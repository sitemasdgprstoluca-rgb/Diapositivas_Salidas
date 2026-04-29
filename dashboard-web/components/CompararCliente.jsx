'use client';

import { useMemo, useState } from 'react';
import RadarComparativo from './analytics/RadarComparativo';
import EvolucionConPrediccion from './analytics/EvolucionConPrediccion';
import RankingGeneral from './analytics/RankingGeneral';
import InsightsIA from './analytics/InsightsIA';
import {
  calcularRanking,
  generarInsights,
  generarSeriesPorCentro,
  calcularRadarData,
  generarEvolucionData,
} from '@/lib/analytics';

const PALETA = ['#D4A94C', '#C64864', '#7CB342', '#1565C0', '#E65100', '#6A1B9A', '#00838F'];

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

  // Datos por centro: array de { fecha, promedio, id, fechaRaw }
  const seriesPorCentro = useMemo(
    () => generarSeriesPorCentro(seleccionados, todasSups),
    [seleccionados, todasSups]
  );

  // Ranking con delta vs primera visita
  const ranking = useMemo(
    () => calcularRanking(seleccionados, seriesPorCentro),
    [seleccionados, seriesPorCentro]
  );

  // Evolución temporal unificada con proyección lineal de la próxima visita
  const evolucionData = useMemo(
    () => generarEvolucionData(seleccionados, seriesPorCentro),
    [seleccionados, seriesPorCentro]
  );

  // Datos para radar (última supervisión por centro, calificación por rubro)
  const radarData = useMemo(
    () => calcularRadarData(seleccionados, seriesPorCentro, rubrosPorSup),
    [seleccionados, seriesPorCentro, rubrosPorSup]
  );

  // Insights de IA calculados automáticamente (5 reglas, ver lib/analytics.js)
  const insights = useMemo(
    () => generarInsights(ranking, seriesPorCentro, radarData, evolucionData, seleccionados),
    [seleccionados, ranking, seriesPorCentro, radarData, evolucionData]
  );

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
