/**
 * Paletas para diferenciar series en charts (centros, rubros, etc).
 * Derivadas de la paleta institucional + dorado para garantizar contraste.
 */

export const PALETA_CENTROS = [
  '#9F2241', // vino primary
  '#B69566', // dorado primary
  '#5C2E37', // vino oscuro
  '#9B6F4A', // dorado oscuro
  '#B94D69', // vino claro
  '#DDC9A3', // dorado claro
  '#7A5638', // marrón institucional
];

export const COLOR_SERIE = (i) => PALETA_CENTROS[i % PALETA_CENTROS.length];
