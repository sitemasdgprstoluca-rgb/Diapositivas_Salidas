'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

/**
 * Toggle dark/light institucional. Persistencia + sin parpadeo SSR.
 */
export default function ThemeToggle({ className = '' }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => setTheme(isDark ? 'light' : 'dark');

  // Skeleton mientras hidrata para evitar mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        className={
          'inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 bg-white/10 text-white/80 ' +
          className
        }
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
      className={
        'inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 bg-white/10 ' +
        'text-white hover:bg-dorado-500/20 hover:border-dorado-500/40 transition ' +
        className
      }
    >
      {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
    </button>
  );
}
