# Reference Pack — DataTable Estándar de Oro — contrato genérico + gap-fixes (pinning, filtros facetados, loading)

> Material canónico extraído de SIGAE (la implementación de referencia). Los fragmentos marcados **INVARIANTE** se copian tal cual; los marcados **ADAPTABLE** se reescriben por identidad/dominio; los marcados **ESTÁNDAR-OBJETIVO (gap-fix)** son código que SIGAE aún NO tiene y que la skill DEBE generar.


## Resumen del pilar

DataTable<T> es un componente genérico (T extends object) de ~1170 líneas en src/shared/components/tables/DataTable.tsx. Define columnas vía Column<T>[] declarativo (key, label, type, render, filterType, summaryType, align, etc.) y soporta: búsqueda global tolerante a typos/acentos (coincideBusqueda + puntajeBusqueda de searchNormalize.ts, Levenshtein acotado), column manager en portal (show/hide con ojo + drag-reorder + flechas ↑↓ + búsqueda de columnas acento-insensible + presets Todas/Mínimas/Restablecer), persistencia de visibilidad y orden en localStorage (clave sigae:dt:<persistKey>) y orden en URL params (<urlKey>.cols), filtros por columna (text tolerante / select / date / number) con modo CLIENTE o SERVER (onFiltersChange con debounce 350ms + serverFilterKeys), fila de filtros que también muestra fila-resumen (sum/avg/count), ordenamiento por columna o por relevancia, expansión de filas (renderExpanded), acciones de fila en menú kebab flotante en portal (RowActionsMenu), exportación Excel/PDF (exportService singleton, jsPDF+xlsx), y paginación. El no-flicker en server-side se logra en el caller (TanStack Query placeholderData: keepPreviousData) + TableSkeleton al primer load; la paginación interna del DataTable es un slice de cliente (no maneja loading propio). El wrapper de dominio ExpedientesTable.tsx muestra cómo se declaran columnas curadas + generadas desde un catálogo de campos y cómo se traducen los filtros de columna a la query del backend.


## Reglas duras (innegociables)

- La tabla es un unico componente genérico DataTable<T extends object>; el caller NUNCA reimplementa tabla a mano, solo declara Column<T>[] y Action<T>[].
- Toda busqueda (global y filtros de texto por columna) DEBE usar coincideBusqueda de searchNormalize.ts (tolerante a acentos/typos via Levenshtein acotado). Prohibido String.includes crudo para busqueda de usuario.
- El column manager es obligatorio: show/hide (checkbox + ojo), drag-and-drop para reordenar, flechas ↑↓ accesibles, buscador de columnas (acento-insensible), presets (Todas / Minimas / Restablecer orden), todo en PORTAL (createPortal a document.body) para no recortarse por overflow.
- Visibilidad y orden de columnas DEBEN persistir en localStorage bajo clave estable (prefijo + persistKey, o firma de columnas). El orden DEBE poder compartirse via URL param <urlKey>.cols con prioridad URL > localStorage > default.
- conciliarOrden DEBE usarse siempre que se lea un orden guardado: quita huerfanas, deduplica, agrega claves nuevas al final. El parseo de localStorage va en try/catch (storage corrupto no debe romper la tabla).
- Acciones de fila van en menu kebab flotante (MoreVertical) en PORTAL, con posicionamiento por getBoundingClientRect y cierre por click-outside + ESC. Nunca una fila de iconos amontonados.
- Modo server: cuando se pasa onFiltersChange, los filtros se emiten con debounce 350ms via ref (no re-disparar por identidad del callback); las serverFilterKeys NO se filtran en cliente, el resto refina la pagina cargada.
- No-flicker en server-side: el caller usa TanStack Query con placeholderData: keepPreviousData, y muestra TableSkeleton SOLO en el primer load (isLoading && !data). El DataTable no tiene loading propio.
- Exportacion via exportService singleton (Excel xlsx + PDF jsPDF/autoTable), pasando processedData + visibleColumns; gateado por permiso (hasPermission('reportes','export')).
- Acceso a campos anidados SIEMPRE via getNestedValue (soporta 'a.b.c'); nunca row[key] directo cuando hay catalogos anidados.
- Solo iconos Lucide. Colores via CSS vars de tema (var(--theme-*)); no hardcodear hex salvo el color de marca del PDF.
- La fila de filtros y la fila de resumen comparten la misma fila del thead: una columna muestra input de filtro O su valor de resumen (sum/avg/count) segun resolveSummaryType/resolveFilterType.


## Puntos de adaptación (qué cambia por proyecto)

- El componente DataTable.tsx es 100% generico via Column<T extends object>; NO cambia por dominio. Lo unico que se ajusta entre proyectos son los imports (rutas de usePermissions, exportService, formatters, searchNormalize) y el prefijo de localStorage 'sigae:dt:'.
- Lo que cambia por dominio vive en el WRAPPER (tipo ExpedientesTable.tsx): la definicion de columns useMemo<Column<T>[]>, los renders custom de celda (StatusPill, line-clamp, badges), las filterOptions de los selects, persistKey/urlKey, y la traduccion de filtros de columna a la query del backend (aplicarFiltrosServidor + serverFilterKeys).
- El permiso de exportacion (hasPermission('reportes','export')) se adapta al sistema RBAC del proyecto destino.
- El color de cabecera del PDF (headStyles.fillColor: [0,48,65]) se cambia al color primario de la marca destino.
- Los pageSizeOptions, defaultPageSize, emptyMessage/emptyDescription y textos (es-MX) se ajustan por proyecto/idioma.
- La barra de filtros facetados de dominio (ExpedienteFilters.tsx) es un patron a adaptar: que selects/cascadas/toggles/chips se muestran depende del dominio (aqui Fondo->Seccion->Serie->Subserie + CADIDO/Area/Ubicacion/Fase/Reserva).
- Tokens de tema: el componente usa var(--theme-primary-*), var(--theme-bg-*), var(--theme-border-*), var(--theme-hover-bg), etc. — el proyecto destino solo provee esas CSS vars con su paleta.


## Gaps SIGAE vs estándar-objetivo (qué DEBE generar la skill)

- PINNING (left-sticky) de columnas clave: NO EXISTE en DataTable.tsx. No hay clases sticky/left-0/z-index sobre celdas ni th de cuerpo; la unica posicion 'fixed' es de los menus en portal. El contenedor solo tiene overflow-x-auto. La SKILL debe AÑADIR: prop pinnedKeys/pinned en Column<T>, clases sticky left-0 + z-index escalonado + background opaco + sombra de separacion, y calculo de offset acumulado por ancho de columnas ancladas (left dinamico).
- SLIDER NUMERICO en filtros: NO EXISTE. filterType 'number' renderiza un unico <input type=number> de igualdad exacta (Number(cell) === Number(value)), no un rango con doble handle. La SKILL debe AÑADIR un filterType 'numberRange'/'slider' (min-max con dos inputs o slider) y la logica de filtrado por rango (cell >= min && cell <= max).
- RANGO DE FECHAS en filtros: NO EXISTE en el DataTable. filterType 'date' es un unico <input type=date> que compara igualdad exacta de toDateString(). No hay desde/hasta. La SKILL debe AÑADIR un filterType 'dateRange' (dos inputs date desde/hasta) y filtrado por intervalo. (Nota: la barra de dominio ExpedienteFilters tiene un input de 'Ejercicio' (año) y un icono CalendarRange, pero eso es un campo unico, NO un rango de fechas reutilizable en la tabla.)
- SELECT-MULTIPLE en filtros de columna: NO EXISTE dentro del DataTable. filterType 'select' es un <select> de opcion unica (un solo value). La seleccion multiple solo aparece en la barra de dominio via SearchSelect (tampoco multiple). La SKILL debe AÑADIR un filterType 'multiselect' (chips/checkboxes) y filtrado por inclusion en conjunto.
- SKELETONS en paginacion server-side: PARCIAL. Existe TableSkeleton y se usa en el PRIMER load (isLoading && !data en ExpedientesListPage), y el no-parpadeo entre paginas se logra con keepPreviousData en el hook. PERO el DataTable en si NO tiene prop loading ni overlay de skeleton durante un refetch/cambio de pagina/filtro server (no hay estado 'isFetching' visible). La SKILL debe AÑADIR una prop loading?: boolean al DataTable que muestre un overlay/skeleton sutil sobre el tbody durante fetches server-side (sin desmontar la data previa).
- SELECCION de filas (selectable): EXISTE la UI (checkbox header + por fila, contador 'N seleccionados') pero NO hay callback onSelectionChange ni acciones masivas (bulk actions) sobre la seleccion; selectedRows es estado interno muerto hacia afuera. La SKILL debe AÑADIR onSelectionChange y una bulk-action bar si el estandar lo pide.
- RowActionsMenu: el menu en portal calcula posicion al abrir (getBoundingClientRect) pero NO se reposiciona en scroll/resize mientras esta abierto; puede 'quedarse' flotando si el usuario hace scroll. La SKILL debe considerar cerrar en scroll o recalcular posicion.
- EXISTE y cumple el estandar (no son gaps): column manager con drag-reorder + busqueda de columnas + show/hide + persistencia localStorage; orden en URL params; busqueda global tolerante a typos/acentos (coincideBusqueda); filtros por columna text(tolerante)/select(single)/date(exacta)/number(exacta); ordenamiento por columna y por relevancia; fila de resumen (sum/avg/count); expansion de filas (renderExpanded, expandedDefault); acciones de fila en menu kebab en portal; exportacion Excel/PDF gateada por permiso; paginacion (slice cliente con pager interno + pager server-side propio en el wrapper).


## Manifiesto de archivos canónicos


| Archivo | INVARIANTE | Rol |
|---------|:----------:|-----|
| `src/shared/components/tables/DataTable.tsx` | ✅ copia | Componente genérico DataTable<T> de ~1170 líneas. Toda la lógica de tabla: toolbar (búsqueda global + exportar), column manager en portal con drag/visibilidad/búsqueda/persistencia, fila de filtros por columna (text/select/date/number) en modo cliente o server, fila resumen, sorting, expansión de filas, menú kebab de acciones en portal, paginación. Es el archivo CANÓNICO a replicar tal cual. |
| `src/shared/utils/searchNormalize.ts` | ✅ copia | Búsqueda tolerante (estilo YouTube): normalizarTexto (NFD, sin acentos/símbolos), distanciaEdicion (Levenshtein acotado con poda), coincideBusqueda (AND por token, exacto o aproximado), puntajeBusqueda (relevancia para ordenar), filtrarPorBusqueda. Lo consume DataTable y todo campo de búsqueda del sistema. |
| `src/services/exportService.ts` | ✏️ adapta | Singleton ExportService: exportDataToExcel (xlsx) y exportDataToPDF (jsPDF + jspdf-autotable). Resuelve key/label/value de columnas heterogéneas de forma tolerante (firstString sobre ['key','accessor','field',...]). Color de cabecera PDF [0,48,65] = azul SIGAE (adaptar por marca). |
| `src/shared/components/ui/FeedbackStates.tsx` | ✅ copia | Define Skeleton (animate-pulse, variant text/circular/rectangular, color var --theme-bg-tertiary) y TableSkeleton ({rows, columns}). TableSkeleton es lo que se muestra durante el PRIMER load server-side; no vive dentro del DataTable. |
| `src/modules/expedientes/components/ExpedientesTable.tsx` | ✏️ adapta | Wrapper de dominio. Ejemplo CANÓNICO de cómo declarar Column<T>[] (columnas curadas con render custom + columnas generadas desde un catálogo de campos), cómo configurar persistKey/urlKey, cómo usar onFiltersChange + serverFilterKeys para traducir filtros de columna a la query del backend, y cómo montar un pager server-side propio. Se ADAPTA por dominio. |
| `src/modules/expedientes/components/ExpedienteFilters.tsx` | ✏️ adapta | Barra de filtros facetados de dominio (separada del DataTable): búsqueda con debounce 350ms, selects de catálogo en cascada (SearchSelect), chips de filtros activos removibles, toggle switch booleano, panel avanzado colapsable con badge de conteo. Patrón de 'filtros facetados' a replicar/adaptar. |
| `src/modules/expedientes/pages/ExpedientesListPage.tsx` | ✏️ adapta | Página que orquesta server-side: useExpedientesPage (TanStack Query con keepPreviousData), estado page/pageSize/busqueda/filtros, TableSkeleton durante isLoading && !data, ErrorState con retry. Muestra dónde vive el no-flicker (en el query, no en DataTable). |
| `src/modules/expedientes/hooks/useExpedientes.ts` | ✏️ adapta | Hook de paginación server-side. placeholderData: keepPreviousData es LA pieza que evita el parpadeo entre páginas (conserva la data anterior mientras llega la nueva). queryKeys jerárquicos. |


## Templates embebibles (verbatim)


### Column<T> y Action<T> y DataTableProps<T> (interfaces completas VERBATIM)

_Es el CONTRATO completo del componente. Una skill debe emitir estas tres interfaces VERBATIM: definen toda la API declarativa (cómo el caller describe columnas, acciones y opciones). No cambian por dominio; solo se parametriza T._

```ts
import type { LucideIcon } from 'lucide-react';

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  shortLabel?: string;
  type?: 'text' | 'catalog' | 'numeric' | 'currency' | 'date' | 'kpi';
  filterType?: 'text' | 'select' | 'date' | 'number' | 'none';
  filterOptions?: Array<{ value: string; label: string }>;
  summaryType?: 'sum' | 'avg' | 'count' | 'none';
  summaryFormatter?: (value: number) => string;
  align?: 'left' | 'center' | 'right';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- valor de celda dinámico; el render del call-site lo tipa
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  visible?: boolean;
  className?: string;
}

export interface Action<T = Record<string, unknown>> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
  className?: string;
  tooltip?: string;
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  renderActions?: (row: T, index: number) => React.ReactNode;
  exportable?: boolean;
  exportFileName?: string;
  selectable?: boolean;
  filterable?: boolean;
  showSummary?: boolean;
  showGlobalSearch?: boolean;
  compact?: boolean;
  title?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  /** Clave estable para persistir orden/visibilidad de columnas en localStorage. */
  persistKey?: string;
  /** Si se provee, el ORDEN de columnas se refleja en la URL (param `<urlKey>.cols`). */
  urlKey?: string;
  /** Modo SERVER de filtros: emite filtros por columna al consumidor (debounced). */
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  /** Claves que filtra el SERVER; las demas se filtran en CLIENTE (refinan la pagina). */
  serverFilterKeys?: string[];
  /** Render del contenido expandido por fila (timelines, detalles anidados). */
  renderExpanded?: (row: T) => React.ReactNode;
  /** 'all' | 'none' — estado inicial de expansion. Default 'none'. */
  expandedDefault?: 'all' | 'none';
}
```


### searchNormalize.ts — busqueda tolerante (firma + implementacion VERBATIM)

_Es el motor de busqueda tolerante a typos/acentos que exige el estandar. coincideBusqueda alimenta tanto la busqueda global como los filtros de texto por columna; puntajeBusqueda ordena por relevancia cuando no hay sort manual. Invariante entre proyectos. NOTA: en el archivo real los regex usan literales de diacriticos/ñ; aqui se escriben como ̀-ͯ y ñ para portabilidad._

```ts
/** Normaliza: minusculas, sin acentos (NFD), sin simbolos, espacios colapsados. */
export function normalizarTexto(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diacriticos
    .replace(/[^a-z0-9ñ\s]/g, ' ') // simbolos -> espacio
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distancia de edicion (Levenshtein) acotada con poda temprana. */
export function distanciaEdicion(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  if (la === 0) return lb;
  if (lb === 0) return la;
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  let cur = new Array(lb + 1).fill(0);
  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    [prev, cur] = [cur, prev];
  }
  return prev[lb];
}

function umbral(tokenLen: number): number {
  if (tokenLen <= 3) return 0;
  if (tokenLen <= 5) return 1;
  return 2;
}

function tokenCoincide(texto: string, token: string): boolean {
  if (!token) return true;
  if (texto.includes(token)) return true;
  const tol = umbral(token.length);
  if (tol === 0) return false;
  for (const palabra of texto.split(' ')) {
    if (!palabra) continue;
    if (Math.abs(palabra.length - token.length) <= tol && distanciaEdicion(palabra, token, tol) <= tol) return true;
  }
  return false;
}

/** AND por token: TODOS los tokens deben aparecer (exacto o aproximado). Multi-campo. */
export function coincideBusqueda(consulta: string, ...textos: unknown[]): boolean {
  const q = normalizarTexto(consulta);
  if (!q) return true;
  const heno = textos.map(normalizarTexto).join(' ');
  return q.split(' ').every((tok) => tokenCoincide(heno, tok));
}

/** Puntaje de relevancia (mayor = mejor) para ordenar resultados. */
export function puntajeBusqueda(consulta: string, ...textos: unknown[]): number {
  const q = normalizarTexto(consulta);
  if (!q) return 0;
  const heno = textos.map(normalizarTexto).join(' ');
  let score = 0;
  for (const tok of q.split(' ')) {
    if (heno.includes(tok)) score += tok.length * 2;
    else if (tokenCoincide(heno, tok)) score += tok.length;
    if (heno.startsWith(tok)) score += 3;
  }
  return score;
}
```


### exportService — firma del singleton (VERBATIM, adaptar fillColor)

_Servicio de exportacion que consume DataTable (exportToExcel/exportToPDF pasan processedData + visibleColumns). Es tolerante a columnas heterogeneas (resuelve key/label por candidatos). INVARIANTE salvo headStyles.fillColor que es el color de marca (aqui [0,48,65] azul SIGAE)._

```ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type AnyCol = Record<string, unknown>;
type ExportRow = Record<string, unknown>;

function firstString(c: AnyCol, claves: readonly string[]): string {
  for (const k of claves) { const v = c[k]; if (typeof v === 'string' && v) return v; }
  return '';
}
function colKey(c: AnyCol): string { return firstString(c, ['key', 'accessor', 'field', 'id', 'dataKey']); }
function colLabel(c: AnyCol): string { return firstString(c, ['label', 'header', 'title', 'name']) || colKey(c); }
function cellValue(row: ExportRow, c: AnyCol): string {
  const k = colKey(c);
  let v: unknown = k ? row[k] : undefined;
  if (typeof c.exportValue === 'function') v = (c.exportValue as (r: ExportRow) => unknown)(row);
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return '';
  return String(v);
}

class ExportService {
  private static instance: ExportService;
  static getInstance(): ExportService {
    if (!ExportService.instance) ExportService.instance = new ExportService();
    return ExportService.instance;
  }
  exportDataToExcel(data: ExportRow[], columns: AnyCol[], fileName = 'export'): void {
    const cols = columns.filter((c) => colKey(c));
    const rows = data.map((row) => { const o: Record<string, string> = {}; cols.forEach((c) => { o[colLabel(c)] = cellValue(row, c); }); return o; });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
  exportDataToPDF(data: ExportRow[], columns: AnyCol[], fileName = 'export'): void {
    const cols = columns.filter((c) => colKey(c));
    const doc = new jsPDF({ orientation: cols.length > 6 ? 'landscape' : 'portrait' });
    autoTable(doc, {
      head: [cols.map(colLabel)],
      body: data.map((row) => cols.map((c) => cellValue(row, c))),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 48, 65], textColor: 255, fontStyle: 'bold' }, // ADAPTAR: color primario de marca
      theme: 'grid',
    });
    doc.save(`${fileName}.pdf`);
  }
}

export const exportService = ExportService.getInstance();
```


### RowActionsMenu — menu kebab de acciones en PORTAL (VERBATIM)

_El estandar exige acciones de fila en menu flotante en PORTAL (no recortado por overflow de la tabla). Patron clave: getBoundingClientRect para posicionar, createPortal(document.body), cierre por click-outside/ESC. Invariante; solo cambian colores de tema._

```tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

function RowActionsMenu<T>({ actions, row }: { actions: Action<T>[]; row: T }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const visibles = actions.filter((a) => !a.show || a.show(row));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node) || menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (visibles.length === 0) return null;

  const toggle = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const ancho = 184;
      setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.right - ancho, window.innerWidth - ancho - 8)) });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle} aria-label="Acciones" aria-haspopup="menu" aria-expanded={open}
        className={`grid h-8 w-8 place-items-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 ${open ? 'bg-gray-200 text-gray-700' : ''}`}>
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && createPortal(
        <div ref={menuRef} role="menu" className="fixed z-[120] w-[184px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
          style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
          {visibles.map((action, i) => {
            const Icon = action.icon;
            return (
              <button key={i} type="button" role="menuitem" onClick={() => { setOpen(false); action.onClick(row); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${action.className || 'text-gray-700'}`}>
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
```


### Persistencia localStorage + URL + reconciliacion de orden (VERBATIM)

_Patron CANONICO de persistencia exigido: visibilidad+orden en localStorage bajo clave estable (persistKey o firma de columnas), orden compartible via URL param <urlKey>.cols con prioridad URL>localStorage>default, y conciliarOrden robusto ante storage corrupto o columnas cambiantes. El unico punto a adaptar es el prefijo 'sigae:dt:'._

```tsx
// Firma ESTABLE por valor del set de columnas (evita re-disparar efectos por identidad del array).
const columnsSig = columns.map((c) => c.key).join('|');
const storageBase = 'sigae:dt:' + (persistKey || columnsSig); // ADAPTAR prefijo 'sigae:dt:'

// Concilia orden guardado con claves vigentes: quita huerfanas, deduplica, agrega nuevas al final.
function conciliarOrden(base: string[], claves: string[]): string[] {
  const validas = base.filter((k, i) => claves.includes(k) && base.indexOf(k) === i);
  return [...validas, ...claves.filter((k) => !validas.includes(k))];
}

// Visibilidad PERSISTIDA (lazy init lee localStorage).
const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
  const base = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {} as Record<string, boolean>);
  try {
    const saved = JSON.parse(localStorage.getItem(storageBase + ':vis') || 'null');
    if (saved && typeof saved === 'object') for (const k of Object.keys(base)) if (typeof saved[k] === 'boolean') base[k] = saved[k];
  } catch { /* storage corrupto */ }
  return base;
});
useEffect(() => { try { localStorage.setItem(storageBase + ':vis', JSON.stringify(columnVisibility)); } catch {} }, [storageBase, columnVisibility]);

// Orden: prioridad URL (vista compartida) -> localStorage -> predeterminado.
const [columnOrder, setColumnOrder] = useState<string[]>(() => {
  const claves = columnsSig ? columnsSig.split('|') : [];
  if (urlKey) { const fromUrl = searchParams.get(`${urlKey}.cols`); if (fromUrl) return conciliarOrden(fromUrl.split(','), claves); }
  try { const saved = JSON.parse(localStorage.getItem(storageBase + ':order') || 'null'); if (Array.isArray(saved)) return conciliarOrden(saved as string[], claves); } catch {}
  return claves;
});
useEffect(() => { try { localStorage.setItem(storageBase + ':order', JSON.stringify(columnOrder)); } catch {} }, [storageBase, columnOrder]);
// Reflejo en URL (limpia el param cuando el orden es el predeterminado).
useEffect(() => {
  if (!urlKey) return;
  const param = `${urlKey}.cols`;
  const deseado = columnOrder.join('|') === columnsSig ? null : columnOrder.join(',');
  if ((searchParams.get(param) ?? null) === deseado) return;
  setSearchParams((prev) => { const next = new URLSearchParams(prev); if (deseado === null) next.delete(param); else next.set(param, deseado); return next; }, { replace: true });
}, [urlKey, columnOrder, columnsSig, searchParams, setSearchParams]);
```


### Filtros SERVER con debounce + pipeline cliente/servidor (VERBATIM)

_Es el corazon del modo hibrido cliente/servidor que exige el estandar: las claves en serverFilterKeys NO se filtran en cliente (la fuente ya viene del backend), las demas refinan la pagina cargada; debounce 350ms evita martillar el backend. Invariante._

```tsx
// Emite filtros por columna al consumidor con DEBOUNCE 350ms (no una query por letra).
const onFiltersChangeRef = useRef(onFiltersChange);
useEffect(() => { onFiltersChangeRef.current = onFiltersChange; });
useEffect(() => {
  if (!serverFiltering) return;
  const id = window.setTimeout(() => onFiltersChangeRef.current?.(filters), 350);
  return () => window.clearTimeout(id);
}, [filters, serverFiltering]);

// Pipeline: global search (cliente, tolerante) + filtros por columna (server keys -> backend; resto -> cliente) + sort.
const processedData = useMemo(() => {
  let result = [...data];
  const consultaGlobal = globalSearch.trim();
  if (consultaGlobal && !serverFiltering) result = result.filter(row => coincideBusqueda(consultaGlobal, ...textosBuscables(row, columns)));
  Object.entries(filters).forEach(([column, filterValue]) => {
    if (filterValue === '' || filterValue == null) return;
    if (serverFiltering && serverFilterKeys?.includes(column)) return; // lo filtra el backend
    const colConfig = columns.find(c => c.key === column);
    const ft = colConfig ? resolveFilterType(colConfig) : 'text';
    result = result.filter(row => {
      const cellValue = getNestedValue(row, column);
      switch (ft) {
        case 'select': return String(cellValue) === String(filterValue);
        case 'date': return new Date(String(cellValue)).toDateString() === new Date(String(filterValue)).toDateString();
        case 'number': return Number(cellValue) === Number(filterValue);
        default: return coincideBusqueda(String(filterValue), valorBuscable(cellValue));
      }
    });
  });
  if (sorting.field) { const dir = sorting.direction === 'asc' ? 1 : -1; result.sort((a, b) => { const aVal = getNestedValue(a, sorting.field!); const bVal = getNestedValue(b, sorting.field!); if (aVal == null && bVal == null) return 0; if (aVal == null) return 1; if (bVal == null) return -1; if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir; return String(aVal).localeCompare(String(bVal)) * dir; }); }
  else if (consultaGlobal && !serverFiltering) result.sort((a, b) => puntajeBusqueda(consultaGlobal, ...textosBuscables(b, columns)) - puntajeBusqueda(consultaGlobal, ...textosBuscables(a, columns)));
  return result;
}, [data, filters, sorting, globalSearch, columns, serverFiltering, serverFilterKeys]);
```


### TableSkeleton + patron no-flicker (keepPreviousData)

_El estandar pide 'paginacion server-side sin parpadeo con Skeletons'. El patron real combina: (a) TableSkeleton SOLO en el primer load (isLoading && !data), y (b) placeholderData: keepPreviousData en TanStack Query para que al cambiar de pagina se conserve la data anterior (sin parpadeo) en vez de mostrar skeleton. El DataTable en si NO tiene estado de loading; la skill debe acoplar este patron en el caller._

```tsx
// 1) Skeleton de tabla (FeedbackStates.tsx) — se muestra en el PRIMER load.
export const Skeleton: React.FC<{ variant?: 'text'|'circular'|'rectangular'; width?: string|number; height?: string|number; className?: string }> = ({ variant = 'text', width, height, className = '' }) => {
  const variantClasses = { text: 'h-4 rounded', circular: 'rounded-full', rectangular: 'rounded-lg' };
  const style: React.CSSProperties = { backgroundColor: 'var(--theme-bg-tertiary)' };
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  return <div className={`animate-pulse ${variantClasses[variant]} ${className}`} style={style} />;
};
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">{Array.from({ length: columns }).map((_, i) => <Skeleton key={i} width="25%" height={20} />)}</div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">{Array.from({ length: columns }).map((_, c) => <Skeleton key={c} width="25%" height={16} />)}</div>
    ))}
  </div>
);

// 2) No-flicker entre paginas: en el HOOK de TanStack Query.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
useQuery({ queryKey, queryFn, placeholderData: keepPreviousData });

// 3) En la pagina: skeleton solo en primer load, no en cambios de pagina.
// {isError ? <ErrorState .../> : isLoading && !data ? (
//   <div className="..."><TableSkeleton rows={8} columns={6} /></div>
// ) : <DomainTable .../>}
```
