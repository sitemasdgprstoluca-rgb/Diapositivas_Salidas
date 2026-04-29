/**
 * Funciones puras de analítica para el dashboard /comparar.
 *
 * Extraídas de components/CompararCliente.js para ser testeables
 * independientemente del componente React.
 *
 * Convenciones:
 *  - Las series numéricas son Array<number> (proyectarSiguiente, stdDev)
 *  - Las series por centro son { [nombre]: Array<{ promedio, fechaRaw, ... }> }
 *  - Ningún input es mutado.
 */

/**
 * Desviación estándar poblacional (divide entre n, no n-1).
 * Devuelve 0 si la serie tiene menos de 2 elementos.
 *
 * @param {number[]} serie
 * @returns {number}
 */
export function stdDev(serie) {
  if (serie.length < 2) return 0;
  const mean = serie.reduce((a, v) => a + v, 0) / serie.length;
  const variance = serie.reduce((a, v) => a + (v - mean) ** 2, 0) / serie.length;
  return Math.sqrt(variance);
}

/**
 * Proyecta el siguiente valor de una serie usando regresión lineal
 * mínimos cuadrados sobre los últimos 6 puntos. El resultado se redondea
 * a 2 decimales y se limita al rango [0, 10].
 *
 * @param {number[]} serie
 * @returns {number|null}  null si la serie tiene menos de 2 puntos.
 */
export function proyectarSiguiente(serie) {
  const ultimos = serie.slice(-6);
  if (ultimos.length < 2) return null;
  const n = ultimos.length;
  const sx = ultimos.reduce((a, _, i) => a + i, 0);
  const sy = ultimos.reduce((a, v) => a + v, 0);
  const sxy = ultimos.reduce((a, v, i) => a + i * v, 0);
  const sxx = ultimos.reduce((a, _, i) => a + i * i, 0);
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const b = (sy - m * sx) / n;
  const proyectado = m * n + b;
  return Math.max(0, Math.min(10, Number(proyectado.toFixed(2))));
}

/**
 * Calcula el ranking de centros ordenado por promedio descendente.
 * El "promedio" de cada centro es la calificación de su última supervisión.
 * El "delta" es la diferencia entre la última y la primera visita,
 * redondeado a 2 decimales. Es null si no hay primera visita.
 *
 * @param {string[]} seleccionados  nombres de centros
 * @param {Object<string, Array<{promedio: number, fechaRaw: string}>>} seriesPorCentro
 * @returns {Array<{nombre: string, promedio: number, delta: number|null, visitas: number}>}
 */
export function calcularRanking(seleccionados, seriesPorCentro) {
  return seleccionados
    .map((nombre) => {
      const serie = seriesPorCentro[nombre] || [];
      const primera = serie[0]?.promedio;
      const ultima = serie[serie.length - 1]?.promedio || 0;
      const delta = primera != null ? Number((ultima - primera).toFixed(2)) : null;
      return { nombre, promedio: ultima, delta, visitas: serie.length };
    })
    .sort((a, b) => b.promedio - a.promedio);
}

/**
 * Regla 1 — Mejor mejora: centro con mayor delta positivo entre los que
 * tienen ≥2 visitas. Devuelve el insight o null si nadie cumple.
 *
 * @param {Array<{nombre:string, delta:number|null, visitas:number}>} ranking
 * @returns {{tipo:'mejora', titulo:string, descripcion:string}|null}
 */
export function regla1Mejora(ranking) {
  const conDelta = ranking.filter((r) => r.delta != null && r.visitas >= 2);
  if (conDelta.length === 0) return null;
  const mejor = [...conDelta].sort((a, b) => b.delta - a.delta)[0];
  if (mejor.delta <= 0) return null;
  return {
    tipo: 'mejora',
    titulo: 'Mejor progresión',
    descripcion: `${mejor.nombre} subió +${mejor.delta.toFixed(2)} puntos desde su primera visita. Reconoce prácticas y replícalas.`,
  };
}

/**
 * Regla 2 — Regresión detectada: centro con peor delta < -0.5 entre los
 * que tienen ≥2 visitas. Devuelve insight o null.
 *
 * @param {Array<{nombre:string, delta:number|null, visitas:number}>} ranking
 * @returns {{tipo:'riesgo', titulo:string, descripcion:string}|null}
 */
export function regla2Riesgo(ranking) {
  const conDelta = ranking.filter((r) => r.delta != null && r.visitas >= 2);
  if (conDelta.length === 0) return null;
  const peor = [...conDelta].sort((a, b) => a.delta - b.delta)[0];
  if (peor.delta >= -0.5) return null;
  return {
    tipo: 'riesgo',
    titulo: 'Regresión detectada',
    descripcion: `${peor.nombre} bajó ${Math.abs(peor.delta).toFixed(2)} puntos. Se recomienda supervisión de seguimiento.`,
  };
}

/**
 * Regla 3 — Consistencia: centro con menor stdDev (<0.8) entre los que
 * tienen ≥3 visitas. Devuelve insight o null.
 *
 * @param {string[]} seleccionados
 * @param {Object<string, Array<{promedio:number}>>} seriesPorCentro
 * @returns {{tipo:'consistencia', titulo:string, descripcion:string}|null}
 */
export function regla3Consistencia(seleccionados, seriesPorCentro) {
  const consistencias = seleccionados
    .map((nombre) => {
      const serie = (seriesPorCentro[nombre] || []).map((s) => s.promedio);
      return { nombre, sd: stdDev(serie), visitas: serie.length };
    })
    .filter((c) => c.visitas >= 3);
  if (consistencias.length === 0) return null;
  const masCons = [...consistencias].sort((a, b) => a.sd - b.sd)[0];
  if (masCons.sd >= 0.8) return null;
  return {
    tipo: 'consistencia',
    titulo: 'Mayor consistencia',
    descripcion: `${masCons.nombre} mantiene desempeño estable (desviación de ${masCons.sd.toFixed(2)} en ${masCons.visitas} visitas).`,
  };
}

/**
 * Regla 4 — Área de oportunidad: rubro más bajo (≤6) del peor centro
 * del ranking. Devuelve insight o null.
 *
 * @param {Array<{nombre:string}>} ranking
 * @param {Array<{rubro:string, orden:number, [centro:string]:number}>} radarData
 * @returns {{tipo:'oportunidad', titulo:string, descripcion:string}|null}
 */
export function regla4Oportunidad(ranking, radarData) {
  if (ranking.length === 0 || radarData.length === 0) return null;
  const peorCentro = ranking[ranking.length - 1].nombre;
  const rubroPeor = [...radarData]
    .filter((r) => r[peorCentro] != null)
    .sort((a, b) => (a[peorCentro] || 0) - (b[peorCentro] || 0))[0];
  if (!rubroPeor || rubroPeor[peorCentro] > 6) return null;
  return {
    tipo: 'oportunidad',
    titulo: 'Área de oportunidad',
    descripcion: `${peorCentro} tiene su calificación más baja en "${rubroPeor.rubro}" (${rubroPeor[peorCentro]}/10). Focalizar acciones correctivas ahí.`,
  };
}

/**
 * Regla 5 — Tendencia proyectada: proyección con mayor |delta|>0.1 sobre
 * el último valor real. Devuelve insight o null.
 *
 * @param {Object<string, Array<{promedio:number}>>} seriesPorCentro
 * @param {{proyecciones?: Object<string, number>}} evolucionData
 * @returns {{tipo:'prediccion', titulo:string, descripcion:string}|null}
 */
export function regla5Prediccion(seriesPorCentro, evolucionData) {
  const projs = Object.entries(evolucionData?.proyecciones || {});
  if (projs.length === 0) return null;
  const subiendo = projs
    .map(([nombre, proy]) => {
      const ultimo = (seriesPorCentro[nombre] || []).slice(-1)[0]?.promedio || 0;
      return { nombre, proy, delta: proy - ultimo };
    })
    .sort((a, b) => b.delta - a.delta)[0];
  if (!subiendo || Math.abs(subiendo.delta) <= 0.1) return null;
  return {
    tipo: 'prediccion',
    titulo: 'Tendencia proyectada',
    descripcion: `${subiendo.nombre} proyecta ${subiendo.delta > 0 ? 'subir' : 'bajar'} a ${subiendo.proy.toFixed(2)} en la próxima visita según tendencia.`,
  };
}

/**
 * Genera insights de IA orquestando las 5 reglas en orden:
 * mejora → riesgo → consistencia → oportunidad → prediccion.
 * El orden importa: la UI los renderiza en orden de array.
 *
 * @param {Array<{nombre:string, promedio:number, delta:number|null, visitas:number}>} ranking
 * @param {Object<string, Array<{promedio:number}>>} seriesPorCentro
 * @param {Array<{rubro:string, orden:number, [centro:string]:number}>} radarData
 * @param {{proyecciones?: Object<string, number>}} evolucionData
 * @param {string[]} seleccionados
 * @returns {Array<{tipo:string, titulo:string, descripcion:string}>}
 */
export function generarInsights(ranking, seriesPorCentro, radarData, evolucionData, seleccionados) {
  if (seleccionados.length === 0) return [];
  return [
    regla1Mejora(ranking),
    regla2Riesgo(ranking),
    regla3Consistencia(seleccionados, seriesPorCentro),
    regla4Oportunidad(ranking, radarData),
    regla5Prediccion(seriesPorCentro, evolucionData),
  ].filter((insight) => insight !== null);
}

/**
 * Agrupa supervisiones por centro, ordenadas cronológicamente,
 * normalizando la forma cruda de Supabase a `{fecha, promedio, id, fechaRaw}`.
 *
 * @param {string[]} seleccionados
 * @param {Array<{id:string, nombre_cprs:string, fecha_hora_supervision:string, promedio_general:number|string|null}>} todasSups
 * @returns {Object<string, Array<{fecha:string, promedio:number, id:string, fechaRaw:string}>>}
 */
export function generarSeriesPorCentro(seleccionados, todasSups) {
  const map = {};
  for (const nombre of seleccionados) {
    map[nombre] = todasSups
      .filter((s) => s.nombre_cprs === nombre)
      .slice() // clona para no mutar inputs frozen
      .sort(
        (a, b) =>
          new Date(a.fecha_hora_supervision) - new Date(b.fecha_hora_supervision)
      )
      .map((s) => ({
        fecha: new Date(s.fecha_hora_supervision).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
        }),
        promedio: Number(s.promedio_general || 0),
        id: s.id,
        fechaRaw: s.fecha_hora_supervision,
      }));
  }
  return map;
}

/**
 * Construye los datos del radar comparativo: cada entrada representa
 * un rubro con la calificación que cada centro dio en su última
 * supervisión. Los rubros marcados `no_aplica` se excluyen.
 * Nombres >18 caracteres se truncan a 16+'…'.
 *
 * @param {string[]} seleccionados
 * @param {Object<string, Array<{id:string}>>} seriesPorCentro
 * @param {Object<string, Array<{rubro_catalog_id:string, nombre:string, orden:number, calificacion:number, no_aplica:boolean}>>} rubrosPorSup
 * @returns {Array<{rubro:string, orden:number, [centro:string]:number}>}
 */
export function calcularRadarData(seleccionados, seriesPorCentro, rubrosPorSup) {
  const rubros = new Map();
  for (const nombre of seleccionados) {
    const serie = seriesPorCentro[nombre] || [];
    const ultimaSup = serie[serie.length - 1];
    if (!ultimaSup) continue;
    const rs = (rubrosPorSup[ultimaSup.id] || []).filter((r) => !r.no_aplica);
    for (const r of rs) {
      if (!rubros.has(r.rubro_catalog_id)) {
        rubros.set(r.rubro_catalog_id, {
          rubro: r.nombre.length > 18 ? r.nombre.substring(0, 16) + '…' : r.nombre,
          orden: r.orden,
        });
      }
      rubros.get(r.rubro_catalog_id)[nombre] = r.calificacion || 0;
    }
  }
  return Array.from(rubros.values()).sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

/**
 * Construye la matriz temporal para la gráfica de evolución, con una
 * fila por cada fecha distinta + una fila final "Próx. estim." con la
 * proyección de cada centro que tenga ≥2 visitas.
 *
 * @param {string[]} seleccionados
 * @param {Object<string, Array<{promedio:number, fechaRaw:string}>>} seriesPorCentro
 * @returns {{rows: Array<Object>, ultimaFechaReal: string|null, proyecciones: Object<string, number>}}
 */
export function generarEvolucionData(seleccionados, seriesPorCentro) {
  const proyecciones = {};
  const todasLasFechas = new Set();
  const indexPorCentroYFecha = {};

  for (const nombre of seleccionados) {
    const serie = seriesPorCentro[nombre] || [];
    indexPorCentroYFecha[nombre] = {};
    for (const s of serie) {
      todasLasFechas.add(s.fechaRaw);
      indexPorCentroYFecha[nombre][s.fechaRaw] = s.promedio;
    }
    if (serie.length >= 2) {
      const proy = proyectarSiguiente(serie.map((s) => s.promedio));
      if (proy != null) proyecciones[nombre] = proy;
    }
  }

  const ordenadas = Array.from(todasLasFechas).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const rows = ordenadas.map((fechaRaw) => {
    const row = {
      fecha: new Date(fechaRaw).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      }),
    };
    for (const nombre of seleccionados) {
      row[nombre] = indexPorCentroYFecha[nombre][fechaRaw] ?? null;
    }
    return row;
  });

  const ultimaFechaReal = rows[rows.length - 1]?.fecha || null;

  if (Object.keys(proyecciones).length > 0) {
    const rowProy = { fecha: 'Próx. estim.' };
    for (const nombre of seleccionados) {
      rowProy[nombre] = proyecciones[nombre] ?? null;
    }
    rows.push(rowProy);
  }

  return { rows, ultimaFechaReal, proyecciones };
}
