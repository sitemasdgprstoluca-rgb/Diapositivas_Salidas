import type { Config } from 'tailwindcss';

/**
 * Sistema de diseño institucional — Gobierno del Estado de México
 * Paleta tomada del módulo de Supervisiones del ERP-DGPRS:
 *   Primary (Vino Pantone 7420 C):  #9F2241
 *   Secondary (Pantone 504 C):      #5C2E37
 *   Accent (Dorado Pantone 465 C):  #B69566
 *
 * Reglas:
 *   ✓ Tipografía: Inter (system-ui fallback)
 *   ✓ Border radius: lg (8px), xl (12px), 2xl (16px) — nunca cuadrado
 *   ✓ Sombras: soft / card / floating (más suaves que las defaults de Tailwind)
 *   ✓ Animaciones: pulse-slow 3s, fade-in 0.5s, slide-up 0.3s
 *   ✓ Ring 1px sobre border 1px (outline suave > línea dura)
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ========== PALETA INSTITUCIONAL ==========
        institucional: {
          50: '#F9E8EC',
          100: '#F0CDD5',
          200: '#E0A3B2',
          300: '#CC7A8F',
          400: '#B94D69',
          500: '#9F2241', // ★ Primary — vino corporativo
          600: '#8B1D38',
          700: '#5C2E37', // ★ Secondary — vino oscuro
          800: '#3D1520',
          900: '#2A0E16',
        },
        dorado: {
          50: '#FBF6EB',
          100: '#F5EAD0',
          200: '#EBD8A6',
          300: '#DDC9A3',
          400: '#C9B07F',
          500: '#B69566', // ★ Accent — dorado corporativo
          600: '#9B6F4A',
          700: '#7A5638',
          800: '#5A3F28',
          900: '#3D2B1B',
        },

        // Aliases legacy (compatibilidad con código previo)
        guinda: {
          DEFAULT: '#9F2241',
          light: '#B94D69',
          dark: '#5C2E37',
        },

        // ========== SEMÁNTICOS DE EVALUACIÓN ==========
        eval: {
          bueno: '#16a34a',    // ≥ 8.0  verde
          regular: '#ca8a04',  // 6.0-7.9 ámbar
          malo: '#dc2626',     // < 6.0  rojo
        },

        crema: '#FAF8F5',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        // Pesos clave del sistema institucional
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        floating: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'inst-glow': '0 0 24px -4px rgba(159, 34, 65, 0.35)',
        'dorado-glow': '0 0 24px -4px rgba(182, 149, 102, 0.45)',
      },

      spacing: {
        18: '4.5rem',
        88: '22rem',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'hud-glow': 'hudGlow 4s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        hudGlow: {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(159,34,65,0.25)' },
          '50%': { boxShadow: '0 0 30px -2px rgba(182,149,102,0.45)' },
        },
      },

      backgroundImage: {
        'gradient-inst': 'linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
        'gradient-dorado': 'linear-gradient(135deg, #B69566 0%, #9B6F4A 100%)',
        'gradient-inst-dorado': 'linear-gradient(135deg, #9F2241 0%, #B69566 100%)',
        'mesh-inst':
          'radial-gradient(ellipse at 30% 20%, rgba(182, 149, 102, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(159, 34, 65, 0.25) 0%, transparent 55%), linear-gradient(180deg, #1a0b10 0%, #0f0608 50%, #0a0507 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
