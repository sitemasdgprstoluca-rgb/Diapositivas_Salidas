import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { getSupabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      console.log('[Auth] getSupabase lanzó:', e?.message);
      setCargando(false);
      return;
    }

    if (!supabase) {
      setCargando(false);
      return;
    }

    // Cargar sesión existente (con timeout para no quedar colgado)
    const timeout = setTimeout(() => {
      console.log('[Auth] Timeout obteniendo sesión, entrando en modo no-auth');
      setCargando(false);
    }, 8000);

    supabase.auth.getSession()
      .then(({ data }) => {
        clearTimeout(timeout);
        setSesion(data?.session || null);
        setUsuario(data?.session?.user || null);
        setCargando(false);
      })
      .catch((e) => {
        clearTimeout(timeout);
        console.log('[Auth] Error getSession:', e?.message);
        setCargando(false);
      });

    // Suscribirse a cambios
    let subscription = null;
    try {
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        setSesion(session);
        setUsuario(session?.user || null);
        setCargando(false);
      });
      subscription = listener?.data?.subscription;
    } catch (e) {
      console.log('[Auth] Error onAuthStateChange:', e?.message);
    }

    // Refrescar token cuando la app vuelve al foreground
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        try {
          supabase.auth.startAutoRefresh?.();
        } catch {}
      } else {
        try {
          supabase.auth.stopAutoRefresh?.();
        } catch {}
      }
    });

    return () => {
      clearTimeout(timeout);
      try { subscription?.unsubscribe?.(); } catch {}
      try { appStateSub?.remove?.(); } catch {}
    };
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    try {
      const supabase = getSupabase();
      if (!supabase) return { error: 'Supabase no configurado' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message || null };
    } catch (e) {
      return { error: e?.message || 'Error inesperado' };
    }
  }, []);

  const registrarse = useCallback(async (email, password, nombre) => {
    try {
      const supabase = getSupabase();
      if (!supabase) return { error: 'Supabase no configurado' };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre_completo: nombre || '' } },
      });
      return { error: error?.message || null };
    } catch (e) {
      return { error: e?.message || 'Error inesperado' };
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      await supabase.auth.signOut();
    } catch (e) {
      console.log('[Auth] Error signOut:', e?.message);
    }
  }, []);

  const autenticado = Boolean(sesion);

  return (
    <AuthContext.Provider
      value={{
        sesion,
        usuario,
        cargando,
        autenticado,
        iniciarSesion,
        registrarse,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
