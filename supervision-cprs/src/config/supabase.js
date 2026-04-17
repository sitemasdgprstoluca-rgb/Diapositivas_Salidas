import Constants from 'expo-constants';

/**
 * Configuración de Supabase.
 * Lee las variables de entorno EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY
 * desde el archivo .env (Expo las inyecta en process.env en build time).
 *
 * Como respaldo, también intenta leerlas desde app.json → expo.extra.
 */
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  extra.supabaseUrl ||
  '';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra.supabaseAnonKey ||
  '';

export const SUPABASE_BUCKET_FOTOS = 'supervisiones-fotos';

/**
 * Indica si la configuración está presente. Se usa para deshabilitar
 * silenciosamente la capa de sync cuando las variables no están seteadas
 * (ej. desarrollo local sin .env).
 */
export const supabaseEstaConfigurado = () => {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
};
