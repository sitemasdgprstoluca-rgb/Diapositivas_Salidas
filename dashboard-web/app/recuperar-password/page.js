'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearClienteNavegador } from '../../lib/supabase-browser';

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Ingresa un email válido.');
      return;
    }
    setCargando(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/cambiar-password`
            : undefined,
      }
    );
    setCargando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-guinda-dark via-guinda to-guinda-light flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-extrabold tracking-tight">Recuperar contraseña</h1>
          <p className="text-white/80 mt-2">
            Te enviamos un enlace al correo para crear una nueva.
          </p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-guinda focus:outline-none transition"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              required
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
              {cargando ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm font-semibold text-guinda hover:underline">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-3">📬</div>
            <h2 className="text-2xl font-extrabold text-gray-900">Revisa tu correo</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">
              Si el email <span className="font-bold">{email}</span> está registrado, recibirás
              un enlace para crear una nueva contraseña.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 bg-guinda hover:bg-guinda-dark text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
