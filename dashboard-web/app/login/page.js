'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '../../lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-guinda-dark via-guinda to-guinda-light flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-dorado text-guinda-dark font-extrabold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
            CPRS
          </div>
          <h1 className="text-white text-4xl font-extrabold tracking-tight">Dashboard Supervisión</h1>
          <p className="text-white/80 mt-2">Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
          <label className="block text-sm font-bold text-gray-800 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-guinda focus:outline-none transition"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />

          <label className="block text-sm font-bold text-gray-800 mb-1.5 mt-4">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-guinda focus:outline-none transition"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-6 bg-gradient-to-r from-guinda to-guinda-dark text-white font-bold py-4 rounded-xl hover:shadow-lg transition disabled:opacity-60"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Si no tienes cuenta de administrador, contacta al equipo técnico.
          </p>
        </form>
      </div>
    </div>
  );
}
