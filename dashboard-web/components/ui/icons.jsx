/**
 * Iconos SVG institucionales — line icons con stroke fino estilo premium.
 * Inspirados en Lucide / Phosphor pero hechos a mano para no añadir dependencia.
 *
 * Convenciones:
 *  - viewBox 0 0 24 24
 *  - stroke="currentColor", fill="none"
 *  - strokeWidth 1.5 (delgado, elegante)
 *  - strokeLinecap/Linejoin "round" (suavidad)
 *  - tamaño default 22px, override por className
 */

const baseProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconBuilding(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 9h0M9 13h0M9 17h0M15 9h0M15 13h0M15 17h0" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

export function IconClipboard(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 11h6M9 15h6M9 19h4" />
    </svg>
  );
}

export function IconChart(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 21V3" />
      <path d="M21 21H3" />
      <rect x="6" y="13" width="3" height="6" rx="0.5" />
      <rect x="11" y="9" width="3" height="10" rx="0.5" />
      <rect x="16" y="5" width="3" height="14" rx="0.5" />
    </svg>
  );
}

export function IconTarget(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconBrain(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 5v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-13a3 3 0 0 0-3-3z" />
      <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 5v0a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3" />
      <path d="M9 9h0M9 13h0M15 9h0M15 13h0" />
    </svg>
  );
}

export function IconTrendUp(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

export function IconTrendDown(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 7l6 6 4-4 8 8" />
      <path d="M14 17h7v-7" />
    </svg>
  );
}

export function IconPin(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconShield(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconCamera(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 7h3l2-3h8l2 3h3v12H3z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconBan(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 5.5l13 13" />
    </svg>
  );
}

export function IconRadar(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 12L19.5 4.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconTrophy(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3" />
      <path d="M17 6h3v2a3 3 0 0 1-3 3" />
      <path d="M10 15v3M14 15v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function IconLineChart(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 21V3" />
      <path d="M21 21H3" />
      <path d="M5 16l4-5 4 3 6-8" />
      <circle cx="5" cy="16" r="1.2" fill="currentColor" />
      <circle cx="9" cy="11" r="1.2" fill="currentColor" />
      <circle cx="13" cy="14" r="1.2" fill="currentColor" />
      <circle cx="19" cy="6" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconPuzzle(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 3h2v2a1.5 1.5 0 0 0 3 0V3h2a2 2 0 0 1 2 2v2h2a1.5 1.5 0 0 1 0 3h-2v2a2 2 0 0 1-2 2h-2v-2a1.5 1.5 0 0 0-3 0v2H7a2 2 0 0 1-2-2v-2H3a1.5 1.5 0 0 1 0-3h2V5a2 2 0 0 1 2-2h2z" />
    </svg>
  );
}

export function IconKey(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="8" cy="14" r="4" />
      <path d="M11 12l9-9" />
      <path d="M16 7l3 3" />
      <path d="M18 5l2 2" />
    </svg>
  );
}

export function IconLock(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconLightbulb(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3z" />
    </svg>
  );
}

export function IconWarning(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="18" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconMail(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function IconSparkle(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5L12 8z" />
    </svg>
  );
}

export function IconCrystalBall(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="11" r="7" />
      <path d="M5 18h14" />
      <path d="M9 8a3 3 0 0 1 3-3" />
    </svg>
  );
}

export function IconAntenna(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M8 17a4 4 0 0 1 8 0" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
      <path d="M12 17v4" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCheckCircle(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}
