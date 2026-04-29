'use client';

import { useMemo, useState } from 'react';
import RadarComparativo from './analytics/RadarComparativo';
import EvolucionConPrediccion from './analytics/EvolucionConPrediccion';
import RankingGeneral from './analytics/RankingGeneral';
import InsightsIA from './analytics/InsightsIA';
import HexKpiCard from './ui/HexKpiCard';
import HudFrame from './ui/HudFrame';
import {
  IconBuilding,
  IconRadar,
  IconClipboard,
  IconBrain,
  IconTrophy,
  IconLineChart,
} from './ui/icons';
import {
  calcularRanking,
  generarInsights,
  generarSeriesPorCentro,
  calcularRadarData,
  generarEvolucionData,
} from '@/lib/analytics';

// Paleta institucional para diferenciar centros (vino, dorado, oscuro, complementarios)
const PALETA = ['#9F2241', '#B69566', '#5C2E37', '#9B6F4A', '#7A5638', '#B94D69', '#C9B07F'];

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

  const seriesPorCentro = useMemo(
    () => generarSeriesPorCentro(seleccionados, todasSups),
    [seleccionados, todasSups]
  );

  const ranking = useMemo(
    () => calcularRanking(seleccionados, seriesPorCentro),
    [seleccionados, seriesPorCentro]
  );

  const evolucionData = useMemo(
    () => generarEvolucionData(seleccionados, seriesPorCentro),
    [seleccionados, seriesPorCentro]
  );

  const radarData = useMemo(
    () => calcularRadarData(seleccionados, seriesPorCentro, rubrosPorSup),
    [seleccionados, seriesPorCentro, rubrosPorSup]
  );

  const insights = useMemo(
    () => generarInsights(ranking, seriesPorCentro, radarData, evolucionData, seleccionados),
    [seleccionados, ranking, seriesPorCentro, radarData, evolucionData]
  );

  const totalVisitas = ranking.reduce((acc, r) => acc + r.visitas, 0);

  return (
    <div>
      {/* KPIs hexagonales premium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <HexKpiCard
          icon={IconBuilding}
          value={`${seleccionados.length}/${centrosDisponibles.length}`}
          label="Centros seleccionados"
          tone="guinda"
        />
        <HexKpiCard
          icon={IconRadar}
          value={`${radarData.length}/15`}
          label="Rubros analizados"
          tone="dorado"
        />
        <HexKpiCard
          icon={IconClipboard}
          value={totalVisitas}
          label="Supervisiones"
          tone="neutro"
        />
        <HexKpiCard
          icon={IconBrain}
          value={insights.length}
          label="Insights IA"
          tone="dorado"
          hint="generados automáticamente"
        />
      </div>

      {/* Selector de centros */}
      <HudFrame
        title="Selecciona centros a comparar"
        subtitle="Hasta 7 centros simultáneos · clic para alternar"
        tone="dark"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dorado-500/15 border border-dorado-500/30 text-[11px] font-bold text-dorado-300 tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-dorado-500 animate-pulse" />
            {seleccionados.length}/7
          </span>
        }
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2">
          {centrosDisponibles.map((c) => {
            const activo = seleccionados.includes(c);
            const color = PALETA[seleccionados.indexOf(c) % PALETA.length];
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${
                  activo
                    ? 'text-white border-transparent shadow-lg'
                    : 'text-white/65 border-white/15 hover:border-dorado-500/50 hover:text-white bg-white/5'
                }`}
                style={
                  activo
                    ? {
                        background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                        boxShadow: `0 0 18px -2px ${color}88`,
                      }
                    : undefined
                }
              >
                {activo && '●  '}{c}
              </button>
            );
          })}
        </div>
      </HudFrame>

      {seleccionados.length === 0 ? (
        <HudFrame tone="dark" className="text-center py-20">
          <p className="text-white/45 text-lg">
            Selecciona al menos un centro para ver las analíticas.
          </p>
        </HudFrame>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col izquierda: Ranking + Insights */}
          <div className="space-y-6 lg:col-span-1">
            <HudFrame
              title="Ranking general"
              subtitle="ordenado por promedio · delta vs primera visita"
              tone="dark"
              badge={<IconTrophy className="text-dorado-300" />}
            >
              <RankingGeneral centros={ranking} />
            </HudFrame>

            <HudFrame
              title="Insights de IA"
              subtitle="patrones detectados automáticamente"
              tone="dark"
              badge={<IconBrain className="text-dorado-300" />}
            >
              <InsightsIA insights={insights} />
            </HudFrame>
          </div>

          {/* Col central: Radar */}
          <HudFrame
            title="Desempeño por rubro"
            subtitle="última supervisión por centro"
            tone="dark"
            badge={<IconRadar className="text-dorado-300" />}
            className="lg:col-span-1"
          >
            <RadarComparativo datos={radarData} centros={seleccionados} />
          </HudFrame>

          {/* Col derecha: Evolución + predicción */}
          <HudFrame
            title="Evolución + predicción"
            subtitle="regresión lineal sobre las últimas visitas"
            tone="dark"
            badge={<IconLineChart className="text-dorado-300" />}
            className="lg:col-span-1"
          >
            <EvolucionConPrediccion
              datos={evolucionData.rows}
              centros={seleccionados}
              ultimaFechaReal={evolucionData.ultimaFechaReal}
            />
            <p className="text-[10px] text-dorado-300/60 text-center mt-3 italic uppercase tracking-wider">
              Zona dorada = proyección lineal próxima visita
            </p>
          </HudFrame>
        </div>
      )}
    </div>
  );
}
