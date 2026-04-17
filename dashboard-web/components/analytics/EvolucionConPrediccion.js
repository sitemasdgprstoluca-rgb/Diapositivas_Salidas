'use client';

import {
  LineChart, Line, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea
} from 'recharts';

const PALETA = ['#D4A94C', '#C64864', '#7CB342', '#1565C0', '#E65100', '#6A1B9A', '#00838F'];

/**
 * Evolución temporal multi-centro con zona de predicción (dashed).
 * datos = [{ fecha, Centro A: 7.5, Centro B: 8.2, predicted: true|false }, ...]
 */
export default function EvolucionConPrediccion({ datos, centros, ultimaFechaReal }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-white/40 text-sm">
        Sin datos suficientes
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <ComposedChart data={datos} margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
          <defs>
            {centros.map((c, i) => (
              <linearGradient key={c} id={`line-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PALETA[i % PALETA.length]} stopOpacity={0.4} />
                <stop offset="100%" stopColor={PALETA[i % PALETA.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid stroke="rgba(201, 168, 118, 0.1)" strokeDasharray="3 3" />
          <XAxis
            dataKey="fecha"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            stroke="rgba(201, 168, 118, 0.3)"
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            stroke="rgba(201, 168, 118, 0.3)"
          />

          {/* Zona de proyección sombreada */}
          {ultimaFechaReal && (
            <ReferenceArea
              x1={ultimaFechaReal}
              x2={datos[datos.length - 1]?.fecha}
              fill="rgba(201, 168, 118, 0.06)"
              strokeOpacity={0}
              label={{ value: 'Proyección', fill: 'rgba(201,168,118,0.6)', fontSize: 10, position: 'insideTopRight' }}
            />
          )}

          <ReferenceLine y={6} stroke="#F9A825" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={8} stroke="#7CB342" strokeDasharray="4 4" strokeOpacity={0.5} />

          <Tooltip
            contentStyle={{
              background: 'rgba(15, 6, 8, 0.95)',
              border: '1px solid rgba(201, 168, 118, 0.3)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', paddingTop: 8 }} />

          {centros.map((c, i) => (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={PALETA[i % PALETA.length]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: PALETA[i % PALETA.length], strokeWidth: 0 }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
