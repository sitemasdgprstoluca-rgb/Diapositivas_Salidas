'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * AuthSubmit — botón de envío premium con shimmer + spinner.
 *
 * Props:
 *  - loading: bool
 *  - icon?: ReactNode (cuando NO loading)
 *  - children: label
 *  - tone?: 'brand' (default) | 'gold' | 'success'
 *  - disabled?: bool
 */
export default function AuthSubmit({
  loading = false,
  icon,
  children,
  tone = 'brand',
  disabled = false,
  ...rest
}) {
  const palette = {
    brand: {
      gradient: 'linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
      shadow: '0 10px 28px -6px rgba(159, 34, 65, 0.55)',
      hoverShadow: '0 16px 36px -6px rgba(159, 34, 65, 0.70)',
    },
    gold: {
      gradient: 'linear-gradient(135deg, #B69566 0%, #9B6F4A 100%)',
      shadow: '0 10px 28px -6px rgba(182, 149, 102, 0.55)',
      hoverShadow: '0 16px 36px -6px rgba(182, 149, 102, 0.70)',
    },
    success: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      shadow: '0 10px 28px -6px rgba(16, 185, 129, 0.50)',
      hoverShadow: '0 16px 36px -6px rgba(16, 185, 129, 0.70)',
    },
  };
  const p = palette[tone] || palette.brand;
  const isDisabled = loading || disabled;

  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -2, boxShadow: p.hoverShadow } : {}}
      whileTap={!isDisabled ? { scale: 0.985 } : {}}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      {...rest}
      className="relative w-full overflow-hidden text-white py-3.5 rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed group"
      style={{
        background: p.gradient,
        boxShadow: p.shadow,
      }}
    >
      {/* Shimmer */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out"
        style={{
          background:
            'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.30) 50%, transparent 70%)',
        }}
      />
      <span className="relative flex items-center justify-center gap-2.5">
        {loading ? (
          <>
            <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />
            <span>Procesando…</span>
          </>
        ) : (
          <>
            {icon}
            <span>{children}</span>
          </>
        )}
      </span>
    </motion.button>
  );
}
