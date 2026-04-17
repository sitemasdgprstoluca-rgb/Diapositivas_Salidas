import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware: valida sesión y rol admin en todas las rutas protegidas.
 * - Sin sesión  → /login
 * - Con sesión pero no admin → /no-admin
 * - Con sesión y admin → sigue
 */
export async function middleware(request) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const esRutaPublica = pathname.startsWith('/login') || pathname.startsWith('/no-admin');

  if (!user) {
    if (esRutaPublica) return response;
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Usuario autenticado: verificar que sea admin
  if (!esRutaPublica) {
    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminRow) {
      const url = request.nextUrl.clone();
      url.pathname = '/no-admin';
      return NextResponse.redirect(url);
    }
  }

  // Evitar que admin logeado entre a /login
  if (user && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Todas las rutas excepto assets y api
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
