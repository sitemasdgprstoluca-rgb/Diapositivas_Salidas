---
description: "Un solo comando para todo el estándar de UI + gobernanza. Escribe en lenguaje natural lo que quieres (arrancar proyecto nuevo, mejorar el login / las gráficas / las tablas / los tutoriales, pulir una pantalla, o auditar) y la skill detecta la intención y lo hace. Carga Engram."
argument-hint: "describe qué quieres (ej: 'mejora el login', 'arranca proyecto FACT', 'audita esto', 'pon bonito el dashboard')"
---

# Rodrich Design — Un comando, enruta por intención

Lee y sigue COMPLETO el skill **`rodrich-design`** (`~/.claude/skills/rodrich-design/SKILL.md`,
o `.claude/skills/rodrich-design/SKILL.md` si el repo lo versiona). Lee el reference pack que
toque ANTES de actuar (no trabajes de memoria).

**LO QUE PIDIÓ EL USUARIO:** $ARGUMENTS

**PASO 0 — Carga Engram** (`mem_context` + `mem_search`) y **enruta por intención**.
Combina lo que escribió el usuario con el estado del repo (lee `package.json` + `src/`) y elige UNA ruta:

| Si el texto/estado indica… | Ruta | Qué haces |
|----------------------------|------|-----------|
| repo vacío, "arranca/nuevo proyecto/sigla X" | **BOOTSTRAP** | las 5 fases del skill (MODO A) |
| "mejora/arregla/estandariza **el login / las gráficas / las tablas / los tutoriales**" (un pilar, a nivel sistema) | **RETROFIT** | `references/06-retrofit.md` enfocado a ESE pilar + su pack (01/02/03/04) |
| "audita / revisa / qué le falta / gaps" | **AUDIT** | pack 06 PASO 0–1: solo el reporte de gaps, sin tocar código |
| "pon bonito / mejora **<una pantalla o componente concreto>**" (un dashboard, un modal, una vista, un form) | **DISEÑO** | invoca la skill `/diseno` (Parte A UI/UX + C gráficas) sobre esa pantalla |
| ambiguo / no queda claro el alcance | **PREGUNTA** | 1 pregunta corta con `AskUserQuestion` y luego enruta |

Heurística pilar vs pantalla: si nombran algo **genérico del sistema** ("las gráficas", "el login") → RETROFIT;
si nombran una **pantalla/ruta/componente específico** ("el dashboard de reportes", "el modal de captura") → DISEÑO.
Si dudas, pregunta.

No exiges sintaxis: el usuario escribe libre. (Atajos opcionales que también entiendes: `audit`,
`upgrade <pilar>`, `<sigla nueva>`.)

---

## MODO A · BOOTSTRAP — las 5 fases (proyecto nuevo)

- FASE 1 → Entrevista de identidad (AskUserQuestion: sigla/institución/tagline/color primario/perfil + arquetipo de login).
- FASE 2 → Infra y gobernanza (pnpm, estructura core/modules/shared, tsconfig/vite/eslint, CI, AGENTS.md). → pack 05
- FASE 3 → Generación de UI (4 pilares):
  - 3.1 Design System (Motion Kit + tokens + buildPaletteFromHex). → pack 01
  - 3.2 Auth Vault — login del arquetipo elegido (motor de auth agnóstico). → pack 01
  - 3.3 DataTable Estándar de Oro (+ gap-fixes: pinning, filtros facetados, loading). → pack 02
  - 3.4 Gráficas palette-aware (6 tipos + gap-fixes: useId, leyendas interactivas, KPI animado). → pack 03 + `/diseno`
  - 3.5 Tutorial Engine (5 sub-fases TDD; gap-fixes multi-tab/RBAC/overflow). → pack 04
- FASE 4 → Calidad (eslint, scripts `validate`). → pack 05
- FASE 5 → Verificación con `superpowers:verification-before-completion` (build verde + visual check del login).

## MODO B · RETROFIT / AUDIT — proyecto existente → pack 06

Inventario → reporte de gaps (se muestra antes de tocar nada) → elegir objetivos (no invasivo por
defecto) → recetas por pilar reusando las convenciones del anfitrión → verificación con los scripts
REALES del proyecto. Regla de oro: el resultado es indistinguible de código nativo; nunca pises identidad/colores.

---

**Estándares Enterprise Premium** (DataTable Oro, gráficas de impacto, glassmorphism/coreografía Framer Motion):
línea base OBLIGATORIA. Asúmelos, no los expliques, impleméntalos. Reutiliza antes de crear (Modal/ModuleHero/InfoTip),
DRY de diccionarios (CATALOGOS_UI), tokens `--theme-*`, solo Lucide, tema adaptativo, `prefers-reduced-motion`.

Al terminar SIEMPRE: `mem_save` (qué se hizo, pilares tocados, gaps pendientes). En bootstrap, el proyecto queda listo para `/rodrich-dev`.
