'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { crearClienteNavegador } from '../lib/supabase-browser';

export default function Header({ email }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = crearClienteNavegador();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navLink = (href, label) => {
    const activo = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={
          'px-4 py-2 rounded-lg text-sm font-semibold transition ' +
          (activo
            ? 'bg-white/25 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white')
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-gradient-to-r from-guinda-dark via-guinda to-guinda-light">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-dorado text-guinda-dark font-extrabold px-3 py-1 rounded-full text-xs tracking-wider">
            CPRS
          </div>
          <div>
            <h1 className="text-white text-xl font-bold leading-none">Dashboard Supervisión</h1>
            <p className="text-white/70 text-xs mt-0.5">Analítica institucional</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {navLink('/', 'Centros')}
          {navLink('/comparar', 'Comparar')}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm hidden md:block">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
