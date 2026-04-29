'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearClienteNavegador } from '../../lib/supabase-browser';
import { IconCheckCircle } from '../../components/ui/icons';

export default function CambiarPasswordPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (pwd.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (pwd !== pwdConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    const { error: err } = await supabase.auth.updateUser({ password: pwd });
    setCargando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setExito(true);
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-guinda-dark via-guinda to-guinda-light flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-extrabold tracking-tight">Cambiar contraseña</h1>
          <p className="text-white/80 mt-2">Mínimo 6 caracteres.</p>
        </div>

        {!exito ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-guinda focus:outline-none transition"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              required
            />

            <label className="block text-sm font-bold text-gray-800 mb-1.5 mt-4">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-guinda focus:outline-none transition"
              placeholder="Repite tu nueva contraseña"
              autoComplete="new-password"
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
              {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm font-semibold text-guinda hover:underline">
                ← Volver al dashboard
              </Link>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-emerald-600 mb-4 flex justify-center">
              <IconCheckCircle width={56} height={56} strokeWidth={1.8} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Contraseña actualizada</h2>
            <p className="text-gray-600 mt-3">Te llevamos al dashboard…</p>
          </div>
        )}
      </div>
    </div>
  );
}
