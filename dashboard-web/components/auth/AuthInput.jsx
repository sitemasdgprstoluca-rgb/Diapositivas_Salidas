'use client';

import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

/**
 * AuthInput — input premium para autenticación.
 * - Label flotante animado
 * - Icon prefix con highlight institucional al focus
 * - Suffix opcional (toggle password)
 * - Error con shake + mensaje colapsable
 * - Caps Lock detection (warning) cuando type="password"
 *
 * Props:
 *  - icon: ReactNode (icon component)
 *  - label: string
 *  - type: 'text'|'email'|'password'|...
 *  - error?: string
 *  - showStrength?: bool (sólo para password — pinta una barra abajo)
 *  - value, onChange, ...input props
 */
const AuthInput = forwardRef(function AuthInput(
  { icon, label, type = 'text', error, showStrength = false, value = '', ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const isPassword = type === 'password';
  const realType = isPassword && reveal ? 'text' : type;

  const detectCaps = (e) => {
    if (e.getModifierState) setCapsOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="space-y-1.5">
      <label
        className={`text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${
          error ? 'text-[#dc2626]' : focused ? 'text-[#9F2241]' : 'text-[#64748b]'
        }`}
      >
        {label}
      </label>

      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="relative"
      >
        {/* Icon prefix */}
        <span
          className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-l-xl transition-all duration-300 pointer-events-none ${
            error
              ? 'text-[#dc2626]'
              : focused
                ? 'bg-gradient-to-br from-[#9F2241] to-[#5C2E37] text-white shadow-md'
                : 'text-[#9F2241]'
          }`}
          style={focused && !error ? { boxShadow: '0 4px 12px -2px rgba(159,34,65,0.40)' } : {}}
        >
          {icon}
        </span>

        <input
          ref={ref}
          {...rest}
          type={realType}
          value={value}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setCapsOn(false);
            rest.onBlur?.(e);
          }}
          onKeyDown={(e) => {
            if (isPassword) detectCaps(e);
            rest.onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            if (isPassword) detectCaps(e);
            rest.onKeyUp?.(e);
          }}
          className={`auth-input w-full pl-14 ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 text-sm font-medium rounded-xl outline-none transition-all duration-300 ${
            error
              ? 'bg-white border-2 border-[#fca5a5] text-[#7f1d1d] placeholder-[#fca5a5] ring-4 ring-[#fee2e2]'
              : focused
                ? 'bg-white border-2 border-[#9F2241] text-[#0f172a] placeholder-[#cbd5e1] ring-4 ring-[#9F2241]/10 shadow-lg'
                : 'bg-white border-2 border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] hover:border-[#9F2241]/50'
          }`}
        />

        {/* Toggle password visibility */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-lg transition ${
              focused ? 'text-[#9F2241] hover:bg-[#9F2241]/10' : 'text-[#94a3b8] hover:bg-[#f1f5f9]'
            }`}
          >
            {reveal ? <EyeOff size={16} strokeWidth={2.2} /> : <Eye size={16} strokeWidth={2.2} />}
          </button>
        )}
      </motion.div>

      {/* Strength bar */}
      {isPassword && showStrength && value && <PasswordStrength password={value} />}

      {/* Caps Lock warning */}
      <AnimatePresence>
        {isPassword && capsOn && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-[#b45309] font-semibold flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            Bloq Mayús está activado
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-[#dc2626] font-semibold flex items-center gap-1.5"
          >
            <span className="w-1 h-1 rounded-full bg-[#dc2626]" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AuthInput;

/* --- Password strength meter --- */
function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function PasswordStrength({ password }) {
  const score = calcStrength(password);
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Excelente'];
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];
  return (
    <div className="pt-1 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              backgroundColor: i < score ? colors[score] : '#e2e8f0',
              scaleX: i < score ? 1 : 0.96,
            }}
            transition={{ duration: 0.25 }}
            className="h-1 flex-1 rounded-full origin-left"
          />
        ))}
      </div>
      <p
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: colors[score] }}
      >
        Fortaleza · {labels[score]}
      </p>
    </div>
  );
}
