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
          'relative px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ' +
          (activo
            ? 'bg-white/15 text-white shadow-lg ring-1 ring-dorado-500/40'
            : 'text-white/75 hover:bg-white/10 hover:text-white')
        }
      >
        {label}
        {activo && (
          <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-dorado-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <header
      className="relative border-b border-dorado-500/15"
      style={{
        background:
          'radial-gradient(ellipse at 0% 0%, rgba(182,149,102,0.18) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(0,0,0,0.25) 0%, transparent 55%), linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
        boxShadow:
          '0 2px 24px -8px rgba(159,34,65,0.5), inset 0 -1px 0 0 rgba(182,149,102,0.2)',
      }}
    >
      {/* Línea dorada superior */}
      <div
        className="h-0.5"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #B69566 35%, #DDC9A3 50%, #B69566 65%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="font-black px-3 py-1.5 rounded-lg text-xs tracking-[0.18em] transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #B69566 0%, #DDC9A3 100%)',
              color: '#3D1520',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.25) inset, 0 0 14px -2px rgba(182,149,102,0.6)',
            }}
          >
            CPRS
          </div>
          <div>
            <h1
              className="text-white text-xl font-black leading-none tracking-tight"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
            >
              Dashboard Supervisión
            </h1>
            <p className="text-dorado-200/80 text-[10px] mt-1 uppercase tracking-[0.22em] font-semibold">
              Analítica institucional
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navLink('/', 'Centros')}
          {navLink('/comparar', 'Comparar')}
        </nav>

        <div className="flex items-center gap-3">
          {email && (
            <span className="text-white/75 text-xs hidden md:block tabular-nums">
              {email}
            </span>
          )}
          <Link
            href="/cambiar-password"
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition border border-white/15 hidden sm:inline-flex items-center"
            title="Cambiar contraseña"
          >
            🔑
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-dorado-500/20 hover:border-dorado-500/40 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border border-white/15"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
