/**
 * Helpers puros de autenticación / contraseña.
 *
 * Reciben el cliente de Supabase como argumento (inyección de dependencias)
 * para ser testeables sin mockear el módulo `supabaseClient`.
 *
 * Devuelven siempre `{ error: string|null }` para uniformar manejo en UI.
 */

/**
 * Valida que una contraseña cumpla las reglas mínimas.
 * Hoy: ≥6 caracteres, no solo espacios.
 *
 * @param {string} password
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validarPasswordFuerte(password) {
  if (password == null || password === '') {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  if (typeof password !== 'string') {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  if (password.trim().length === 0) {
    return { isValid: false, error: 'La contraseña no puede ser solo espacios' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return { isValid: true };
}

/**
 * Inicia el flujo de recuperación: Supabase manda email con un enlace
 * que al abrirse redirige a la pantalla de "cambiar password".
 *
 * @param {Object|null} supabase  cliente Supabase
 * @param {string} email
 * @returns {Promise<{ error: string|null }>}
 */
export async function recuperarPassword(supabase, email) {
  if (!supabase) {
    return { error: 'Supabase no está configurado/disponible' };
  }
  const emailNorm = (email || '').trim().toLowerCase();
  if (!emailNorm) {
    return { error: 'Ingresa un email válido' };
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
      // redirectTo se sobrescribe en cada plataforma (móvil / web).
      redirectTo: undefined,
    });
    return { error: error?.message || null };
  } catch (e) {
    return { error: e?.message || 'Error inesperado al solicitar recuperación' };
  }
}

/**
 * Cambia la contraseña del usuario autenticado actualmente.
 * Valida fortaleza antes de mandar al servidor.
 *
 * @param {Object|null} supabase
 * @param {string} newPassword
 * @returns {Promise<{ error: string|null }>}
 */
export async function cambiarPassword(supabase, newPassword) {
  if (!supabase) {
    return { error: 'Supabase no está configurado/disponible' };
  }
  const validacion = validarPasswordFuerte(newPassword);
  if (!validacion.isValid) {
    return { error: validacion.error };
  }
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message || null };
  } catch (e) {
    return { error: e?.message || 'Error inesperado al cambiar contraseña' };
  }
}
