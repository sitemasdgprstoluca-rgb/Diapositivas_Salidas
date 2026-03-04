import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  crearNuevaSupervision, 
  crearNuevaArea,
  guardarSupervision as guardarEnStorage,
  obtenerSupervisiones,
  obtenerSupervisionPorId,
  eliminarSupervision as eliminarDeStorage,
} from '../utils/storage';

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
  AGREGAR_AREA: 'AGREGAR_AREA',
  ACTUALIZAR_AREA: 'ACTUALIZAR_AREA',
  ELIMINAR_AREA: 'ELIMINAR_AREA',
  REORDENAR_AREAS: 'REORDENAR_AREAS',
  AGREGAR_FOTO: 'AGREGAR_FOTO',
  ELIMINAR_FOTO: 'ELIMINAR_FOTO',
  LIMPIAR_SUPERVISION: 'LIMPIAR_SUPERVISION',
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
    
    case ACTIONS.AGREGAR_AREA:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: [...state.supervisionActual.areas, crearNuevaArea()],
        },
      };
    
    case ACTIONS.ACTUALIZAR_AREA:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.map((area) =>
            area.id === action.payload.id
              ? { ...area, ...action.payload.datos }
              : area
          ),
        },
      };
    
    case ACTIONS.ELIMINAR_AREA:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.filter(
            (area) => area.id !== action.payload
          ),
        },
      };
    
    case ACTIONS.REORDENAR_AREAS:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: action.payload,
        },
      };
    
    case ACTIONS.AGREGAR_FOTO:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.map((area) =>
            area.id === action.payload.areaId
              ? { ...area, fotos: [...area.fotos, action.payload.foto] }
              : area
          ),
        },
      };
    
    case ACTIONS.ELIMINAR_FOTO:
      return {
        ...state,
        supervisionActual: {
          ...state.supervisionActual,
          areas: state.supervisionActual.areas.map((area) =>
            area.id === action.payload.areaId
              ? {
                  ...area,
                  fotos: area.fotos.filter((_, idx) => idx !== action.payload.fotoIndex),
                }
              : area
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

  // Cargar todas las supervisiones
  const cargarSupervisiones = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_CARGANDO, payload: true });
    try {
      const supervisiones = await obtenerSupervisiones();
      dispatch({ type: ACTIONS.SET_SUPERVISIONES, payload: supervisiones });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // Crear nueva supervisión
  const nuevaSupervision = useCallback(() => {
    dispatch({ type: ACTIONS.NUEVA_SUPERVISION });
  }, []);

  // Cargar supervisión existente
  const cargarSupervision = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_CARGANDO, payload: true });
    try {
      const supervision = await obtenerSupervisionPorId(id);
      dispatch({ type: ACTIONS.SET_SUPERVISION_ACTUAL, payload: supervision });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // Guardar supervisión actual
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

  // Eliminar supervisión
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

  // Actualizar datos generales
  const actualizarDatosGenerales = useCallback((datos) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_DATOS_GENERALES, payload: datos });
  }, []);

  // Agregar área
  const agregarArea = useCallback(() => {
    dispatch({ type: ACTIONS.AGREGAR_AREA });
  }, []);

  // Actualizar área
  const actualizarArea = useCallback((id, datos) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_AREA, payload: { id, datos } });
  }, []);

  // Eliminar área
  const eliminarArea = useCallback((id) => {
    dispatch({ type: ACTIONS.ELIMINAR_AREA, payload: id });
  }, []);

  // Reordenar áreas
  const reordenarAreas = useCallback((nuevasAreas) => {
    dispatch({ type: ACTIONS.REORDENAR_AREAS, payload: nuevasAreas });
  }, []);

  // Agregar foto a área
  const agregarFoto = useCallback((areaId, foto) => {
    dispatch({ type: ACTIONS.AGREGAR_FOTO, payload: { areaId, foto } });
  }, []);

  // Eliminar foto de área
  const eliminarFoto = useCallback((areaId, fotoIndex) => {
    dispatch({ type: ACTIONS.ELIMINAR_FOTO, payload: { areaId, fotoIndex } });
  }, []);

  // Limpiar supervisión actual
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
    agregarArea,
    actualizarArea,
    eliminarArea,
    reordenarAreas,
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

// Hook personalizado
export function useSupervision() {
  const context = useContext(SupervisionContext);
  if (!context) {
    throw new Error('useSupervision debe usarse dentro de SupervisionProvider');
  }
  return context;
}
