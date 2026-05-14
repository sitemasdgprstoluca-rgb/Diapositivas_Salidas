'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

/**
 * HexKpiCard premium adaptable a light/dark.
 *
 * Diseño: card hexagonal con clip-path, mesh radial al tope, glow del color,
 * icon con halo, número con animación spring, label uppercase tight, hint opcional.
 *
 * Props:
 *  - value: number | string
 *  - label: string
 *  - hint?: string
 *  - icon: ReactElement
 *  - tone: "guinda" | "dorado" | "neutro" | "verde" | "ambar" | "rojo"
 *  - delay?: number  (segundos, para stagger)
 *  - href?: string  (no aquí; envuelve afuera)
 */
export default function HexKpiCard({ value, label, hint, icon, tone = 'guinda', delay = 0 }) {
  const palette = {
    guinda: {
      color: '#9F2241',
      colorSoft: 'rgba(159, 34, 65, 0.18)',
      iconBg: 'linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
      iconColor: '#FBF6EB',
    },
    dorado: {
      color: '#B69566',
      colorSoft: 'rgba(182, 149, 102, 0.20)',
      iconBg: 'linear-gradient(135deg, #B69566 0%, #9B6F4A 100%)',
      iconColor: '#3D1520',
    },
    neutro: {
      color: '#94a3b8',
      colorSoft: 'rgba(148, 163, 184, 0.18)',
      iconBg: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
      iconColor: '#DDC9A3',
    },
    verde: {
      color: '#10b981',
      colorSoft: 'rgba(16, 185, 129, 0.18)',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      iconColor: '#ecfdf5',
    },
    ambar: {
      color: '#f59e0b',
      colorSoft: 'rgba(245, 158, 11, 0.18)',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      iconColor: '#fffbeb',
    },
    rojo: {
      color: '#ef4444',
      colorSoft: 'rgba(239, 68, 68, 0.18)',
      iconBg: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
      iconColor: '#fef2f2',
    },
  };

  const p = palette[tone] || palette.guinda;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, scale: 1.025 }}
      className="relative group"
    >
      {/* Halo difuso de fondo */}
      <div
        aria-hidden
        className="absolute inset-0 blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${p.color}55 0%, transparent 65%)`,
        }}
      />

      {/* Tarjeta hexagonal */}
      <div
        className="relative h-52 px-6 py-7 flex flex-col items-center justify-center text-center transition-shadow duration-300"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
          background: `
            radial-gradient(ellipse at 50% -10%, ${p.colorSoft} 0%, transparent 65%),
            linear-gradient(180deg, var(--bg-card-solid) 0%, var(--bg-app-2) 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px ${p.color}55,
            inset 0 0 36px ${p.color}22,
            0 12px 32px -8px ${p.color}40
          `,
        }}
      >
        {/* Línea brillante de tope */}
        <span
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/3 rounded-full opacity-90"
          style={{
            background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />

        {/* Icono con halo */}
        {icon && (
          <div className="relative mb-2">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-md opacity-70"
              style={{ background: p.color }}
            />
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: p.iconBg,
                boxShadow: `0 0 0 1px ${p.color}55, 0 0 24px -2px ${p.color}80`,
              }}
            >
              <span style={{ color: p.iconColor, display: 'inline-flex' }}>{icon}</span>
            </div>
          </div>
        )}

        {/* Valor */}
        <AnimatedValue
          value={value}
          color={p.color}
        />

        {/* Label */}
        <div
          className="mt-1.5 text-[10px] uppercase tracking-[0.18em] font-bold"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </div>

        {/* Hint */}
        {hint && (
          <div
            className="mt-1 text-[10px] tabular-nums font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {hint}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Anima un número desde 0 con spring; si no es número, lo muestra tal cual. */
function AnimatedValue({ value, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  // Detectar si es número (puede venir como "0/22" o "0.00" string)
  const numericValue = typeof value === 'number' ? value : null;

  // Inicializar el motion value en el target final asegura que el DOM
  // siempre refleje el valor correcto (en SSR, en tests sin rAF efectivo,
  // o cuando reduce-motion bloquea la animación).
  const motionVal = useMotionValue(numericValue ?? 0);

  const display = useTransform(motionVal, (current) => {
    if (numericValue == null) return value;
    if (Number.isInteger(numericValue)) return Math.round(current).toLocaleString('es-MX');
    return current.toFixed(2);
  });

  useEffect(() => {
    if (inView && numericValue != null) {
      // Reset a 0 y anima hacia el target para el efecto count-up.
      motionVal.set(0);
      const controls = animate(motionVal, numericValue, {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
      });
      return () => controls.stop();
    }
  }, [inView, numericValue, motionVal]);

  return (
    <motion.div
      ref={ref}
      className="text-3xl font-black tabular-nums tracking-tight"
      style={{
        color: 'var(--text-primary)',
        textShadow: `0 0 18px ${color}55`,
      }}
    >
      {numericValue != null ? <motion.span>{display}</motion.span> : value}
    </motion.div>
  );
}
