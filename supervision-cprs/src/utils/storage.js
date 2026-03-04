import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SUPERVISIONES_KEY = '@supervisiones';

/**
 * Genera un ID único para cada supervisión
 */
export const generarId = () => {
  return Crypto.randomUUID();
};

/**
 * Obtiene todas las supervisiones guardadas
 * @returns {Promise<Array>} Lista de supervisiones
 */
export const obtenerSupervisiones = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SUPERVISIONES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error al obtener supervisiones:', error);
    return [];
  }
};

/**
 * Guarda una nueva supervisión o actualiza una existente
 * @param {Object} supervision - Objeto de supervisión
 * @returns {Promise<Object>} La supervisión guardada
 */
export const guardarSupervision = async (supervision) => {
  try {
    const supervisiones = await obtenerSupervisiones();
    const index = supervisiones.findIndex((s) => s.id === supervision.id);

    if (index !== -1) {
      // Actualizar existente
      supervisiones[index] = {
        ...supervision,
        fechaModificacion: new Date().toISOString(),
      };
    } else {
      // Nueva supervisión
      supervisiones.unshift({
        ...supervision,
        id: supervision.id || generarId(),
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
      });
    }

    await AsyncStorage.setItem(SUPERVISIONES_KEY, JSON.stringify(supervisiones));
    return supervisiones[index !== -1 ? index : 0];
  } catch (error) {
    console.error('Error al guardar supervisión:', error);
    throw error;
  }
};

/**
 * Obtiene una supervisión por su ID
 * @param {string} id - ID de la supervisión
 * @returns {Promise<Object|null>} La supervisión o null
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
 * @param {string} id - ID de la supervisión a eliminar
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export const eliminarSupervision = async (id) => {
  try {
    const supervisiones = await obtenerSupervisiones();
    const nuevasSupervisiones = supervisiones.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SUPERVISIONES_KEY, JSON.stringify(nuevasSupervisiones));
    return true;
  } catch (error) {
    console.error('Error al eliminar supervisión:', error);
    return false;
  }
};

/**
 * Crea una nueva supervisión vacía
 * @returns {Object} Objeto de supervisión vacío
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
    },
    areas: [],
    fechaCreacion: null,
    fechaModificacion: null,
  };
};

/**
 * Crea una nueva área vacía
 * @returns {Object} Objeto de área vacío
 */
export const crearNuevaArea = () => {
  return {
    id: generarId(),
    nombre: '',
    observacion: '',
    sinNovedad: false,
    fotos: [],
  };
};
