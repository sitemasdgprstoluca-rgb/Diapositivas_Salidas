'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { crearClienteNavegador } from '../../lib/supabase-browser';

/* ═══════════════════════════════════════════════════════════════════
   🎨 Partículas flotantes animadas
   ═══════════════════════════════════════════════════════════════════ */
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => {
    const size = Math.random() * 12 + 6;
    return {
      id: i,
      size,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 8,
      color:
        i % 3 === 0
          ? 'rgba(201, 168, 118, 0.4)'
          : i % 3 === 1
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.15)',
      shadow:
        i % 3 === 0
          ? '0 0 10px rgba(201, 168, 118, 0.5)'
          : '0 0 8px rgba(255, 255, 255, 0.3)',
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            boxShadow: p.shadow,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   🌟 Anillos concéntricos animados
   ═══════════════════════════════════════════════════════════════════ */
function AnimatedRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse-ring"
          style={{
            width: `${(i + 1) * 250}px`,
            height: `${(i + 1) * 250}px`,
            animationDelay: `${i * 0.7}s`,
            border:
              i % 2 === 0
                ? '2px solid rgba(201, 168, 118, 0.25)'
                : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow:
              i % 2 === 0
                ? '0 0 20px rgba(201, 168, 118, 0.15), inset 0 0 20px rgba(201, 168, 118, 0.05)'
                : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ✨ Input Premium con icon gradient al enfocar
   ═══════════════════════════════════════════════════════════════════ */
function PremiumInput({ icon: Icon, label, error, type, onToggle, showPassword, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="group">
      <label
        className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-all duration-300 ${
          isFocused ? 'text-theme-primary' : 'text-gray-500'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-l-xl transition-all duration-300 ${
            isFocused ? 'bg-theme-gradient text-white' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Icon />
        </div>
        <input
          {...props}
          type={type}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full pl-14 pr-12 py-4 bg-gray-50 border-2 rounded-xl transition-all duration-300 text-gray-800 placeholder-gray-400 outline-none ${
            isFocused
              ? 'border-theme-primary ring-4 ring-[rgba(147,32,67,0.1)] bg-white shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          } ${error ? 'border-red-400 ring-4 ring-red-100' : ''}`}
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isFocused ? 'text-theme-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   🎯 Íconos SVG inline (matching react-icons/fa)
   ═══════════════════════════════════════════════════════════════════ */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3H178.3z" />
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
    <path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" />
  </svg>
);
const IconSignIn = () => (
  <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
    <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L48 320c-26.5 0-48-21.5-48-48L0 240c0-26.5 21.5-48 48-48l112 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
  </svg>
);
const IconSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor" className="animate-spin">
    <path d="M304 48a48 48 0 1 0-96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0-96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0-96 0 48 48 0 1 0 96 0zM142.9 437a48 48 0 1 0 -67.9-67.9 48 48 0 1 0 67.9 67.9zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" />
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 576 512" fill="currentColor">
    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM432 256A144 144 0 1 1 144 256a144 144 0 1 1 288 0zM288 192c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor">
    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 125.2-32.4L373 389.9z" />
  </svg>
);
const IconShieldAlt = () => (
  <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
    <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z" />
  </svg>
);
const IconRoute = () => (
  <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
    <path d="M416 320h-96c-17.7 0-32-14.3-32-32s14.3-32 32-32h96c35.3 0 64-28.7 64-64s-28.7-64-64-64H183.3l41.4 41.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3l96-96c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L137.4 64H416c70.7 0 128 57.3 128 128s-57.3 128-128 128zM96 416h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-35.3 0-64-28.7-64-64s28.7-64 64-64h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32 14.3-32 32s14.3 32 32 32z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════
   🔐 Login page (Supabase)
   ═══════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Llena email y contraseña.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      setErrorMessage(
        error.message === 'Invalid login credentials'
          ? 'Usuario o contraseña incorrectos'
          : error.message
      );
      return;
    }
    setExiting(true);
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 300);
  };

  return (
    <div
      className={`min-h-screen w-full flex relative overflow-hidden bg-gray-50 transition-all duration-300 ${
        exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen">
        {/* ═══ PANEL IZQUIERDO ═══ */}
        <div
          className={`w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 bg-white transition-all duration-500 ${
            mounted && !exiting
              ? 'opacity-100 translate-x-0'
              : exiting
                ? 'opacity-0 -translate-x-10'
                : 'opacity-0 -translate-x-10'
          }`}
        >
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Iniciar Sesión</h1>
              <p className="text-gray-500 text-sm mt-3">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="animate-shake rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-sm">⚠️</span>
                  </div>
                  <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                </div>
              )}

              <PremiumInput
                icon={IconUser}
                label="Usuario o correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                autoComplete="username"
              />

              <PremiumInput
                icon={IconLock}
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                onToggle={() => setShowPassword((s) => !s)}
                showPassword={showPassword}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-theme-primary hover:text-theme-primary-hover transition-all duration-300 hover:underline underline-offset-4 hover:translate-x-1"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden text-white py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group bg-theme-gradient"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <IconSpinner />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <IconSignIn />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="lg:hidden mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600 font-medium text-sm">
                Subsecretaría de Control Penitenciario
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Dirección General de Prevención y Reinserción Social
              </p>
              <p className="text-gray-400 text-[10px] mt-0.5">v.1.0</p>
            </div>
          </div>
        </div>

        {/* ═══ PANEL DERECHO ═══ */}
        <div
          className={`hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden transition-all duration-500 delay-100 ${
            mounted && !exiting
              ? 'opacity-100 translate-x-0'
              : exiting
                ? 'opacity-0 translate-x-10'
                : 'opacity-0 translate-x-10'
          }`}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, rgba(155, 126, 76, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.3) 0%, transparent 50%),
                linear-gradient(135deg, #932043 0%, #632842 60%, #4a1a2e 100%)
              `,
            }}
          />

          <FloatingParticles />
          <AnimatedRings />

          <div className="relative z-10 flex flex-col justify-center items-center p-12 xl:p-16 w-full">
            <div className="max-w-lg text-center space-y-8">
              {/* Logo */}
              <div className="relative group mb-4">
                <Image
                  src="/brand/logo-sistema.png"
                  alt="Logo institucional"
                  width={160}
                  height={160}
                  priority
                  className="h-32 xl:h-40 w-auto mx-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl"
                />
              </div>

              {/* Título */}
              <div className="space-y-3">
                <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                  Sistema de Supervisión Penitenciaria
                </h2>

                {/* Línea decorativa dorada */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[#C9A876] to-[#C9A876] rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-[#C9A876] shadow-lg shadow-[#C9A876]/50 animate-pulse" />
                  <div className="h-0.5 w-16 bg-gradient-to-l from-transparent via-[#C9A876] to-[#C9A876] rounded-full" />
                </div>
              </div>

              {/* Card descriptiva */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Indicadores de Medición por Rubro
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Evaluación estandarizada, trazabilidad completa y analítica institucional
                  para los Centros Penitenciarios y de Reinserción Social.
                </p>
              </div>

              {/* Características */}
              <div className="flex justify-center gap-6 pt-4">
                {[
                  { Icon: IconShieldAlt, label: 'Seguro' },
                  { Icon: IconRoute, label: 'Trazable' },
                  { Icon: IconUser, label: 'Rol-Based' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                      <span className="text-white/60 group-hover:text-white transition-colors">
                        <Icon />
                      </span>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-8 border-t border-white/10">
                <p className="text-white/80 font-medium text-sm">
                  Subsecretaría de Control Penitenciario
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Dirección General de Prevención y Reinserción Social
                </p>
                <p className="text-white/30 text-[10px] mt-0.5">v.1.0</p>
              </div>
            </div>
          </div>

          {/* Decoración esquina inferior */}
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
            <div className="absolute bottom-0 right-0 w-full h-full bg-white rounded-tl-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
