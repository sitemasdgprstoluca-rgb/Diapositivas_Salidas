'use client';

import { useMemo, useState } from 'react';
import RadarComparativo from './analytics/RadarComparativo';
import EvolucionConPrediccion from './analytics/EvolucionConPrediccion';
import RankingGeneral from './analytics/RankingGeneral';
import InsightsIA from './analytics/InsightsIA';

const PALETA = ['#D4A94C', '#C64864', '#7CB342', '#1565C0', '#E65100', '#6A1B9A', '#00838F'];

/**
 * Regresión lineal simple para proyectar el siguiente valor.
 * Usa mínimos cuadrados sobre los últimos N puntos (cap 6 para estabilidad).
 */
function proyectarSiguiente(serie) {
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

/** Desviación estándar para medir consistencia. */
function stdDev(serie) {
  if (serie.length < 2) return 0;
  const mean = serie.reduce((a, v) => a + v, 0) / serie.length;
  const variance = serie.reduce((a, v) => a + (v - mean) ** 2, 0) / serie.length;
  return Math.sqrt(variance);
}

export default function CompararCliente({ centrosDisponibles, todasSups, rubrosPorSup }) {
  const [seleccionados, setSeleccionados] = useState(centrosDisponibles.slice(0, Math.min(3, centrosDisponibles.length)));

  const toggle = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((n) => n !== nombre)
        : prev.length < 7
          ? [...prev, nombre]
          : prev
    );
  };

  // Datos por centro: array de { fecha, promedio, supId }
  const seriesPorCentro = useMemo(() => {
    const map = {};
    for (const nombre of seleccionados) {
      const sups = todasSups
        .filter((s) => s.nombre_cprs === nombre)
        .sort((a, b) => new Date(a.fecha_hora_supervision) - new Date(b.fecha_hora_supervision))
        .map((s) => ({
          fecha: new Date(s.fecha_hora_supervision).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
          promedio: Number(s.promedio_general || 0),
          id: s.id,
          fechaRaw: s.fecha_hora_supervision,
        }));
      map[nombre] = sups;
    }
    return map;
  }, [seleccionados, todasSups]);

  // Ranking con delta vs primera visita
  const ranking = useMemo(() => {
    return seleccionados.map((nombre) => {
      const serie = seriesPorCentro[nombre] || [];
      const primera = serie[0]?.promedio;
      const ultima = serie[serie.length - 1]?.promedio || 0;
      const delta = primera != null ? Number((ultima - primera).toFixed(2)) : null;
      return { nombre, promedio: ultima, delta, visitas: serie.length };
    }).sort((a, b) => b.promedio - a.promedio);
  }, [seleccionados, seriesPorCentro]);

  // Evolución temporal unificada con proyección
  const evolucionData = useMemo(() => {
    const fechas = new Set();
    const proyecciones = {};

    for (const nombre of seleccionados) {
      const serie = seriesPorCentro[nombre] || [];
      serie.forEach((s) => fechas.add(s.fecha));
      const proy = proyectarSiguiente(serie.map((s) => s.promedio));
      if (proy != null && serie.length >= 2) {
        proyecciones[nombre] = proy;
      }
    }

    const fechasOrdenadas = Array.from(fechas).sort(
      (a, b) => {
        // parsear "17 abr" etc. Como ya están ordenadas por serie, usamos el primer orden
        return 0;
      }
    );

    // Recomponer con orden temporal real usando fechaRaw
    const todasLasFechas = new Set();
    const indexPorCentroYFecha = {};
    for (const nombre of seleccionados) {
      indexPorCentroYFecha[nombre] = {};
      (seriesPorCentro[nombre] || []).forEach((s) => {
        todasLasFechas.add(s.fechaRaw);
        indexPorCentroYFecha[nombre][s.fechaRaw] = s.promedio;
      });
    }

    const ordenadas = Array.from(todasLasFechas).sort((a, b) => new Date(a) - new Date(b));
    const rows = ordenadas.map((fechaRaw) => {
      const row = {
        fecha: new Date(fechaRaw).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }),
      };
      for (const nombre of seleccionados) {
        row[nombre] = indexPorCentroYFecha[nombre][fechaRaw] ?? null;
      }
      return row;
    });

    const ultimaFechaReal = rows[rows.length - 1]?.fecha || null;

    // Agregar punto de proyección (próxima visita estimada)
    if (Object.keys(proyecciones).length > 0) {
      const rowProy = { fecha: 'Próx. estim.' };
      for (const nombre of seleccionados) {
        rowProy[nombre] = proyecciones[nombre] ?? null;
      }
      rows.push(rowProy);
    }

    return { rows, ultimaFechaReal, proyecciones };
  }, [seleccionados, seriesPorCentro]);

  // Datos para radar (última supervisión por centro, promedio por rubro)
  const radarData = useMemo(() => {
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
  }, [seleccionados, seriesPorCentro, rubrosPorSup]);

  // Insights de IA calculados automáticamente
  const insights = useMemo(() => {
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
    const consistencias = seleccionados.map((nombre) => {
      const serie = (seriesPorCentro[nombre] || []).map((s) => s.promedio);
      return { nombre, sd: stdDev(serie), visitas: serie.length };
    }).filter((c) => c.visitas >= 3);
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
  }, [seleccionados, ranking, seriesPorCentro, radarData, evolucionData]);

  const totalVisitas = ranking.reduce((acc, r) => acc + r.visitas, 0);

  return (
    <div>
      {/* KPIs superiores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPI label="Centros seleccionados" value={seleccionados.length} suffix={`/${centrosDisponibles.length}`} />
        <KPI label="Rubros analizados" value={radarData.length} suffix="/15" />
        <KPI label="Supervisiones" value={totalVisitas} />
        <KPI label="Insights IA" value={insights.length} highlight />
      </div>

      {/* Selector de centros */}
      <div className="analytics-card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/90 font-bold text-sm uppercase tracking-wider">
            Selecciona centros a comparar
          </h3>
          <span className="text-xs text-white/50">
            {seleccionados.length}/7 · máx 7
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {centrosDisponibles.map((c, i) => {
            const activo = seleccionados.includes(c);
            const color = PALETA[seleccionados.indexOf(c) % PALETA.length];
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${
                  activo
                    ? 'text-white border-transparent shadow-lg'
                    : 'text-white/60 border-white/20 hover:border-white/50 hover:text-white/90 bg-white/5'
                }`}
                style={
                  activo
                    ? {
                        background: `linear-gradient(135deg, ${color}CC, ${color}66)`,
                        boxShadow: `0 0 16px ${color}44`,
                      }
                    : undefined
                }
              >
                {activo && '●  '}{c}
              </button>
            );
          })}
        </div>
      </div>

      {seleccionados.length === 0 ? (
        <div className="analytics-card p-16 text-center">
          <p className="text-white/40 text-lg">Selecciona al menos un centro para ver las analíticas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col izquierda: Ranking + Insights */}
          <div className="space-y-6 lg:col-span-1">
            <div className="analytics-card p-5 analytics-card-hover">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400">🏆</span>
                <h3 className="text-white/90 font-bold text-sm uppercase tracking-wider">Ranking General</h3>
              </div>
              <RankingGeneral centros={ranking} />
            </div>

            <div className="analytics-card p-5 analytics-card-hover">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-purple-400">🧠</span>
                <h3 className="text-white/90 font-bold text-sm uppercase tracking-wider">Insights de IA</h3>
              </div>
              <InsightsIA insights={insights} />
            </div>
          </div>

          {/* Col central: Radar */}
          <div className="analytics-card p-5 analytics-card-hover lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">📊</span>
                <h3 className="text-white/90 font-bold text-sm uppercase tracking-wider">
                  Desempeño por Rubro
                </h3>
              </div>
              <span className="text-[10px] text-white/40">última supervisión</span>
            </div>
            <RadarComparativo datos={radarData} centros={seleccionados} />
          </div>

          {/* Col derecha: Evolución + predicción */}
          <div className="analytics-card p-5 analytics-card-hover lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-green-300">📈</span>
                <h3 className="text-white/90 font-bold text-sm uppercase tracking-wider">
                  Evolución + Predicción
                </h3>
              </div>
            </div>
            <EvolucionConPrediccion
              datos={evolucionData.rows}
              centros={seleccionados}
              ultimaFechaReal={evolucionData.ultimaFechaReal}
            />
            <p className="text-[10px] text-white/40 text-center mt-2 italic">
              Zona dorada = proyección por regresión lineal sobre últimas visitas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, suffix, highlight }) {
  return (
    <div className={`analytics-card p-4 ${highlight ? 'shadow-glow-gold' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${highlight ? 'text-gradient-gold animate-glow-pulse' : 'text-white'}`}>
        {value}
        {suffix && <span className="text-base text-white/40 font-medium"> {suffix}</span>}
      </p>
    </div>
  );
}
