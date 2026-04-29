'use client';

import {
  IconSparkle,
  IconWarning,
  IconTarget,
  IconLightbulb,
  IconCrystalBall,
} from '../ui/icons';

/**
 * Insights automáticos calculados a partir de los datos.
 * Detecta patrones: mejor mejora, peor regresión, más consistente, oportunidad.
 */
export default function InsightsIA({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="text-white/40 text-sm text-center py-8">
        Sin insights suficientes todavía. Agrega más supervisiones.
      </div>
    );
  }

  const iconos = {
    mejora: IconSparkle,
    riesgo: IconWarning,
    consistencia: IconTarget,
    oportunidad: IconLightbulb,
    prediccion: IconCrystalBall,
  };

  const colores = {
    mejora: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5', text: 'text-emerald-300' },
    riesgo: { border: 'border-red-500/40', bg: 'bg-red-500/5', text: 'text-red-300' },
    consistencia: { border: 'border-blue-400/40', bg: 'bg-blue-400/5', text: 'text-blue-300' },
    oportunidad: { border: 'border-dorado-500/40', bg: 'bg-dorado-500/5', text: 'text-dorado-200' },
    prediccion: { border: 'border-purple-400/40', bg: 'bg-purple-400/5', text: 'text-purple-200' },
  };

  return (
    <div className="space-y-3">
      {insights.map((ins, idx) => {
        const col = colores[ins.tipo] || colores.oportunidad;
        const Icon = iconos[ins.tipo] || IconLightbulb;
        return (
          <div
            key={idx}
            className={`${col.bg} ${col.border} border rounded-xl p-3.5 animate-slide-up`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5 ${col.text}`}>
                <Icon width={20} height={20} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${col.text}`}>
                  {ins.titulo}
                </p>
                <p className="text-white/80 text-sm leading-relaxed">{ins.descripcion}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
