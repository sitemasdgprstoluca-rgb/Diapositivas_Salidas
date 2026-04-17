import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@sync_queue';

/**
 * Cola persistente de supervisiones pendientes de sincronizar a Supabase.
 * Se guarda en AsyncStorage, sobrevive a cierres de la app.
 *
 * Cada item tiene el shape:
 *   { supervisionId: string, subirFotos: boolean, intentos: number, ultimoError?: string }
 */

export const obtenerCola = async () => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const guardarCola = async (items) => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
};

/**
 * Agrega (o actualiza) una supervisión en la cola.
 * Si ya estaba pendiente, actualiza las opciones (subirFotos) y resetea intentos.
 */
export const encolarSupervision = async (supervisionId, opciones = {}) => {
  const { subirFotos = false } = opciones;
  const cola = await obtenerCola();
  const existente = cola.find((i) => i.supervisionId === supervisionId);
  if (existente) {
    // Upgrade: si ya estaba en cola y ahora pide subirFotos, mantener true
    existente.subirFotos = existente.subirFotos || subirFotos;
    existente.intentos = 0;
    delete existente.ultimoError;
  } else {
    cola.push({
      supervisionId,
      subirFotos,
      intentos: 0,
      encolado: new Date().toISOString(),
    });
  }
  await guardarCola(cola);
  return cola.length;
};

export const removerDeCola = async (supervisionId) => {
  const cola = await obtenerCola();
  const filtrada = cola.filter((i) => i.supervisionId !== supervisionId);
  await guardarCola(filtrada);
};

export const marcarFallido = async (supervisionId, error) => {
  const cola = await obtenerCola();
  const item = cola.find((i) => i.supervisionId === supervisionId);
  if (item) {
    item.intentos = (item.intentos || 0) + 1;
    item.ultimoError = error;
    await guardarCola(cola);
  }
};

export const contarPendientes = async () => {
  const cola = await obtenerCola();
  return cola.length;
};

export const limpiarCola = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
