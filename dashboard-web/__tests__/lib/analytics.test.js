/**
 * Tests TDD del módulo lib/analytics.js
 *
 * Cubre las 4 funciones puras extraídas de CompararCliente.js:
 *  - stdDev          → desviación estándar poblacional
 *  - proyectarSiguiente → regresión lineal con ventana 6 + clamp [0,10]
 *  - calcularRanking → ranking de centros con delta vs primera visita
 *  - generarInsights → 5 reglas de insights IA
 */
import { describe, it, expect } from 'vitest';
import {
  stdDev,
  proyectarSiguiente,
  calcularRanking,
  generarInsights,
} from '@/lib/analytics';

/** Helper para construir un punto de la serie */
const punto = (promedio, fechaRaw = '2026-01-01T00:00:00Z') => ({
  promedio,
  fechaRaw,
  fecha: '01 ene',
  id: `id-${Math.random()}`,
});

describe('stdDev — desviación estándar poblacional', () => {
  it('serie vacía → 0', () => {
    expect(stdDev([])).toBe(0);
  });

  it('un solo punto → 0', () => {
    expect(stdDev([7.5])).toBe(0);
  });

  it('dos puntos iguales → 0', () => {
    expect(stdDev([5, 5])).toBe(0);
  });

  it('dos puntos simétricos [4,6] → 1 (varianza poblacional)', () => {
    expect(stdDev([4, 6])).toBe(1);
  });

  it('serie [2,4,4,4,5] → ~0.9798 (mean=3.8, var=0.96)', () => {
    // mean = 3.8; sumSq = 3.24+0.04+0.04+0.04+1.44 = 4.8; var = 4.8/5 = 0.96; sqrt = 0.9798
    expect(stdDev([2, 4, 4, 4, 5])).toBeCloseTo(0.9798, 4);
  });

  it('serie de calificaciones reales [8,8.5,7.9,8.2] → ~0.2291 (mean=8.15)', () => {
    // mean = 8.15; sumSq = 0.0225+0.1225+0.0625+0.0025 = 0.21; var = 0.0525; sqrt = 0.22913
    expect(stdDev([8, 8.5, 7.9, 8.2])).toBeCloseTo(0.2291, 3);
  });

  it('determinismo: mismo input → mismo output', () => {
    const a = stdDev([1, 2, 3, 4, 5]);
    const b = stdDev([1, 2, 3, 4, 5]);
    expect(a).toBe(b);
  });
});

describe('proyectarSiguiente — regresión lineal con ventana 6 + clamp [0,10]', () => {
  it('serie vacía → null', () => {
    expect(proyectarSiguiente([])).toBe(null);
  });

  it('un solo punto → null (length<2 tras slice(-6))', () => {
    expect(proyectarSiguiente([7.5])).toBe(null);
  });

  it('dos puntos crecientes [6,7] → 8 (m=1, b=6, proy=2*1+6)', () => {
    expect(proyectarSiguiente([6, 7])).toBe(8);
  });

  it('dos puntos planos [5,5] → 5 (m=0, b=5)', () => {
    expect(proyectarSiguiente([5, 5])).toBe(5);
  });

  it('tendencia ascendente clipeada al techo [7,8,9] → 10', () => {
    // m=1, proy bruta = 1*3 + 7 = 10, queda igual
    expect(proyectarSiguiente([7, 8, 9])).toBe(10);
  });

  it('tendencia clipeada por arriba: [8,9,10] → 10 (proy bruta=11)', () => {
    expect(proyectarSiguiente([8, 9, 10])).toBe(10);
  });

  it('tendencia descendente clipeada al piso [3,2,1] → 0', () => {
    // m=-1, proy bruta = -1*3 + 3 = 0
    expect(proyectarSiguiente([3, 2, 1])).toBe(0);
  });

  it('tendencia descendente que iría a negativo [2,1,0] → 0 (clamp piso)', () => {
    // m=-1, proy bruta = -1*3 + 2 = -1, clamp a 0
    expect(proyectarSiguiente([2, 1, 0])).toBe(0);
  });

  it('ventana cap 6: [0,0,0,0,7,8,9] (7 puntos) usa últimos 6 → 10', () => {
    // últimos 6 = [0,0,0,7,8,9], n=6
    // sx=15, sy=24, sxy=0+0+0+21+32+45=98, sxx=0+1+4+9+16+25=55
    // m=(6*98 - 15*24)/(6*55 - 225) = (588-360)/(330-225) = 228/105 ≈ 2.171
    // b=(24 - 2.171*15)/6 = (24 - 32.57)/6 ≈ -1.428
    // proy = 2.171*6 + (-1.428) ≈ 11.6 → clamp 10
    expect(proyectarSiguiente([0, 0, 0, 0, 7, 8, 9])).toBe(10);
  });

  it('verifica .toFixed(2): [1,2,3.7] → 4.93', () => {
    // x=[0,1,2], n=3, sx=3, sy=6.7, sxy=0+2+7.4=9.4, sxx=5
    // m=(3*9.4 - 3*6.7)/(3*5 - 9) = (28.2 - 20.1)/6 = 1.35
    // b=(6.7 - 1.35*3)/3 = 2.65/3 ≈ 0.8833
    // proy = 1.35*3 + 0.8833 = 4.9333 → toFixed(2) = 4.93
    expect(proyectarSiguiente([1, 2, 3.7])).toBe(4.93);
  });

  it('caso fraccional típico [6,7,6.5,8] → 8.25', () => {
    // n=4, x=[0,1,2,3], sx=6, sy=27.5, sxy=0+7+13+24=44, sxx=14
    // m=(4*44 - 6*27.5)/(4*14 - 36) = (176-165)/20 = 0.55
    // b=(27.5 - 0.55*6)/4 = 24.2/4 = 6.05
    // proy = 0.55*4 + 6.05 = 8.25
    expect(proyectarSiguiente([6, 7, 6.5, 8])).toBe(8.25);
  });

  it('determinismo: mismo input → mismo output', () => {
    const a = proyectarSiguiente([1, 2, 3, 4, 5]);
    const b = proyectarSiguiente([1, 2, 3, 4, 5]);
    expect(a).toBe(b);
  });
});

describe('calcularRanking — ranking de centros con delta vs primera visita', () => {
  it('sin seleccionados → []', () => {
    expect(calcularRanking([], {})).toEqual([]);
  });

  it('1 centro 1 visita → delta=0, visitas=1, promedio=valor', () => {
    const result = calcularRanking(['A'], { A: [punto(7.5)] });
    expect(result).toEqual([{ nombre: 'A', promedio: 7.5, delta: 0, visitas: 1 }]);
  });

  it('1 centro serie vacía → promedio=0, delta=null, visitas=0', () => {
    const result = calcularRanking(['A'], { A: [] });
    expect(result).toEqual([{ nombre: 'A', promedio: 0, delta: null, visitas: 0 }]);
  });

  it('centro ausente del map → fallback || []', () => {
    const result = calcularRanking(['Z'], {});
    expect(result).toEqual([{ nombre: 'Z', promedio: 0, delta: null, visitas: 0 }]);
  });

  it('delta positivo redondeado: [6, 8.234] → 2.23 (toBe estricto, post-toFixed)', () => {
    const result = calcularRanking(['A'], { A: [punto(6), punto(8.234)] });
    expect(result[0].delta).toBe(2.23);
  });

  it('delta negativo redondeado: [8, 6.5] → -1.5', () => {
    const result = calcularRanking(['A'], { A: [punto(8), punto(6.5)] });
    expect(result[0].delta).toBe(-1.5);
  });

  it('orden descendente por promedio: últimos [6,9,7] → [B,C,A]', () => {
    const result = calcularRanking(['A', 'B', 'C'], {
      A: [punto(5), punto(6)],
      B: [punto(7), punto(9)],
      C: [punto(8), punto(7)],
    });
    expect(result.map((r) => r.nombre)).toEqual(['B', 'C', 'A']);
  });

  it('empate en promedio: ambos quedan en el array', () => {
    const result = calcularRanking(['A', 'B'], {
      A: [punto(7), punto(7)],
      B: [punto(7), punto(7)],
    });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.nombre).sort()).toEqual(['A', 'B']);
  });

  it('5 puntos → visitas === 5', () => {
    const serie = [punto(5), punto(6), punto(7), punto(8), punto(9)];
    const result = calcularRanking(['A'], { A: serie });
    expect(result[0].visitas).toBe(5);
  });

  it('no muta los inputs', () => {
    const seleccionados = Object.freeze(['A', 'B']);
    const seriesPorCentro = Object.freeze({
      A: Object.freeze([punto(5), punto(6)]),
      B: Object.freeze([punto(7), punto(8)]),
    });
    expect(() => calcularRanking(seleccionados, seriesPorCentro)).not.toThrow();
  });

  it('último valor define promedio (no la primera ni la media)', () => {
    const result = calcularRanking(['A'], { A: [punto(2), punto(3), punto(8)] });
    expect(result[0].promedio).toBe(8);
  });
});

describe('generarInsights — 5 reglas de insights IA', () => {
  // Helpers para construir inputs limpios
  const series = (n, nombres) =>
    Object.fromEntries(
      Object.entries(nombres).map(([k, vals]) => [k, vals.map((v) => punto(v))])
    );

  it('sin seleccionados → []', () => {
    expect(
      generarInsights([], {}, [], { proyecciones: {} }, [])
    ).toEqual([]);
  });

  // ─── Regla 1: mejora ───
  it('Regla 1: mejor delta positivo con ≥2 visitas dispara mejora', () => {
    const ranking = [
      { nombre: 'A', promedio: 8, delta: 1.5, visitas: 3 },
      { nombre: 'B', promedio: 7, delta: 0.2, visitas: 2 },
    ];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A', 'B']);
    const mejora = out.find((i) => i.tipo === 'mejora');
    expect(mejora).toBeDefined();
    expect(mejora.titulo).toBe('Mejor progresión');
    expect(mejora.descripcion).toContain('A');
    expect(mejora.descripcion).toContain('+1.50');
  });

  it('Regla 1: delta=0 NO dispara mejora', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 3 }];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'mejora')).toBeUndefined();
  });

  it('Regla 1: visitas=1 con delta>0 NO dispara (filtra <2 visitas)', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 1.5, visitas: 1 }];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'mejora')).toBeUndefined();
  });

  // ─── Regla 2: riesgo ───
  it('Regla 2: peor delta -0.6 dispara riesgo con "0.60"', () => {
    const ranking = [
      { nombre: 'A', promedio: 5, delta: -0.6, visitas: 3 },
      { nombre: 'B', promedio: 7, delta: 0.5, visitas: 2 },
    ];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A', 'B']);
    const riesgo = out.find((i) => i.tipo === 'riesgo');
    expect(riesgo).toBeDefined();
    expect(riesgo.descripcion).toContain('0.60');
    expect(riesgo.descripcion).toContain('A');
  });

  it('Regla 2: delta=-0.5 NO dispara (estricto < -0.5)', () => {
    const ranking = [{ nombre: 'A', promedio: 5, delta: -0.5, visitas: 3 }];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'riesgo')).toBeUndefined();
  });

  it('Regla 2: delta=-0.49 NO dispara', () => {
    const ranking = [{ nombre: 'A', promedio: 5, delta: -0.49, visitas: 3 }];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'riesgo')).toBeUndefined();
  });

  it('Regla 2: delta=-2.0 dispara con "2.00"', () => {
    const ranking = [{ nombre: 'A', promedio: 5, delta: -2, visitas: 3 }];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A']);
    const riesgo = out.find((i) => i.tipo === 'riesgo');
    expect(riesgo).toBeDefined();
    expect(riesgo.descripcion).toContain('2.00');
  });

  // ─── Regla 3: consistencia ───
  it('Regla 3: stdDev=0 con 4 visitas dispara consistencia', () => {
    // serie [7,7,7,7] → stdDev=0 < 0.8
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 4 }];
    const series = { A: [punto(7), punto(7), punto(7), punto(7)] };
    const out = generarInsights(ranking, series, [], { proyecciones: {} }, ['A']);
    const cons = out.find((i) => i.tipo === 'consistencia');
    expect(cons).toBeDefined();
    expect(cons.descripcion).toContain('A');
    expect(cons.descripcion).toContain('4 visitas');
  });

  it('Regla 3: 2 visitas filtrado (requiere >=3)', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 2 }];
    const series = { A: [punto(7), punto(7)] };
    const out = generarInsights(ranking, series, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'consistencia')).toBeUndefined();
  });

  it('Regla 3: 2 centros que cumplen, gana el de menor stdDev', () => {
    // A: [7,7,7] stdDev=0;   B: [6,7,8] stdDev≈0.816 (>0.8 NO cumple)
    // Solo A debería disparar
    const ranking = [
      { nombre: 'A', promedio: 7, delta: 0, visitas: 3 },
      { nombre: 'B', promedio: 8, delta: 2, visitas: 3 },
    ];
    const series = {
      A: [punto(7), punto(7), punto(7)],
      B: [punto(6), punto(7), punto(8)], // stdDev ≈ 0.816 > 0.8 → no cumple
    };
    const out = generarInsights(ranking, series, [], { proyecciones: {} }, ['A', 'B']);
    const cons = out.find((i) => i.tipo === 'consistencia');
    expect(cons).toBeDefined();
    expect(cons.descripcion).toContain('A');
  });

  // ─── Regla 4: oportunidad ───
  it('Regla 4: rubro con calificación 5 del peor centro dispara oportunidad', () => {
    const ranking = [
      { nombre: 'A', promedio: 9, delta: 1, visitas: 2 },
      { nombre: 'Z', promedio: 4, delta: -1, visitas: 2 }, // peor (último del ranking)
    ];
    const radar = [
      { rubro: 'Cocina', orden: 1, A: 9, Z: 5 },
      { rubro: 'Armería', orden: 2, A: 8, Z: 7 },
    ];
    const out = generarInsights(ranking, {}, radar, { proyecciones: {} }, ['A', 'Z']);
    const opp = out.find((i) => i.tipo === 'oportunidad');
    expect(opp).toBeDefined();
    expect(opp.descripcion).toContain('Z');
    expect(opp.descripcion).toContain('Cocina');
    expect(opp.descripcion).toContain('5/10');
  });

  it('Regla 4: calificación 6 dispara (<= 6 inclusive)', () => {
    const ranking = [{ nombre: 'Z', promedio: 6, delta: 0, visitas: 2 }];
    const radar = [{ rubro: 'X', orden: 1, Z: 6 }];
    const out = generarInsights(ranking, {}, radar, { proyecciones: {} }, ['Z']);
    expect(out.find((i) => i.tipo === 'oportunidad')).toBeDefined();
  });

  it('Regla 4: calificación 7 NO dispara', () => {
    const ranking = [{ nombre: 'Z', promedio: 7, delta: 0, visitas: 2 }];
    const radar = [{ rubro: 'X', orden: 1, Z: 7 }];
    const out = generarInsights(ranking, {}, radar, { proyecciones: {} }, ['Z']);
    expect(out.find((i) => i.tipo === 'oportunidad')).toBeUndefined();
  });

  it('Regla 4: radarData=[] no dispara', () => {
    const ranking = [{ nombre: 'A', promedio: 5, delta: 0, visitas: 2 }];
    const out = generarInsights(ranking, {}, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'oportunidad')).toBeUndefined();
  });

  // ─── Regla 5: predicción ───
  it('Regla 5: proyección sube 0.3 dispara con "subir" + "7.30"', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 2 }];
    const series = { A: [punto(6.5), punto(7)] };
    const evolucion = { proyecciones: { A: 7.3 } };
    const out = generarInsights(ranking, series, [], evolucion, ['A']);
    const pred = out.find((i) => i.tipo === 'prediccion');
    expect(pred).toBeDefined();
    expect(pred.descripcion).toContain('subir');
    expect(pred.descripcion).toContain('7.30');
  });

  it('Regla 5: proyección baja 0.4 dispara con "bajar" + "7.60"', () => {
    const ranking = [{ nombre: 'A', promedio: 8, delta: 0, visitas: 2 }];
    const series = { A: [punto(7.8), punto(8)] };
    const evolucion = { proyecciones: { A: 7.6 } };
    const out = generarInsights(ranking, series, [], evolucion, ['A']);
    const pred = out.find((i) => i.tipo === 'prediccion');
    expect(pred).toBeDefined();
    expect(pred.descripcion).toContain('bajar');
    expect(pred.descripcion).toContain('7.60');
  });

  it('Regla 5: delta=0.1 exacto NO dispara (estricto > 0.1)', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 2 }];
    const series = { A: [punto(6.9), punto(7)] };
    const evolucion = { proyecciones: { A: 7.1 } };
    const out = generarInsights(ranking, series, [], evolucion, ['A']);
    expect(out.find((i) => i.tipo === 'prediccion')).toBeUndefined();
  });

  it('Regla 5: delta=0.11 dispara', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 2 }];
    const series = { A: [punto(6.9), punto(7)] };
    const evolucion = { proyecciones: { A: 7.11 } };
    const out = generarInsights(ranking, series, [], evolucion, ['A']);
    expect(out.find((i) => i.tipo === 'prediccion')).toBeDefined();
  });

  it('Regla 5: proyecciones={} no dispara', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 2 }];
    const series = { A: [punto(7)] };
    const out = generarInsights(ranking, series, [], { proyecciones: {} }, ['A']);
    expect(out.find((i) => i.tipo === 'prediccion')).toBeUndefined();
  });

  it('Regla 5: evolucionData={} (sin .proyecciones) tolera con || {}', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 0, visitas: 2 }];
    const series = { A: [punto(7)] };
    expect(() =>
      generarInsights(ranking, series, [], {}, ['A'])
    ).not.toThrow();
  });

  // ─── Casos integrados ───
  it('escenario completo dispara las 5 reglas en orden estricto', () => {
    // Diseño:
    //  - Mejora: A delta=+2 (ranking[0]) — gana mejora
    //  - Riesgo: Z delta=-1 (ranking peor) — gana riesgo
    //  - Consistencia: A serie [9,9,9,9] stdDev=0 con 4 visitas
    //  - Oportunidad: Z tiene rubro con cal=5 (peor del ranking)
    //  - Predicción: A proyección 9.5 (último=9, delta+0.5)
    const ranking = [
      { nombre: 'A', promedio: 9, delta: 2, visitas: 4 },
      { nombre: 'Z', promedio: 5, delta: -1, visitas: 3 },
    ];
    const series = {
      A: [punto(9), punto(9), punto(9), punto(9)],
      Z: [punto(6), punto(5.5), punto(5)],
    };
    const radar = [
      { rubro: 'Cocina', orden: 1, A: 9, Z: 5 },
    ];
    const evolucion = { proyecciones: { A: 9.5 } };

    const out = generarInsights(ranking, series, radar, evolucion, ['A', 'Z']);
    const tipos = out.map((i) => i.tipo);
    expect(tipos).toEqual(['mejora', 'riesgo', 'consistencia', 'oportunidad', 'prediccion']);
  });

  it('determinismo: mismo input → mismo output', () => {
    const ranking = [{ nombre: 'A', promedio: 7, delta: 1, visitas: 3 }];
    const series = { A: [punto(6), punto(6.5), punto(7)] };
    const a = generarInsights(ranking, series, [], { proyecciones: {} }, ['A']);
    const b = generarInsights(ranking, series, [], { proyecciones: {} }, ['A']);
    expect(a).toEqual(b);
  });

  it('no muta los inputs (Object.freeze no lanza)', () => {
    const ranking = Object.freeze([
      Object.freeze({ nombre: 'A', promedio: 7, delta: 1, visitas: 3 }),
    ]);
    const series = Object.freeze({
      A: Object.freeze([punto(6), punto(7), punto(7)]),
    });
    const radar = Object.freeze([]);
    const evolucion = Object.freeze({ proyecciones: Object.freeze({}) });
    expect(() =>
      generarInsights(ranking, series, radar, evolucion, ['A'])
    ).not.toThrow();
  });
});
