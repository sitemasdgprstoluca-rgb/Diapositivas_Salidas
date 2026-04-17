'use client';

import { crearClienteNavegador } from '../../lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function NoAdminPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-guinda-dark via-guinda to-guinda-light flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-extrabold text-gray-900">Acceso restringido</h1>
        <p className="text-gray-600 mt-3 leading-relaxed">
          Tu cuenta no tiene permisos de administrador. Este dashboard está restringido a personal autorizado.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          Si crees que esto es un error, contacta al equipo técnico para que te agreguen a la tabla
          <code className="mx-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">public.admins</code>.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 bg-guinda hover:bg-guinda-dark text-white font-bold px-6 py-3 rounded-xl transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
