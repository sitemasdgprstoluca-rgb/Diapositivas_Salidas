/**
 * Tests TDD para los helpers de auth/password.
 *
 * Verifican el comportamiento de las funciones puras de auth:
 *  - recuperarPassword(supabase, email)  → manda email de reset
 *  - cambiarPassword(supabase, newPassword) → actualiza password del usuario logueado
 *  - validarPasswordFuerte(password) → valida reglas mínimas (longitud, etc.)
 *
 * Estas funciones se usan desde AuthContext y desde las pantallas
 * de recuperación/cambio de password. Al ser puras (con cliente
 * inyectado), son testeables sin React.
 */

const {
  recuperarPassword,
  cambiarPassword,
  validarPasswordFuerte,
} = require('../../src/utils/authHelpers');

describe('validarPasswordFuerte', () => {
  it('rechaza contraseñas vacías', () => {
    const r = validarPasswordFuerte('');
    expect(r.isValid).toBe(false);
    expect(r.error).toMatch(/requerida|vac/i);
  });

  it('rechaza contraseñas <6 caracteres', () => {
    const r = validarPasswordFuerte('12345');
    expect(r.isValid).toBe(false);
    expect(r.error).toMatch(/6/);
  });

  it('acepta contraseña de exactamente 6 caracteres', () => {
    expect(validarPasswordFuerte('abc123').isValid).toBe(true);
  });

  it('acepta contraseña larga', () => {
    expect(validarPasswordFuerte('ContraseñaSegura2026!').isValid).toBe(true);
  });

  it('rechaza solo espacios', () => {
    const r = validarPasswordFuerte('      ');
    expect(r.isValid).toBe(false);
  });

  it('rechaza null/undefined sin lanzar', () => {
    expect(validarPasswordFuerte(null).isValid).toBe(false);
    expect(validarPasswordFuerte(undefined).isValid).toBe(false);
  });
});

describe('recuperarPassword', () => {
  let supabaseMock;

  beforeEach(() => {
    supabaseMock = {
      auth: {
        resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
      },
    };
  });

  it('llama a resetPasswordForEmail con el email normalizado (lowercase, trim)', async () => {
    await recuperarPassword(supabaseMock, '  Sitemasdgprstoluca@Gmail.COM  ');
    expect(supabaseMock.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'sitemasdgprstoluca@gmail.com',
      expect.any(Object)
    );
  });

  it('retorna { error: null } cuando Supabase responde OK', async () => {
    const result = await recuperarPassword(supabaseMock, 'a@b.com');
    expect(result.error).toBeNull();
  });

  it('retorna error si email vacío (sin llamar a Supabase)', async () => {
    const result = await recuperarPassword(supabaseMock, '');
    expect(result.error).toMatch(/email/i);
    expect(supabaseMock.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('retorna error si supabase.auth.resetPasswordForEmail falla', async () => {
    supabaseMock.auth.resetPasswordForEmail = jest.fn(() =>
      Promise.resolve({ error: { message: 'Network error' } })
    );
    const result = await recuperarPassword(supabaseMock, 'a@b.com');
    expect(result.error).toBe('Network error');
  });

  it('captura excepciones inesperadas y las traduce a {error}', async () => {
    supabaseMock.auth.resetPasswordForEmail = jest.fn(() => {
      throw new Error('boom');
    });
    const result = await recuperarPassword(supabaseMock, 'a@b.com');
    expect(result.error).toBe('boom');
  });

  it('retorna error si supabase es null', async () => {
    const result = await recuperarPassword(null, 'a@b.com');
    expect(result.error).toMatch(/configurado|disponible/i);
  });
});

describe('cambiarPassword', () => {
  let supabaseMock;

  beforeEach(() => {
    supabaseMock = {
      auth: {
        updateUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'x' } }, error: null })),
      },
    };
  });

  it('llama a updateUser con la nueva contraseña', async () => {
    await cambiarPassword(supabaseMock, 'NuevaPass123');
    expect(supabaseMock.auth.updateUser).toHaveBeenCalledWith({
      password: 'NuevaPass123',
    });
  });

  it('valida fortaleza ANTES de mandar al servidor', async () => {
    const result = await cambiarPassword(supabaseMock, '123');
    expect(result.error).toMatch(/6/);
    expect(supabaseMock.auth.updateUser).not.toHaveBeenCalled();
  });

  it('retorna { error: null } cuando Supabase responde OK', async () => {
    const result = await cambiarPassword(supabaseMock, 'NuevaPass123');
    expect(result.error).toBeNull();
  });

  it('retorna error si Supabase falla', async () => {
    supabaseMock.auth.updateUser = jest.fn(() =>
      Promise.resolve({ data: null, error: { message: 'Token expired' } })
    );
    const result = await cambiarPassword(supabaseMock, 'NuevaPass123');
    expect(result.error).toBe('Token expired');
  });

  it('captura excepciones inesperadas', async () => {
    supabaseMock.auth.updateUser = jest.fn(() => {
      throw new Error('network down');
    });
    const result = await cambiarPassword(supabaseMock, 'NuevaPass123');
    expect(result.error).toBe('network down');
  });

  it('retorna error si supabase es null', async () => {
    const result = await cambiarPassword(null, 'NuevaPass123');
    expect(result.error).toMatch(/configurado|disponible/i);
  });
});
