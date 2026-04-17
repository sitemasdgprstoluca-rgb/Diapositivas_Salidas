'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PALETA = ['#D4A94C', '#C64864', '#7CB342', '#1565C0', '#E65100', '#6A1B9A', '#00838F'];

/**
 * Radar por rubros comparando múltiples centros.
 * Datos esperados: [{ rubro: 'Cocina', Centro A: 8, Centro B: 6, ... }, ...]
 */
export default function RadarComparativo({ datos, centros }) {
  if (!datos || datos.length === 0 || centros.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-white/40 text-sm">
        Sin datos suficientes para el radar
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <RadarChart data={datos} outerRadius="75%">
          <defs>
            {centros.map((c, i) => (
              <linearGradient key={c} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={PALETA[i % PALETA.length]} stopOpacity={0.8} />
                <stop offset="100%" stopColor={PALETA[i % PALETA.length]} stopOpacity={0.15} />
              </linearGradient>
            ))}
          </defs>
          <PolarGrid stroke="rgba(201, 168, 118, 0.2)" />
          <PolarAngleAxis
            dataKey="rubro"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
            stroke="rgba(201, 168, 118, 0.2)"
          />
          {centros.map((c, i) => (
            <Radar
              key={c}
              name={c}
              dataKey={c}
              stroke={PALETA[i % PALETA.length]}
              fill={`url(#grad-${i})`}
              strokeWidth={2}
              fillOpacity={0.35}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 6, 8, 0.95)',
              border: '1px solid rgba(201, 168, 118, 0.3)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
