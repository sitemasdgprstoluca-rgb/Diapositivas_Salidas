import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { RUBROS_INDICADORES } from '../constants/data';
import { sincronizarSupervision, eliminarSupervisionRemota } from './syncSupabase';
import { encolarSupervision } from './syncQueue';

const SUPERVISIONES_KEY = '@supervisiones';
const MODELO_VERSION_KEY = '@supervisiones_modelo_version';
const MODELO_VERSION_ACTUAL = 'v2_rubros_indicadores';

/**
 * Genera un ID único para cada supervisión
 */
export const generarId = () => {
  return Crypto.randomUUID();
};

/**
 * Migración: si la versión del modelo guardada no es la actual,
 * se limpian las supervisiones previas (modelo viejo de áreas libres).
 */
export const migrarSiEsNecesario = async () => {
  try {
    const versionGuardada = await AsyncStorage.getItem(MODELO_VERSION_KEY);
    if (versionGuardada !== MODELO_VERSION_ACTUAL) {
      await AsyncStorage.removeItem(SUPERVISIONES_KEY);
      await AsyncStorage.setItem(MODELO_VERSION_KEY, MODELO_VERSION_ACTUAL);
    }
  } catch (error) {
    console.error('Error migrando modelo:', error);
  }
};

/**
 * Obtiene todas las supervisiones guardadas
 */
export const obtenerSupervisiones = async () => {
  try {
    await migrarSiEsNecesario();
    const jsonValue = await AsyncStorage.getItem(SUPERVISIONES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error al obtener supervisiones:', error);
    return [];
  }
};

/**
 * Guarda una nueva supervisión o actualiza una existente
 */
export const guardarSupervision = async (supervision) => {
  try {
    const supervisiones = await obtenerSupervisiones();
    const index = supervisiones.findIndex((s) => s.id === supervision.id);

    if (index !== -1) {
      supervisiones[index] = {
        ...supervision,
        fechaModificacion: new Date().toISOString(),
      };
    } else {
      supervisiones.unshift({
        ...supervision,
        id: supervision.id || generarId(),
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
      });
    }

    await AsyncStorage.setItem(SUPERVISIONES_KEY, JSON.stringify(supervisiones));
    const guardada = supervisiones[index !== -1 ? index : 0];

    // Encolar para sincronización (el SyncProvider drena la cola cuando hay red).
    // Fotos solo se suben al marcar "finalizado".
    const subirFotos = guardada.estado === 'finalizado';
    encolarSupervision(guardada.id, { subirFotos }).catch((err) => {
      console.log('[storage] error encolando:', err?.message);
    });

    // Intento oportunista de sync inmediato (si hay red, se sube ya; si no, queda en cola).
    sincronizarSupervision(guardada, { subirFotos }).then((r) => {
      if (r?.ok) {
        // Si salió bien, quitar de la cola
        import('./syncQueue').then((m) => m.removerDeCola(guardada.id));
      }
    }).catch(() => { /* silencioso: la cola reintentará */ });

    return guardada;
  } catch (error) {
    console.error('Error al guardar supervisión:', error);
    throw error;
  }
};

/**
 * Obtiene una supervisión por su ID
 */
export const obtenerSupervisionPorId = async (id) => {
  try {
    const supervisiones = await obtenerSupervisiones();
    return supervisiones.find((s) => s.id === id) || null;
  } catch (error) {
    console.error('Error al obtener supervisión:', error);
    return null;
  }
};

/**
 * Elimina una supervisión por su ID
 */
export const eliminarSupervision = async (id) => {
  try {
    const supervisiones = await obtenerSupervisiones();
    const nuevasSupervisiones = supervisiones.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SUPERVISIONES_KEY, JSON.stringify(nuevasSupervisiones));

    // Borrar también del backend (fire-and-forget)
    eliminarSupervisionRemota(id).catch((err) => {
      console.log('[storage] borrado remoto fallido:', err?.message);
    });

    return true;
  } catch (error) {
    console.error('Error al eliminar supervisión:', error);
    return false;
  }
};

/**
 * Crea los 15 rubros precargados según el catálogo oficial.
 * Orden estricto (no editable por el usuario).
 */
export const crearRubrosIniciales = () => {
  return RUBROS_INDICADORES
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((rubro) => ({
      id: generarId(),
      rubroId: rubro.id,
      nombre: rubro.nombre,
      orden: rubro.orden,
      noAplica: false,
      calificacion: null,
      criterios: rubro.criterios.map((c) => ({
        id: c.id,
        texto: c.texto,
        cumple: null, // null = sin responder; true = SI; false = NO
      })),
      observacion: '',
      sinNovedad: false,
      fotos: [],
    }));
};

/**
 * Crea una nueva supervisión con los 15 rubros precargados.
 */
export const crearNuevaSupervision = () => {
  return {
    id: generarId(),
    estado: 'borrador',
    datosGenerales: {
      fechaCompleta: null,
      nombreCprs: '',
      fechaDiaMes: null,
      horaSupervision: null,
      promedioGeneral: 0,
    },
    areas: crearRubrosIniciales(), // nota: se mantiene la clave "areas" para compatibilidad con vistas
    fechaCreacion: null,
    fechaModificacion: null,
  };
};

/**
 * DEPRECATED - mantenido para compatibilidad, pero ya no se usa en el flujo.
 * El usuario no puede agregar áreas libres en el nuevo modelo.
 */
export const crearNuevaArea = () => {
  return {
    id: generarId(),
    nombre: '',
    noAplica: false,
    calificacion: null,
    criterios: [],
    observacion: '',
    sinNovedad: false,
    fotos: [],
  };
};
