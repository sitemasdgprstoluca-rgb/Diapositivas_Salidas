# Reference Pack — Tutorial Engine — motor invariante + gap-fixes (multi-tab banner, RBAC, diagramas HTML/CSS)

> Material canónico extraído de SIGAE (la implementación de referencia). Los fragmentos marcados **INVARIANTE** se copian tal cual; los marcados **ADAPTABLE** se reescriben por identidad/dominio; los marcados **ESTÁNDAR-OBJETIVO (gap-fix)** son código que SIGAE aún NO tiene y que la skill DEBE generar.


## Resumen del pilar

El pilar TUTORIALES/MANUALES de SIGAE tiene tres capas: (1) un MOTOR de tour interactivo (coach-marks) — TutorialProvider expone una API (iniciar/siguiente/anterior/saltar/finalizar/irAPaso + estado/progreso), persiste en localStorage, navega con react-router antes de cada paso y sondea el DOM por `[data-tutorial-id="..."]`; el Spotlight global oscurece la pantalla, recorta un halo sobre el target (seguimiento por rAF + getBoundingClientRect) y muestra una tarjeta-tooltip glass tema-adaptativa, con fallback elegante a tarjeta centrada si el target no aparece. (2) GUÍAS conceptuales "¿qué es esta pantalla?" (GuiaConcepto: queEs/proposito/influye/flujo + conceptos + diagrama) abiertas vía Modal compartido por BotonComoFunciona (inyectado en ModuleHero por `guiaId`), PrimeraVezBanner y el menú de Ayuda contextual del Layout. (3) Diagramas HTML/CSS (jerarquía archivística y mapa del sistema) con tokens `var(--theme-*)`. Todo posicionamiento es puro/testeable (positioning.ts) y toda la persistencia es defensiva. Contenido y tipos están totalmente separados del motor; el registry y guias.config son los únicos archivos que se adaptan por dominio.


## Reglas duras (innegociables)

- Separación estricta MOTOR vs CONTENIDO: types.ts + engine/* + components/* + guias/{GuiaConceptoModal,BotonComoFunciona,PrimeraVezBanner,iconoDe} son invariantes; SOLO registry.ts, guias.config.ts y diagramas/* se adaptan por dominio. Nunca mezclar contenido es-MX dentro del motor.
- Convención de anclas única: cada Paso.target usa `[data-tutorial-id="..."]`, tipado globalmente en jsx-data-attrs.d.ts (sin cast). Toda ancla referenciada debe existir realmente en la UI o el paso cae al fallback centrado.
- Fallback elegante obligatorio: si el target no aparece tras el sondeo (ESPERA_TARGET_MS), el Spotlight muestra tarjeta centrada; el tour NUNCA se rompe ni bloquea.
- Overlay no-bloqueante: el contenedor del Spotlight va con pointer-events:none (solo la tarjeta reactiva el puntero) para no pasmar la página; z-index 10000/10001.
- Tema-adaptativo SIEMPRE: todos los colores vienen de var(--theme-*) (color-mix incluido). Cualquier contenido montado sobre un Modal de fondo fijo DEBE envolverse en var(--theme-bg-card)/var(--theme-text-primary) para aislar dark mode.
- Persistencia defensiva: todo acceso a localStorage va por safeStorage o try/catch que se traga errores; claves namespaced y versionadas (`<app>.tutoriales.progreso.v1`). La capa de aprendizaje jamás tira la app.
- Posicionamiento puro y testeable: el cálculo de halo/tooltip (positioning.ts) no toca el DOM (recibe rects) y tiene tests; el Spotlight solo lee getBoundingClientRect y delega.
- Accesibilidad: tarjeta del tour con role=dialog + aria-modal + aria-label, foco al botón principal, ESC=saltar, flechas navegan; respeta prefers-reduced-motion (useReducedMotion) en todas las animaciones.
- Cada GuiaConcepto responde las 4 preguntas (queEs/proposito/influye/flujo) y trae ≥1 concepto; todo tutorialId referenciado DEBE existir en TUTORIALES_POR_ID (verificado por tests).
- Fuente única de diccionarios: las definiciones de catálogos en las guías se importan de CATALOGOS_UI (o equivalente del dominio), no se duplican.
- Montaje único y global: <TutorialProvider><PantallaActivaProvider> envuelven el árbol y <Spotlight/>+<BienvenidaAutoStart/> se montan UNA sola vez en App (dentro del Router, tras el tema).
- Auto-inicio no intrusivo: BienvenidaAutoStart corre una sola vez (flag), nunca interrumpe un tour activo ni se dispara en rutas de auth; siempre saltable.
- ESTÁNDAR-OBJETIVO (a imponer aunque SIGAE aún no lo cumpla): PrimeraVezBanner con useSyncExternalStore+safeStorage (sync multi-tab); diagramas en HTML/CSS semántico con overflow-x-auto touch-pan-x; TutorialesPage filtra por RBAC excluyendo del DOM los módulos sin permiso.


## Puntos de adaptación (qué cambia por proyecto)

- registry.ts: el array TUTORIALES completo (ids, títulos, descripciones, iconos Lucide por nombre, y cada Paso con ruta/target/contenido es-MX) se reescribe para los módulos y anclas del proyecto destino.
- guias.config.ts: las GuiaConcepto[] (textos queEs/proposito/influye/flujo, conceptos con icono+termino+definicion, qué diagrama usar, resaltarFlujo, ruta, tutorialId) se reescriben por dominio; FlujoNodo enumera los nodos del mapa de ESE sistema.
- Anclas data-tutorial-id: los nombres concretos (sidebar-nav, expedientes-buscar, config-tab-fondos, etc.) se sustituyen por los de la UI del proyecto; deben colocarse en los componentes reales.
- Diagramas (DiagramaArchivistica/MapaSistema): la lista de NIVELES/NODOS, sus iconos, descripciones y el ejemplo de clave canónica se adaptan al dominio (la técnica HTML/CSS+tokens es invariante).
- Color primario / tokens: todo sale de var(--theme-*); el valor del primario (en SIGAE azul #003041) lo define el tema del proyecto, no el motor.
- Prefijo de claves localStorage: 'sigae.' → '<app>.' en storage.ts y primeraVezBanner.storage.ts.
- Mapa tutorialId→módulo para el filtro RBAC y rutas excluidas de BienvenidaAutoStart: dependen de los módulos/rutas del proyecto.
- GUIAS_MODULO vs sub-pantallas: qué guías son de módulo (tarjetas del Centro de aprendizaje) y cuáles de sub-pantalla (pestañas) depende de la estructura del proyecto; useRegistrarPantalla se llama con los ids de sub-pantalla propios.
- ModuleHero recibe guiaId por módulo: cada página decide qué guiaId inyectar.


## Gaps SIGAE vs estándar-objetivo (qué DEBE generar la skill)

- (1) PrimeraVezBanner SÍ tiene un GAP: usa useState local (`useState(() => shouldShowBanner(safeGet(...)))`) en src/modules/tutoriales/guias/PrimeraVezBanner.tsx (líneas 1,16). Usa safeStorage (safeGet/safeSet) y helpers puros aislados (primeraVezBanner.storage.ts), lo cual es bueno, PERO NO usa useSyncExternalStore, así que no sincroniza entre pestañas (abrir el módulo en otra pestaña no oculta el banner ya descartado hasta recargar). EL ESTÁNDAR EXIGE useSyncExternalStore suscrito al evento 'storage' (+ un evento custom para la misma pestaña) sobre safeStorage, como en la plantilla embebida 'PrimeraVezBanner — versión ESTÁNDAR'.
- (2) Los diagramas NO usan SVG: DiagramaArchivistica.tsx y MapaSistema.tsx ya son HTML/CSS semántico (figure/figcaption/ol/li) con tokens var(--theme-*) y chevrons rotados — correcto. GAP PARCIAL: NO envuelven la lista en un contenedor `overflow-x-auto touch-pan-x`; en pantallas muy estrechas la cadena horizontal (sm:flex-row) podría desbordar sin scroll táctil controlado. EL ESTÁNDAR EXIGE envolver las listas anchas en `<div className="overflow-x-auto touch-pan-x">` (ver plantilla 'Diagrama HTML/CSS semántico').
- (3) TutorialesPage tiene un GAP claro: NO filtra por RBAC. TutorialesPanel renderiza `tutoriales.map(...)` (todos los del provider) y las guías por `GUIAS.find`, sin consultar usePermissions; no hay ningún import de usePermissions en todo src/modules/tutoriales. La ruta /tutoriales está protegida solo con `dashboard.read` (App.tsx). Resultado: un usuario sin permiso de, p.ej., configuracion/auditoria ve igualmente esas tarjetas y puede lanzar su tour. EL ESTÁNDAR EXIGE excluir del DOM los tutoriales/guías de módulos sin permiso, mapeando tutorialId→módulo y filtrando con hasPermission(modulo,'read') (ver plantilla 'Filtro RBAC de TutorialesPage'). Nota: el motor en sí (iniciar) tampoco valida permisos; el filtro debe ser en la página y, idealmente, también en el menú de Ayuda del Layout.
- (4) GuiaConceptoModal SÍ cumple: envuelve TODO su contenido en un <div style={{ backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)' }}> (líneas 42-45) precisamente porque el Modal base tiene bg-white fijo. No hay gap aquí; es el patrón de referencia a replicar. (Único matiz: el header del Modal compartido usa su propio gradiente theme-header, no el wrapper, lo cual es intencional.)
- (5) guias.config.ts SÍ reutiliza CATALOGOS_UI como fuente única: importa `CATALOGOS_UI` de '@/modules/catalogos/catalogos.config' y la guía de catálogos toma las descripciones de CATALOGOS_UI.{secciones,series,subseries,resoluciones,cadido,areas,ubicaciones}.descripcion (líneas 15, 111-117), verificado por guias.config.test.ts. No duplica definiciones. No hay gap; es la convención a imponer (cualquier diccionario de dominio que ya exista debe reutilizarse, no copiarse). Único riesgo a vigilar: textos NO-catálogo (p.ej. conceptos de tablero/importador) sí están escritos inline en guias.config, lo cual es aceptable porque no existe otra fuente canónica para ellos.
- (Extra) No existe componente llamado 'InfoTooltip'; el equivalente real es InfoTip (src/shared/components/ui/InfoTip.tsx): tooltip con portal/posición fija accesible. GuiaConceptoModal hoy NO lo usa (muestra las definiciones siempre visibles en tarjetas), pero es el componente a reutilizar si se quisieran definiciones inline con ℹ️.


## Manifiesto de archivos canónicos


| Archivo | INVARIANTE | Rol |
|---------|:----------:|-----|
| `src/modules/tutoriales/types.ts` | ✅ copia | Tipos del MOTOR: Paso, PosicionPaso, Tutorial, EstadoTour, EstadoTutorial, ProgresoPersistido, RegistroProgreso, TutorialApi. Sin contenido ni dependencias de dominio. |
| `src/modules/tutoriales/engine/TutorialProvider.tsx` | ✅ copia | Contexto + hook useTutorial; implementa toda la TutorialApi, persistencia, navegación con react-router y sondeo del target (ESPERA_TARGET_MS=1500, SONDEO_MS=80). Reanudar/reiniciar/saltar/finalizar. |
| `src/modules/tutoriales/engine/positioning.ts` | ✅ copia | Cálculo PURO (sin DOM) del halo y colocación del tooltip evitando bordes del viewport. HALO_PADDING=8, TOOLTIP_GAP=14, VIEWPORT_MARGIN=12. 100% testeable. |
| `src/modules/tutoriales/engine/storage.ts` | ✏️ adapta | Persistencia defensiva en localStorage (try/catch que se traga errores): leerProgreso/guardarProgreso/reiniciarProgreso + flags de bienvenida. Claves namespaced 'sigae.tutoriales.*.v1'. |
| `src/modules/tutoriales/engine/pantallaActiva.tsx` | ✅ copia | Registro ligero de la SUB-PANTALLA activa (p.ej. pestaña dentro de Configuración) para que la ayuda contextual hable de lo que se ve, no solo del módulo: PantallaActivaProvider / usePantallaActiva / useRegistrarPantalla. |
| `src/modules/tutoriales/components/Spotlight.tsx` | ✅ copia | Overlay global (createPortal a document.body, z-10000). Oscurece con sombra-recorte, halo pulsante, sigue al target por rAF, tarjeta glass con tokens de tema, ESC=saltar, flechas navegan, role=dialog. pointer-events:none en el overlay (no bloquea la página). |
| `src/modules/tutoriales/components/BienvenidaAutoStart.tsx` | ✅ copia | Headless: auto-inicia el tour 'bienvenida' UNA vez en el primer ingreso autenticado (flag localStorage), respetando rutas excluidas y sin interrumpir un tour activo. |
| `src/modules/tutoriales/registry.ts` | ✏️ adapta | CONTENIDO real de los tutoriales (es-MX): array TUTORIALES, TUTORIALES_POR_ID, tutorialDeRuta(pathname). Cada Paso apunta a un data-tutorial-id real. SE ADAPTA por dominio/proyecto. |
| `src/modules/tutoriales/guias/guias.config.ts` | ✏️ adapta | CONTENIDO de guías conceptuales (GuiaConcepto[]): GUIAS, GUIAS_MODULO, GUIAS_POR_ID, guiaDeRuta. Reutiliza CATALOGOS_UI como fuente única de diccionarios de catálogos. SE ADAPTA por dominio. |
| `src/modules/tutoriales/guias/GuiaConceptoModal.tsx` | ✅ copia | Modal de guía conceptual: usa el Modal compartido y ENVUELVE su cuerpo en var(--theme-bg-card)/var(--theme-text-primary) para aislar dark mode (el Modal base es de fondo blanco fijo). Estructura ¿Qué es?/Para qué/Influye/Flujo + conceptos + diagrama + CTA al tutorial. |
| `src/modules/tutoriales/guias/BotonComoFunciona.tsx` | ✅ copia | Botón '¿Cómo funciona?' que abre GuiaConceptoModal por guiaId. Se inyecta en ModuleHero vía prop guiaId opcional. Tema-adaptativo. |
| `src/modules/tutoriales/guias/PrimeraVezBanner.tsx` | ✅ copia | Banner descartable 'primera vez' que abre la guía y se recuerda en localStorage (vía safeStorage). GAP: usa useState local, NO useSyncExternalStore (no sincroniza multi-tab). |
| `src/modules/tutoriales/guias/primeraVezBanner.storage.ts` | ✅ copia | Helpers puros del banner (claveBanner, shouldShowBanner) aislados para no romper react-refresh/only-export-components. |
| `src/modules/tutoriales/guias/iconoDe.ts` | ✅ copia | Resuelve un icono lucide-react por nombre string; fallback a GraduationCap. Permite que el contenido (registry/guias) declare iconos por string sin importar el componente. |
| `src/modules/tutoriales/guias/diagramas/DiagramaArchivistica.tsx` | ✏️ adapta | Diagrama de la jerarquía (Fondo→Sección→Serie→Subserie→Expediente) en HTML/CSS semántico (ol/li/figure) con tokens de tema; cadena horizontal en sm con chevrons. SE ADAPTA al dominio. |
| `src/modules/tutoriales/guias/diagramas/MapaSistema.tsx` | ✏️ adapta | Mapa del flujo entre módulos en HTML/CSS con prop `resaltar` ('Estás aquí'). HTML/CSS, no SVG. SE ADAPTA al dominio. |
| `src/modules/tutoriales/pages/TutorialesPage.tsx` | ✏️ adapta | Página/Panel del Centro de aprendizaje: progreso global + tarjeta por tutorial (Ver guía + Iniciar/Reanudar/Repetir/Reiniciar). Exporta TutorialesPage y TutorialesPanel (embebible). GAP: NO filtra por RBAC; muestra todas las guías/tutoriales. |
| `src/modules/tutoriales/index.ts` | ✅ copia | Barrel: re-exporta motor, guías, diagramas, página y tipos. Punto único de import (`@/modules/tutoriales`). |
| `src/modules/tutoriales/registry.ts (consumido por App.tsx)` | ✅ copia | App.tsx envuelve <TutorialProvider><PantallaActivaProvider> y monta <Spotlight/> + <BienvenidaAutoStart/> UNA sola vez global, dentro de <Router> y después de DynamicTheme. |
| `src/shared/components/ui/Modal.tsx` | ✅ copia | Modal compartido reutilizado por GuiaConceptoModal: createPortal a body, AnimatePresence, header con gradiente theme-header, ESC, sizes sm..full. Fondo del contenedor es bg-white fijo (de ahí el wrapper de tema en GuiaConceptoModal). |
| `src/shared/components/ui/ModuleHero.tsx` | ✅ copia | Header de módulo; expone prop opcional `guiaId` que, si se provee, renderiza <BotonComoFunciona guiaId> a la derecha. Punto de inyección de la guía conceptual por módulo. |
| `src/shared/components/ui/InfoTip.tsx` | ✅ copia | Tooltip de información (equivalente a InfoTooltip): ícono Info con portal y posición fija, accesible (hover/focus/click, role=tooltip). Reutilizable en GuiaConceptoModal para definiciones inline. NO existe 'InfoTooltip'; el nombre real es InfoTip. |
| `src/shared/resilience/safeStorage.ts` | ✅ copia | Acceso a localStorage a prueba de fallos: safeGet/safeSet/safeRemove/safeParse/safeStringify/isStorageDisponible. Base para persistencia de tutoriales/banner sin tirar la app. |
| `src/core/permissions/usePermissions.ts` | ✅ copia | Sistema RBAC del proyecto: hasPermission(module,action,resource,scope) con wildcard, admin/superadmin total, fallback a PERMISSION_MATRIX. Wrappers por módulo en src/modules/<m>/permissions.ts (useXPermissions → {canRead,...}). ES LO QUE DEBE USAR el filtro RBAC de TutorialesPage. |
| `src/shared/types/jsx-data-attrs.d.ts` | ✅ copia | Declaración global que tipa `data-tutorial-id` en HTMLAttributes y SVGAttributes para usarlo sin cast. Habilita la convención de anclas del motor. |
| `src/shared/components/layout/Layout.tsx (AyudaButton)` | ✅ copia | Botón de Ayuda global (data-tutorial-id='help-button'): menú con '¿Qué es esta pantalla?' (GuiaConceptoModal por pantallaActiva ?? guiaDeRuta), 'Guía de esta pantalla' (iniciar tutorialDeRuta) y 'Ver todos los tutoriales'. Conecta motor+guías a la navegación. |


## Templates embebibles (verbatim)


### Tipos del motor (Paso, Tutorial, EstadoTour, EstadoTutorial, TutorialApi)

_Núcleo invariante del motor. Se copia verbatim entre proyectos; solo el CONTENIDO (registry) cambia. PosicionPaso/Paso/Tutorial definen la forma de cada coach-mark; EstadoTour es el snapshot reactivo; TutorialApi es el contrato del hook useTutorial._

```ts
export type PosicionPaso = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export interface Paso {
  /** Selector CSS del elemento a resaltar. Convención: [data-tutorial-id="..."].
   *  Si se omite o no está en el DOM → tarjeta centrada (fallback elegante). */
  target?: string;
  titulo: string;
  contenido: string;
  /** Ruta a navegar ANTES de mostrar el paso (ej. '/expedientes'). */
  ruta?: string;
  /** Posición preferida del tooltip. Por defecto 'auto'. */
  posicion?: PosicionPaso;
}

export interface Tutorial {
  id: string;
  titulo: string;
  descripcion: string;
  /** Nombre de un icono Lucide (ej. 'GraduationCap'). */
  icono?: string;
  pasos: Paso[];
}

export type EstadoTutorial = 'no-iniciado' | 'en-progreso' | 'completado';

export interface EstadoTour {
  activo: boolean;
  tutorial: Tutorial | null;
  indicePaso: number;
  paso: Paso | null;
  totalPasos: number;
  /** true mientras el motor navega/espera a que aparezca el target del paso. */
  navegando: boolean;
}

export interface ProgresoPersistido {
  ultimoPaso: number;
  completado: boolean;
  actualizado: string;
}
export type RegistroProgreso = Record<string, ProgresoPersistido>;

export interface TutorialApi {
  iniciar: (id: string, opciones?: { reiniciar?: boolean }) => void;
  siguiente: () => void;
  anterior: () => void;
  saltar: () => void;
  finalizar: () => void;
  irAPaso: (indice: number) => void;
  estado: EstadoTour;
  estadoDe: (id: string) => EstadoTutorial;
  progresoDe: (id: string) => ProgresoPersistido | null;
  progresoGlobal: number;
  tutoriales: Tutorial[];
}
```


### Interfaces GuiaConcepto y ConceptoItem

_Forma invariante de cada guía conceptual '¿qué es esta pantalla?'. queEs/proposito/influye/flujo son las 4 preguntas obligatorias; el array conceptos[] alimenta las tarjetas; diagrama+resaltarFlujo enlazan un diagrama. tutorialId conecta la guía con un Tutorial del registry. El CONTENIDO de cada guía se adapta por dominio; la interface no._

```ts
export type FlujoNodo = 'catalogos' | 'expedientes' | 'importador' | 'tablero' | 'auditoria';

export interface ConceptoItem {
  /** Nombre de un icono lucide-react (ej. 'FolderTree'). */
  icono: string;
  termino: string;
  definicion: string;
}

export interface GuiaConcepto {
  id: string;
  titulo: string;
  /** ¿QUÉ ES esta pantalla? — 1 frase directa. */
  queEs: string;
  /** ¿PARA QUÉ SIRVE? — propósito, 1-2 frases. */
  proposito: string;
  /** ¿EN QUÉ INFLUYE? — consecuencias / por qué importa. */
  influye: string;
  /** ¿DÓNDE ENCAJA en el proceso? — 1 frase situándola. */
  flujo: string;
  conceptos: ConceptoItem[];
  /** Diagrama visual opcional. */
  diagrama?: 'archivistica' | 'mapa';
  /** Nodo del mapa a resaltar (solo si diagrama === 'mapa'). */
  resaltarFlujo?: FlujoNodo;
  /** Tutorial interactivo asociado (debe existir en el registry). */
  tutorialId?: string;
  /** Ruta canónica del módulo (para guiaDeRuta y enlaces). */
  ruta?: string;
  /** Icono lucide para la tarjeta del Centro de aprendizaje. */
  icono?: string;
}
```


### Convención de selector data-tutorial-id + tipado global

_El motor ancla cada paso a un elemento real con `[data-tutorial-id="..."]`. Esta declaración global permite escribir el atributo en JSX sin cast. Es invariante; cada proyecto solo cambia los NOMBRES de las anclas (botones/secciones de su UI) que el registry referencia._

```ts
// src/shared/types/jsx-data-attrs.d.ts
import 'react';

declare module 'react' {
  interface HTMLAttributes {
    'data-tutorial-id'?: string;
  }
  interface SVGAttributes {
    'data-tutorial-id'?: string;
  }
}

// Uso en cualquier componente de la UI (sin cast):
//   <button data-tutorial-id="expedientes-nuevo">…</button>
//   <section data-tutorial-id="tutoriales-catalogo">…</section>
// Y en el paso del registry:
//   { ruta: '/expedientes', target: '[data-tutorial-id="expedientes-nuevo"]', titulo, contenido, posicion: 'left' }
```


### Firmas tutorialDeRuta / guiaDeRuta y mapas por id

_Resolución contextual: dada la ruta actual, devuelve el id de tutorial/guía correspondiente. Las usa el AyudaButton del Layout. Patrón espejo: ambas omiten '/dashboard' del match por prefijo y guiaDeRuta cae a 'tablero' para la raíz. Invariante en estructura; las rutas/ids se adaptan por dominio._

```ts
// registry.ts
export const TUTORIALES: Tutorial[] = [/* … */];
export const TUTORIALES_POR_ID: Record<string, Tutorial> = Object.fromEntries(
  TUTORIALES.map((t) => [t.id, t]),
);
export function tutorialDeRuta(pathname: string): string | null {
  for (const t of TUTORIALES) {
    const ruta = t.pasos[0]?.ruta;
    if (ruta && ruta !== '/dashboard' && pathname.startsWith(ruta)) return t.id;
  }
  return null;
}

// guias.config.ts
export const GUIAS_POR_ID: Record<string, GuiaConcepto> = Object.fromEntries(
  GUIAS.map((g) => [g.id, g]),
);
export function guiaDeRuta(pathname: string): string | null {
  for (const g of GUIAS_MODULO) {
    if (g.ruta && g.ruta !== '/dashboard' && pathname.startsWith(g.ruta)) return g.id;
  }
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'tablero';
  return null;
}
```


### Posicionamiento puro: calcularHalo / colocarTooltip

_Núcleo testeable del Spotlight (sin DOM, recibe rects). Calcula la caja del halo con padding+clamp al viewport y elige el mejor lado del tooltip respetando márgenes. Constantes adaptables a gusto pero estables. Invariante._

```ts
export interface Rect { top: number; left: number; width: number; height: number; }
export interface Viewport { width: number; height: number; }
export interface CajaHalo { top: number; left: number; width: number; height: number; }
export interface ColocacionTooltip { lado: Exclude<PosicionPaso, 'auto'>; top: number; left: number; }

export const HALO_PADDING = 8;
export const TOOLTIP_GAP = 14;
export const VIEWPORT_MARGIN = 12;

export function calcularHalo(target: Rect, vp: Viewport, padding = HALO_PADDING): CajaHalo {
  const top = Math.max(0, target.top - padding);
  const left = Math.max(0, target.left - padding);
  const width = Math.min(vp.width - left, target.width + padding * 2);
  const height = Math.min(vp.height - top, target.height + padding * 2);
  return { top, left, width, height };
}

export function colocarTooltip(
  halo: CajaHalo, tip: { width: number; height: number }, vp: Viewport,
  preferencia: PosicionPaso = 'auto',
): ColocacionTooltip {
  const orden: Exclude<PosicionPaso, 'auto'>[] =
    preferencia === 'auto'
      ? ['bottom', 'top', 'right', 'left']
      : [preferencia, 'bottom', 'top', 'right', 'left'];
  const cabe = (lado: Exclude<PosicionPaso,'auto'>) => {
    switch (lado) {
      case 'top': return halo.top - TOOLTIP_GAP - tip.height >= VIEWPORT_MARGIN;
      case 'bottom': return halo.top + halo.height + TOOLTIP_GAP + tip.height <= vp.height - VIEWPORT_MARGIN;
      case 'left': return halo.left - TOOLTIP_GAP - tip.width >= VIEWPORT_MARGIN;
      case 'right': return halo.left + halo.width + TOOLTIP_GAP + tip.width <= vp.width - VIEWPORT_MARGIN;
    }
  };
  const lado = orden.find(cabe) ?? 'bottom';
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  const cx = halo.left + halo.width / 2, cy = halo.top + halo.height / 2;
  let top = 0, left = 0;
  if (lado === 'top') { top = halo.top - TOOLTIP_GAP - tip.height; left = cx - tip.width / 2; }
  else if (lado === 'bottom') { top = halo.top + halo.height + TOOLTIP_GAP; left = cx - tip.width / 2; }
  else if (lado === 'left') { left = halo.left - TOOLTIP_GAP - tip.width; top = cy - tip.height / 2; }
  else { left = halo.left + halo.width + TOOLTIP_GAP; top = cy - tip.height / 2; }
  top = clamp(top, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vp.height - tip.height - VIEWPORT_MARGIN));
  left = clamp(left, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vp.width - tip.width - VIEWPORT_MARGIN));
  return { lado, top, left };
}
```


### Recorte/halo del Spotlight (técnica box-shadow gigante + tokens de tema)

_La técnica clave del overlay: oscurecer todo MENOS la caja del target usando una box-shadow de 9999px, con anillo del primario y glow del accent. Overlay con pointer-events:none para no bloquear la página; solo la tarjeta reactiva el puntero. Invariante (los colores salen de var(--theme-*))._

```tsx
{/* Capa de recorte: oscurece TODO menos el halo */}
<div
  style={{
    position: 'absolute',
    top: halo.top, left: halo.left, width: halo.width, height: halo.height,
    borderRadius: 12,
    boxShadow:
      '0 0 0 9999px rgba(2,6,12,0.62), ' +
      '0 0 0 2px color-mix(in srgb, var(--theme-primary) 70%, transparent), ' +
      '0 0 24px 4px color-mix(in srgb, var(--theme-primary) 45%, transparent)',
    pointerEvents: 'none',
  }}
  aria-hidden
/>
{/* El contenedor raíz del overlay va con pointerEvents:'none' y zIndex 10000;
   la tarjeta-tooltip re-activa pointer-events:auto y va a zIndex 10001.
   Fallback centrado cuando no hay halo: un scrim inset-0 con onClick=saltar. */}
```


### Persistencia defensiva (storage del motor) + claves namespaced

_Persistencia que NUNCA tira la app (try/catch que se traga cuota/modo privado/SSR). Patrón guardarProgreso que mezcla parcial + sella `actualizado` y devuelve el registro completo para sincronizar el estado React. El prefijo de las claves se adapta por proyecto (aquí 'sigae.')._

```ts
export const CLAVE_PROGRESO = 'sigae.tutoriales.progreso.v1';
export const CLAVE_BIENVENIDA_VISTA = 'sigae.tutoriales.bienvenida-vista.v1';

function tieneStorage(): boolean {
  try { return typeof window !== 'undefined' && !!window.localStorage; } catch { return false; }
}
export function leerProgreso(): RegistroProgreso {
  if (!tieneStorage()) return {};
  try {
    const crudo = window.localStorage.getItem(CLAVE_PROGRESO);
    if (!crudo) return {};
    const p = JSON.parse(crudo) as unknown;
    return p && typeof p === 'object' ? (p as RegistroProgreso) : {};
  } catch { return {}; }
}
export function guardarProgreso(
  id: string,
  parcial: Partial<Omit<ProgresoPersistido, 'actualizado'>>,
): RegistroProgreso {
  const registro = leerProgreso();
  const previo = registro[id] ?? { ultimoPaso: 0, completado: false, actualizado: new Date(0).toISOString() };
  registro[id] = {
    ultimoPaso: parcial.ultimoPaso ?? previo.ultimoPaso,
    completado: parcial.completado ?? previo.completado,
    actualizado: new Date().toISOString(),
  };
  try { window.localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(registro)); } catch { /* ignora */ }
  return registro;
}
```


### PantallaActiva — sub-pantalla activa para ayuda contextual

_Las pestañas internas (p.ej. dentro de Configuración) no son rutas, así que el pathname no basta. El componente de cada pestaña llama useRegistrarPantalla('configuracion/parametros') y la ayuda contextual prioriza esa sub-pantalla. Invariante; los ids se adaptan._

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface PantallaActivaApi { pantalla: string | null; setPantalla: (id: string | null) => void; }
const Ctx = createContext<PantallaActivaApi | null>(null);

export function PantallaActivaProvider({ children }: { children: ReactNode }) {
  const [pantalla, setPantalla] = useState<string | null>(null);
  return <Ctx.Provider value={{ pantalla, setPantalla }}>{children}</Ctx.Provider>;
}
export function usePantallaActiva(): string | null {
  return useContext(Ctx)?.pantalla ?? null;
}
export function useRegistrarPantalla(id: string | null): void {
  const setPantalla = useContext(Ctx)?.setPantalla;
  useEffect(() => {
    if (!setPantalla) return;
    setPantalla(id);
    return () => setPantalla(null);
  }, [setPantalla, id]);
}
```


### iconoDe — resolución de icono lucide por string

_Permite que el CONTENIDO (registry/guias) declare iconos como string ('FolderArchive') desacoplándolo del import del componente. Fallback a GraduationCap. Invariante._

```ts
import { GraduationCap, type LucideIcon } from 'lucide-react';
import * as Lucide from 'lucide-react';

export function iconoDe(nombre?: string): LucideIcon {
  if (nombre && nombre in Lucide) {
    const c = (Lucide as unknown as Record<string, unknown>)[nombre];
    if (typeof c === 'function' || typeof c === 'object') return c as LucideIcon;
  }
  return GraduationCap;
}
```


### Wrapper de tema en GuiaConceptoModal (aislar dark mode sobre Modal claro)

_El Modal base tiene bg-white fijo; por eso el cuerpo de la guía SIEMPRE se envuelve en var(--theme-bg-card)/var(--theme-text-primary) para funcionar en claro y oscuro. Patrón obligatorio cuando se reutiliza un Modal compartido tema-agnóstico._

```tsx
<Modal isOpen={isOpen} onClose={onClose} title={guia.titulo} size="xl">
  <div
    className="p-5 sm:p-6"
    style={{ backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)' }}
  >
    {/* ¿Qué es? — lead destacado con borde izquierdo del primario */}
    <div className="rounded-xl border-l-4 p-4"
         style={{ backgroundColor: 'var(--theme-surface-soft)', borderColor: 'var(--theme-primary)' }}>
      …
    </div>
    {/* Grid Para qué / Influye / Flujo · diagrama opcional · conceptos · CTA */}
  </div>
</Modal>
```


### Inyección de BotonComoFunciona vía prop guiaId de ModuleHero

_Punto de inyección invariante: ModuleHero recibe `guiaId?` y, si está, renderiza el botón de guía a la derecha junto a las acciones. Así cada módulo obtiene '¿Cómo funciona?' sin tocar el motor._

```tsx
interface ModuleHeroProps { /* … */ guiaId?: string; actions?: React.ReactNode; }
// dentro del render:
{(actions || guiaId) && (
  <div className="flex flex-shrink-0 items-center gap-2">
    {guiaId && <BotonComoFunciona guiaId={guiaId} />}
    {actions}
  </div>
)}

// BotonComoFunciona:
export function BotonComoFunciona({ guiaId, etiqueta = '¿Cómo funciona?' }: { guiaId: string; etiqueta?: string }) {
  const [open, setOpen] = useState(false);
  return (<>
    <button type="button" onClick={() => setOpen(true)} /* tokens de tema */>
      <HelpCircle className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} /> {etiqueta}
    </button>
    <GuiaConceptoModal guiaId={guiaId} isOpen={open} onClose={() => setOpen(false)} />
  </>);
}
```


### Diagrama HTML/CSS semántico con overflow horizontal (ESTÁNDAR)

_Los diagramas deben ser HTML/CSS semántico (figure/figcaption/ol/li) con tokens de tema, NO SVG. El estándar EXIGE un contenedor con scroll horizontal en móvil. SIGAE usa columnas con chevrons rotados; el estándar pide envolver en overflow-x-auto touch-pan-x para diagramas anchos. Adaptar nodos/textos por dominio._

```tsx
<figure className="m-0">
  <figcaption className="sr-only">Flujo entre módulos</figcaption>
  {/* ESTÁNDAR: envolver listas anchas para scroll táctil horizontal en móvil */}
  <div className="overflow-x-auto touch-pan-x">
    <ol className="flex list-none flex-col gap-1.5 p-0 sm:flex-row sm:items-stretch sm:gap-1"
        aria-label="Flujo entre módulos">
      {NODOS.map((n, i) => (
        <li key={n.clave} className="flex items-stretch gap-1 sm:flex-1 sm:flex-col">
          <div className="flex flex-1 flex-col items-start gap-1 rounded-xl border p-3"
               style={{
                 backgroundColor: n.aqui
                   ? 'color-mix(in srgb, var(--theme-primary) 14%, var(--theme-bg-card))'
                   : 'var(--theme-bg-tertiary)',
                 borderColor: n.aqui ? 'var(--theme-primary)' : 'var(--theme-border-primary)',
               }}>
            {/* icono + nombre + rol; badge 'Estás aquí' si aqui */}
          </div>
          {i < NODOS.length - 1 && (
            <ChevronRight className="h-4 w-4 rotate-90 sm:rotate-0" aria-hidden
                          style={{ color: 'var(--theme-text-tertiary)' }} />
          )}
        </li>
      ))}
    </ol>
  </div>
</figure>
```


### PrimeraVezBanner — versión ESTÁNDAR con useSyncExternalStore + safeStorage

_El estándar EXIGE sincronización multi-tab. SIGAE usa useState local (gap). Plantilla objetivo: un store externo sobre localStorage que escucha 'storage' y sincroniza todas las pestañas vía useSyncExternalStore; safeStorage para no tirar la app. Se embebe para que un proyecto futuro la copie y reemplace el useState._

```tsx
import { useCallback, useSyncExternalStore } from 'react';
import { safeGet, safeSet } from '@/shared/resilience/safeStorage';

export function claveBanner(moduloId: string): string { return `app.guia.${moduloId}.vista`; }
export function shouldShowBanner(v: string | null): boolean { return v !== '1'; }

function subscribe(cb: () => void) {
  const onStorage = () => cb();
  window.addEventListener('storage', onStorage);
  window.addEventListener('app:banner-vista', onStorage as EventListener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('app:banner-vista', onStorage as EventListener);
  };
}

/** Hook estándar: refleja localStorage y sincroniza entre pestañas. */
export function useBannerVisible(guiaId: string): [boolean, () => void] {
  const clave = claveBanner(guiaId);
  const visible = useSyncExternalStore(
    subscribe,
    () => shouldShowBanner(safeGet(clave)),
    () => true, // SSR: por defecto visible
  );
  const marcarVisto = useCallback(() => {
    safeSet(clave, '1');
    window.dispatchEvent(new Event('app:banner-vista')); // notifica a la MISMA pestaña
  }, [clave]);
  return [visible, marcarVisto];
}
// En el componente: const [visible, marcarVisto] = useBannerVisible(guiaId);
```


### Filtro RBAC de TutorialesPage (ESTÁNDAR) usando usePermissions

_El estándar EXIGE excluir del DOM las guías/tutoriales de módulos sin permiso. SIGAE NO lo hace (gap). Plantilla objetivo: mapear cada tutorial/guía a su módulo y filtrar con hasPermission(modulo,'read'). Adaptar el mapa tutorialId→módulo por proyecto._

```tsx
import { usePermissions } from '@/core/permissions/usePermissions';

/** Mapa id de tutorial/guía → módulo de permisos. Se adapta por dominio. */
const MODULO_DE: Record<string, string | null> = {
  bienvenida: null,            // siempre visible
  expedientes: 'expedientes',
  catalogos: 'catalogos',
  importador: 'importador',
  configuracion: 'configuracion',
  auditoria: 'auditoria',
};

export function TutorialesPanel() {
  const { tutoriales, /* … */ } = useTutorial();
  const { hasPermission } = usePermissions();
  const visibles = tutoriales.filter((t) => {
    const m = MODULO_DE[t.id];
    return m == null || hasPermission(m, 'read');
  });
  // …renderizar SOLO `visibles`; las guías se filtran por su tutorialId/módulo igual.
}
```
