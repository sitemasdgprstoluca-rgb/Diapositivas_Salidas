// Tema de colores para la aplicación Supervisión C.P.R.S.
// Soporta light/dark mode adaptativo via ThemeContext.
// Basado en el Manual de Identidad de la Subsecretaría de Seguridad.

export const lightColors = {
  // Marca institucional
  primary: '#8A2035',
  primaryLight: '#A83248',
  primaryDark: '#6B1829',
  secondary: '#D4A94C',
  secondaryLight: '#E5C474',
  accent: '#D4A94C',
  // Semánticos
  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#F9A825',
  warningBg: '#FFF3E0',
  warningText: '#E65100',
  error: '#C62828',
  errorBg: '#FFEBEE',
  errorDark: '#8A1C1C',
  info: '#1565C0',
  infoBg: '#E3F2FD',
  // Superficies
  background: '#FAF8F5',
  backgroundElevated: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#F5F1EC',
  // Texto
  text: '#1a1a1a',
  textSecondary: '#555555',
  textLight: '#888888',
  textInverse: '#ffffff',
  // Bordes
  border: '#D4A94C40',
  borderStrong: '#cbd5e1',
  borderSubtle: '#E5E7EB',
  divider: 'rgba(0,0,0,0.08)',
  // Utilitarios
  disabled: '#cccccc',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
  // Gradientes
  gradientStart: '#6B1829',
  gradientMid: '#8A2035',
  gradientEnd: '#A83248',
};

export const darkColors = {
  primary: '#A83248',
  primaryLight: '#C73E5A',
  primaryDark: '#7a1c33',
  secondary: '#E5C474',
  secondaryLight: '#F0D998',
  accent: '#E5C474',
  success: '#4ADE80',
  successBg: 'rgba(74,222,128,0.15)',
  warning: '#FACC15',
  warningBg: 'rgba(250,204,21,0.15)',
  warningText: '#FCD34D',
  error: '#F87171',
  errorBg: 'rgba(248,113,113,0.15)',
  errorDark: '#DC2626',
  info: '#60A5FA',
  infoBg: 'rgba(96,165,250,0.15)',
  background: '#14080c',
  backgroundElevated: '#1f1014',
  surface: '#1a0d11',
  surfaceAlt: '#241319',
  text: '#F5F5F5',
  textSecondary: '#cbd5e1',
  textLight: '#94a3b8',
  textInverse: '#0f172a',
  border: 'rgba(229,196,116,0.25)',
  borderStrong: 'rgba(229,196,116,0.4)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.08)',
  disabled: '#3f3036',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.65)',
  gradientStart: '#3a0d1a',
  gradientMid: '#5a1428',
  gradientEnd: '#7a1c33',
};

// Backward compatibility: legacy `import { COLORS }` sigue funcionando
// pero apunta a la paleta light. Componentes nuevos deben usar useColors().
export const COLORS = lightColors;

export const FONTS = {
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '500',
  },
  semiBold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
};

export const SIZES = {
  // Tamaños de fuente
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Espaciado
  padding: 16,
  paddingSmall: 8,
  paddingLarge: 24,
  margin: 16,
  marginSmall: 8,
  marginLarge: 24,
  
  // Bordes
  borderRadius: 8,
  borderRadiusSmall: 4,
  borderRadiusLarge: 16,
  borderRadiusFull: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };
