import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  obtenerCola,
  removerDeCola,
  marcarFallido,
  contarPendientes,
} from '../utils/syncQueue';
import { obtenerSupervisionPorId } from '../utils/storage';
import { sincronizarSupervision } from '../utils/syncSupabase';
import { supabaseEstaConfigurado } from '../config/supabase';

const SyncContext = createContext(null);

/**
 * Import defensivo de NetInfo. Si el módulo nativo no está presente
 * (por ejemplo en web o si el install falló), devolvemos null y el
 * provider sigue funcionando con heurística de "siempre online".
 */
let NetInfo = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.log('[Sync] NetInfo no disponible, usando modo optimista online.');
}

export function SyncProvider({ children }) {
  const [online, setOnline] = useState(true);
  const [pendientes, setPendientes] = useState(0);
  const drenando = useRef(false);

  const refrescarPendientes = useCallback(async () => {
    try {
      const n = await contarPendientes();
      setPendientes(n);
    } catch (e) {
      console.log('[Sync] Error contando pendientes:', e?.message);
    }
  }, []);

  const drenarCola = useCallback(async () => {
    if (!supabaseEstaConfigurado() || drenando.current) return;
    drenando.current = true;
    try {
      const cola = await obtenerCola();
      for (const item of cola) {
        if ((item.intentos || 0) >= 10) continue;

        const supervision = await obtenerSupervisionPorId(item.supervisionId);
        if (!supervision) {
          await removerDeCola(item.supervisionId);
          continue;
        }

        try {
          const { ok, error } = await sincronizarSupervision(supervision, {
            subirFotos: item.subirFotos,
          });
          if (ok) {
            await removerDeCola(item.supervisionId);
          } else {
            await marcarFallido(item.supervisionId, error || 'desconocido');
          }
        } catch (innerError) {
          // Nunca dejar que un error de sync mate el proceso de drenado
          console.log('[Sync] error individual:', innerError?.message);
          await marcarFallido(item.supervisionId, innerError?.message || 'excepción');
        }
      }
    } catch (e) {
      console.log('[Sync] Error drenando cola:', e?.message);
    } finally {
      drenando.current = false;
      await refrescarPendientes();
    }
  }, [refrescarPendientes]);

  useEffect(() => {
    let unsub = null;
    refrescarPendientes().catch(() => {});

    if (NetInfo) {
      try {
        unsub = NetInfo.addEventListener((state) => {
          const connected = Boolean(
            state?.isConnected && state?.isInternetReachable !== false
          );
          setOnline(connected);
          if (connected) drenarCola().catch(() => {});
        });
      } catch (e) {
        console.log('[Sync] NetInfo.addEventListener falló:', e?.message);
      }
    }

    // Drenado periódico (funciona aunque no haya NetInfo)
    const interval = setInterval(() => {
      drenarCola().catch(() => {});
    }, 60_000);

    return () => {
      if (unsub) {
        try { unsub(); } catch {}
      }
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SyncContext.Provider
      value={{
        online,
        pendientes,
        drenarCola,
        refrescarPendientes,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    return {
      online: true,
      pendientes: 0,
      drenarCola: async () => {},
      refrescarPendientes: async () => {},
    };
  }
  return ctx;
}
