'use client';

/**
 * HexKpiCard — Tarjeta KPI con forma hexagonal estilo HUD institucional.
 *
 * Visual: clip-path polygon hexagonal, fondo radial dorado/vino, halo de icono,
 * número grande con glow, label institucional debajo.
 *
 * Props:
 *  - value: número o string a destacar (ej. "8.45", "126", "92%")
 *  - label: descripción corta (ej. "Promedio general")
 *  - icon: emoji o nodo React renderizado dentro del halo
 *  - tone: "guinda" | "dorado" | "neutro" — ajusta el gradiente
 *  - hint: línea pequeña adicional bajo el label (opcional)
 */
export default function HexKpiCard({ value, label, icon, tone = 'guinda', hint }) {
  const palette = {
    guinda: {
      glow: 'rgba(159, 34, 65, 0.45)',
      ring: 'rgba(159, 34, 65, 0.6)',
      iconBg: 'linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
      iconRing: 'rgba(182, 149, 102, 0.55)',
      valueClass: 'text-white',
    },
    dorado: {
      glow: 'rgba(182, 149, 102, 0.5)',
      ring: 'rgba(182, 149, 102, 0.7)',
      iconBg: 'linear-gradient(135deg, #B69566 0%, #9B6F4A 100%)',
      iconRing: 'rgba(255, 255, 255, 0.35)',
      valueClass: 'text-white',
    },
    neutro: {
      glow: 'rgba(255, 255, 255, 0.15)',
      ring: 'rgba(255, 255, 255, 0.25)',
      iconBg: 'linear-gradient(135deg, #2a1b22 0%, #14080c 100%)',
      iconRing: 'rgba(182, 149, 102, 0.4)',
      valueClass: 'text-dorado-200',
    },
  };

  const p = palette[tone] || palette.guinda;

  return (
    <div className="relative group">
      {/* Halo exterior */}
      <div
        className="absolute inset-0 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${p.glow} 0%, transparent 65%)`,
        }}
      />

      {/* Card hexagonal */}
      <div
        className="relative h-48 px-6 py-7 flex flex-col items-center justify-center text-center transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          background:
            'radial-gradient(ellipse at top, rgba(182,149,102,0.18) 0%, transparent 55%), linear-gradient(180deg, rgba(15,6,8,0.96) 0%, rgba(26,11,16,0.98) 100%)',
          boxShadow: `0 0 0 1px ${p.ring} inset, 0 0 32px -8px ${p.glow}`,
        }}
      >
        {/* Icono con halo */}
        {icon && (
          <div className="relative mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                background: p.iconBg,
                boxShadow: `0 0 0 2px ${p.iconRing}, 0 0 20px -2px ${p.glow}`,
              }}
            >
              <span className="text-white drop-shadow">{icon}</span>
            </div>
          </div>
        )}

        <div
          className={`text-3xl font-black tabular-nums tracking-tight ${p.valueClass}`}
          style={{ textShadow: `0 0 16px ${p.glow}` }}
        >
          {value}
        </div>

        <div className="mt-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-dorado-300/90">
          {label}
        </div>

        {hint && (
          <div className="mt-0.5 text-[9px] text-white/50 tabular-nums">{hint}</div>
        )}
      </div>
    </div>
  );
}
