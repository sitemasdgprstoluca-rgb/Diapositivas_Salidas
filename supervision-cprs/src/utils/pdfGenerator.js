import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { 
  formatearFechaCompleta, 
  formatearFechaDiaMes, 
  formatearHora,
  generarNombreArchivo 
} from './dateUtils';

// Detectar si estamos en web
const isWeb = Platform.OS === 'web';

// Colores de la plantilla
const COLORS = {
  primary: '#8A2035',
  secondary: '#783039',
  accent: '#D4A94C',
  white: '#FFFFFF',
  lightGray: '#E3E9ED',
  text: '#333333',
};

/**
 * Helper para timeout en promesas
 */
const withTimeout = (promise, ms, errorMsg = 'Timeout') => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

/**
 * FileReader con timeout para web
 */
const readBlobAsDataURLWithTimeout = (blob, timeoutMs = 30000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout leyendo blob'));
    }, timeoutMs);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      clearTimeout(timeoutId);
      resolve(reader.result);
    };
    reader.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Error leyendo blob'));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Convierte una imagen local a base64 para incrustar en HTML
 * @param {string} uri - URI de la imagen
 * @returns {Promise<string>} Data URL de la imagen
 */
const imagenADataURL = async (uri) => {
  try {
    if (!uri) return null;
    console.log('[PDF] Convirtiendo imagen:', uri.substring(Math.max(0, uri.length - 30)));
    
    if (isWeb) {
      // En web, si ya es un data URL o blob URL, usarlo directamente
      if (uri.startsWith('data:')) {
        return uri;
      }
      if (uri.startsWith('blob:')) {
        // Convertir blob URL a data URL con timeout
        try {
          const response = await withTimeout(fetch(uri), 15000, 'Timeout fetch blob');
          const blob = await response.blob();
          return await readBlobAsDataURLWithTimeout(blob, 20000);
        } catch (e) {
          console.log('[PDF] Error convirtiendo blob:', e.message);
          return null;
        }
      }
      // Si es una URL normal, intentar cargarla
      try {
        const response = await withTimeout(fetch(uri), 15000, 'Timeout fetch URL');
        const blob = await response.blob();
        return await readBlobAsDataURLWithTimeout(blob, 20000);
      } catch (e) {
        console.log('[PDF] Error cargando URL:', e.message);
        return null; // Retornar null en vez de la URL si falla
      }
    }
    
    const base64 = await withTimeout(
      FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      }),
      15000,
      'Timeout leyendo imagen para PDF'
    );
    console.log('[PDF] Imagen convertida, tamaño:', Math.round(base64.length / 1024), 'KB');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.log('[PDF] Error convirtiendo imagen:', error.message);
    return null;
  }
};

/**
 * Genera el HTML para el PDF
 * @param {Object} supervision - Objeto de supervisión
 * @returns {Promise<string>} HTML del documento
 */
const generarHTML = async (supervision) => {
  const fechaHora = supervision.datosGenerales.fechaHoraSupervision;
  const fechaCompleta = formatearFechaCompleta(fechaHora);
  const fechaDiaMes = formatearFechaDiaMes(fechaHora);
  const horaSupervision = formatearHora(fechaHora);
  const nombreCprs = supervision.datosGenerales.nombreCprs;
  const areas = supervision.areas || [];

  // Generar HTML para cada área
  let areasHTML = '';
  for (const area of areas) {
    const observacion = area.sinNovedad ? 'Sin novedad.' : (area.observacion || 'Sin observación.');
    
    // Procesar fotos
    let fotosHTML = '';
    if (area.fotos && area.fotos.length > 0) {
      fotosHTML = '<div class="fotos-container">';
      for (const foto of area.fotos) {
        const dataUrl = await imagenADataURL(foto.uri);
        if (dataUrl) {
          fotosHTML += `<img src="${dataUrl}" class="foto" />`;
        }
      }
      fotosHTML += '</div>';
    } else {
      fotosHTML = '<p class="sin-fotos">Sin evidencia fotográfica</p>';
    }

    areasHTML += `
      <div class="area-card">
        <div class="area-header">${area.nombre}</div>
        <div class="area-observacion">
          <strong>Observación:</strong> ${observacion}
        </div>
        ${fotosHTML}
      </div>
    `;
  }

  // Lista de lugares
  const listaLugares = areas.map(a => `<li>${a.nombre}</li>`).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: ${COLORS.text};
          background: ${COLORS.white};
        }
        .page {
          page-break-after: always;
          padding: 40px;
          min-height: 100vh;
        }
        .page:last-child {
          page-break-after: avoid;
        }
        
        /* Portada */
        .portada {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
          color: ${COLORS.white};
        }
        .portada-fecha {
          font-size: 18px;
          margin-bottom: 60px;
          opacity: 0.9;
        }
        .portada-titulo {
          font-size: 42px;
          font-weight: bold;
          margin-bottom: 20px;
          color: ${COLORS.accent};
        }
        .portada-subtitulo {
          font-size: 24px;
          margin-bottom: 40px;
        }
        .linea-dorada {
          width: 200px;
          height: 4px;
          background: ${COLORS.accent};
          margin: 30px auto;
        }
        
        /* Info general */
        .header-bar {
          background: ${COLORS.primary};
          color: ${COLORS.white};
          padding: 15px 20px;
          margin: -40px -40px 30px -40px;
        }
        .header-bar h2 {
          font-size: 20px;
        }
        .info-card {
          background: ${COLORS.lightGray};
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 30px;
          border-left: 5px solid ${COLORS.primary};
        }
        .info-row {
          margin-bottom: 12px;
          font-size: 16px;
        }
        .info-label {
          font-weight: bold;
          color: ${COLORS.primary};
        }
        .lugares-lista {
          margin-top: 15px;
          padding-left: 25px;
        }
        .lugares-lista li {
          margin-bottom: 8px;
        }
        
        /* Áreas */
        .area-card {
          background: ${COLORS.white};
          border: 2px solid ${COLORS.lightGray};
          border-radius: 10px;
          margin-bottom: 25px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .area-header {
          background: ${COLORS.primary};
          color: ${COLORS.white};
          padding: 12px 20px;
          font-size: 18px;
          font-weight: bold;
        }
        .area-observacion {
          padding: 15px 20px;
          font-size: 14px;
          border-bottom: 1px solid ${COLORS.lightGray};
        }
        .fotos-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 15px;
          justify-content: flex-start;
        }
        .foto {
          width: 120px;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid ${COLORS.lightGray};
        }
        .sin-fotos {
          padding: 20px;
          text-align: center;
          color: #999;
          font-style: italic;
        }
        
        /* Pie final */
        .final-page {
          background: ${COLORS.primary};
          color: ${COLORS.white};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .final-titulo {
          font-size: 32px;
          margin-bottom: 20px;
        }
        .final-cprs {
          font-size: 26px;
          color: ${COLORS.accent};
          font-weight: bold;
          margin-bottom: 30px;
        }
        .final-fecha {
          font-size: 16px;
          opacity: 0.8;
        }
        .final-footer {
          position: absolute;
          bottom: 40px;
          font-size: 10px;
          opacity: 0.6;
        }
      </style>
    </head>
    <body>
      <!-- Portada -->
      <div class="page portada">
        <div class="portada-fecha">${fechaCompleta.toUpperCase()}</div>
        <div class="portada-titulo">${nombreCprs.toUpperCase()}</div>
        <div class="portada-subtitulo">SUPERVISIÓN C.P.R.S.</div>
        <div class="linea-dorada"></div>
      </div>
      
      <!-- Información General -->
      <div class="page">
        <div class="header-bar">
          <h2>INFORMACIÓN DE LA SUPERVISIÓN</h2>
        </div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Centro:</span> ${nombreCprs}
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span> ${fechaDiaMes}
          </div>
          <div class="info-row">
            <span class="info-label">Hora:</span> ${horaSupervision}
          </div>
          <div class="info-row">
            <span class="info-label">Lugares recorridos:</span>
            <ul class="lugares-lista">
              ${listaLugares || '<li>Sin lugares registrados</li>'}
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Áreas -->
      ${areas.length > 0 ? `
        <div class="page">
          <div class="header-bar">
            <h2>ÁREAS SUPERVISADAS</h2>
          </div>
          ${areasHTML}
        </div>
      ` : ''}
      
      <!-- Página Final -->
      <div class="page final-page">
        <div class="final-titulo">SUPERVISIÓN C.P.R.S.</div>
        <div class="final-cprs">${nombreCprs.toUpperCase()}</div>
        <div class="linea-dorada"></div>
        <div class="final-fecha">${fechaCompleta}</div>
        <div class="final-footer">Documento generado automáticamente</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera un archivo PDF con los datos de la supervisión
 * @param {Object} supervision - Objeto de supervisión completo
 * @returns {Promise<string>} URI del archivo generado
 */
export const generarPDF = async (supervision) => {
  try {
    console.log('[PDF] === INICIANDO GENERACIÓN ===');
    console.log('[PDF] CPRS:', supervision.datosGenerales.nombreCprs);
    console.log('[PDF] Áreas:', supervision.areas?.length || 0);
    
    console.log('[PDF] Generando HTML...');
    const html = await generarHTML(supervision);
    console.log('[PDF] HTML generado, tamaño:', Math.round(html.length / 1024), 'KB');
    
    if (isWeb) {
      // En web, abrir ventana de impresión
      console.log('[PDF] Modo Web - abriendo ventana de impresión...');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
      console.log('[PDF] === VENTANA DE IMPRESIÓN ABIERTA ===');
      return 'web-print';
    }
    
    console.log('[PDF] Imprimiendo a archivo...');
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    console.log('[PDF] Archivo temporal:', uri);

    // Renombrar el archivo con nombre descriptivo
    const nombreCprs = supervision.datosGenerales.nombreCprs;
    const fechaHora = supervision.datosGenerales.fechaHoraSupervision;
    const nombreLimpio = nombreCprs.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, '_');
    const fecha = new Date(fechaHora);
    const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
    const nuevoNombre = `Supervision_CPRS_${nombreLimpio}_${fechaStr}.pdf`;
    const nuevaRuta = `${FileSystem.documentDirectory}${nuevoNombre}`;

    console.log('[PDF] Moviendo a:', nuevaRuta);
    await FileSystem.moveAsync({
      from: uri,
      to: nuevaRuta,
    });

    console.log('[PDF] === GENERACIÓN COMPLETADA ===');
    return nuevaRuta;
  } catch (error) {
    console.error('[PDF] Error generando PDF:', error);
    throw error;
  }
};

/**
 * Comparte un archivo PDF
 * @param {string} filePath - Ruta del archivo a compartir
 */
export const compartirPDF = async (filePath) => {
  try {
    // En web, la ventana de impresión ya se abrió
    if (isWeb) {
      console.log('[PDF] Web: ventana de impresión ya abierta');
      return;
    }
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      console.log('Compartiendo archivo PDF:', filePath);
      
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Supervisión PDF',
      });
    } else {
      throw new Error('Compartir no está disponible en este dispositivo');
    }
  } catch (error) {
    console.error('Error compartiendo PDF:', error);
    throw error;
  }
};