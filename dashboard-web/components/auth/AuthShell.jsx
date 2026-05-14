'use client';

import { motion } from 'framer-motion';

/**
 * AuthShell — layout split-panel premium para todas las pantallas de auth.
 *
 * Estructura:
 *  ┌─────────────────────────┬──────────────────────────────┐
 *  │   FORM (children)       │  Panel marca con orbes       │
 *  │   light glass card      │  vino + dorado animados      │
 *  └─────────────────────────┴──────────────────────────────┘
 *
 * Props:
 *  - title: string
 *  - subtitle?: string
 *  - children: ReactNode (el formulario en sí)
 */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-[#0a0507]">
      {/* Mesh + orbes globales */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(1200px circle at 12% 8%, rgba(159, 34, 65, 0.30), transparent 55%),
            radial-gradient(1000px circle at 90% 90%, rgba(182, 149, 102, 0.22), transparent 55%),
            radial-gradient(800px circle at 50% 50%, rgba(74, 26, 46, 0.45), transparent 65%),
            linear-gradient(180deg, #0c0608 0%, #18090f 50%, #0a0507 100%)
          `,
        }}
      />
      <FloatingOrbs />
      <Grid />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Panel form */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center p-6 sm:p-10"
        >
          <div className="w-full max-w-md">
            {/* Card glass */}
            <div
              className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                boxShadow:
                  '0 40px 80px -20px rgba(0,0,0,0.50), 0 0 0 1px rgba(182,149,102,0.18), inset 0 1px 0 0 rgba(255,255,255,0.9)',
              }}
            >
              {/* Línea brillante superior */}
              <span
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, #B69566 35%, #DDC9A3 50%, #9F2241 65%, transparent 100%)',
                }}
              />

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(159, 34, 65, 0.08)',
                    border: '1px solid rgba(159, 34, 65, 0.16)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9F2241] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5C2E37]">
                    CPRS · Plataforma Institucional
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.20, duration: 0.5 }}
                  className="text-3xl sm:text-4xl font-black tracking-tight text-[#0f172a]"
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.30, duration: 0.4 }}
                    className="text-sm text-[#64748b] mt-3 leading-relaxed"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>

              {/* Form children */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                {children}
              </motion.div>
            </div>

            {/* Footer mobile */}
            <div className="lg:hidden mt-6 text-center">
              <p className="text-white/70 text-xs font-semibold">
                Subsecretaría de Control Penitenciario
              </p>
              <p className="text-white/40 text-[10px] mt-0.5">
                Dirección General de Prevención y Reinserción Social · v.1.0
              </p>
            </div>
          </div>
        </motion.div>

        {/* Panel marca derecho */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="hidden lg:flex relative items-center justify-center p-12 xl:p-16"
        >
          <BrandPanel />
        </motion.div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative z-10 max-w-lg text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative mb-8"
      >
        <div
          aria-hidden
          className="absolute inset-0 blur-3xl opacity-50 animate-orb-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(182, 149, 102, 0.55) 0%, transparent 65%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-sistema.png"
          alt="Logo institucional"
          className="relative h-32 xl:h-40 w-auto mx-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg"
      >
        Sistema de Supervisión <span className="text-gradient-gold">Penitenciaria</span>
      </motion.h2>

      {/* Línea decorativa */}
      <div className="flex items-center justify-center gap-3 py-5">
        <span className="h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#B69566] to-[#B69566]" />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: '#DDC9A3',
            boxShadow: '0 0 14px rgba(182,149,102,0.8)',
          }}
        />
        <span className="h-[2px] w-16 rounded-full bg-gradient-to-l from-transparent via-[#B69566] to-[#B69566]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="rounded-2xl p-6 mt-2"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(182, 149, 102, 0.22)',
        }}
      >
        <h3 className="text-base font-bold text-white mb-2 tracking-tight">
          Indicadores de Medición por Rubro
        </h3>
        <p className="text-white/65 text-sm leading-relaxed">
          Evaluación estandarizada, trazabilidad completa y analítica institucional para los
          Centros Penitenciarios y de Reinserción Social.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 pt-7"
      >
        {[
          { label: 'Cifrado', icon: <ShieldIcon /> },
          { label: 'Auditable', icon: <RouteIcon /> },
          { label: 'Roles', icon: <UserIcon /> },
        ].map((f) => (
          <div
            key={f.label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-[#DDC9A3]">{f.icon}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/55 font-semibold">
              {f.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="pt-8 border-t border-white/10 mt-8">
        <p className="text-white/80 font-semibold text-sm">
          Subsecretaría de Control Penitenciario
        </p>
        <p className="text-white/40 text-xs mt-1">
          Dirección General de Prevención y Reinserción Social
        </p>
        <p className="text-white/30 text-[10px] mt-0.5">v.1.0</p>
      </div>
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute rounded-full blur-3xl animate-orb-pulse"
        style={{
          width: 480, height: 480,
          top: -160, left: '20%',
          background: 'radial-gradient(circle, rgba(159,34,65,0.30), transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-orb-pulse"
        style={{
          width: 560, height: 560,
          bottom: -200, right: '10%',
          background: 'radial-gradient(circle, rgba(182,149,102,0.20), transparent 70%)',
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-orb-pulse"
        style={{
          width: 320, height: 320,
          top: '30%', right: '5%',
          background: 'radial-gradient(circle, rgba(221,201,163,0.12), transparent 70%)',
          animationDelay: '4s',
        }}
      />
    </div>
  );
}

function Grid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
    />
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function RouteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" /><circle cx="18" cy="5" r="3" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
