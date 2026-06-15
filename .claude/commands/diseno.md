---
description: Diseño DGPRS — aplica la skill unificada de UI/UX + gráficas/diagramas (glass/HUD adaptativo) de Farmacia V2
argument-hint: [pantalla, componente o gráfica a diseñar/mejorar]
---

Aplica la skill de diseño unificada de Farmacia V2. Primero LEE la guía completa
(busca el archivo y léelo):
`farmacia-v2/.claude/skills/diseno/SKILL.md` (o `.claude/skills/diseno/SKILL.md`
si el cwd ya es el proyecto). Si no la encuentras, usa `find . -path "*/skills/diseno/SKILL.md"`.

Sigue sus dos partes:
- **Parte A · UI/UX**: reutiliza el kit `src/components/ui` (Button, SubmitButton, Dialog,
  Input, Select, Badge, DropdownMenu, DatePicker, Skeleton, Switch…); accesibilidad
  (contraste ≥4.5:1, focus, aria-label, labels); 3 estados (loading `Skeleton` / vacío /
  error); layout bento (colapsa a 1 col en móvil); micro-interacciones 150–300ms con
  transform/opacity y `prefers-reduced-motion`; formularios `react-hook-form` + `zod`.
- **Parte B · gráficas/diagramas**: deriva colores de `useChartTheme()` (palette-aware,
  NO hardcodear); glow/3D y barras cilindro opcionales; tooltips holográficos solo fuertes
  cuando `t.isDark`; Mermaid para diagramas.
- **Parte C · gráficas estándar (6 tipos — estándar obligatorio del equipo)**: todo
  dashboard usa al menos 2 de estos 6 tipos canónicos palette-aware (de SIGAE/rodrich-design;
  detalle verbatim en `~/.claude/skills/rodrich-design/references/03-charts.md`):
  1. `TendenciaArea` — AreaChart con gradiente + filtro glow SVG.
  2. `KpiCardHud` — valor (animado con `useAnimatedNumber`) + delta ▲/▼ + sparkline, biselado 3D.
  3. `DonutReservados` — PieChart esquinas redondas + total central animado + leyenda con %.
  4. `BarrasCilindro` — BarChart con gradiente horizontal (0.5→1→0.5) = efecto cilindro 3D.
  5. `RankingSeries` — tabla premium: medalla + barra proporcional con glow + %.
  6. `GaugeMeta` — arco SVG semicircular (`A` command + dasharray) + % animado + valor/meta.
  Reglas: color SIEMPRE de `useChartTheme()` (jamás hex de marca); `<defs>` con `useId()` en
  toda gráfica repetible; `CartesianGrid vertical={false}` strokeDasharray='3 3'; entrada
  700–800ms ease-out; tooltip holográfico (glow en boxShadow) SOLO si `t.isDark`; deltas con
  color semántico (#10b981 / #f43f5e); leyendas interactivas (toggle/atenuación de serie);
  contenedor `ChartCard` (biselado multi-shadow) con `role="img"` + `aria-label`.

Reglas duras: **es-MX** en todo; **solo iconos Lucide (cero emojis)**; **tema adaptativo
claro/oscuro — NUNCA forzar dark**; reutiliza componentes antes de crear nuevos. La UI del
proyecto está pausada hasta `uipro`: si vas a tocar UI, confirma el alcance. Al terminar,
verifica con `tsc --noEmit` + ESLint (no hay rasterizador local; el usuario valida visual).

Diseñar / mejorar:

$ARGUMENTS
