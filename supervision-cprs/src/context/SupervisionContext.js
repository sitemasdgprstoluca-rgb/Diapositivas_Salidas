import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  crearNuevaSupervision,
  guardarSupervision as guardarEnStorage,
  obtenerSupervisiones,
  obtenerSupervisionPorId,
  eliminarSupervision as eliminarDeStorage,
} from '../utils/storage';
import { calcularPromedioGeneral } from '../constants/data';

// Estado inicial
const initialState = {
  supervisionActual: null,
  supervisiones: [],
  cargando: false,
  error: null,
};

// Tipos de acciones
const ACTIONS = {
  SET_CARGANDO: 'SET_CARGANDO',
  SET_ERROR: 'SET_ERROR',
  SET_SUPERVISIONES: 'SET_SUPERVISIONES',
  SET_SUPERVISION_ACTUAL: 'SET_SUPERVISION_ACTUAL',
  NUEVA_SUPERVISION: 'NUEVA_SUPERVISION',
  ACTUALIZAR_DATOS_GENERALES: 'ACTUALIZAR_DATOS_GENERALES',
  ACTUALIZAR_RUBRO: 'ACTUALIZAR_RUBRO',
  ACTUALIZAR_CRITERIO: 'ACTUALIZAR_CRITERIO',
  AGREGAR_FOTO: 'AGREGAR_FOTO',
  ELIMINAR_FOTO: 'ELIMINAR_FOTO',
  LIMPIAR_SUPERVISION: 'LIMPIAR_SUPERVISION',
};

// Helper: recalcular promedio cada vez que cambian rubros
const conPromedioActualizado = (supervision) => {
  const promedio = calcularPromedioGeneral(supervision.areas || []);
  return {
    ...supervision,
    datosGenerales: {
      ...supervision.datosGenerales,
      promedioGeneral: promedio,
    },
  };
};

// Reducer
function supervisionReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CARGANDO:
      return { ...state, cargando: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, cargando: false };

    case ACTIONS.SET_SUPERVISIONES:
      return { ...state, supervisiones: action.payload, cargando: false };

    case ACTIONS.SET_SUPERVISION_ACTUAL:
      return { ...state, supervisionActual: action.payload, cargando: false };

    case ACTIONS.NUEVA_SUPERVISION:
      return { ...state, supervisionActual: crearNuevaSupervision() };

    case ACTIONS.ACTUALIZAR_DATOS_GENERALES:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          datosGenerales: {
            ...state.supervisionActual.datosGenerales,
            ...action.payload,
          },
        },
      };

    case ACTIONS.ACTUALIZAR_RUBRO: {
      const nuevaSupervision = {
        ...state.supervisionActual,
        areas: state.supervisionActual.areas.map((rubro) =>
          rubro.id === action.payload.id
            ? { ...rubro, ...action.payload.datos }
            : rubro
        ),
      };
      return {
        ...state,
        supervisionActual: conPromedioActualizado(nuevaSupervision),
      };
    }

    case ACTIONS.ACTUALIZAR_CRITERIO: {
      const { rubroId, criterioId, cumple } = action.payload;
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.map((rubro) =>
            rubro.id === rubroId
              ? {
                  ...rubro,
                  criterios: rubro.criterios.map((c) =>
                    c.id === criterioId ? { ...c, cumple } : c
                  ),
                }
              : rubro
          ),
        },
      };
    }

    case ACTIONS.AGREGAR_FOTO:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.map((rubro) =>
            rubro.id === action.payload.areaId
              ? { ...rubro, fotos: [...rubro.fotos, action.payload.foto] }
              : rubro
          ),
        },
      };

    case ACTIONS.ELIMINAR_FOTO:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.map((rubro) =>
            rubro.id === action.payload.areaId
              ? {
                  ...rubro,
                  fotos: rubro.fotos.filter((_, idx) => idx !== action.payload.fotoIndex),
                }
              : rubro
          ),
        },
      };

    case ACTIONS.LIMPIAR_SUPERVISION:
      return { ...state, supervisionActual: null };

    default:
      return state;
  }
}

// Contexto
const SupervisionContext = createContext(null);

// Provider
export function SupervisionProvider({ children }) {
  const [state, dispatch] = useReducer(supervisionReducer, initialState);

  const cargarSupervisiones = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_CARGANDO, payload: true });
    try {
      const supervisiones = await obtenerSupervisiones();
      dispatch({ type: ACTIONS.SET_SUPERVISIONES, payload: supervisiones });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const nuevaSupervision = useCallback(() => {
    dispatch({ type: ACTIONS.NUEVA_SUPERVISION });
  }, []);

  const cargarSupervision = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_CARGANDO, payload: true });
    try {
      const supervision = await obtenerSupervisionPorId(id);
      dispatch({ type: ACTIONS.SET_SUPERVISION_ACTUAL, payload: supervision });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const guardarSupervision = useCallback(async (estado = 'borrador') => {
    if (!state.supervisionActual) return null;

    dispatch({ type: ACTIONS.SET_CARGANDO, payload: true });
    try {
      const supervisionGuardada = await guardarEnStorage({
        ...state.supervisionActual,
        estado,
      });
      dispatch({ type: ACTIONS.SET_SUPERVISION_ACTUAL, payload: supervisionGuardada });
      await cargarSupervisiones();
      return supervisionGuardada;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return null;
    }
  }, [state.supervisionActual, cargarSupervisiones]);

  const eliminarSupervision = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_CARGANDO, payload: true });
    try {
      await eliminarDeStorage(id);
      await cargarSupervisiones();
      if (state.supervisionActual?.id === id) {
        dispatch({ type: ACTIONS.LIMPIAR_SUPERVISION });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.supervisionActual, cargarSupervisiones]);

  const actualizarDatosGenerales = useCallback((datos) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_DATOS_GENERALES, payload: datos });
  }, []);

  // Actualiza un rubro (calificación, noAplica, observación, sinNovedad, etc.)
  const actualizarRubro = useCallback((id, datos) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_RUBRO, payload: { id, datos } });
  }, []);

  // Mantiene compatibilidad con código que llama "actualizarArea"
  const actualizarArea = actualizarRubro;

  const actualizarCriterio = useCallback((rubroId, criterioId, cumple) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_CRITERIO, payload: { rubroId, criterioId, cumple } });
  }, []);

  const agregarFoto = useCallback((areaId, foto) => {
    dispatch({ type: ACTIONS.AGREGAR_FOTO, payload: { areaId, foto } });
  }, []);

  const eliminarFoto = useCallback((areaId, fotoIndex) => {
    dispatch({ type: ACTIONS.ELIMINAR_FOTO, payload: { areaId, fotoIndex } });
  }, []);

  const limpiarSupervision = useCallback(() => {
    dispatch({ type: ACTIONS.LIMPIAR_SUPERVISION });
  }, []);

  const value = {
    ...state,
    cargarSupervisiones,
    nuevaSupervision,
    cargarSupervision,
    guardarSupervision,
    eliminarSupervision,
    actualizarDatosGenerales,
    actualizarRubro,
    actualizarArea,
    actualizarCriterio,
    agregarFoto,
    eliminarFoto,
    limpiarSupervision,
  };

  return (
    <SupervisionContext.Provider value={value}>
      {children}
    </SupervisionContext.Provider>
  );
}

export function useSupervision() {
  const context = useContext(SupervisionContext);
  if (!context) {
    throw new Error('useSupervision debe usarse dentro de SupervisionProvider');
  }
  return context;
}
