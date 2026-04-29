// Catálogo de centros: cliente que lee de Supabase con fallback al
// constant local para que la app siga funcionando si la tabla
// `cprs_centros` aún no existe o si no hay red.

import { getSupabase } from './supabaseClient';
import { LISTA_CPRS as FALLBACK_LISTA } from '../constants/data';

let cache = null;

/**
 * Devuelve la lista de nombres de C.P.R.S. ordenados.
 * Estrategia:
 *   1. Si ya hay caché en memoria, regresa eso.
 *   2. Intenta leer de public.cprs_centros (orden ASC, activo=true).
 *   3. Si falla (tabla no existe / sin red), regresa FALLBACK_LISTA.
 */
export async function obtenerCentros() {
  if (cache) return cache;

  try {
    const supabase = getSupabase();
    if (!supabase) return FALLBACK_LISTA;

    const { data, error } = await supabase
      .from('cprs_centros')
      .select('nombre, orden')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_LISTA;
    }

    cache = data.map((c) => c.nombre);
    return cache;
  } catch {
    return FALLBACK_LISTA;
  }
}

/**
 * Limpia la caché para forzar relectura desde BD.
 * Útil tras un cambio de sesión o cuando se sabe que el catálogo cambió.
 */
export function invalidarCacheCentros() {
  cache = null;
}
