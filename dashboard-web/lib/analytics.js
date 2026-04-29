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
 * Genera insights de IA aplicando 5 reglas en orden de inserción:
 *  1. mejora        — mejor delta positivo entre centros con ≥2 visitas
 *  2. riesgo        — peor delta < -0.5 entre centros con ≥2 visitas
 *  3. consistencia  — menor stdDev (<0.8) entre centros con ≥3 visitas
 *  4. oportunidad   — rubro más débil (≤6) del peor centro del ranking
 *  5. prediccion    — proyección con mayor |delta| > 0.1 sobre último valor
 *
 * El orden de los items en el array final importa para la UI; conserva
 * el orden de inserción de las reglas.
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
  const out = [];

  // 1) Mejor mejora
  const conDelta = ranking.filter((r) => r.delta != null && r.visitas >= 2);
  if (conDelta.length > 0) {
    const mejor = [...conDelta].sort((a, b) => b.delta - a.delta)[0];
    if (mejor.delta > 0) {
      out.push({
        tipo: 'mejora',
        titulo: 'Mejor progresión',
        descripcion: `${mejor.nombre} subió +${mejor.delta.toFixed(2)} puntos desde su primera visita. Reconoce prácticas y replícalas.`,
      });
    }
    // 2) Regresión
    const peor = [...conDelta].sort((a, b) => a.delta - b.delta)[0];
    if (peor.delta < -0.5) {
      out.push({
        tipo: 'riesgo',
        titulo: 'Regresión detectada',
        descripcion: `${peor.nombre} bajó ${Math.abs(peor.delta).toFixed(2)} puntos. Se recomienda supervisión de seguimiento.`,
      });
    }
  }

  // 3) Más consistente
  const consistencias = seleccionados
    .map((nombre) => {
      const serie = (seriesPorCentro[nombre] || []).map((s) => s.promedio);
      return { nombre, sd: stdDev(serie), visitas: serie.length };
    })
    .filter((c) => c.visitas >= 3);
  if (consistencias.length > 0) {
    const masCons = [...consistencias].sort((a, b) => a.sd - b.sd)[0];
    if (masCons.sd < 0.8) {
      out.push({
        tipo: 'consistencia',
        titulo: 'Mayor consistencia',
        descripcion: `${masCons.nombre} mantiene desempeño estable (desviación de ${masCons.sd.toFixed(2)} en ${masCons.visitas} visitas).`,
      });
    }
  }

  // 4) Oportunidad: rubro más débil del peor centro
  if (ranking.length > 0 && radarData.length > 0) {
    const peorCentro = ranking[ranking.length - 1].nombre;
    const rubroPeor = [...radarData]
      .filter((r) => r[peorCentro] != null)
      .sort((a, b) => (a[peorCentro] || 0) - (b[peorCentro] || 0))[0];
    if (rubroPeor && rubroPeor[peorCentro] <= 6) {
      out.push({
        tipo: 'oportunidad',
        titulo: 'Área de oportunidad',
        descripcion: `${peorCentro} tiene su calificación más baja en "${rubroPeor.rubro}" (${rubroPeor[peorCentro]}/10). Focalizar acciones correctivas ahí.`,
      });
    }
  }

  // 5) Predicción destacada
  const projs = Object.entries(evolucionData.proyecciones || {});
  if (projs.length > 0) {
    const subiendo = projs
      .map(([nombre, proy]) => {
        const ultimo = (seriesPorCentro[nombre] || []).slice(-1)[0]?.promedio || 0;
        return { nombre, proy, delta: proy - ultimo };
      })
      .sort((a, b) => b.delta - a.delta)[0];
    if (subiendo && Math.abs(subiendo.delta) > 0.1) {
      out.push({
        tipo: 'prediccion',
        titulo: 'Tendencia proyectada',
        descripcion: `${subiendo.nombre} proyecta ${subiendo.delta > 0 ? 'subir' : 'bajar'} a ${subiendo.proy.toFixed(2)} en la próxima visita según tendencia.`,
      });
    }
  }

  return out;
}
