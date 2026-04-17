'use client';

const PALETA = ['#D4A94C', '#C64864', '#7CB342', '#1565C0', '#E65100', '#6A1B9A', '#00838F'];

export default function RankingGeneral({ centros }) {
  // centros = [{ nombre, promedio, delta }], ordenado desc
  if (!centros || centros.length === 0) {
    return (
      <div className="text-white/40 text-sm text-center py-8">
        Selecciona centros para ver el ranking
      </div>
    );
  }

  const max = Math.max(...centros.map((c) => c.promedio));

  return (
    <div className="space-y-3">
      {centros.map((c, i) => {
        const pct = max > 0 ? (c.promedio / 10) * 100 : 0;
        const color = PALETA[i % PALETA.length];
        return (
          <div key={c.nombre} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                />
                <span className="text-white/90 text-sm font-semibold truncate max-w-[180px]">
                  {c.nombre}
                </span>
              </div>
              <span className="text-white font-bold text-sm glow-gold">
                {c.promedio.toFixed(2)}
              </span>
            </div>
            <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}55, ${color})`,
                  boxShadow: `0 0 12px ${color}80`,
                }}
              />
            </div>
            {c.delta != null && (
              <div className="flex items-center justify-end mt-1">
                <span
                  className={`text-[10px] font-bold ${
                    c.delta > 0 ? 'text-green-400' : c.delta < 0 ? 'text-red-400' : 'text-white/40'
                  }`}
                >
                  {c.delta > 0 ? '▲ +' : c.delta < 0 ? '▼ ' : '= '}
                  {Math.abs(c.delta).toFixed(2)} vs primera visita
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
