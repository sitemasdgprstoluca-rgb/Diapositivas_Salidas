/**
 * Genera el PDF como una replica fiel de la presentación PPTX:
 *   - Misma proporción de slide 16:9 (13.333 x 7.5 in = 1280 x 720 px @ 96dpi)
 *   - Mismas imágenes de fondo institucionales (portada / general / cierre)
 *   - Misma paleta de colores (guinda #691C32, dorado #BC955C)
 *   - Misma jerarquía de slides: Portada → Información → Rubros → Cierre
 *   - Coordenadas pixel-exactas al PPTX (1 in = 96 px)
 *
 * El usuario obtiene un PDF que se ve idéntico al PPTX cuando lo abre.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import {
  formatearFechaCompleta,
  formatearFechaDiaMes,
  formatearHora,
} from './dateUtils';
import {
  cargarAssetBase64,
  fondoPortada,
  fondoGeneral,
  fondoCierre,
} from './pptxGenerator';

const isWeb = Platform.OS === 'web';

// Paleta institucional (igual al PPTX)
const COLORS = {
  guinda: '#691C32',
  dorado: '#BC955C',
  blanco: '#FFFFFF',
  negro: '#000000',
  text: '#2A0E16',
};

// Slide widescreen 16:9: 13.333 x 7.5 in @ 96dpi = 1280 x 720 px
const SLIDE_W_IN = 13.333;
const SLIDE_H_IN = 7.5;
const PX_PER_IN = 96;
const SLIDE_W = Math.round(SLIDE_W_IN * PX_PER_IN); // 1280
const SLIDE_H = Math.round(SLIDE_H_IN * PX_PER_IN); // 720

// Convierte coordenadas en pulgadas (mismas que usa pptxGenerator) a pixeles del HTML
const inToPx = (inches) => Math.round(inches * PX_PER_IN);

const withTimeout = (promise, ms, errorMsg = 'Timeout') => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const readBlobAsDataURLWithTimeout = (blob, timeoutMs = 30000) =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Timeout leyendo blob')), timeoutMs);
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

const imagenADataURL = async (uri) => {
  try {
    if (!uri) return null;
    if (isWeb) {
      if (uri.startsWith('data:')) return uri;
      if (uri.startsWith('blob:')) {
        const response = await withTimeout(fetch(uri), 15000, 'Timeout fetch blob');
        const blob = await response.blob();
        return await readBlobAsDataURLWithTimeout(blob, 20000);
      }
      return uri;
    }
    const base64 = await withTimeout(
      FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }),
      30000,
      'Timeout leyendo imagen para PDF'
    );
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.log('[PDF] Error convirtiendo imagen:', error.message);
    return null;
  }
};

// Helper para construir un absoluto-positioned element con coordenadas en pulgadas
const abs = (xIn, yIn, wIn, hIn, extras = '') =>
  `position:absolute;left:${inToPx(xIn)}px;top:${inToPx(yIn)}px;width:${inToPx(wIn)}px;height:${inToPx(hIn)}px;${extras}`;

const colorCal = (cal) => {
  if (cal == null) return '#888';
  if (cal <= 4) return '#C62828';
  if (cal <= 6) return '#F9A825';
  if (cal <= 8) return '#7CB342';
  return '#2E7D32';
};

/**
 * Construye el HTML — réplica fiel de pptxGenerator slide a slide,
 * usando los mismos fondos PNG y coordenadas en pulgadas.
 */
const generarHTML = async (supervision) => {
  const fechaHora = supervision.datosGenerales.fechaHoraSupervision;
  const fechaCompleta = formatearFechaCompleta(fechaHora);
  const fechaDiaMes = formatearFechaDiaMes(fechaHora);
  const horaSupervision = formatearHora(fechaHora);
  const nombreCprs = (supervision.datosGenerales.nombreCprs || '').toUpperCase();
  const areas = supervision.areas || [];

  // Cargar fondos en paralelo
  const [bgPortada64, bgGeneral64, bgCierre64] = await Promise.all([
    cargarAssetBase64(fondoPortada),
    cargarAssetBase64(fondoGeneral),
    cargarAssetBase64(fondoCierre),
  ]);

  const dataUrl = (b64) => (b64 ? `data:image/png;base64,${b64}` : '');

  // Imagen del centro (si existe)
  const imgCentroData = await imagenADataURL(supervision.datosGenerales.imagenCentro);

  // Estadísticas
  const evaluadas = areas.filter((a) => !a.noAplica && a.calificacion != null);
  const noAplican = areas.filter((a) => a.noAplica);
  const promedio = evaluadas.length > 0
    ? evaluadas.reduce((acc, a) => acc + (a.calificacion || 0), 0) / evaluadas.length
    : 0;
  const totalFotos = areas.reduce((acc, a) => acc + (a.fotos?.length || 0), 0);

  // ================ SLIDE 1: PORTADA ================
  // Réplica del PPTX: 4 textos centrados en dorado/guinda, fecha esquina inf-derecha
  const slidePortada = `
    <section class="slide">
      ${bgPortada64 ? `<img class="slide-bg" src="${dataUrl(bgPortada64)}" />` : ''}
      <div style="${abs(0.5, 1.35, SLIDE_W_IN - 1.0, 0.6, `color:${COLORS.dorado};font-style:italic;font-weight:700;font-size:32px;text-align:center;`)}">
        SUBSECRETARÍA DE CONTROL PENITENCIARIO
      </div>
      <div style="${abs(0, 2.0, SLIDE_W_IN, 0.95, `color:${COLORS.dorado};font-style:italic;font-weight:700;font-size:28px;text-align:center;line-height:1.15;`)}">
        DIRECCIÓN GENERAL DE PREVENCIÓN Y<br/>REINSERCIÓN SOCIAL
      </div>
      <div style="${abs(0.5, 3.55, SLIDE_W_IN - 1.0, 0.5, `color:${COLORS.dorado};font-style:italic;font-weight:700;font-size:24px;text-align:center;`)}">
        DELEGACIÓN ADMINISTRATIVA
      </div>
      <div style="${abs(0, 4.45, SLIDE_W_IN, 0.45, `color:${COLORS.guinda};font-weight:700;font-size:20px;text-align:center;`)}">
        SUPERVISIÓN ADMINISTRATIVA EN EL C.P.R.S
      </div>
      <div style="${abs(0.5, 4.9, SLIDE_W_IN - 1.0, 0.45, `color:${COLORS.guinda};font-style:italic;font-weight:700;font-size:20px;text-align:center;`)}">
        ${nombreCprs}
      </div>
      <div style="${abs(7.5, 6.15, 5.5, 0.5, `color:${COLORS.guinda};font-style:italic;font-weight:700;font-size:18px;text-align:right;`)}">
        ${fechaCompleta.toUpperCase()}
      </div>
    </section>
  `;

  // ================ SLIDE 2: INFORMACIÓN ================
  // Layout: header guinda + info-cards + (opcional) imagen del centro
  const slideInfo = `
    <section class="slide">
      ${bgGeneral64 ? `<img class="slide-bg" src="${dataUrl(bgGeneral64)}" />` : ''}
      <div style="${abs(0.4, 0.4, SLIDE_W_IN - 0.8, 0.7, `color:${COLORS.guinda};font-weight:800;font-size:24px;border-bottom:2px solid ${COLORS.dorado};padding-bottom:6px;`)}">
        SUPERVISIÓN ADMINISTRATIVA EN EL C.P.R.S ${nombreCprs}
      </div>

      <div style="${abs(0.4, 1.4, 5.5, 0.4, `color:${COLORS.guinda};font-weight:700;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;`)}">
        Información general
      </div>

      <div style="${abs(0.4, 1.8, 5.5, 0.55, `font-size:16px;color:${COLORS.text};`)}">
        <strong style="color:${COLORS.guinda};">Centro:</strong> ${nombreCprs}
      </div>
      <div style="${abs(0.4, 2.35, 5.5, 0.55, `font-size:16px;color:${COLORS.text};`)}">
        <strong style="color:${COLORS.guinda};">Fecha:</strong> ${fechaDiaMes}
      </div>
      <div style="${abs(0.4, 2.9, 5.5, 0.55, `font-size:16px;color:${COLORS.text};`)}">
        <strong style="color:${COLORS.guinda};">Hora:</strong> ${horaSupervision}
      </div>
      <div style="${abs(0.4, 3.45, 5.5, 0.55, `font-size:16px;color:${COLORS.text};`)}">
        <strong style="color:${COLORS.guinda};">Rubros del estándar:</strong> ${areas.length} de 15
      </div>

      <div style="${abs(0.4, 4.4, 5.5, 0.4, `color:${COLORS.guinda};font-weight:700;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;`)}">
        Resumen de la supervisión
      </div>

      <div style="${abs(0.4, 4.85, 1.25, 1.6, `border:1px solid ${COLORS.dorado};border-radius:8px;padding:12px;text-align:center;`)}">
        <div style="font-size:32px;font-weight:900;color:${COLORS.guinda};">${evaluadas.length}</div>
        <div style="font-size:10px;letter-spacing:0.2em;color:${COLORS.dorado};text-transform:uppercase;font-weight:700;margin-top:4px;">Evaluados</div>
      </div>
      <div style="${abs(1.8, 4.85, 1.25, 1.6, `border:1px solid ${COLORS.dorado};border-radius:8px;padding:12px;text-align:center;`)}">
        <div style="font-size:32px;font-weight:900;color:${COLORS.guinda};">${noAplican.length}</div>
        <div style="font-size:10px;letter-spacing:0.2em;color:${COLORS.dorado};text-transform:uppercase;font-weight:700;margin-top:4px;">No aplican</div>
      </div>
      <div style="${abs(3.2, 4.85, 1.25, 1.6, `border:1px solid ${COLORS.dorado};border-radius:8px;padding:12px;text-align:center;`)}">
        <div style="font-size:32px;font-weight:900;color:${COLORS.guinda};">${totalFotos}</div>
        <div style="font-size:10px;letter-spacing:0.2em;color:${COLORS.dorado};text-transform:uppercase;font-weight:700;margin-top:4px;">Fotos</div>
      </div>
      <div style="${abs(4.6, 4.85, 1.35, 1.6, `border:2px solid ${colorCal(promedio)};border-radius:8px;padding:12px;text-align:center;background:${colorCal(promedio)}10;`)}">
        <div style="font-size:32px;font-weight:900;color:${colorCal(promedio)};">${promedio.toFixed(2)}</div>
        <div style="font-size:10px;letter-spacing:0.2em;color:${COLORS.dorado};text-transform:uppercase;font-weight:700;margin-top:4px;">Promedio</div>
      </div>

      ${imgCentroData ? `<img src="${imgCentroData}" style="${abs(7.0, 1.4, 5.8, 5.0, 'object-fit:cover;border-radius:10px;border:3px solid ' + COLORS.dorado + ';')}" />` : ''}
    </section>
  `;

  // ================ SLIDES POR RUBRO ================
  let rubrosHTML = '';
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    const cal = area.calificacion;
    const color = colorCal(cal);

    const obs = area.sinNovedad
      ? 'Sin novedad.'
      : (area.observacion || 'Sin observación registrada.');

    // Criterios
    const criterios = area.criterios || [];
    const criteriosLi = criterios.map((c) => {
      const tag = c.cumple === true ? 'SÍ' : c.cumple === false ? 'NO' : '—';
      const tagColor = c.cumple === true ? '#16a34a' : c.cumple === false ? '#dc2626' : '#888';
      return `<li style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px;font-size:11px;line-height:1.3;color:${COLORS.text};">
        <span style="flex-shrink:0;width:26px;text-align:center;font-weight:800;font-size:9px;padding:2px 0;border-radius:3px;background:${tagColor};color:#fff;">${tag}</span>
        <span style="flex:1;">${c.texto || ''}</span>
      </li>`;
    }).join('');

    // Fotos (máx 4 en grid 2x2 dentro del slide)
    const fotosUrls = area.fotos
      ? await Promise.all(area.fotos.slice(0, 4).map((f) => imagenADataURL(f.uri)))
      : [];
    const fotosValidas = fotosUrls.filter(Boolean);

    let fotosHTML = '';
    if (fotosValidas.length > 0) {
      const gridCols = fotosValidas.length === 1 ? 1 : 2;
      const cellW = 5.6 / gridCols;
      const cellH = (cellW * 0.75); // ratio 4:3
      fotosHTML = fotosValidas.map((url, idx) => {
        const col = idx % gridCols;
        const row = Math.floor(idx / gridCols);
        const xF = 7.4 + col * cellW;
        const yF = 1.6 + row * cellH;
        return `<img src="${url}" style="${abs(xF, yF, cellW - 0.1, cellH - 0.1, `object-fit:cover;border-radius:6px;border:1px solid ${COLORS.dorado};`)}" />`;
      }).join('');
    } else {
      fotosHTML = `<div style="${abs(7.4, 1.6, 5.5, 5.0, `background:#F5F0E8;border:1px dashed ${COLORS.dorado};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#888;font-style:italic;font-size:14px;`)}">Sin evidencia fotográfica</div>`;
    }

    // Badge calificación
    const calBadge = area.noAplica
      ? `<div style="${abs(11.8, 0.4, 1.1, 1.1, `background:#888;color:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;`)}">N/A</div>`
      : cal != null
        ? `<div style="${abs(11.8, 0.4, 1.1, 1.1, `background:${color};color:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;`)}">${cal}</div>`
        : `<div style="${abs(11.8, 0.4, 1.1, 1.1, `background:#cbd5e1;color:#888;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;`)}">—</div>`;

    rubrosHTML += `
      <section class="slide">
        ${bgGeneral64 ? `<img class="slide-bg" src="${dataUrl(bgGeneral64)}" />` : ''}
        <div style="${abs(0.4, 0.4, 11.3, 0.45, `color:${COLORS.dorado};font-weight:800;font-size:13px;letter-spacing:0.25em;text-transform:uppercase;`)}">
          Rubro ${i + 1}
        </div>
        <div style="${abs(0.4, 0.85, 11.3, 0.7, `color:${COLORS.guinda};font-weight:800;font-size:24px;line-height:1.1;`)}">
          ${area.nombre || ''}
        </div>
        ${calBadge}

        <div style="${abs(0.4, 1.7, 6.8, 0.4, `color:${COLORS.dorado};font-weight:800;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;`)}">
          Observación
        </div>
        <div style="${abs(0.4, 2.1, 6.8, 1.4, `font-size:12px;color:${COLORS.text};line-height:1.4;background:#FFF;padding:10px 14px;border-radius:6px;border:1px solid #E8DFD0;`)}">
          ${obs}
        </div>

        ${criteriosLi ? `
        <div style="${abs(0.4, 3.65, 6.8, 0.4, `color:${COLORS.dorado};font-weight:800;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;`)}">
          Criterios evaluados (${criterios.filter(c=>c.cumple===true).length}/${criterios.length} cumplen)
        </div>
        <div style="${abs(0.4, 4.05, 6.8, 2.7, 'background:#FFF;padding:10px 14px;border-radius:6px;border:1px solid #E8DFD0;overflow:hidden;')}">
          <ul style="list-style:none;margin:0;padding:0;">${criteriosLi}</ul>
        </div>
        ` : ''}

        ${fotosHTML}

        <div style="${abs(0.4, 6.95, 12.5, 0.3, `color:${COLORS.dorado};font-size:9px;letter-spacing:0.2em;text-transform:uppercase;border-top:1px solid ${COLORS.dorado}40;padding-top:6px;display:flex;justify-content:space-between;`)}">
          <span>${nombreCprs}</span>
          <span>${fechaDiaMes} · ${horaSupervision}</span>
        </div>
      </section>
    `;
  }

  // ================ SLIDE CIERRE ================
  const slideCierre = `
    <section class="slide">
      ${bgCierre64 ? `<img class="slide-bg" src="${dataUrl(bgCierre64)}" />` : ''}
      <div style="${abs(0, 2.5, SLIDE_W_IN, 0.5, `color:${COLORS.dorado};font-size:18px;letter-spacing:0.32em;text-transform:uppercase;text-align:center;font-weight:600;`)}">
        Fin de la supervisión
      </div>
      <div style="${abs(0, 3.0, SLIDE_W_IN, 1.2, `color:${COLORS.dorado};font-weight:900;font-size:60px;text-align:center;font-style:italic;line-height:1;`)}">
        ${nombreCprs}
      </div>
      <div style="${abs(0, 4.3, SLIDE_W_IN, 0.5, `color:${COLORS.guinda};font-weight:600;font-size:20px;text-align:center;`)}">
        Documento generado automáticamente
      </div>
      <div style="${abs(SLIDE_W_IN/2 - 1, 5.0, 2, 0.04, `background:${COLORS.dorado};`)}"></div>
      <div style="${abs(0, 5.3, SLIDE_W_IN, 0.4, `color:${COLORS.guinda};font-size:14px;letter-spacing:0.2em;text-transform:uppercase;text-align:center;`)}">
        ${fechaCompleta}
      </div>
    </section>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Supervisión ${nombreCprs}</title>
<style>
  @page {
    size: ${SLIDE_W}px ${SLIDE_H}px;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${SLIDE_W}px;
    color: ${COLORS.text};
    font-family: 'Helvetica Neue', Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .slide {
    width: ${SLIDE_W}px;
    height: ${SLIDE_H}px;
    position: relative;
    overflow: hidden;
    background: ${COLORS.blanco};
    page-break-after: always;
    page-break-inside: avoid;
  }
  .slide:last-child { page-break-after: auto; }
  .slide-bg {
    position: absolute;
    top: 0; left: 0;
    width: ${SLIDE_W}px;
    height: ${SLIDE_H}px;
    z-index: 0;
  }
  .slide > *:not(.slide-bg) { z-index: 1; }
</style>
</head>
<body>
  ${slidePortada}
  ${slideInfo}
  ${rubrosHTML}
  ${slideCierre}
</body>
</html>`;
};

/**
 * Genera el PDF estructurado en slides 16:9.
 * Las páginas del PDF tienen tamaño exacto 1280x720 (sin márgenes), igual al PPTX.
 */
export const generarPDF = async (supervision) => {
  try {
    const html = await generarHTML(supervision);

    if (isWeb) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
      return 'web-print';
    }

    // expo-print acepta width/height en puntos (1pt = 1/72 in).
    // 13.333 in × 72 = 960 pt;  7.5 in × 72 = 540 pt.
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
      width: 960,
      height: 540,
      margins: { left: 0, right: 0, top: 0, bottom: 0 },
    });

    const nombreCprs = supervision.datosGenerales.nombreCprs || 'CPRS';
    const fechaHora = supervision.datosGenerales.fechaHoraSupervision;
    const nombreLimpio = nombreCprs.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, '_');
    const fecha = new Date(fechaHora);
    const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
    const nuevoNombre = `Supervision_CPRS_${nombreLimpio}_${fechaStr}.pdf`;
    const nuevaRuta = `${FileSystem.documentDirectory}${nuevoNombre}`;

    await FileSystem.moveAsync({ from: uri, to: nuevaRuta });
    return nuevaRuta;
  } catch (err) {
    console.log('[PDF] FATAL:', err.message);
    throw err;
  }
};

/**
 * Comparte el PDF generado vía Sharing API.
 */
export const compartirPDF = async (uri) => {
  if (isWeb) return;
  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) {
    console.log('[PDF] Sharing no disponible');
    return;
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartir supervisión',
    UTI: 'com.adobe.pdf',
  });
};
