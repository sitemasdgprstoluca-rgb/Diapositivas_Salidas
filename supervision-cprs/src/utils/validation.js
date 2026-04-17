/**
 * Valida los datos generales de una supervisión
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
 * Valida un rubro individual.
 * Reglas:
 *  - Si noAplica: no requiere nada más.
 *  - Si aplica: debe tener calificación entera 1-10.
 *  - Todos los criterios deben estar respondidos (SI/NO).
 *  - Debe tener observación o estar marcado "sin novedad".
 *  - Debe tener al menos una foto (si aplica).
 */
export const validarRubro = (rubro) => {
  const errores = {};

  if (rubro.noAplica) {
    // No aplica - nada más que validar
    return { isValid: true, errores: {} };
  }

  // Calificación obligatoria, entera, 1-10
  const cal = rubro.calificacion;
  if (cal == null || !Number.isInteger(cal) || cal < 1 || cal > 10) {
    errores.calificacion = 'La calificación (1-10) es obligatoria';
  }

  // Todos los criterios deben estar respondidos
  if (rubro.criterios && rubro.criterios.length > 0) {
    const sinResponder = rubro.criterios.filter((c) => c.cumple !== true && c.cumple !== false);
    if (sinResponder.length > 0) {
      errores.criterios = `Faltan ${sinResponder.length} criterio(s) por responder (SÍ/NO)`;
    }
  }

  if (!rubro.sinNovedad && (!rubro.observacion || rubro.observacion.trim() === '')) {
    errores.observacion = 'La observación es requerida (o marque "Sin novedad")';
  }

  if (!rubro.fotos || rubro.fotos.length === 0) {
    errores.fotos = 'Se requiere al menos una foto';
  }

  return {
    isValid: Object.keys(errores).length === 0,
    errores,
  };
};

// Compatibilidad con nombre anterior
export const validarArea = validarRubro;

/**
 * Valida toda la supervisión antes de generar el PPTX
 */
export const validarSupervisionCompleta = (supervision) => {
  const errores = [];
  const advertencias = [];

  const validacionDatos = validarDatosGenerales(supervision.datosGenerales);
  if (!validacionDatos.isValid) {
    Object.values(validacionDatos.errores).forEach((error) => {
      errores.push(error);
    });
  }

  if (!supervision.areas || supervision.areas.length === 0) {
    errores.push('No hay rubros cargados en la supervisión.');
  } else {
    supervision.areas.forEach((rubro) => {
      const validacionRubro = validarRubro(rubro);
      if (!validacionRubro.isValid) {
        Object.values(validacionRubro.errores).forEach((error) => {
          errores.push(`${rubro.nombre}: ${error}`);
        });
      }
    });

    const evaluados = supervision.areas.filter((r) => !r.noAplica);
    if (evaluados.length === 0) {
      advertencias.push('Todos los rubros están marcados como "No aplica". No se calculará promedio.');
    }
  }

  return {
    isValid: errores.length === 0,
    errores,
    advertencias,
    puedeGenerar: errores.length === 0,
  };
};
