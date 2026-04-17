import { getSupabase } from './supabaseClient';
import { SUPABASE_BUCKET_FOTOS } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Módulo de sincronización con Supabase.
 *
 * Filosofía: offline-first. AsyncStorage es la fuente de verdad local.
 * Este módulo hace "upsert" de una supervisión completa al backend cuando
 * hay red y sesión activa. Los errores de red NO bloquean el flujo del
 * usuario — se loggean y se reintentarán en el siguiente save.
 */

const log = (...args) => console.log('[Sync]', ...args);
const logError = (...args) => console.log('[Sync:ERROR]', ...args);

/** Fallback manual si globalThis.atob no existe */
const base64ToBinary = (b64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let str = '';
  const clean = b64.replace(/=+$/, '');
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = chars.indexOf(clean[i]);
    const c2 = chars.indexOf(clean[i + 1]);
    const c3 = chars.indexOf(clean[i + 2] || 'A');
    const c4 = chars.indexOf(clean[i + 3] || 'A');
    const n = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
    str += String.fromCharCode((n >> 16) & 0xff);
    if (clean[i + 2]) str += String.fromCharCode((n >> 8) & 0xff);
    if (clean[i + 3]) str += String.fromCharCode(n & 0xff);
  }
  return str;
};

/**
 * Convierte una supervisión del formato local (AsyncStorage) al formato
 * normalizado de la DB.
 */
const toRowSupervision = (supervision, userId) => ({
  id: supervision.id,
  user_id: userId,
  estado: supervision.estado || 'borrador',
  nombre_cprs: supervision.datosGenerales?.nombreCprs || null,
  fecha_hora_supervision: supervision.datosGenerales?.fechaHoraSupervision || null,
  genero_director: supervision.datosGenerales?.generoDirector || null,
  genero_administrador: supervision.datosGenerales?.generoAdministrador || null,
  imagen_centro_path: supervision.datosGenerales?.imagenCentroRemotePath || null,
  promedio_general: supervision.datosGenerales?.promedioGeneral || 0,
});

const toRowRubro = (rubro, supervisionId) => ({
  id: rubro.id,
  supervision_id: supervisionId,
  rubro_catalog_id: rubro.rubroId || '',
  nombre: rubro.nombre,
  orden: rubro.orden || 0,
  no_aplica: Boolean(rubro.noAplica),
  calificacion: rubro.calificacion != null ? rubro.calificacion : null,
  observacion: rubro.observacion || '',
  sin_novedad: Boolean(rubro.sinNovedad),
});

const toRowCriterio = (criterio, rubroId, orden) => ({
  id: criterio.id || undefined, // dejar que postgres genere si no hay id uuid válido
  rubro_id: rubroId,
  criterio_catalog_id: criterio.id || '',
  texto: criterio.texto,
  cumple: criterio.cumple === true ? true : criterio.cumple === false ? false : null,
  orden: orden,
});

/**
 * Sube una foto local al bucket de Supabase Storage.
 * Retorna el path (no la URL pública).
 */
const subirFoto = async (supabase, userId, supervisionId, rubroId, foto) => {
  try {
    if (!foto?.uri) return null;
    // Si ya está en el bucket, no subir de nuevo
    if (foto.remotePath) return foto.remotePath;

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const path = `${userId}/${supervisionId}/${rubroId}/${fileName}`;

    let fileBody;
    try {
      if (isWeb) {
        const response = await fetch(foto.uri);
        fileBody = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(foto.uri, {
          encoding: 'base64',
        });
        // atob puede no estar en algunos runtimes RN; decodificar manual
        const binary = globalThis.atob ? globalThis.atob(base64) : base64ToBinary(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        fileBody = bytes;
      }
    } catch (readErr) {
      logError('No se pudo leer la foto local:', readErr?.message);
      return null;
    }

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_FOTOS)
      .upload(path, fileBody, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      logError('Error subiendo foto:', error.message);
      return null;
    }

    return path;
  } catch (e) {
    logError('Excepción subiendo foto:', e.message);
    return null;
  }
};

/**
 * Sincroniza una supervisión completa al backend.
 * No bloquea ni lanza excepciones: los errores se loggean y retorna
 * { ok: false, error } para que el caller decida.
 *
 * @param {Object} supervision - Supervisión del formato local (AsyncStorage)
 * @param {Object} [opciones]
 * @param {boolean} [opciones.subirFotos=false] - Si true, sube fotos al bucket.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const sincronizarSupervision = async (supervision, opciones = {}) => {
  const { subirFotos = false } = opciones;

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: 'Supabase no configurado' };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      log('Sin sesión, saltando sync');
      return { ok: false, error: 'Sin sesión' };
    }

    const userId = session.user.id;

    // 1) Upsert supervisión
    const rowSup = toRowSupervision(supervision, userId);
    const { error: errSup } = await supabase
      .from('supervisiones')
      .upsert(rowSup, { onConflict: 'id' });

    if (errSup) {
      logError('Error upsert supervisión:', errSup.message);
      return { ok: false, error: errSup.message };
    }

    // 2) Borrar rubros+criterios+fotos previos (cascade) y reinsertar limpio
    //    Es la forma más simple de mantener consistencia sin track de deltas.
    const rubros = supervision.areas || [];
    if (rubros.length > 0) {
      const { error: errDel } = await supabase
        .from('rubros')
        .delete()
        .eq('supervision_id', supervision.id);
      if (errDel) {
        logError('Error borrando rubros previos:', errDel.message);
      }

      // 3) Insertar rubros
      const rowsRubros = rubros.map((r) => toRowRubro(r, supervision.id));
      const { error: errRub } = await supabase.from('rubros').insert(rowsRubros);
      if (errRub) {
        logError('Error insert rubros:', errRub.message);
        return { ok: false, error: errRub.message };
      }

      // 4) Insertar criterios por rubro
      const rowsCriterios = [];
      rubros.forEach((r) => {
        (r.criterios || []).forEach((c, idx) => {
          rowsCriterios.push(toRowCriterio(c, r.id, idx));
        });
      });
      if (rowsCriterios.length > 0) {
        // Remover ids que no son uuid válidos (catálogo usa 'arm-1', 'med-2', etc.)
        const clean = rowsCriterios.map(({ id, ...rest }) => rest);
        const { error: errCri } = await supabase.from('criterios_rubro').insert(clean);
        if (errCri) {
          logError('Error insert criterios:', errCri.message);
        }
      }

      // 5) Subir fotos (opcional, sólo al finalizar)
      if (subirFotos) {
        for (const r of rubros) {
          const fotos = r.fotos || [];
          for (let i = 0; i < fotos.length; i++) {
            const foto = fotos[i];
            const path = await subirFoto(supabase, userId, supervision.id, r.id, foto);
            if (path) {
              await supabase.from('fotos_rubro').insert({
                rubro_id: r.id,
                storage_path: path,
                orden: i,
              });
            }
          }
        }
      }
    }

    log('Supervisión sincronizada:', supervision.id);
    return { ok: true };
  } catch (e) {
    logError('Excepción sync:', e.message);
    return { ok: false, error: e.message };
  }
};

/**
 * Borra una supervisión del backend. Usa el CASCADE de Postgres para
 * eliminar rubros/criterios/fotos hijas.
 */
export const eliminarSupervisionRemota = async (supervisionId) => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase no configurado' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { ok: false, error: 'Sin sesión' };

    const { error } = await supabase
      .from('supervisiones')
      .delete()
      .eq('id', supervisionId);

    if (error) {
      logError('Error eliminando remoto:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    logError('Excepción eliminar remoto:', e.message);
    return { ok: false, error: e.message };
  }
};
