// Índice de mapas de municipios - solo versiones transparentes (no_zoom)
// Estos mapas se muestran en la esquina de las diapositivas

import almoloya from '../../assets/mapas/almoloya_de_juarez_no_zoom_transparent.png';
import chalco from '../../assets/mapas/chalco_no_zoom_transparent.png';
import cuautitlanIzcalli from '../../assets/mapas/cuautitlan_izcalli_no_zoom_transparent.png';
import cuautitlan from '../../assets/mapas/cuautitlan_no_zoom_transparent.png';
import ecatepec from '../../assets/mapas/ecatepec_de_morelos_no_zoom_transparent.png';
import elOro from '../../assets/mapas/el_oro_no_zoom_transparent.png';
import ixtlahuaca from '../../assets/mapas/ixtlahuaca_no_zoom_transparent.png';
import jilotepec from '../../assets/mapas/jilotepec_no_zoom_transparent.png';
import lerma from '../../assets/mapas/lerma_no_zoom_transparent.png';
import nezahualcoyotl from '../../assets/mapas/nezahualcoyotl_no_zoom_transparent.png';
import otumba from '../../assets/mapas/otumba_no_zoom_transparent.png';
import penitenciaria from '../../assets/mapas/PENITENCIARIA_MODELO_no_zoom_transparent.png';
import quintaDelBosque from '../../assets/mapas/QUINTA_DEL_BOSQUE_no_zoom_transparent.png';
import sultepec from '../../assets/mapas/sultepec_no_zoom_transparent.png';
import tenancingo from '../../assets/mapas/tenancingo_no_zoom_transparent.png';
import tenangoDelAire from '../../assets/mapas/tenango_del_aire_no_zoom_transparent.png';
import tenangoDelValle from '../../assets/mapas/tenango_del_valle_no_zoom_transparent.png';
import texcoco from '../../assets/mapas/texcoco_no_zoom_transparent.png';
import tlalnepantla from '../../assets/mapas/tlalnepantla_de_baz_no_zoom_transparent.png';
import valleDeBravo from '../../assets/mapas/valle_de_bravo_no_zoom_transparent.png';
import valleDeChalco from '../../assets/mapas/valle_de_chalco_solidaridad_no_zoom_transparent.png';
import zumpango from '../../assets/mapas/zumpango_no_zoom_transparent.png';

/**
 * Objeto con todos los mapas disponibles
 * Las claves son palabras clave para buscar en el nombre del CPRS
 */
const MAPAS = {
  // Ordenados por especificidad (más específico primero)
  'cuautitlan izcalli': cuautitlanIzcalli,
  'cuautitlán izcalli': cuautitlanIzcalli,
  'tenango del aire': tenangoDelAire,
  'tenango del valle': tenangoDelValle,
  'valle de bravo': valleDeBravo,
  'valle de chalco': valleDeChalco,
  'quinta del bosque': quintaDelBosque,
  'el oro': elOro,
  'almoloya': almoloya,
  'chalco': chalco,
  'cuautitlan': cuautitlan,
  'cuautitlán': cuautitlan,
  'ecatepec': ecatepec,
  'ixtlahuaca': ixtlahuaca,
  'jilotepec': jilotepec,
  'lerma': lerma,
  'nezahualcoyotl': nezahualcoyotl,
  'nezahualcóyotl': nezahualcoyotl,
  'otumba': otumba,
  'penitenciaria': penitenciaria,
  'penitenciaría': penitenciaria,
  'modelo': penitenciaria,
  'sultepec': sultepec,
  'tenancingo': tenancingo,
  'texcoco': texcoco,
  'tlalnepantla': tlalnepantla,
  'zumpango': zumpango,
};

/**
 * Busca el mapa correspondiente al nombre del CPRS
 * @param {string} nombreCprs - Nombre del centro penitenciario
 * @returns {number|null} - El asset del mapa o null si no se encuentra
 */
export const buscarMapa = (nombreCprs) => {
  if (!nombreCprs) return null;
  
  const nombreLower = nombreCprs.toLowerCase();
  
  // Buscar por coincidencia parcial
  for (const [clave, mapa] of Object.entries(MAPAS)) {
    if (nombreLower.includes(clave)) {
      return mapa;
    }
  }
  
  return null;
};

export default MAPAS;
