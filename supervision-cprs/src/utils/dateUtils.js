import { MESES } from '../constants/data';

/**
 * Formatea una fecha al formato "DD de mes de YYYY"
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFechaCompleta = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = MESES[date.getMonth()];
  const anio = date.getFullYear();
  return `${dia} de ${mes} de ${anio}`;
};

/**
 * Formatea una fecha al formato "DD de mes"
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFechaDiaMes = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = MESES[date.getMonth()];
  return `${dia} de ${mes}`;
};

/**
 * Formatea una hora al formato "HH:MM"
 * @param {Date|string} hora - Hora a formatear
 * @returns {string} Hora formateada
 */
export const formatearHora = (hora) => {
  if (!hora) return '';
  const date = new Date(hora);
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
};

/**
 * Formatea una fecha al formato "YYYY-MM-DD"
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFechaArchivo = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const anio = date.getFullYear();
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const dia = date.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

/**
 * Genera el nombre del archivo PPTX
 * @param {string} nombreCprs - Nombre del C.P.R.S.
 * @param {Date|string} fecha - Fecha de la supervisión
 * @returns {string} Nombre del archivo
 */
export const generarNombreArchivo = (nombreCprs, fecha) => {
  const nombreLimpio = nombreCprs.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, '_');
  const fechaFormateada = formatearFechaArchivo(fecha);
  return `Supervision_CPRS_${nombreLimpio}_${fechaFormateada}.pptx`;
};

/**
 * Formatea una fecha para mostrar en listas
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha formateada para display
 */
export const formatearFechaDisplay = (fechaISO) => {
  if (!fechaISO) return '';
  const date = new Date(fechaISO);
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const anio = date.getFullYear();
  const hora = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${min}`;
};
