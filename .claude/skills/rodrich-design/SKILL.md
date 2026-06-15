---
name: rodrich-design
description: >-
  Complemento de /rodrich-dev. Corre ANTES del desarrollo para inyectar el estándar
  visual + infraestructura + gobernanza de un proyecto nuevo: entrevista de identidad,
  Auth Vault (login animado de 3 arquetipos), DataTable Estándar de Oro, 6 gráficas
  palette-aware, Tutorial Engine, y los Estándares Enterprise Premium como línea base
  obligatoria. Trigger: "/rodrich-design", "arrancar proyecto nuevo", "scaffolding de UI
  estándar", "login futurista", "estandarizar diseño para todos los proyectos".
version: 1.0.0
---

# rodrich-design — Estándar de Arranque (UI + Gobernanza)

> **Qué es:** el paso que sienta la base de CUALQUIER proyecto nuevo del equipo antes de
> escribir lógica de negocio. Encapsula los 4 pilares de SIGAE como estándar obligatorio y
> los adapta a la identidad del proyecto mediante una entrevista.
>
> **Posición en el flujo:** `/rodrich-design` (este) → deja lista la cáscara → `/rodrich-dev`
> (ciclo SDD+TDD de features) construye encima. No sustituye a `/rodrich-dev`; lo precede.
>
> **Para colaboradores:** la skill es **autónoma**. Todo el código vive en los reference packs
> (`references/*.md`) que viajan con la skill; NO requiere acceso al repo de SIGAE.

## Un solo comando — enrutador por intención (PASO 0)

`/rodrich-design` es **una sola entrada**. El usuario escribe en lenguaje natural lo que quiere y
la skill **detecta la intención** y ejecuta la ruta correcta. No hay que aprender subcomandos.

Combina lo que pidió el usuario con el estado del repo (lee `package.json` + `src/`) y elige UNA ruta:

| El texto/estado indica… | Ruta | Acción |
|-------------------------|------|--------|
| repo vacío · "arranca / proyecto nuevo / sigla X" | **BOOTSTRAP** | las 5 fases (MODO A, abajo) |
| "mejora/estandariza **el login / las gráficas / las tablas / los tutoriales**" (pilar, a nivel sistema) | **RETROFIT** | `references/06-retrofit.md` enfocado a ese pilar + su pack |
| "audita / revisa / qué le falta / gaps" | **AUDIT** | pack 06 PASO 0–1: solo reporte de gaps, sin tocar código |
| "pon bonito / mejora **\<una pantalla o componente concreto\>**" | **DISEÑO** | invoca la skill `/diseno` (Parte A UI/UX + C gráficas) sobre esa pantalla |
| ambiguo | **PREGUNTA** | 1 pregunta corta (`AskUserQuestion`) y luego enruta |

**Pilar vs pantalla:** si nombran algo genérico del sistema ("las gráficas", "el login") → RETROFIT;
si nombran una pantalla/ruta/componente específico ("el dashboard de reportes", "el modal de captura")
→ DISEÑO (delega en `/diseno`). Si dudas, pregunta. Atajos opcionales que también entiendes:
`audit`, `upgrade <pilar>`, `<sigla nueva>`.

**Regla del RETROFIT/AUDIT:** adaptarse al anfitrión, no imponer SIGAE — reusa sus tokens, estructura,
componentes base (`Modal`/`ModuleHero`/tooltip) y RBAC; añade capacidades (features), no cosmética
forzada; nunca pises identidad/colores existentes. Sigue `06-retrofit.md` paso a paso.

## Cómo usar esta skill

1. Lee este SKILL.md completo y crea un TODO por cada fase (TodoWrite).
2. Antes de cada fase, **lee el reference pack correspondiente** (no de memoria — los packs
   tienen el código verbatim, las reglas duras y los gap-fixes):
   - Fase 2/4 → `references/05-governance.md`
   - Fase 3.2 (login) → `references/01-auth-vault.md`
   - Fase 3.3 (tablas) → `references/02-datatable.md`
   - Fase 3.4 (gráficas) → `references/03-charts.md`
   - Fase 3.5 (tutoriales) → `references/04-tutorials.md`
   - Modo RETROFIT (proyecto existente) → `references/06-retrofit.md`
3. Para diseño/gráficas finas, invoca también la skill **`/diseno`** (Parte A UI/UX, Parte C gráficas).
4. Cierra con `superpowers:verification-before-completion` (evidencia antes de "listo") y `mem_save`.

## Disciplina (de AGENTS.md / superpowers, no negociable)

- **TDD** en todo componente con lógica (geometría orbital, positioning, persistencia, filtros): test primero.
- **Reutiliza antes de crear**: `Modal`, `ModuleHero`, `InfoTip`, kit `shared/components/ui`. Extrae helpers genéricos (p.ej. `iconoDe`). No dupliques.
- **DRY de diccionarios**: la fuente de verdad de definiciones de dominio es la config existente del catálogo (`CATALOGOS_UI` o equivalente). Nunca duplicar definiciones en `guias.config`.
- **Tokens primero**: todo color sale de `var(--theme-*)`; nunca hex de marca hardcodeado. Identidad = cambiar UN hex base.
- **es-MX** en toda la UI; **solo iconos Lucide** (cero emojis); **tema adaptativo claro/oscuro** (nunca forzar dark); **`prefers-reduced-motion`** respetado en TODA animación.

---

# MODO A · BOOTSTRAP (proyecto nuevo) — 5 fases

## FASE 1 · Entrevista de Identidad

Herramienta: `AskUserQuestion`, máximo 2 rondas. Al cerrar: `mem_save` con identidad + arquetipo.

**Ronda A — Identidad básica:**
1. Sigla + nombre completo del sistema.
2. Institución / organización.
3. Tagline (frase corta).
4. **Color primario** — hex exacto o descripción ("verde gobierno #005f3e"). De aquí se DERIVA la escala 50–900.
5. Perfil del usuario final.

**Ronda B — Arquetipo visual (Auth Vault):**

| Arquetipo | Layout | Cuándo |
|-----------|--------|--------|
| **Alpha Orbital** | Dual-panel 50/50. Izq oscuro con órbita de dominio. Der claro con formulario. | Backoffices institucionales, gobierno |
| **Glassmorphic Zero** | Card translúcida central sobre aurora full-bleed. Minimalismo estricto, sin paneles ni fondos oscuros sólidos. | SaaS, B2C, alto diseño |
| **Asymmetric Hero** | Grid 70/30: hero con KPIs flotantes (izq) + formulario compacto (der). | Dashboards de datos, analytics |

Preguntas condicionadas: Alpha Orbital → ¿qué objeto orbita? (los 9 ítems); Glassmorphic Zero → ¿imagen de fondo o aurora generada?; Asymmetric Hero → ¿qué 3 métricas flotan?; todos → ¿emblema SVG/logo, descripción, o icono Lucide?

> **GAP conocido (ver pack 01):** SIGAE solo implementa **Alpha Orbital**. Glassmorphic Zero y
> Asymmetric Hero hay que **diseñarlos desde cero** reusando el mismo motor de auth + Motion Kit
> + tokens + (opcional) orbit engine. El pack 01 documenta exactamente cómo componerlos.

---

## FASE 2 · Infraestructura y Gobernanza

→ **Lee `references/05-governance.md`** y genera, con las versiones reales de ahí:

- `.npmrc` (fuerza pnpm) + `package.json` (deps canónicas, `packageManager`, `engines`).
- Estructura modular `core/ modules/ shared/ pages/` (+ `core/branding/` con el contrato `BRANDING`).
- `tsconfig.app.json` strict + `tsconfig.json` (project references) + `vite.config.ts` (alias `@`, vitest, port 5000, chunks).
- `eslint.config.js` (flat) + `.github/workflows/ci.yml` + `.husky/pre-commit` (`pnpm validate`) + commitlint.
- `AGENTS.md` (fuente de verdad) + `CLAUDE.md` (thin) del proyecto.

---

## FASE 3 · Generación de UI (los 4 pilares)

### 3.1 · Design System
Genera `design-system/MASTER.md` (paleta derivada del primario, tokens, reglas duras), `src/index.css`
(**Motion Kit** — pack 01, prefijo renombrado al namespace del proyecto + bloque `:root`/`.dark` de tokens
+ `@media (prefers-reduced-motion)` que apaga las animaciones), `tailwind.config.js`, `core/theme/colorUtils.ts`
(`buildPaletteFromHex` — pack 01) y `core/theme/DynamicTheme.tsx` (inyecta `--theme-*` en runtime desde `BRANDING`).

### 3.2 · Auth Vault → **pack 01**
Motor de auth (`AuthProvider`, `AuthTransitionProvider`, `authTransition.ts`, `ProtectedRoute`) **agnóstico al
layout** (INVARIANTE). El arquetipo elegido define solo el layout visual, consumiendo `useAuth().signIn` +
`useAuthTransition().run('login', navigate)`. Orbit engine (`orbit.ts` geometría pura **con tests**, `orbit.config.ts`
adaptado al dominio — 9 ítems / 3 anillos / 1 stamped, invariantes testeables). Emblema por identidad. Botón con sweep.

### 3.3 · DataTable Estándar de Oro → **pack 02**
Copia el genérico `DataTable<T>` (contrato `Column<T>`/`Action<T>`/`DataTableProps<T>` verbatim), `searchNormalize`
(`coincideBusqueda`), `exportService`, `RowActionsMenu` (portal), persistencia localStorage+URL+`conciliarOrden`,
filtros server con debounce, `TableSkeleton` + `keepPreviousData`. **GENERA los gap-fixes** (no existen en SIGAE):
- **Pinning** de columnas (`pinned` en `Column<T>`, sticky left + offset acumulado + sombra).
- Filtros **`multiselect`**, **`dateRange`**, **`numberRange`/slider** (además del text/select/date/number actuales).
- Prop **`loading`** → overlay/skeleton sutil sobre tbody en refetch server (sin desmontar data previa).
- `onSelectionChange` + bulk-action bar; reposicionar/cerrar `RowActionsMenu` en scroll.

### 3.4 · Gráficas palette-aware → **pack 03** (+ `/diseno` Parte C)
Copia `chart-theme.ts` (ÚNICO archivo de color a adaptar), `use-chart-theme.ts` (MutationObserver), las 6 gráficas
(`TendenciaArea`, `KpiCardHud`, `DonutReservados`, `BarrasCilindro`, `RankingSeries`, `GaugeMeta`), `ChartCard`,
`useAnimatedNumber`, `colorUtils`. **GENERA los gap-fixes**:
- `useId()` en TODA gráfica repetible (TendenciaArea/BarrasCilindro hoy usan ids estáticos → colisión).
- **Leyendas interactivas** (toggle de serie al click + atenuación) — patrón común reutilizable.
- `useAnimatedNumber` también en el valor grande de `KpiCardHud` (hoy estático).
- Overrides de sombra/cursor de tooltip condicionados a `t.isDark` (no negro duro en claro).

### 3.5 · Tutorial Engine → **pack 04** — 5 sub-fases secuenciales (TDD)
- **T1 Fundamentos:** `types.ts` + `guias.config.ts` (interfaz `GuiaConcepto`/`ConceptoItem`, DRY desde `CATALOGOS_UI`), `iconoDe.ts` genérico. Tests de integridad cruzada `registry ↔ guias.config`.
- **T2 UI Core (TDD + a11y):** `GuiaConceptoModal` (reutiliza `Modal` + `InfoTip`, contenido envuelto en `--theme-bg-card`/`--theme-text-primary` para aislar dark mode). Diagramas en **HTML/CSS semántico + tokens** (NO SVG) con `overflow-x-auto touch-pan-x` **(gap-fix)**.
- **T3 Inyección no invasiva:** `ModuleHero` recibe `guiaId?` → `BotonComoFunciona`. `PrimeraVezBanner` con **`useSyncExternalStore` + `safeStorage`** para sync multi-tab **(gap-fix — SIGAE usa useState local)**.
- **T4 Distribución + RBAC:** anclas `data-tutorial-id` en módulos. `TutorialesPage` **filtra por RBAC** excluyendo del DOM (no solo ocultando) las guías/tutoriales de módulos sin permiso de lectura — mapear `tutorialId → módulo` y filtrar con `usePermissions`/`hasPermission` **(gap-fix — SIGAE no filtra)**.
- **T5 Validación del tour:** recorrido ≥6 pasos en `registry.ts`; gate `typecheck + lint + test:run` verde.

---

## FASE 4 · Calidad
ESLint flat + (opcional) Prettier + tsconfig strict + scripts estándar (`validate`). Todo de **pack 05**.

## FASE 5 · Verificación → `superpowers:verification-before-completion`
```bash
pnpm install && pnpm typecheck && pnpm lint && pnpm test:run && pnpm build
pnpm dev   # visual check del login en el arquetipo elegido
```
Criterios: login del arquetipo correcto · colores del proyecto en toda la UI · DataTable con datos mock + pinning/filtros · ≥1 gráfica de cada tipo sin errores · tutorial de bienvenida arranca · `validate` verde.

Cierre: `mem_save` (identidad, arquetipo, stack, rutas clave, fecha).

---

# MODO B · RETROFIT (proyecto existente) → **`references/06-retrofit.md`**

Para mejorar un proyecto que ya tiene código. NO uses las 5 fases de bootstrap; sigue el pack 06:

- **PASO 0 · Inventario** — detecta stack, estructura, sistema de tema/tokens, RBAC y componentes base reutilizables del anfitrión.
- **PASO 1 · Reporte de gaps** — matriz pilar × estado (`AUSENTE`/`PARCIAL`/`OK`). MUÉSTRALA antes de tocar nada.
- **PASO 2 · Elegir objetivos** (`AskUserQuestion`) — qué pilar(es) y agresividad (no invasivo por defecto; reemplazo solo si lo piden).
- **PASO 3 · Recetas por pilar** — añade gap-fixes al componente existente o introduce el pilar nuevo, **reusando convenciones del anfitrión** (su alias, tokens, `Modal`, RBAC, prefijos); namespacing propio para no colisionar; TDD por cambio.
- **PASO 4 · Verificación** — corre los scripts REALES del anfitrión (no asumas los de SIGAE) + `verification-before-completion` + `mem_save` (pilares mejorados, gaps pendientes).

Regla de oro: un retrofit exitoso es **indistinguible de código nativo del proyecto**. Aplica el estándar en *capacidad*, no en *cosmética impuesta*.

---

## Estándares Enterprise Premium (LÍNEA BASE OBLIGATORIA)

No son opcionales ni para esta skill ni para `/rodrich-dev` después. **Asúmelos, no los expliques, no pidas permiso, impleméntalos.**

**DataTable (Oro):** column manager (show/hide + drag-reorder + búsqueda de columnas + persistencia localStorage) · **pinning** left-sticky · persistencia en URL · búsqueda global tolerante a typos/acentos · filtros facetados (texto / multiselect / rango fechas / slider numérico) · chips de filtros activos · paginación server-side sin parpadeo con **Skeletons** · acciones de fila en menú flotante (portal) · expansión de filas · fila de resumen.

**Gráficas (Impacto):** tooltips holográficos (glow solo en dark) · gradientes y 3D/glow vía `<defs>` SVG con `useId()` · `useAnimatedNumber` en TODO número · entrada orquestada ≤700–800ms ease-out · deltas ▲/▼ con color semántico · leyendas interactivas (hover/click resalta).

**Animaciones / Wow consistente:** Glassmorphism (`backdrop-blur` + bordes sutiles) en modales, KPI cards y menús — contraste ≥4.5:1 siempre · coreografía Framer Motion (`staggerChildren` + FadeUp para listas/tarjetas, FadeUp global al montar página) · botones primarios con `whileHover {y:-2}` + `whileTap` + sweep · `PulseHalo` para guiar la atención hacia acciones críticas / tutoriales · orbes ambientales reutilizables fuera del login.

---

## Mantenimiento de la skill
Versionada (`version:` en el frontmatter). Cuando SIGAE cierre un gap (p.ej. añada pinning real), actualizar el
reference pack correspondiente en el mismo PR. Los packs son la fuente de verdad portable; SIGAE es la referencia conceptual.
