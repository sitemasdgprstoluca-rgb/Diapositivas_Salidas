// Polyfills requeridos por @supabase/supabase-js en React Native.
// DEBEN ir antes de cualquier import que los use.
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  supabaseEstaConfigurado,
} from '../config/supabase';

let _supabase = null;
let _initError = null;

/**
 * Cliente singleton de Supabase.
 * - Devuelve null si las variables no están configuradas.
 * - Devuelve null (sin crashear) si el createClient falla por cualquier razón.
 * - Loggea el error pero no propaga.
 */
export const getSupabase = () => {
  if (_supabase) return _supabase;
  if (_initError) return null; // ya fallamos una vez, no reintentamos

  if (!supabaseEstaConfigurado()) {
    console.warn('[Supabase] No configurado. La app correrá 100% local.');
    return null;
  }

  try {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    return _supabase;
  } catch (e) {
    _initError = e;
    console.log('[Supabase] Error inicializando cliente:', e?.message || e);
    console.log('[Supabase] La app correrá 100% local. Revisa tu .env y reinicia con npx expo start -c');
    return null;
  }
};

/**
 * Para debug: devuelve el error de inicialización si lo hubo.
 */
export const getSupabaseInitError = () => _initError;
