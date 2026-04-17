import pptxgen from 'pptxgenjs';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import {
  formatearFechaCompleta,
  formatearFechaDiaMes,
  formatearHora,
  generarNombreArchivo
} from './dateUtils';
import { buscarMapa } from './mapasIndex';
import { calcularPromedioGeneral } from '../constants/data';

// Colores para la escala 1-10 (formato hex sin #)
const colorHexCalificacion = (cal) => {
  if (cal == null) return '888888';
  if (cal <= 4) return 'C62828'; // rojo
  if (cal <= 6) return 'F9A825'; // amarillo
  if (cal <= 8) return '7CB342'; // verde claro
  return '2E7D32'; // verde fuerte
};

// Detectar si estamos en web
const isWeb = Platform.OS === 'web';

// Importar imágenes de fondo
import fondoPortada from '../../assets/backgrounds/portada.png';
import fondoGeneral from '../../assets/backgrounds/general.png';
import fondoCierre from '../../assets/backgrounds/cierre.png';

// Colores institucionales exactos
const COLORS = {
  guinda: '691C32',      // Guinda institucional
  dorado: 'BC955C',      // Dorado/café claro
  negro: '000000',
  blanco: 'FFFFFF',
};

// Tamaño de slide (16:9 widescreen en pulgadas)
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// Margen izquierdo global para textos (aumentado para evitar superposición con elementos gráficos)
const LEFT_MARGIN = 1.8;
// Margen derecho igual al izquierdo para centrar
const RIGHT_MARGIN = 1.8;
// Margen izquierdo reducido para títulos - más pegado a la izquierda
const TITLE_LEFT_MARGIN = 0.8;
// Margen derecho ampliado para títulos - para que no sobrepase
const TITLE_RIGHT_MARGIN = 2.2;
// Margen superior adicional (ajuste fino - reducido 1mm)
const TOP_MARGIN = 0.11;

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
const readBlobAsBase64WithTimeout = (blob, timeoutMs = 30000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout leyendo blob'));
    }, timeoutMs);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      clearTimeout(timeoutId);
      const base64 = reader.result?.split(',')[1] || null;
      resolve(base64);
    };
    reader.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Error leyendo blob'));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Normaliza la orientación de una imagen (corrige rotación EXIF)
 */
const normalizarOrientacionImagen = async (uri) => {
  try {
    if (!uri) return uri;
    
    // En web, no necesitamos normalizar
    if (isWeb) return uri;
    
    // Manipular la imagen para aplicar la rotación EXIF y devolver una imagen correctamente orientada
    const result = await withTimeout(
      ImageManipulator.manipulateAsync(
        uri,
        [], // No aplicamos transformaciones manuales, solo queremos que aplique la orientación EXIF
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      ),
      15000, // 15 segundos timeout por imagen
      'Timeout procesando imagen'
    );
    return result.uri;
  } catch (error) {
    console.log('[PPTX] Error normalizando imagen:', error.message);
    return uri; // Devolver la URI original si falla
  }
};

/**
 * Convierte una imagen local a base64 (normalizando orientación primero)
 */
const imagenABase64 = async (uri) => {
  try {
    if (!uri) return null;
    
    if (isWeb) {
      // En web, convertir blob URL o URL normal a base64
      if (uri.startsWith('data:')) {
        // Ya es un data URL, extraer el base64
        return uri.split(',')[1];
      }
      if (uri.startsWith('blob:') || uri.startsWith('http')) {
        try {
          const response = await withTimeout(fetch(uri), 15000, 'Timeout fetch imagen');
          const blob = await response.blob();
          const base64 = await readBlobAsBase64WithTimeout(blob, 20000);
          return base64;
        } catch (e) {
          console.log('[PPTX] Error cargando imagen web:', e.message);
          return null;
        }
      }
      return null;
    }
    
    // Primero normalizar la orientación
    const uriNormalizada = await normalizarOrientacionImagen(uri);
    const base64 = await withTimeout(
      FileSystem.readAsStringAsync(uriNormalizada, {
        encoding: 'base64',
      }),
      10000,
      'Timeout leyendo archivo'
    );
    return base64;
  } catch (error) {
    console.log('[PPTX] Error convirtiendo imagen:', error.message);
    return null;
  }
};

/**
 * Carga un asset y lo convierte a base64
 */
const cargarAssetBase64 = async (assetModule) => {
  try {
    if (isWeb) {
      // En web, los assets son URLs directas
      try {
        const response = await withTimeout(fetch(assetModule), 15000, 'Timeout fetch asset');
        const blob = await response.blob();
        const base64 = await readBlobAsBase64WithTimeout(blob, 20000);
        return base64;
      } catch (e) {
        console.log('[PPTX] Error cargando asset web:', e.message);
        return null;
      }
    } else {
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: 'base64',
      });
      return base64;
    }
  } catch (error) {
    console.log('[PPTX] Error cargando asset:', error);
    return null;
  }
};

/**
 * Genera la lista de lugares supervisados (excluye rubros "No aplica").
 * Usa nombre corto si está disponible para el listado del slide 2.
 */
const generarListaLugares = (areas) => {
  if (!areas || areas.length === 0) return ['Sin lugares registrados'];
  return areas
    .filter((a) => !a.noAplica)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map((area) => area.nombreCorto || area.nombre);
};

/**
 * Genera un archivo PowerPoint con los datos de la supervisión
 */
export const generarPPTX = async (supervision) => {
  try {
    console.log('[PPTX] === INICIANDO GENERACIÓN ===');
    console.log('[PPTX] CPRS:', supervision.datosGenerales.nombreCprs);
    console.log('[PPTX] Áreas:', supervision.areas?.length || 0);
    
    const pptx = new pptxgen();
    
    // Configuración del documento
    pptx.author = 'Delegación Administrativa';
    pptx.title = `Supervisión ${supervision.datosGenerales.nombreCprs}`;
    pptx.subject = 'Supervisión Administrativa C.P.R.S.';
    pptx.company = 'Gobierno del Estado de México';
    pptx.layout = 'LAYOUT_WIDE';

    // Datos formateados
    const fechaHora = supervision.datosGenerales.fechaHoraSupervision;
    const fechaCompleta = formatearFechaCompleta(fechaHora);
    const fechaDiaMes = formatearFechaDiaMes(fechaHora);
    const horaSupervision = formatearHora(fechaHora);
    const nombreCprs = supervision.datosGenerales.nombreCprs;
    const lugaresRecorridos = generarListaLugares(supervision.areas);

    console.log('[PPTX] Cargando fondos...');
    // Cargar fondos y mapa en paralelo
    const mapaAsset = buscarMapa(nombreCprs);
    const promesas = [
      cargarAssetBase64(fondoPortada),
      cargarAssetBase64(fondoGeneral),
      cargarAssetBase64(fondoCierre),
    ];
    if (mapaAsset) {
      promesas.push(cargarAssetBase64(mapaAsset));
    }
    
    const resultados = await Promise.all(promesas);
    const bgPortada = resultados[0];
    const bgGeneral = resultados[1];
    const bgCierre = resultados[2];
    const mapaBase64 = mapaAsset ? resultados[3] : null;

    // ==================== SLIDE 1: PORTADA ====================
    const slide1 = pptx.addSlide();
    
    // Fondo de portada
    if (bgPortada) {
      slide1.addImage({
        data: `image/png;base64,${bgPortada}`,
        x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
      });
    }
    
    // SUBSECRETARÍA DE CONTROL PENITENCIARIO
    slide1.addText('SUBSECRETARÍA DE CONTROL PENITENCIARIO', {
      x: LEFT_MARGIN, y: 1.35, w: SLIDE_W - LEFT_MARGIN - 0.5, h: 0.6,
      fontSize: 32,
      fontFace: 'Gotham',
      color: COLORS.dorado,
      bold: true,
      italic: true,
      align: 'center',
    });
    
    // DIRECCIÓN GENERAL DE PREVENCIÓN Y REINSERCIÓN SOCIAL
    slide1.addText('DIRECCIÓN GENERAL DE PREVENCIÓN Y\nREINSERCIÓN SOCIAL', {
      x: 0, y: 2.0, w: SLIDE_W, h: 0.95,
      fontSize: 28,
      fontFace: 'Gotham',
      color: COLORS.dorado,
      bold: true,
      italic: true,
      align: 'center',
    });
    
    // DELEGACIÓN ADMINISTRATIVA
    slide1.addText('DELEGACIÓN ADMINISTRATIVA', {
      x: LEFT_MARGIN, y: 3.55, w: SLIDE_W - LEFT_MARGIN - 0.5, h: 0.5,
      fontSize: 24,
      fontFace: 'Gotham',
      color: COLORS.dorado,
      bold: true,
      italic: true,
      align: 'center',
    });
    
    // SUPERVISIÓN ADMINISTRATIVA EN EL C.P.R.S
    slide1.addText('SUPERVISIÓN ADMINISTRATIVA EN EL C.P.R.S', {
      x: 0, y: 4.45, w: SLIDE_W, h: 0.45,
      fontSize: 20,
      fontFace: 'Gotham',
      color: COLORS.guinda,
      bold: true,
      align: 'center',
    });
    
    // Nombre CPRS (sin subrayado según especificación)
    slide1.addText(nombreCprs.toUpperCase(), {
      x: LEFT_MARGIN, y: 4.9, w: SLIDE_W - LEFT_MARGIN - 0.5, h: 0.45,
      fontSize: 20,
      fontFace: 'Gotham',
      color: COLORS.guinda,
      bold: true,
      italic: true,
      align: 'center',
    });
    
    // Fecha - esquina inferior derecha
    slide1.addText(fechaCompleta.toUpperCase(), {
      x: 7.5, y: 6.15, w: 5.5, h: 0.5,
      fontSize: 18,
      fontFace: 'Gotham',
      color: COLORS.guinda,
      bold: true,
      italic: true,
      align: 'right',
    });

    // ==================== SLIDE 2: INFORMACIÓN GENERAL ====================
    const slide2 = pptx.addSlide();
    
    // Fondo general
    if (bgGeneral) {
      slide2.addImage({
        data: `image/png;base64,${bgGeneral}`,
        x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
      });
    }
    
    // Título: SUPERVISIÓN ADMINISTRATIVA EN EL C.P.R.S <Nombre_CPRS> - con márgenes ajustados
    slide2.addText(`SUPERVISIÓN ADMINISTRATIVA EN EL C.P.R.S ${nombreCprs.toUpperCase()}`, {
      x: TITLE_LEFT_MARGIN, y: 0.60, w: SLIDE_W - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN, h: 0.40,
      fontSize: 16,
      fontFace: 'Gotham',
      color: COLORS.guinda,
      bold: true,
      italic: true,
      align: 'center',
    });
    
    // Párrafo introductorio - texto completo con formatos
    slide2.addText([
      { text: 'Con el objetivo de mantener orden y conocer las necesidades administrativas en los Centros Penitenciarios, me permito hacer de su Superior conocimiento que el día ', options: { bold: true } },
      { text: fechaDiaMes, options: { bold: true } },
      { text: ', siendo aproximadamente las ', options: { bold: true } },
      { text: horaSupervision, options: { bold: true } },
      { text: ' horas se procedió a ', options: { bold: true } },
      { text: `realizar una supervisión en coordinación con ${supervision.datosGenerales.generoDirector === 'hombre' ? 'el Director' : 'la Directora'}, ${supervision.datosGenerales.generoAdministrador === 'hombre' ? 'el Administrador' : 'la Administradora'} y personal de seguridad,`, options: { bold: true, italic: true, underline: true } },
      { text: ' dando recorrido a todo el interior del centro.', options: { bold: true, italic: true } },
    ], {
      x: LEFT_MARGIN, y: 1.05 + TOP_MARGIN, w: SLIDE_W - LEFT_MARGIN - 0.5, h: 0.75,
      fontSize: 11,
      fontFace: 'Gotham',
      color: COLORS.negro,
      align: 'justify',
      valign: 'top',
    });
    
    // Imagen del centro (lado izquierdo) - más pequeña para no tapar texto
    if (supervision.datosGenerales.imagenCentro) {
      try {
        const base64Centro = await imagenABase64(supervision.datosGenerales.imagenCentro);
        if (base64Centro) {
          slide2.addImage({
            data: `image/jpeg;base64,${base64Centro}`,
            x: LEFT_MARGIN, y: 1.95 + TOP_MARGIN, w: 3.8, h: 2.9,
            sizing: { type: 'cover', w: 3.8, h: 2.9 },
          });
        }
      } catch (e) {
        // Si falla, agregar placeholder
        slide2.addText('<Imagen\ndel\ncentro>', {
          x: LEFT_MARGIN, y: 1.95 + TOP_MARGIN, w: 3.8, h: 2.9,
          fontSize: 28,
          fontFace: 'Gotham',
          color: '999999',
          align: 'center',
          valign: 'middle',
        });
      }
    } else {
      // Placeholder para imagen del centro
      slide2.addText('<Imagen\ndel\ncentro>', {
        x: LEFT_MARGIN, y: 1.95 + TOP_MARGIN, w: 3.8, h: 2.9,
        fontSize: 28,
        fontFace: 'Gotham',
        color: '999999',
        align: 'center',
        valign: 'middle',
      });
    }
    
    // Texto del supervisor (lado derecho) - ajustado a imagen más pequeña
    slide2.addText([
      { text: 'La supervisión realizada estuvo a cargo del ', options: { bold: false } },
      { text: 'Lic. Héctor Guillermo de Anda Ávila, ', options: { bold: true, italic: true } },
      { text: 'Encargado de la Delegación Administrativa de la Dirección General de Prevención y Reinserción Social.', options: { bold: true } },
    ], {
      x: LEFT_MARGIN + 4.0, y: 1.95 + TOP_MARGIN, w: SLIDE_W - (LEFT_MARGIN + 4.0) - RIGHT_MARGIN, h: 1.0,
      fontSize: 12,
      fontFace: 'Gotham',
      color: COLORS.negro,
      align: 'justify',
    });
    
    // Lista de participantes con bullets - ajustada
    slide2.addText([
      { text: `•   ${supervision.datosGenerales.generoDirector === 'hombre' ? 'Director' : 'Directora'} del C.P.R.S. `, options: {} },
      { text: nombreCprs.toUpperCase(), options: {} },
      { text: ' .', options: {} },
    ], {
      x: LEFT_MARGIN + 4.0, y: 3.05 + TOP_MARGIN, w: 7.0, h: 0.30,
      fontSize: 12, 
      fontFace: 'Gotham', 
      color: COLORS.negro,
      bullet: false,
    });
    
    slide2.addText(`•   ${supervision.datosGenerales.generoAdministrador === 'hombre' ? 'Administrador' : 'Administradora'} del C.P.R.S.`, {
      x: LEFT_MARGIN + 4.0, y: 3.35 + TOP_MARGIN, w: 7.0, h: 0.30,
      fontSize: 12, 
      fontFace: 'Gotham', 
      color: COLORS.negro,
    });
    
    slide2.addText([
      { text: '•   ', options: { bold: false } },
      { text: '01 unidad vehicular ', options: { bold: true, italic: true } },
      { text: 'para el traslado del personal administrativo', options: { bold: false } },
    ], {
      x: LEFT_MARGIN + 4.0, y: 3.65 + TOP_MARGIN, w: 7.0, h: 0.30,
      fontSize: 12, 
      fontFace: 'Gotham',
      color: COLORS.negro,
    });
    
    // Lugares supervisados - más compacto
    slide2.addText('Lugares y puntos supervisados:', {
      x: LEFT_MARGIN + 4.0, y: 4.0 + TOP_MARGIN, w: 7.0, h: 0.30,
      fontSize: 12, 
      fontFace: 'Gotham',
      color: COLORS.negro, 
      italic: true,
    });
    
    // Lista de lugares en dos columnas - más juntas
    const mitad = Math.ceil(lugaresRecorridos.length / 2);
    const col1 = lugaresRecorridos.slice(0, mitad).map(l => `•  ${l}`).join('\n');
    const col2 = lugaresRecorridos.slice(mitad).map(l => `•  ${l}`).join('\n');
    
    slide2.addText(col1, {
      x: LEFT_MARGIN + 4.0, y: 4.30 + TOP_MARGIN, w: 3.3, h: 2.0,
      fontSize: 11, 
      fontFace: 'Gotham', 
      color: COLORS.negro, 
      valign: 'top',
    });
    
    if (col2) {
      slide2.addText(col2, {
        x: LEFT_MARGIN + 7.3, y: 4.30 + TOP_MARGIN, w: 3.3, h: 2.0,
        fontSize: 11, 
        fontFace: 'Gotham', 
        color: COLORS.negro, 
        valign: 'top',
      });
    }
    
    // Agregar mapa del municipio en la esquina SUPERIOR derecha (si existe)
    if (mapaBase64) {
      slide2.addImage({
        data: `image/png;base64,${mapaBase64}`,
        x: SLIDE_W - 1.8,
        y: 0.3,
        w: 1.5,
        h: 1.4,
      });
    }

    // ==================== SLIDE 3: TABLERO DE INDICADORES ====================
    console.log('[PPTX] Construyendo tablero de indicadores...');
    const rubros = supervision.areas || [];
    const promedioGlobal = calcularPromedioGeneral(rubros);

    if (rubros.length > 0) {
      const slideTablero = pptx.addSlide();
      if (bgGeneral) {
        slideTablero.addImage({
          data: `image/png;base64,${bgGeneral}`,
          x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
        });
      }

      slideTablero.addText(`INDICADORES DE MEDICIÓN — C.P.R.S. ${nombreCprs.toUpperCase()}`, {
        x: TITLE_LEFT_MARGIN, y: 0.55, w: SLIDE_W - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN, h: 0.40,
        fontSize: 15,
        fontFace: 'Gotham',
        color: COLORS.guinda,
        bold: true,
        italic: true,
        align: 'center',
      });

      slideTablero.addText('Escala 1-10 (10 = valor más alto). N/A = el C.P.R.S. no cuenta con esa área.', {
        x: LEFT_MARGIN, y: 0.98, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 0.28,
        fontSize: 10,
        fontFace: 'Gotham',
        color: COLORS.negro,
        italic: true,
        align: 'center',
      });

      // Mapa del municipio
      if (mapaBase64) {
        slideTablero.addImage({
          data: `image/png;base64,${mapaBase64}`,
          x: SLIDE_W - 1.8, y: 0.3, w: 1.5, h: 1.4,
        });
      }

      // Tabla de rubros (dos columnas para aprovechar espacio)
      const rubrosOrdenados = [...rubros].sort((a, b) => (a.orden || 0) - (b.orden || 0));
      const mitad = Math.ceil(rubrosOrdenados.length / 2);
      const colA = rubrosOrdenados.slice(0, mitad);
      const colB = rubrosOrdenados.slice(mitad);

      const yInicioTabla = 1.40;
      const alturaFila = 0.38;
      const anchoTabla = (SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN - 0.4) / 2;
      const xColA = LEFT_MARGIN;
      const xColB = LEFT_MARGIN + anchoTabla + 0.4;

      const dibujarFila = (slide, rubro, x, y, w) => {
        const cal = rubro.noAplica ? 'N/A' : (rubro.calificacion != null ? String(rubro.calificacion) : '—');
        const colorBadge = rubro.noAplica ? '888888' : colorHexCalificacion(rubro.calificacion);

        // Fondo de fila
        slide.addShape('rect', {
          x, y, w, h: alturaFila - 0.04,
          fill: { color: COLORS.blanco },
          line: { color: 'CCCCCC', width: 0.5 },
        });

        // Número + nombre
        const nombreCorto = rubro.nombre.length > 55 ? rubro.nombre.substring(0, 52) + '...' : rubro.nombre;
        slide.addText(`${rubro.orden}. ${nombreCorto}`, {
          x: x + 0.08, y, w: w - 0.75, h: alturaFila - 0.04,
          fontSize: 9,
          fontFace: 'Gotham',
          color: COLORS.negro,
          valign: 'middle',
        });

        // Badge de calificación
        slide.addShape('ellipse', {
          x: x + w - 0.58, y: y + 0.04, w: 0.52, h: alturaFila - 0.12,
          fill: { color: colorBadge },
          line: { color: colorBadge, width: 0 },
        });
        slide.addText(cal, {
          x: x + w - 0.58, y: y + 0.04, w: 0.52, h: alturaFila - 0.12,
          fontSize: rubro.noAplica ? 9 : 11,
          fontFace: 'Gotham',
          color: COLORS.blanco,
          bold: true,
          align: 'center',
          valign: 'middle',
        });
      };

      colA.forEach((rubro, i) => {
        dibujarFila(slideTablero, rubro, xColA, yInicioTabla + i * alturaFila, anchoTabla);
      });
      colB.forEach((rubro, i) => {
        dibujarFila(slideTablero, rubro, xColB, yInicioTabla + i * alturaFila, anchoTabla);
      });

      // Cuadro de PROMEDIO
      const yPromedio = 6.55;
      const colorProm = colorHexCalificacion(Math.round(promedioGlobal));
      slideTablero.addShape('rect', {
        x: LEFT_MARGIN, y: yPromedio, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 0.60,
        fill: { color: colorProm },
        line: { color: colorProm, width: 0 },
      });
      slideTablero.addText('PROMEDIO C.P.R.S.', {
        x: LEFT_MARGIN + 0.2, y: yPromedio, w: 3.5, h: 0.60,
        fontSize: 14,
        fontFace: 'Gotham',
        color: COLORS.blanco,
        bold: true,
        valign: 'middle',
      });
      slideTablero.addText(promedioGlobal.toFixed(2), {
        x: SLIDE_W - RIGHT_MARGIN - 1.6, y: yPromedio, w: 1.4, h: 0.60,
        fontSize: 24,
        fontFace: 'Gotham',
        color: COLORS.blanco,
        bold: true,
        align: 'right',
        valign: 'middle',
      });
    }

    // ==================== SLIDES DE RUBROS CON FOTOS ====================
    // Cada rubro tiene su propia diapositiva con título, badge de calificación,
    // checklist de criterios, observación y fotos.
    // Rubros con noAplica generan slide informativo sin fotos.
    console.log('[PPTX] Procesando rubros...');
    if (supervision.areas && supervision.areas.length > 0) {
      const rubrosOrdenadosParaSlides = [...supervision.areas].sort(
        (a, b) => (a.orden || 0) - (b.orden || 0)
      );
      let areaIndex = 0;
      for (const area of rubrosOrdenadosParaSlides) {
        areaIndex++;
        console.log(`[PPTX] Procesando rubro ${areaIndex}/${rubrosOrdenadosParaSlides.length}: ${area.nombre}`);

        const nombreArea = area.nombre;

        // =============== SLIDE PARA RUBRO "NO APLICA" ===============
        if (area.noAplica) {
          const slideNA = pptx.addSlide();
          if (bgGeneral) {
            slideNA.addImage({
              data: `image/png;base64,${bgGeneral}`,
              x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
            });
          }

          slideNA.addText(`RUBRO: ${nombreArea.toUpperCase()}`, {
            x: TITLE_LEFT_MARGIN, y: 0.60, w: SLIDE_W - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN, h: 0.40,
            fontSize: 16,
            fontFace: 'Gotham',
            color: COLORS.guinda,
            bold: true,
            italic: true,
            align: 'center',
          });

          if (mapaBase64) {
            slideNA.addImage({
              data: `image/png;base64,${mapaBase64}`,
              x: SLIDE_W - 1.8, y: 0.3, w: 1.5, h: 1.4,
            });
          }

          // Badge N/A
          slideNA.addShape('ellipse', {
            x: SLIDE_W / 2 - 1.0, y: 2.2, w: 2.0, h: 2.0,
            fill: { color: '888888' },
            line: { color: '888888', width: 0 },
          });
          slideNA.addText('N/A', {
            x: SLIDE_W / 2 - 1.0, y: 2.2, w: 2.0, h: 2.0,
            fontSize: 56,
            fontFace: 'Gotham',
            color: COLORS.blanco,
            bold: true,
            align: 'center',
            valign: 'middle',
          });

          slideNA.addText('EL C.P.R.S. NO CUENTA CON ESTA ÁREA', {
            x: LEFT_MARGIN, y: 4.6, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 0.6,
            fontSize: 20,
            fontFace: 'Gotham',
            color: COLORS.guinda,
            bold: true,
            italic: true,
            align: 'center',
          });

          slideNA.addText(
            'Este rubro no se contabiliza en el promedio general de la supervisión, al no existir infraestructura o servicio correspondiente dentro del Centro Penitenciario.',
            {
              x: LEFT_MARGIN, y: 5.3, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 1.0,
              fontSize: 12,
              fontFace: 'Gotham',
              color: COLORS.negro,
              align: 'center',
              valign: 'top',
              italic: true,
            }
          );
          continue; // siguiente rubro
        }

        // Procesar observación - soporte simple para viñetas
        const observacionTexto = area.sinNovedad ? 'Sin novedad.' : (area.observacion || 'Sin observación registrada.');
        const lineasObservacion = observacionTexto.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0);

        const fotosArea = area.fotos || [];
        const criterios = area.criterios || [];
        const calificacion = area.calificacion;
        const colorCalHex = colorHexCalificacion(calificacion);
        
        // Sistema dinámico para múltiples slides (4 fotos por slide)
        const FOTOS_POR_SLIDE = 4;
        const totalFotos = fotosArea.length;
        const totalSlides = totalFotos === 0 ? 1 : Math.ceil(totalFotos / FOTOS_POR_SLIDE);
        
        // ========== PRIMER SLIDE DEL ÁREA ==========
        const slideArea = pptx.addSlide();
        
        // Fondo general
        if (bgGeneral) {
          slideArea.addImage({
            data: `image/png;base64,${bgGeneral}`,
            x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
          });
        }
        
        // Título con el nombre del rubro
        slideArea.addText(`RUBRO: ${nombreArea.toUpperCase()}`, {
          x: TITLE_LEFT_MARGIN, y: 0.60, w: SLIDE_W - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN - 1.2, h: 0.40,
          fontSize: 16,
          fontFace: 'Gotham',
          color: COLORS.guinda,
          bold: true,
          italic: true,
          align: 'center',
        });

        // Badge de calificación (esquina superior derecha del título)
        if (calificacion != null) {
          slideArea.addShape('ellipse', {
            x: SLIDE_W - 2.0, y: 0.50, w: 0.7, h: 0.7,
            fill: { color: colorCalHex },
            line: { color: COLORS.blanco, width: 2 },
          });
          slideArea.addText(String(calificacion), {
            x: SLIDE_W - 2.0, y: 0.50, w: 0.7, h: 0.7,
            fontSize: 22,
            fontFace: 'Gotham',
            color: COLORS.blanco,
            bold: true,
            align: 'center',
            valign: 'middle',
          });
        }

        // Texto de protocolo (más compacto para dejar espacio al checklist)
        slideArea.addText([
          { text: 'Se realizó la revisión conforme al ', options: { bold: false } },
          { text: 'Protocolo y Procedimiento Sistemático de Operación, ', options: { bold: true, italic: true } },
          { text: 'respetando en todo momento los ', options: { bold: false } },
          { text: 'Derechos Humanos de las Personas Privadas de la Libertad.', options: { bold: true, italic: true } },
        ], {
          x: LEFT_MARGIN, y: 1.05 + TOP_MARGIN, w: SLIDE_W - LEFT_MARGIN - 0.5, h: 0.40,
          fontSize: 10,
          fontFace: 'Gotham',
          color: COLORS.negro,
          align: 'justify',
        });

        // Cuadro de CRITERIOS (si el rubro los tiene)
        let yActual = 1.50 + TOP_MARGIN;
        let alturaCriterios = 0;
        if (criterios.length > 0) {
          const alturaPorCriterio = 0.22;
          alturaCriterios = 0.28 + criterios.length * alturaPorCriterio;

          slideArea.addShape('rect', {
            x: LEFT_MARGIN, y: yActual, w: SLIDE_W - LEFT_MARGIN - 0.6, h: alturaCriterios,
            fill: { color: 'F5F5F5' },
            line: { color: COLORS.dorado, width: 1 },
          });

          slideArea.addText('CRITERIOS EVALUADOS:', {
            x: LEFT_MARGIN + 0.1, y: yActual + 0.02, w: SLIDE_W - LEFT_MARGIN - 0.8, h: 0.24,
            fontSize: 9,
            fontFace: 'Gotham',
            color: COLORS.guinda,
            bold: true,
          });

          criterios.forEach((crit, idx) => {
            const yCrit = yActual + 0.28 + idx * alturaPorCriterio;
            const simbolo = crit.cumple === true ? '✔' : crit.cumple === false ? '✘' : '—';
            const colorSim = crit.cumple === true ? '2E7D32' : crit.cumple === false ? 'C62828' : '888888';

            slideArea.addText(simbolo, {
              x: LEFT_MARGIN + 0.08, y: yCrit, w: 0.25, h: 0.20,
              fontSize: 12,
              fontFace: 'Gotham',
              color: colorSim,
              bold: true,
              valign: 'middle',
            });
            slideArea.addText(`${idx + 1}. ${crit.texto}`, {
              x: LEFT_MARGIN + 0.35, y: yCrit, w: SLIDE_W - LEFT_MARGIN - 1.0, h: 0.20,
              fontSize: 8.5,
              fontFace: 'Gotham',
              color: COLORS.negro,
              valign: 'middle',
            });
          });

          yActual += alturaCriterios + 0.10;
        }

        // Cuadro de OBSERVACIÓN
        const numViñetas = lineasObservacion.length;
        const alturaBaseObs = 0.50;
        const alturaPorViñeta = 0.16;
        const alturaObservacion = Math.min(1.1, alturaBaseObs + (numViñetas - 1) * alturaPorViñeta);

        slideArea.addShape('rect', {
          x: LEFT_MARGIN, y: yActual, w: SLIDE_W - LEFT_MARGIN - 0.6, h: alturaObservacion,
          fill: { color: COLORS.blanco },
          line: { color: COLORS.guinda, width: 1.5 },
        });

        const textoObservacion = lineasObservacion.map(v => `• ${v}`).join('\n');
        slideArea.addText(textoObservacion, {
          x: LEFT_MARGIN + 0.1, y: yActual + 0.03, w: SLIDE_W - LEFT_MARGIN - 0.8, h: alturaObservacion - 0.06,
          fontSize: 9.5,
          fontFace: 'Gotham',
          color: COLORS.negro,
          valign: 'top',
        });

        // Área disponible para fotos
        const yFotos = yActual + alturaObservacion + 0.12;
        const areaDisponibleW = SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN - 1.0;
        const areaDisponibleH = Math.max(2.5, SLIDE_H - yFotos - 0.5);
        const gap = 0.25;
        
        // Función para agregar foto (sin contorno de color)
        const agregarFotoConBorde = async (slide, foto, x, y, w, h) => {
          try {
            const base64 = await imagenABase64(foto.uri);
            if (base64) {
              // Agregar imagen con esquinas normales
              slide.addImage({
                data: `image/jpeg;base64,${base64}`,
                x: x,
                y: y,
                w: w,
                h: h,
                sizing: { type: 'cover', w: w, h: h },
              });
            }
          } catch (imgError) {
            console.log('Error agregando imagen:', imgError);
          }
        };
        
        // Agregar mapa del municipio en la esquina SUPERIOR derecha (si existe)
        if (mapaBase64) {
          slideArea.addImage({
            data: `image/png;base64,${mapaBase64}`,
            x: SLIDE_W - 1.8, // Esquina derecha
            y: 0.3,          // Esquina SUPERIOR
            w: 1.5,
            h: 1.4,
          });
        }
        
        // Layouts según cantidad de fotos en el primer slide
        // Calcular inicio X para centrar las fotos
        const startXBase = LEFT_MARGIN + 0.5;
        
        // Función para agregar fotos con layout flexible
        const agregarFotosAlSlide = async (slide, fotos, yInicio, alturaDisponible) => {
          const numFotos = fotos.length;
          if (numFotos === 0) return;
          
          if (numFotos === 1) {
            // 1 FOTO: Grande y centrada
            const fotoW = 5.5;
            const fotoH = alturaDisponible;
            const startX = LEFT_MARGIN + (areaDisponibleW) / 2 - fotoW / 2 + 0.5;
            await agregarFotoConBorde(slide, fotos[0], startX, yInicio, fotoW, fotoH);
            
          } else if (numFotos === 2) {
            // 2 FOTOS: Lado a lado con buen espaciado
            const fotoW = (areaDisponibleW - gap * 2) / 2;
            const fotoH = alturaDisponible;
            const totalW = fotoW * 2 + gap;
            const startX = LEFT_MARGIN + (areaDisponibleW - totalW) / 2 + 0.5;
            for (let i = 0; i < 2; i++) {
              const posX = startX + i * (fotoW + gap);
              await agregarFotoConBorde(slide, fotos[i], posX, yInicio, fotoW, fotoH);
            }
            
          } else if (numFotos === 3) {
            // 3 FOTOS: 2 arriba, 1 grande abajo centrada
            const fotoPeqW = (areaDisponibleW - gap * 2) / 2;
            const fotoPeqH = alturaDisponible * 0.46;
            const fotoGrandeW = areaDisponibleW * 0.55;
            const fotoGrandeH = alturaDisponible * 0.50;
            
            const totalWArriba = fotoPeqW * 2 + gap;
            const startXArriba = LEFT_MARGIN + (areaDisponibleW - totalWArriba) / 2 + 0.5;
            for (let i = 0; i < 2; i++) {
              const posX = startXArriba + i * (fotoPeqW + gap);
              await agregarFotoConBorde(slide, fotos[i], posX, yInicio, fotoPeqW, fotoPeqH);
            }
            
            const yAbajo = yInicio + fotoPeqH + gap;
            const startXGrande = LEFT_MARGIN + (areaDisponibleW - fotoGrandeW) / 2 + 0.5;
            await agregarFotoConBorde(slide, fotos[2], startXGrande, yAbajo, fotoGrandeW, fotoGrandeH);
            
          } else {
            // 4+ FOTOS: Cuadrícula 2x2
            const fotoW = (areaDisponibleW - gap * 2) / 2;
            const fotoH = (alturaDisponible - gap) / 2;
            const totalW = fotoW * 2 + gap;
            const startX = LEFT_MARGIN + (areaDisponibleW - totalW) / 2 + 0.5;
            
            for (let row = 0; row < 2; row++) {
              for (let col = 0; col < 2; col++) {
                const idx = row * 2 + col;
                if (idx < fotos.length) {
                  const posX = startX + col * (fotoW + gap);
                  const posY = yInicio + row * (fotoH + gap);
                  await agregarFotoConBorde(slide, fotos[idx], posX, posY, fotoW, fotoH);
                }
              }
            }
          }
        };
        
        // Primer slide: agregar fotos (máximo 4)
        const fotosParaPrimerSlide = fotosArea.slice(0, Math.min(4, totalFotos));
        await agregarFotosAlSlide(slideArea, fotosParaPrimerSlide, yFotos, areaDisponibleH);
        
        // ========== SLIDES ADICIONALES SI HAY MÁS DE 4 FOTOS ==========
        // Sistema dinámico: genera tantos slides como sean necesarios (4 fotos por slide)
        if (totalFotos > 4) {
          const fotosRestantes = fotosArea.slice(4);
          const slidesExtras = Math.ceil(fotosRestantes.length / FOTOS_POR_SLIDE);
          
          for (let slideNum = 0; slideNum < slidesExtras; slideNum++) {
            const slideExtra = pptx.addSlide();
            
            if (bgGeneral) {
              slideExtra.addImage({
                data: `image/png;base64,${bgGeneral}`,
                x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
              });
            }
            
            // Título continuación - indicar número de slide si hay más de uno extra
            const textoTitulo = slidesExtras > 1
              ? `RUBRO: ${nombreArea.toUpperCase()} (continuación ${slideNum + 1}/${slidesExtras})`
              : `RUBRO: ${nombreArea.toUpperCase()} (continuación)`;
            
            slideExtra.addText(textoTitulo, {
              x: TITLE_LEFT_MARGIN, y: 0.60, w: SLIDE_W - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN, h: 0.40,
              fontSize: 16,
              fontFace: 'Gotham',
              color: COLORS.guinda,
              bold: true,
              italic: true,
              align: 'center',
            });
            
            // Agregar mapa del municipio en la esquina SUPERIOR derecha (si existe)
            if (mapaBase64) {
              slideExtra.addImage({
                data: `image/png;base64,${mapaBase64}`,
                x: SLIDE_W - 1.8,
                y: 0.3,
                w: 1.5,
                h: 1.4,
              });
            }
            
            const yFotosExtra = 1.15 + TOP_MARGIN;
            const areaExtraH = 5.3;
            
            // Obtener las fotos para este slide extra
            const inicioFoto = slideNum * FOTOS_POR_SLIDE;
            const finFoto = Math.min(inicioFoto + FOTOS_POR_SLIDE, fotosRestantes.length);
            const fotosEsteSlide = fotosRestantes.slice(inicioFoto, finFoto);
            
            await agregarFotosAlSlide(slideExtra, fotosEsteSlide, yFotosExtra, areaExtraH);
          }
        }
      }
    }

    // ==================== SLIDE: RESUMEN EJECUTIVO ====================
    if (rubros.length > 0) {
      const slideResumen = pptx.addSlide();
      if (bgGeneral) {
        slideResumen.addImage({
          data: `image/png;base64,${bgGeneral}`,
          x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
        });
      }

      slideResumen.addText('RESUMEN EJECUTIVO', {
        x: TITLE_LEFT_MARGIN, y: 0.55, w: SLIDE_W - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN, h: 0.40,
        fontSize: 18,
        fontFace: 'Gotham',
        color: COLORS.guinda,
        bold: true,
        italic: true,
        align: 'center',
      });

      if (mapaBase64) {
        slideResumen.addImage({
          data: `image/png;base64,${mapaBase64}`,
          x: SLIDE_W - 1.8, y: 0.3, w: 1.5, h: 1.4,
        });
      }

      const evaluados = rubros.filter(
        (r) => !r.noAplica && typeof r.calificacion === 'number' && r.calificacion >= 1
      );
      const ordenadosDesc = [...evaluados].sort((a, b) => b.calificacion - a.calificacion);
      const top3 = ordenadosDesc.slice(0, 3);
      const oportunidades = evaluados.filter((r) => r.calificacion <= 5);
      const noAplican = rubros.filter((r) => r.noAplica);

      // Columna izquierda: Mejor evaluados
      slideResumen.addText('MEJOR EVALUADOS', {
        x: LEFT_MARGIN, y: 1.4, w: 4.5, h: 0.35,
        fontSize: 12, fontFace: 'Gotham', color: COLORS.guinda, bold: true,
      });
      top3.forEach((r, i) => {
        const y = 1.8 + i * 0.42;
        slideResumen.addShape('ellipse', {
          x: LEFT_MARGIN, y, w: 0.36, h: 0.36,
          fill: { color: colorHexCalificacion(r.calificacion) },
          line: { color: colorHexCalificacion(r.calificacion), width: 0 },
        });
        slideResumen.addText(String(r.calificacion), {
          x: LEFT_MARGIN, y, w: 0.36, h: 0.36,
          fontSize: 12, fontFace: 'Gotham', color: COLORS.blanco, bold: true,
          align: 'center', valign: 'middle',
        });
        slideResumen.addText(r.nombre, {
          x: LEFT_MARGIN + 0.45, y, w: 4.0, h: 0.36,
          fontSize: 10, fontFace: 'Gotham', color: COLORS.negro, valign: 'middle',
        });
      });

      // Columna derecha: Áreas de oportunidad
      slideResumen.addText('ÁREAS DE OPORTUNIDAD (≤5)', {
        x: LEFT_MARGIN + 5.5, y: 1.4, w: 5.5, h: 0.35,
        fontSize: 12, fontFace: 'Gotham', color: COLORS.guinda, bold: true,
      });
      if (oportunidades.length === 0) {
        slideResumen.addText('Sin áreas de oportunidad. Todas las calificaciones son mayores a 5.', {
          x: LEFT_MARGIN + 5.5, y: 1.8, w: 5.5, h: 0.6,
          fontSize: 10, fontFace: 'Gotham', color: COLORS.negro, italic: true,
        });
      } else {
        oportunidades.slice(0, 5).forEach((r, i) => {
          const y = 1.8 + i * 0.42;
          slideResumen.addShape('ellipse', {
            x: LEFT_MARGIN + 5.5, y, w: 0.36, h: 0.36,
            fill: { color: colorHexCalificacion(r.calificacion) },
            line: { color: colorHexCalificacion(r.calificacion), width: 0 },
          });
          slideResumen.addText(String(r.calificacion), {
            x: LEFT_MARGIN + 5.5, y, w: 0.36, h: 0.36,
            fontSize: 12, fontFace: 'Gotham', color: COLORS.blanco, bold: true,
            align: 'center', valign: 'middle',
          });
          slideResumen.addText(r.nombre, {
            x: LEFT_MARGIN + 5.95, y, w: 4.5, h: 0.36,
            fontSize: 10, fontFace: 'Gotham', color: COLORS.negro, valign: 'middle',
          });
        });
      }

      // Rubros No Aplica
      if (noAplican.length > 0) {
        slideResumen.addText('RUBROS NO APLICABLES AL C.P.R.S.', {
          x: LEFT_MARGIN, y: 4.4, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 0.35,
          fontSize: 12, fontFace: 'Gotham', color: COLORS.guinda, bold: true,
        });
        const listaNA = noAplican.map((r) => `• ${r.nombre}`).join('\n');
        slideResumen.addText(listaNA, {
          x: LEFT_MARGIN, y: 4.75, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 1.3,
          fontSize: 10, fontFace: 'Gotham', color: COLORS.negro, valign: 'top',
        });
      }

      // Cuadro de promedio final
      const colorProm2 = colorHexCalificacion(Math.round(promedioGlobal));
      slideResumen.addShape('rect', {
        x: LEFT_MARGIN, y: 6.55, w: SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN, h: 0.60,
        fill: { color: colorProm2 },
        line: { color: colorProm2, width: 0 },
      });
      slideResumen.addText('PROMEDIO GENERAL C.P.R.S.', {
        x: LEFT_MARGIN + 0.2, y: 6.55, w: 5.5, h: 0.60,
        fontSize: 14, fontFace: 'Gotham', color: COLORS.blanco, bold: true, valign: 'middle',
      });
      slideResumen.addText(
        `${promedioGlobal.toFixed(2)} / 10`,
        {
          x: SLIDE_W - RIGHT_MARGIN - 2.2, y: 6.55, w: 2.0, h: 0.60,
          fontSize: 22, fontFace: 'Gotham', color: COLORS.blanco, bold: true,
          align: 'right', valign: 'middle',
        }
      );
    }

    // ==================== SLIDE FINAL: CIERRE ====================
    const slideCierre = pptx.addSlide();
    
    // Fondo de cierre (solo la imagen, sin texto)
    if (bgCierre) {
      slideCierre.addImage({
        data: `image/png;base64,${bgCierre}`,
        x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
      });
    }

    // ==================== GENERAR ARCHIVO ====================
    console.log('[PPTX] Generando archivo final...');
    const nombreArchivo = generarNombreArchivo(nombreCprs, supervision.datosGenerales.fechaHoraSupervision);
    
    if (isWeb) {
      // En web, usar writeFile para descargar directamente
      console.log('[PPTX] Modo Web - descargando archivo...');
      await pptx.writeFile({ fileName: nombreArchivo });
      console.log('[PPTX] === DESCARGA COMPLETADA ===');
      return nombreArchivo; // En web retornamos solo el nombre
    } else {
      // En móvil, guardar en el sistema de archivos
      const filePath = `${FileSystem.documentDirectory}${nombreArchivo}`;

      const pptxBase64 = await pptx.write({ outputType: 'base64' });
      
      await FileSystem.writeAsStringAsync(filePath, pptxBase64, {
        encoding: 'base64',
      });

      console.log('[PPTX] === GENERACIÓN COMPLETADA ===');
      return filePath;
    }
  } catch (error) {
    console.error('[PPTX] Error generando PPTX:', error);
    throw error;
  }
};

/**
 * Comparte un archivo PPTX
 */
export const compartirPPTX = async (filePath) => {
  try {
    // En web, el archivo ya se descargó automáticamente
    if (isWeb) {
      console.log('[PPTX] Web: archivo descargado automáticamente');
      return;
    }
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      console.log('Compartiendo archivo PPTX:', filePath);
      
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        dialogTitle: 'Compartir Supervisión',
      });
    } else {
      throw new Error('Compartir no está disponible en este dispositivo');
    }
  } catch (error) {
    console.error('Error compartiendo archivo:', error);
    throw error;
  }
};