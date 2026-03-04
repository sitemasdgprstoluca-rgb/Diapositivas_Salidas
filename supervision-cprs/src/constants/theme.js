// Tema de colores para la aplicación Supervisión C.P.R.S.
// Basado en el Manual de Identidad de la Subsecretaría de Seguridad
export const COLORS = {
  primary: '#8A2035',      // Guinda/Vino institucional
  primaryLight: '#A83248', // Guinda claro
  primaryDark: '#6B1829',  // Guinda oscuro
  secondary: '#D4A94C',    // Dorado institucional
  secondaryLight: '#E5C474', // Dorado claro
  accent: '#D4A94C',       // Dorado acento
  success: '#2E7D32',      // Verde éxito
  warning: '#F9A825',      // Amarillo advertencia
  error: '#C62828',        // Rojo error
  background: '#FAF8F5',   // Fondo crema claro
  surface: '#ffffff',      // Superficies blancas
  text: '#1a1a1a',         // Texto principal
  textSecondary: '#555555', // Texto secundario
  textLight: '#888888',    // Texto claro
  border: '#D4A94C40',     // Bordes con tono dorado
  disabled: '#cccccc',     // Elementos deshabilitados
  white: '#ffffff',
  black: '#000000',
};

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
