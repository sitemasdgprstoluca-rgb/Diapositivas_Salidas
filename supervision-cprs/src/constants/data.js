// Lista de C.P.R.S. disponibles
export const LISTA_CPRS = [
  'TENANCINGO SUR',
  'PENITENCIARÍA MODELO',
  'OTUMBA TEPACHICO',
  'LERMA',
  'TLALNEPANTLA',
  'CUAUTITLAN',
  'CHALCO',
  'ZUMPANGO',
  'TENANGO DEL VALLE',
  'JILOTEPEC',
  'NEZAHUALCOYOTL SUR',
  'VALLE DE BRAVO',
  'EL ORO',
  'SULTEPEC',
  'NEZAHUALCOYOTL NORTE',
  'TEXCOCO',
  'NEZA BORDO',
  'ECATEPEC',
  'TENANCINGO CENTRO',
  'IXTLAHUACA',
  'Centro de Internamiento para adolescentes "QUINTA DEL BOSQUE"',
  'SANTIAGUITO',
];

/**
 * Catálogo oficial de RUBROS de indicadores de medición.
 * Orden y criterios tomados literalmente del archivo
 * "Indicadores de Medición por Rubro.xlsx".
 * Escala de calificación: 1-10 (10 = valor más alto).
 * Opción adicional: "No aplica" = EL C.P.R.S NO CUENTA CON ESA ÁREA.
 */
export const RUBROS_INDICADORES = [
  {
    id: 'bitacoras',
    nombre: 'Bitácoras (Kardex)',
    orden: 1,
    criterios: [],
  },
  {
    id: 'almacenes',
    nombre: 'Almacenes: Materias Primas (Harinas), Productos Químicos y Almacén de Víveres',
    nombreCorto: 'Almacenes',
    orden: 2,
    criterios: [
      { id: 'alm-1', texto: 'Registro diario en Kardex de entradas y salidas.' },
      { id: 'alm-2', texto: 'Productos etiquetados con descripción.' },
      { id: 'alm-3', texto: 'Coincidencia entre inventario físico y registros administrativos.' },
      { id: 'alm-4', texto: 'Control de caducidad en productos que lo requieran.' },
    ],
  },
  {
    id: 'armeria',
    nombre: 'Armería',
    orden: 3,
    criterios: [
      { id: 'arm-1', texto: 'Registro de armas por clasificación en Inventario.' },
      { id: 'arm-2', texto: 'Registro de entrega y recepción de armamento por elemento en Bitácora.' },
      { id: 'arm-3', texto: 'Armamento debidamente identificado con sombras.' },
    ],
  },
  {
    id: 'cocina',
    nombre: 'Cocina',
    orden: 4,
    criterios: [
      { id: 'coc-1', texto: 'Sombras e identificaciones de utensilios de Cocina.' },
      { id: 'coc-2', texto: 'Control de entradas y salidas de víveres en Bitácora.' },
      { id: 'coc-3', texto: 'Estufas y equipos en buen estado de funcionamiento.' },
    ],
  },
  {
    id: 'tiendas',
    nombre: 'Tiendas',
    orden: 5,
    criterios: [
      { id: 'tie-1', texto: 'Existencia de inventario actualizado de productos en Tienda.' },
      { id: 'tie-2', texto: 'Control de efectivo o registros de venta diaria en Tienda.' },
      { id: 'tie-3', texto: 'Lista de precios visible y del mes en curso en Tienda.' },
    ],
  },
  {
    id: 'recoleccion_desechos',
    nombre: 'Recolección de desechos',
    orden: 6,
    criterios: [],
  },
  {
    id: 'talleres',
    nombre: 'Talleres de industria',
    orden: 7,
    criterios: [
      { id: 'tal-1', texto: 'Inventario de herramientas actualizado para Taller.' },
      { id: 'tal-2', texto: 'Bitácora de entrega y devolución de herramientas para Taller.' },
      { id: 'tal-3', texto: 'Inventario de herramientas actualizado en Taller.' },
      { id: 'tal-4', texto: 'Sombras e identificaciones en herramientas de Taller.' },
    ],
  },
  {
    id: 'panaderia',
    nombre: 'Panadería',
    orden: 8,
    criterios: [
      { id: 'pan-1', texto: 'Registro de entrada y salida de insumos (harina, azúcar, levadura, etc.) para Pan.' },
      { id: 'pan-2', texto: 'Hornos y equipos en buen estado de funcionamiento.' },
      { id: 'pan-3', texto: 'Almacenamiento adecuado de utensilios de cocina para producción.' },
    ],
  },
  {
    id: 'tortilleria',
    nombre: 'Tortillería',
    orden: 9,
    criterios: [
      { id: 'tor-1', texto: 'Registro de entrada y salida de insumos para producción de Tortillas.' },
      { id: 'tor-2', texto: 'Máquina tortilladora en buen estado.' },
      { id: 'tor-3', texto: 'Control de insumos utilizados para la elaboración con sombras e identificaciones.' },
    ],
  },
  {
    id: 'parque_vehicular',
    nombre: 'Parque Vehicular',
    orden: 10,
    criterios: [
      { id: 'pve-1', texto: 'Bitácora de uso y Responsiva de vehículos actualizada y visible en unidad.' },
      { id: 'pve-2', texto: 'Tarjeta de Circulación en Unidad.' },
      { id: 'pve-3', texto: 'Póliza de Seguro Vigente en Unidad.' },
      { id: 'pve-4', texto: 'Bitácora de recorridos.' },
      { id: 'pve-5', texto: 'Unidades en buenas condiciones.' },
    ],
  },
  {
    id: 'area_medica',
    nombre: 'Área Médica',
    orden: 11,
    criterios: [
      { id: 'med-1', texto: 'Kardex de medicamentos actualizado y visible.' },
      { id: 'med-2', texto: 'Registro de suministro de medicamentos a P.P.L.' },
      { id: 'med-3', texto: 'Equipo médico en buen estado y disponible.' },
    ],
  },
  {
    id: 'lavanderia',
    nombre: 'Área de Lavandería',
    orden: 12,
    criterios: [
      { id: 'lav-1', texto: 'Bitácora con ciclos de lavado realizados por: Kg, Módulo, fecha, etc.' },
      { id: 'lav-2', texto: 'Bitácora de consumo de gas.' },
      { id: 'lav-3', texto: 'Lavadoras y secadoras en buen estado de funcionamiento.' },
    ],
  },
  {
    id: 'subestacion',
    nombre: 'Sub Estación Eléctrica',
    orden: 13,
    criterios: [
      { id: 'sub-1', texto: 'Transformadores en buen estado aparente y funcionales.' },
      { id: 'sub-2', texto: 'Registro o bitácora de mantenimiento de la subestación.' },
      { id: 'sub-3', texto: 'Evidencia de encendido periódico de Planta eléctrica.' },
    ],
  },
  {
    id: 'planta_purificadora',
    nombre: 'Planta Purificadora',
    orden: 14,
    criterios: [
      { id: 'pla-1', texto: 'Equipos de filtración y purificación en buen estado.' },
      { id: 'pla-2', texto: 'Control de distribución o entrega de agua a las áreas correspondientes.' },
    ],
  },
  {
    id: 'necesidades_generales',
    nombre: 'Necesidades Generales',
    orden: 15,
    criterios: [],
  },
];

// Meses en español
export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

// Estados de supervisión
export const ESTADOS_SUPERVISION = {
  BORRADOR: 'borrador',
  FINALIZADO: 'finalizado',
};

// Placeholders de la plantilla PPTX
export const PLACEHOLDERS = {
  FECHA_COMPLETA: '<FECHA_NUMDIA_DE_MES_DE_AÑO>',
  NOMBRE_CPRS: '<Nombre_CPRS>',
  FECHA_DIA_MES: '<FECHA_DIANUMERO_DE_MES>',
  HORA_SUPERVISION: '<HORA_SUPERVISION>',
  OBSERVACIONES_AREAS: '<OBSERVACIONES_IMAGENES_POR_AREA>',
};

/**
 * Calcula el promedio general de calificaciones de rubros evaluados
 * (ignora los rubros marcados como "No aplica").
 */
export const calcularPromedioGeneral = (rubros) => {
  if (!rubros || rubros.length === 0) return 0;
  const evaluados = rubros.filter(
    (r) => !r.noAplica && typeof r.calificacion === 'number' && r.calificacion >= 1
  );
  if (evaluados.length === 0) return 0;
  const suma = evaluados.reduce((acc, r) => acc + r.calificacion, 0);
  return Number((suma / evaluados.length).toFixed(2));
};

/**
 * Devuelve color según escala 1-10 (rojo → amarillo → verde).
 */
export const colorPorCalificacion = (calificacion) => {
  if (calificacion == null) return '#888888';
  if (calificacion <= 4) return '#C62828'; // rojo
  if (calificacion <= 6) return '#F9A825'; // amarillo
  if (calificacion <= 8) return '#7CB342'; // verde claro
  return '#2E7D32'; // verde fuerte
};
