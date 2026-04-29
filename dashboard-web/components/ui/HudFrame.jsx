'use client';

/**
 * HudFrame — Marco sci-fi tipo HUD con esquinas en ángulo y resplandor dorado/vino.
 *
 * Wrap de cualquier contenido con una estética "panel de mando institucional".
 * Las cuatro esquinas tienen brackets, un título opcional aparece en la barra superior.
 *
 * Props:
 *  - title: título corto del panel (opcional)
 *  - subtitle: descripción opcional bajo el título
 *  - tone: "dark" | "light" — fondo y contraste
 *  - badge: nodo opcional renderizado a la derecha del título (ej. contador)
 *  - children: contenido envuelto
 *  - className: clases extra
 */
export default function HudFrame({
  title,
  subtitle,
  tone = 'dark',
  badge,
  children,
  className = '',
}) {
  const isDark = tone === 'dark';
  const cornerColor = isDark ? '#B69566' : '#9F2241';

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 20% 0%, rgba(182,149,102,0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(15,6,8,0.96) 0%, rgba(26,11,16,0.94) 100%)'
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(14px) saturate(120%)',
        WebkitBackdropFilter: 'blur(14px) saturate(120%)',
        border: isDark
          ? '1px solid rgba(182, 149, 102, 0.18)'
          : '1px solid rgba(159, 34, 65, 0.10)',
        boxShadow: isDark
          ? '0 0 24px -4px rgba(159, 34, 65, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.04)'
          : '0 8px 24px -6px rgba(159, 34, 65, 0.12), inset 0 1px 0 0 rgba(255,255,255,0.7)',
        borderRadius: '14px',
      }}
    >
      {/* Brackets superiores */}
      <CornerBracket position="top-left" color={cornerColor} />
      <CornerBracket position="top-right" color={cornerColor} />
      <CornerBracket position="bottom-left" color={cornerColor} />
      <CornerBracket position="bottom-right" color={cornerColor} />

      {/* Header */}
      {(title || badge) && (
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{
            borderColor: isDark
              ? 'rgba(182, 149, 102, 0.15)'
              : 'rgba(159, 34, 65, 0.08)',
          }}
        >
          <div>
            {title && (
              <h3
                className={`text-[11px] uppercase tracking-[0.22em] font-bold ${
                  isDark ? 'text-dorado-300' : 'text-institucional-700'
                }`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`mt-0.5 text-xs ${
                  isDark ? 'text-white/55' : 'text-slate-500'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  );
}

function CornerBracket({ position, color }) {
  const base = 'absolute w-3.5 h-3.5 pointer-events-none';
  const styles = {
    'top-left': {
      top: -1,
      left: -1,
      borderTop: `2px solid ${color}`,
      borderLeft: `2px solid ${color}`,
      borderTopLeftRadius: '4px',
    },
    'top-right': {
      top: -1,
      right: -1,
      borderTop: `2px solid ${color}`,
      borderRight: `2px solid ${color}`,
      borderTopRightRadius: '4px',
    },
    'bottom-left': {
      bottom: -1,
      left: -1,
      borderBottom: `2px solid ${color}`,
      borderLeft: `2px solid ${color}`,
      borderBottomLeftRadius: '4px',
    },
    'bottom-right': {
      bottom: -1,
      right: -1,
      borderBottom: `2px solid ${color}`,
      borderRight: `2px solid ${color}`,
      borderBottomRightRadius: '4px',
    },
  };
  return <div className={base} style={styles[position]} />;
}
