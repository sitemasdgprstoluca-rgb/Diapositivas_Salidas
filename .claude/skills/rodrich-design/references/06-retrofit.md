# Reference Pack — Retrofit / Mejora de Proyectos Existentes

> Cómo aplicar el estándar a un proyecto que **ya existe** (con código, identidad y convenciones
> propias). Principio rector: **adaptarse al anfitrión, no imponer SIGAE**. Nunca pisar la
> identidad/colores existentes; añadir de forma incremental, no invasiva y con TDD.

---

## PASO 0 · Inventario del proyecto anfitrión

Antes de tocar nada, detecta el terreno (Read/Grep, no de memoria):

- **Stack**: `package.json` → ¿React? ¿versión? ¿Recharts? ¿Tailwind? ¿NextUI? ¿pnpm/npm/yarn? ¿Vite/Next/CRA?
- **Estructura**: ¿`core/ modules/ shared/`? ¿feature-sliced? ¿flat `components/`? Anota el patrón real y el alias (`@/*`?).
- **Tema**: ¿hay CSS custom properties `--theme-*`? ¿otra convención (`--color-*`, tokens de Tailwind, CSS-in-JS)? ¿modo oscuro por clase `.dark` o `data-theme`? ¿existe un `DynamicTheme`/theme provider?
- **RBAC**: ¿`usePermissions`/`hasPermission`/casbin/roles? Anota la firma real para el filtro de tutoriales.
- **Componentes base reutilizables**: ¿hay `Modal`/`Dialog`, `ModuleHero`/page header, `Tooltip`, kit `ui/`? — se reutilizan, no se duplican.

> Si NO es React + Tailwind, los pilares (que asumen React/Recharts/Tailwind/Framer Motion) no aplican
> tal cual: reporta la incompatibilidad y ofrece solo la guía conceptual (paleta, animaciones, UX) en vez de copiar código.

---

## PASO 1 · Reporte de Gaps (matriz pilar × estado)

Construye y MUESTRA al usuario esta matriz antes de cambiar nada. Para cada pilar marca:
`AUSENTE` (no existe) · `PARCIAL` (existe pero le faltan features del estándar) · `OK` (cumple).

| Pilar | Señales a buscar | Checklist del estándar |
|-------|------------------|------------------------|
| **Login / Auth Vault** | LoginPage/SignIn/Auth*; framer-motion; keyframes; aurora/orbit | ¿animado? ¿coincide con un arquetipo (Orbital/Glass/Hero)? ¿motor de auth agnóstico al layout? ¿tokens + reduced-motion? |
| **DataTable** | tabla genérica `<T>`; TanStack Table; `<table>` a mano | búsqueda tolerante · column manager (show/hide + drag-reorder + buscador) · **pinning** · filtros facetados (text/multiselect/dateRange/numberRange) · persistencia localStorage+URL · acciones en portal · expansión · resumen · paginación server + **skeleton** |
| **Gráficas** | recharts/chart.js/nivo; hook de tema; componentes Chart | hook **palette-aware** (MutationObserver) · 6 tipos (Area/KPI/Donut/Barras3D/Ranking/Gauge) · `useId()` en `<defs>` · `useAnimatedNumber` · deltas semánticos · tooltips holográficos solo dark · leyendas interactivas |
| **Tutoriales** | tutorial/onboarding/coach-mark; `data-tutorial-id`; Spotlight | motor + Spotlight global · guías `¿qué es?` · banner **useSyncExternalStore** (multi-tab) · diagramas HTML/CSS `overflow-x-auto` · **filtro RBAC** en page · DRY de diccionarios |
| **Gobernanza** | pnpm lockfile; tsconfig; eslint; CI | pnpm · estructura modular · tsconfig strict · eslint flat · CI · husky `validate` · AGENTS.md |

El reporte por pilar dice: **qué existe, qué falta, y qué se haría** (añadir gap-fix vs introducir el pilar completo).

---

## PASO 2 · Elegir objetivos y modo de cambio

`AskUserQuestion`: qué pilar(es) mejorar y con qué agresividad por pilar:
- **No invasivo (recomendado)**: añade features/gap-fixes al componente existente sin reescribirlo; o introduce el pilar nuevo junto al actual.
- **Reemplazo**: sustituye el componente existente por el estándar (solo si el usuario lo pide explícitamente; migra los call-sites).

Nunca asumas reemplazo. Por defecto: incremental.

---

## PASO 3 · Recetas de retrofit por pilar

Todas: **reusar tokens/convenciones del anfitrión**, namespacing propio para evitar colisiones, TDD por cambio.

### Login
- **AUSENTE** → introduce el arquetipo elegido (pack 01) adaptando al motor de auth existente del proyecto (consume su `signIn`/guards; NO dupliques auth). Si no hay tokens `--theme-*`, mapea al sistema de color del anfitrión o introduce `DynamicTheme` + `buildPaletteFromHex` solo si el usuario quiere paleta derivada.
- **PARCIAL** (login plano) → añade Motion Kit (keyframes con **prefijo del proyecto**, sin pisar CSS global), aurora/orbes, sweep en el botón, `prefers-reduced-motion`. No cambies el layout si el usuario no lo pide; ofrece migrar a un arquetipo.

### DataTable
- **AUSENTE** → introduce `DataTable<T>` genérico (pack 02) con todos los gap-fixes; adapta imports al alias del anfitrión, su `exportService`/permisos, prefijo localStorage `<app>:dt:`.
- **PARCIAL** (tabla propia o TanStack) → añade SOLO lo que falte del checklist: pinning (sticky left + offset), filtros `multiselect`/`dateRange`/`numberRange`, prop `loading` con skeleton, persistencia URL, acciones en portal. No reescribas su tabla si cubre el resto.

### Gráficas
- **AUSENTE** → instala recharts; introduce `chart-theme.ts` (adaptado al color del proyecto), `use-chart-theme.ts` (ajusta `leerVar()`/detección de dark al sistema del anfitrión — **punto único de cambio**), las 6 gráficas + `useAnimatedNumber` + `colorUtils` + `ChartCard`.
- **PARCIAL** (ya usan recharts sin tema) → introduce `use-chart-theme` y refactoriza las gráficas existentes para derivar color del hook (quita hex hardcodeados); añade `useId()` en `<defs>`, leyendas interactivas, animación de números.

### Tutoriales
- **AUSENTE** → introduce el motor (pack 04) montando `<TutorialProvider>`+`<Spotlight/>` UNA vez en el root del anfitrión; crea `registry.ts`/`guias.config.ts` para SUS módulos; coloca anclas `data-tutorial-id`. Usa su RBAC real en el filtro y su `Modal` real en `GuiaConceptoModal`.
- **PARCIAL** → aplica los 3 gap-fixes: banner `useSyncExternalStore`, `overflow-x-auto` en diagramas, filtro RBAC en la página.

### Gobernanza
- Añade lo que falte sin romper: `.npmrc`/pnpm, tsconfig strict (cuidado con errores nuevos — corrígelos), eslint flat, `.github/workflows/ci.yml`, husky `validate`, `AGENTS.md`. Si migras de npm/yarn a pnpm, regenera lockfile y avísalo.

---

## PASO 4 · Verificación
Corre los scripts REALES del anfitrión (`pnpm validate`/`npm test`/`build` según su `package.json`), no asumas los de SIGAE. Visual check del/los pilar(es) tocados. `superpowers:verification-before-completion` (evidencia antes de "listo"). `mem_save` con qué pilares se mejoraron y los gaps que quedaron pendientes.

---

## Regla de oro del retrofit
Un retrofit exitoso es **indistinguible de código nativo del proyecto**: usa sus nombres, su estructura, sus tokens, sus componentes base. El estándar se aplica en *capacidad* (features), no en *cosmética impuesta*. Si algo del anfitrión contradice el estándar pero funciona y el usuario no quiere tocarlo, **respétalo y documenta el gap**, no lo fuerces.
