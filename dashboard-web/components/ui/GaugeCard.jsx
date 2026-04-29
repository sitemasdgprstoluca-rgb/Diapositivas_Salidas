'use client';

/**
 * GaugeCard — Medidor circular SVG estilo "tubo de cristal" para promedios 0-10.
 *
 * Muestra un anillo SVG con el porcentaje del valor, gradient dorado→guinda
 * según rango (rojo < 6, ámbar 6-7.9, verde ≥ 8). Incluye glow institucional.
 *
 * Props:
 *  - value: número entre 0 y 10 (acepta floats con decimales)
 *  - label: descripción corta
 *  - sublabel: línea opcional secundaria (ej. "126 visitas")
 *  - size: diámetro en px (default 180)
 */
export default function GaugeCard({ value, label, sublabel, size = 180 }) {
  const safe = Math.max(0, Math.min(10, Number.isFinite(value) ? value : 0));
  const pct = safe / 10;

  // Color según rango
  const colorByRange = (v) => {
    if (v >= 8) return { stroke: '#16a34a', glow: 'rgba(22, 163, 74, 0.5)' };
    if (v >= 6) return { stroke: '#ca8a04', glow: 'rgba(202, 138, 4, 0.5)' };
    return { stroke: '#dc2626', glow: 'rgba(220, 38, 38, 0.5)' };
  };
  const { stroke, glow } = colorByRange(safe);

  const radius = (size - 22) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          filter: `drop-shadow(0 0 18px ${glow})`,
        }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={`gauge-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B69566" />
              <stop offset="55%" stopColor={stroke} />
              <stop offset="100%" stopColor="#9F2241" />
            </linearGradient>
          </defs>

          {/* Track (fondo) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />

          {/* Progreso */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={`url(#gauge-grad-${label})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Valor en el centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-4xl font-black tabular-nums text-white"
            style={{ textShadow: `0 0 18px ${glow}` }}
          >
            {safe.toFixed(2)}
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-dorado-300/80 mt-0.5">
            / 10.00
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] uppercase tracking-[0.22em] font-bold text-dorado-300">
        {label}
      </div>
      {sublabel && (
        <div className="mt-0.5 text-xs text-white/60 tabular-nums">{sublabel}</div>
      )}
    </div>
  );
}
