'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { crearClienteNavegador } from '../../lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Llena email y contraseña.');
      return;
    }
    setCargando(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setCargando(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ═════════ PANEL IZQUIERDO: FORMULARIO ═════════ */}
      <div className="flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Iniciar Sesión</h1>
            <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-2">
                Usuario o correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-blue-50/40 border-0 rounded-xl pl-12 pr-4 py-3.5 text-base text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-guinda/30 transition"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-blue-50/40 border-0 rounded-xl pl-12 pr-12 py-3.5 text-base text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-guinda/30 transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-guinda transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-sm font-semibold text-guinda hover:text-guinda-dark transition">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-guinda to-guinda-dark hover:shadow-lg text-white font-bold text-base py-4 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>Iniciando sesión...</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ═════════ PANEL DERECHO: BRANDING ═════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-guinda-dark via-guinda to-guinda-light text-white flex items-center justify-center p-8 lg:p-12 min-h-[60vh] lg:min-h-screen">
        {/* Círculos concéntricos decorativos */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[520px] h-[520px] rounded-full border border-white/10"></div>
          <div className="absolute w-[680px] h-[680px] rounded-full border border-white/5"></div>
          <div className="absolute w-[360px] h-[360px] rounded-full border border-white/15"></div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 bg-dorado/60 rounded-full"></div>
          <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white/40 rounded-full"></div>
          <div className="absolute bottom-[25%] left-[10%] w-1 h-1 bg-dorado rounded-full"></div>
          <div className="absolute bottom-[40%] right-[25%] w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="absolute top-[60%] left-[35%] w-1 h-1 bg-dorado/50 rounded-full"></div>
          <div className="absolute bottom-[15%] right-[35%] w-1.5 h-1.5 bg-white/50 rounded-full"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center max-w-xl">
          {/* Escudo — placeholder: reemplaza public/brand/escudo.png */}
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 overflow-hidden">
              <EscudoOrPlaceholder />
            </div>
          </div>

          {/* Título del sistema */}
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Sistema de Supervisión
            <br />
            Penitenciaria
          </h2>

          {/* Separador decorativo */}
          <div className="flex items-center justify-center gap-2 my-6">
            <span className="h-px w-16 bg-dorado/70"></span>
            <span className="w-2 h-2 rounded-full bg-dorado"></span>
            <span className="h-px w-16 bg-dorado/70"></span>
          </div>

          {/* Card destacada */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/15">
            <h3 className="text-xl font-bold mb-2">Indicadores de Medición por Rubro</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              Evaluación estandarizada, trazabilidad completa y analítica institucional
              para los Centros Penitenciarios y de Reinserción Social.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <FeatureTag icon="shield" label="Seguro" />
            <FeatureTag icon="wifi" label="Offline-first" />
            <FeatureTag icon="chart" label="Analítica" />
          </div>

          {/* Footer institucional */}
          <div className="mt-10 pt-6 border-t border-white/15 text-white/80 text-xs leading-relaxed">
            <p className="font-semibold">Subsecretaría de Control Penitenciario</p>
            <p>Dirección General de Prevención y Reinserción Social</p>
            <p className="mt-1 text-white/50">v.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Placeholder del escudo. Si existe public/brand/escudo.png lo usa; si no, SVG genérico. */
function EscudoOrPlaceholder() {
  // Si pusiste tu escudo en public/brand/escudo.png, descomenta esto:
  // return <Image src="/brand/escudo.png" alt="Escudo institucional" width={128} height={128} />;

  return (
    <svg viewBox="0 0 64 64" className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M32 4 L54 14 V30 C54 44 32 60 32 60 C32 60 10 44 10 30 V14 Z" />
      <path d="M32 20 L32 44 M22 32 L42 32" strokeLinecap="round" />
    </svg>
  );
}

function FeatureTag({ icon, label }) {
  const icons = {
    shield: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    wifi: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    chart: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        {icons[icon]}
      </div>
      <span className="text-xs font-semibold text-white/90">{label}</span>
    </div>
  );
}
