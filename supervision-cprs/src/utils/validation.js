/**
 * Valida los datos generales de una supervisión
 * @param {Object} datosGenerales - Objeto con los datos generales
 * @returns {Object} Objeto con isValid y errores
 */
export const validarDatosGenerales = (datosGenerales) => {
  const errores = {};

  if (!datosGenerales.fechaHoraSupervision) {
    errores.fechaHoraSupervision = 'La fecha y hora es requerida';
  }

  if (!datosGenerales.nombreCprs || datosGenerales.nombreCprs.trim() === '') {
    errores.nombreCprs = 'El C.P.R.S. es requerido';
  }

  return {
    isValid: Object.keys(errores).length === 0,
    errores,
  };
};

/**
 * Valida un área
 * @param {Object} area - Objeto de área
 * @returns {Object} Objeto con isValid y errores
 */
export const validarArea = (area) => {
  const errores = {};

  if (!area.nombre || area.nombre.trim() === '') {
    errores.nombre = 'El nombre del área es requerido';
  }

  if (!area.sinNovedad && (!area.observacion || area.observacion.trim() === '')) {
    errores.observacion = 'La observación es requerida (o marque "Sin novedad")';
  }

  // Validar que tenga al menos una foto
  if (!area.fotos || area.fotos.length === 0) {
    errores.fotos = 'Se requiere al menos una foto por área';
  }

  return {
    isValid: Object.keys(errores).length === 0,
    errores,
  };
};

/**
 * Valida toda la supervisión antes de generar el PPTX
 * @param {Object} supervision - Objeto de supervisión completo
 * @returns {Object} Objeto con isValid, errores y advertencias
 */
export const validarSupervisionCompleta = (supervision) => {
  const errores = [];
  const advertencias = [];

  // Validar datos generales
  const validacionDatos = validarDatosGenerales(supervision.datosGenerales);
  if (!validacionDatos.isValid) {
    Object.values(validacionDatos.errores).forEach((error) => {
      errores.push(error);
    });
  }

  // Validar áreas
  if (!supervision.areas || supervision.areas.length === 0) {
    advertencias.push('No se han registrado áreas. Se generará con "Sin observaciones registradas."');
  } else {
    supervision.areas.forEach((area, index) => {
      const validacionArea = validarArea(area);
      if (!validacionArea.isValid) {
        Object.values(validacionArea.errores).forEach((error) => {
          errores.push(`Área ${index + 1}: ${error}`);
        });
      }
    });
  }

  return {
    isValid: errores.length === 0,
    errores,
    advertencias,
    puedeGenerar: errores.length === 0, // Puede generar aunque tenga advertencias
  };
};
