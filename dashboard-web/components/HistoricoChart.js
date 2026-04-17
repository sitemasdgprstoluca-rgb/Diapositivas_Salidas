'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function HistoricoChart({ datos }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} ticks={[0, 2, 4, 6, 8, 10]} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value) => [value?.toFixed(2), 'Promedio']}
          />
          <ReferenceLine y={6} stroke="#F9A825" strokeDasharray="4 4" label={{ value: 'Regular', fontSize: 10, fill: '#F9A825', position: 'left' }} />
          <ReferenceLine y={8} stroke="#7CB342" strokeDasharray="4 4" label={{ value: 'Bueno', fontSize: 10, fill: '#7CB342', position: 'left' }} />
          <Line
            type="monotone"
            dataKey="promedio"
            stroke="#8A2035"
            strokeWidth={3}
            dot={{ r: 5, fill: '#8A2035' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
