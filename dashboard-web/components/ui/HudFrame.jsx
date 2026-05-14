'use client';

import { motion } from 'framer-motion';

/**
 * HudFrame premium adaptativo (light/dark vía CSS vars).
 * - Esquinas con brackets sutiles
 * - Header opcional con título / subtítulo / badge
 * - Glass + glow institucional
 *
 * Props:
 *  - title, subtitle, badge, children
 *  - tone: "auto" (default, sigue el theme) | "dark" (siempre HUD oscuro) | "light"
 *  - accent: color hex para los corner brackets (default dorado)
 *  - delay: number (segundos para stagger entrance)
 */
export default function HudFrame({
  title,
  subtitle,
  tone = 'auto',
  badge,
  accent = '#B69566',
  delay = 0,
  children,
  className = '',
}) {
  const forceDark = tone === 'dark';
  const forceLight = tone === 'light';

  // Estilos según tone
  let bg, border, headerBorder, titleColor, subtitleColor, textColor;

  if (forceDark) {
    bg = `
      radial-gradient(ellipse at 20% 0%, rgba(182,149,102,0.10) 0%, transparent 60%),
      linear-gradient(180deg, rgba(15,6,8,0.96) 0%, rgba(26,11,16,0.94) 100%)
    `;
    border = '1px solid rgba(182, 149, 102, 0.22)';
    headerBorder = 'rgba(182, 149, 102, 0.18)';
    titleColor = '#DDC9A3';
    subtitleColor = 'rgba(255,255,255,0.55)';
    textColor = '#f8fafc';
  } else if (forceLight) {
    bg = 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.86) 100%)';
    border = '1px solid rgba(159, 34, 65, 0.10)';
    headerBorder = 'rgba(159, 34, 65, 0.08)';
    titleColor = '#5C2E37';
    subtitleColor = '#64748b';
    textColor = '#0f172a';
  } else {
    bg = 'var(--bg-card)';
    border = '1px solid var(--border-subtle)';
    headerBorder = 'var(--border-subtle)';
    titleColor = 'var(--brand-accent)';
    subtitleColor = 'var(--text-tertiary)';
    textColor = 'var(--text-primary)';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${className}`}
      style={{
        background: bg,
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        border,
        boxShadow: forceDark
          ? '0 0 28px -4px rgba(159,34,65,0.45), inset 0 1px 0 0 rgba(255,255,255,0.05)'
          : 'var(--shadow-floating)',
        borderRadius: '18px',
        color: textColor,
      }}
    >
      {/* Corner brackets */}
      <CornerBracket position="top-left"  color={accent} />
      <CornerBracket position="top-right" color={accent} />
      <CornerBracket position="bottom-left"  color={accent} />
      <CornerBracket position="bottom-right" color={accent} />

      {/* Línea superior brillante */}
      <span
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/2 rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.55,
        }}
      />

      {(title || badge) && (
        <div
          className="flex items-start justify-between gap-3 px-6 py-4 border-b"
          style={{ borderColor: headerBorder }}
        >
          <div className="min-w-0">
            {title && (
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block w-1 h-4 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}
                />
                <h3
                  className="text-[11px] uppercase tracking-[0.20em] font-bold"
                  style={{ color: titleColor }}
                >
                  {title}
                </h3>
              </div>
            )}
            {subtitle && (
              <p className="mt-1 text-xs ml-3" style={{ color: subtitleColor }}>
                {subtitle}
              </p>
            )}
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function CornerBracket({ position, color }) {
  const size = 14;
  const offset = 8;
  const styles = {
    'top-left': {
      top: offset, left: offset,
      borderTop: `2px solid ${color}`,
      borderLeft: `2px solid ${color}`,
      borderTopLeftRadius: '4px',
    },
    'top-right': {
      top: offset, right: offset,
      borderTop: `2px solid ${color}`,
      borderRight: `2px solid ${color}`,
      borderTopRightRadius: '4px',
    },
    'bottom-left': {
      bottom: offset, left: offset,
      borderBottom: `2px solid ${color}`,
      borderLeft: `2px solid ${color}`,
      borderBottomLeftRadius: '4px',
    },
    'bottom-right': {
      bottom: offset, right: offset,
      borderBottom: `2px solid ${color}`,
      borderRight: `2px solid ${color}`,
      borderBottomRightRadius: '4px',
    },
  };

  return (
    <span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        opacity: 0.75,
        ...styles[position],
      }}
    />
  );
}
