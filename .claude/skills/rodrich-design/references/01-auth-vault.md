# Reference Pack — Auth Vault — Login (3 arquetipos), Motion Kit, Design System, Orbit engine

> Material canónico extraído de SIGAE (la implementación de referencia). Los fragmentos marcados **INVARIANTE** se copian tal cual; los marcados **ADAPTABLE** se reescriben por identidad/dominio; los marcados **ESTÁNDAR-OBJETIVO (gap-fix)** son código que SIGAE aún NO tiene y que la skill DEBE generar.


## Resumen del pilar

El pilar LOGIN+DESIGN SYSTEM de SIGAE se apoya en tres capas desacopladas. (1) Un motor de auth AGNÓSTICO al layout: AuthProvider expone signIn/signOut/user/loading vía contexto; AuthTransitionProvider monta un overlay (EscudoSplash) que espera a que cargue el perfil antes de navegar (sin rebote); authTransition.ts tiene la lógica pura de tiempos (MIN_HOLD 750ms, waitUntil); ProtectedRoute hace los guards RBAC. Nada de esto sabe del dual-panel. (2) Un Motion Kit reutilizable de @keyframes con prefijo sigae-* (aurora, orbes, sweep, shimmer, fade-up, halo, draw-check, flow-dash, spin-slow) más tokens CSS --theme-* en :root/.dark inyectados en runtime por DynamicTheme a partir de un hex base. (3) El arquetipo Alpha Orbital (LoginPage dual-panel 50/50): InstitutionalPanel con aurora+orbes+órbita, y ScjnOrbit, un sistema de 9 documentos en 3 anillos elípticos cuya geometría vive en orbit.ts (función PURA orbitFrame) y orbit.config.ts (RINGS+DOCS). El login es responsive (la órbita se oculta en móvil, se muestra marca compacta). Solo existe Alpha Orbital; Glassmorphic Zero y Asymmetric Hero no están construidos pero el Motion Kit + tokens + motor de auth + orbit engine los soportan tal cual.


## Reglas duras (innegociables)

- El MOTOR de auth (AuthProvider/AuthTransitionProvider/authTransition/ProtectedRoute) es AGNÓSTICO al layout y NO se toca por arquetipo: el formulario solo consume useAuth().signIn y useAuthTransition().run('login', navigate). Cambiar el arquetipo NO debe tocar core/auth.
- La geometría orbital (orbit.ts) es función PURA y determinista: recibe timeSec, sin Date.now ni rAF dentro. NUNCA meter estado/azar ahí — debe quedar testeable con los tests existentes (angle=0→derecha, π/2→frente, -π/2→fondo, tilt 90° intercambia ejes).
- Toda animación usa transform/opacity (GPU-friendly) y respeta prefers-reduced-motion: el bloque @media (prefers-reduced-motion: reduce) que apaga las clases sigae-* es OBLIGATORIO; además MotionConfig reducedMotion='user' envuelve la página y los componentes usan useReducedMotion().
- La órbita corre a 60fps mediante UN solo MotionValue de tiempo (useAnimationFrame en el padre) + useTransform por documento; PROHIBIDO re-renderizar React por cuadro. Se pausa con visibilitychange (pestaña oculta) y con reduced-motion.
- Contraste WCAG ≥ 4.5:1 SIEMPRE: usar getReadableTextColor para texto sobre el primario; nunca blanco sobre primario claro. Títulos no usan el primario saturado como relleno de texto (va en barras/botones/encabezados).
- Tokens primero: los componentes consumen --theme-* (o el namespace theme.* de Tailwind), NUNCA hex hardcodeados de marca. La escala primaria 50-900 se DERIVA de un único hex base vía buildPaletteFromHex; cambiar identidad = cambiar el hex base, no editar componentes.
- Modo oscuro por clase .dark en <html>, bootstrapeado antes del primer pintado (DynamicTheme como efecto de módulo) para evitar flash. La escala --theme-primary* la gobierna DynamicTheme; superficie/texto/borde los gobierna el bloque .dark con !important. Nunca forzar dark.
- Iconografía SOLO Lucide; CERO emojis como iconos. Idioma español en toda la UI.
- El orbit.config debe mantener invariantes testeables: exactamente 9 etiquetas (REQUIRED_LABELS), sin ids/labels duplicados, cada doc apunta a un ring válido, semiejes positivos, exactamente 1 stamped. Los 3 anillos comparten speed (giro rígido) y los 9 docs van intercalados cada 40° rotando ring por k%3.
- Keyframes con prefijo de namespace (sigae-*) para evitar colisiones globales; al portar a otro proyecto, renombrar el prefijo de forma consistente en CSS y en las className.
- El login es responsive: en pantallas <lg el panel decorativo/órbita se OCULTA y se muestra una marca compacta; el formulario nunca depende del panel decorativo para funcionar.


## Puntos de adaptación (qué cambia por proyecto)

- Color primario → escala 50-900: se cambia UN hex base (BRANDING.colors.primary) y buildPaletteFromHex regenera 50-900; DynamicTheme inyecta --theme-primary-* en runtime. En Tailwind se renombra el namespace 'institucional' y se ponen los hex de la escala. SIGAE usa #003041 (azul), secondary teal #0E8AA0, accent dorado #C7A968.
- Los 9 ítems orbitales (DOCS) y los 3 anillos (RINGS) se reescriben según el dominio: cambian label/kind/palette/id de cada documento y REQUIRED_LABELS, manteniendo 9 ítems, 3 anillos a misma speed, intercalado cada 40° (k·40°, ring=k%3) y exactamente 1 stamped. Para un proyecto no-archivístico el 'documento' puede mutar a otra metáfora (tarjeta/píldora/órbita de features) reusando el mismo engine y geometría.
- La paleta de carpetas PALETTE (beige/azul/rosa/verde/crema/marron con hi/base/lo/edge/text embossed) y el componente FolderCard son la metáfora visual de SIGAE (papel/archivo); por dominio se cambia el set de colores y el render del item orbital, pero el contrato OrbitDoc/palette se conserva.
- El emblema (ScjnEmblem: anillo bronce + textPath circular + águila PNG) cambia 100% por identidad: se sustituye el asset (src/assets/aguila*.png), el texto circular y los gradientes bronce/crema. El fallback Lucide y la estructura SVG (240x240, textPath) son reutilizables.
- El prefijo de las keyframes sigae-* se renombra al namespace del proyecto nuevo (p. ej. acme-*), aplicando el cambio de forma consistente en index.css y en todas las className que las consumen.
- Textos institucionales: el HEADER superior, el nombre del sistema (gradiente bg-clip-text de la marca), el subtítulo, la nav de capacidades (3 ítems con icono Lucide), el footer (año en romano MMXXVI) y el correo de soporte se editan por proyecto.
- Los gradientes de fondo del panel/aurora/sweep/EscudoSplash (hex teal/dorado/azul) se reañinan a la identidad; la estructura (orbes sigae-orb-a/b, textura sigae-paper, halo+anillo girando del splash) se conserva.
- Arquetipo: Alpha Orbital es dual-panel 50/50 (grid lg:grid-cols-2 con InstitutionalPanel | LoginForm dentro de un shell h-[100dvh] con franja superior y footer). Glassmorphic Zero (card translúcida central sobre aurora) reusa .sigae-aurora + orbes + el LoginForm como tarjeta glass centrada (rounded-3xl + backdrop-blur-xl). Asymmetric Hero (grid 70/30) reusa el hero con KPIs flotantes; ambos consumen el mismo motor de auth, Motion Kit, tokens y (opcionalmente) el orbit engine.
- Tiempos de transición: MIN_HOLD_MS (750) y USER_WAIT_TIMEOUT_MS (3000) en authTransition.ts son ajustables por proyecto sin tocar la UI.


## Gaps SIGAE vs estándar-objetivo (qué DEBE generar la skill)

- SOLO existe el arquetipo Alpha Orbital (dual-panel 50/50): LoginPage + InstitutionalPanel + LoginForm + ScjnOrbit. Los otros dos arquetipos NO están construidos en el repo.
- Glassmorphic Zero (card translúcida central sobre aurora) hay que DISEÑARLO desde cero. No hay un layout de card centrada sobre fondo full-bleed; habría que crear un wrapper que aplique .sigae-aurora + orbes (sigae-orb-a/b) a todo el viewport y montar el LoginForm (ya es una tarjeta glass: rounded-3xl, bg-white/80, backdrop-blur-xl) centrado. El Motion Kit y el motor de auth lo soportan sin cambios.
- Asymmetric Hero (grid 70/30 con KPIs flotantes) hay que DISEÑARLO desde cero. No existen tarjetas KPI flotantes en el contexto de login (sí hay GlassKpiCard/HexKpiCard/KpiStrip en el kit del dashboard según MASTER.md, reaprovechables). Habría que componer un grid asimétrico 70/30, ubicar el hero institucional + KPIs flotantes en la columna ancha y el formulario en la estrecha.
- No hay una abstracción de 'arquetipo' parametrizable: LoginPage tiene el layout dual-panel hardcodeado. Para que la skill regenere 3 arquetipos conviene extraer un prop/variant o tres componentes de página hermanos que compartan LoginForm + el motor de auth + el Motion Kit.
- El orbit engine está acoplado por nombre a 'Scjn'/'Folder'/'Doc' (ScjnOrbit, FolderCard, DOCS) y a la metáfora archivística; para reuso genérico habría que renombrar a algo neutral (p. ej. OrbitField/OrbitItem) y permitir inyectar el componente de item, aunque la matemática (orbit.ts) ya es totalmente reutilizable.
- DynamicTheme depende de un módulo BRANDING (core/branding) no incluido en los archivos pedidos; la skill debe definir ese contrato (colors.primary/secondary/accent, assets) como parte del andamiaje por proyecto.
- El prefijo sigae-* está fijo en CSS y className; no hay variable de namespace, así que portarlo exige un find/replace consistente (gap menor pero a documentar en la skill).


## Manifiesto de archivos canónicos


| Archivo | INVARIANTE | Rol |
|---------|:----------:|-----|
| `src/index.css` | ✏️ adapta | Motion Kit completo (@keyframes sigae-*) + tokens de tema en :root y .dark + utilidades .theme-* + overrides de homologación claro/oscuro. Es el corazón reutilizable: cualquier arquetipo de login consume estas clases. |
| `tailwind.config.js` | ✏️ adapta | theme.extend: escala de color (institucional 50-900, dorado, acento, theme.* mapeado a CSS vars), fontFamily Inter, spacing, animation/keyframes legacy, boxShadow (soft/card/floating), backdropBlur xs, darkMode:'class', plugin nextui. |
| `src/core/theme/colorUtils.ts` | ✅ copia | buildPaletteFromHex(base) genera la escala 50-900 mezclando con blanco/negro; getReadableTextColor garantiza contraste WCAG. Es el algoritmo que adapta el color primario por proyecto. |
| `src/core/theme/DynamicTheme.tsx` | ✅ copia | Inyecta en runtime las CSS vars --theme-* desde BRANDING.colors (primary/secondary/accent) usando buildPaletteFromHex; bootstrap del modo oscuro antes del primer pintado para evitar flash. |
| `src/core/auth/AuthProvider.tsx` | ✏️ adapta | Motor de auth AGNÓSTICO al layout: contexto con user/session/loading/signIn/signOut/refresh; carga perfil + permisos desde Supabase con fallback. No conoce ninguna UI. |
| `src/core/auth/AuthTransitionProvider.tsx` | ✅ copia | Overlay de transición login/logout: run(phase, action) muestra EscudoSplash, espera a que user cargue (waitUntil) antes de ejecutar la navegación, y respeta un hold mínimo. Reutilizable por cualquier arquetipo. |
| `src/core/auth/authTransition.ts` | ✅ copia | Lógica PURA de tiempos del overlay: MIN_HOLD_MS=750, USER_WAIT_TIMEOUT_MS=3000, holdRemaining, delay, waitUntil. Testeable y agnóstica. |
| `src/core/auth/ProtectedRoute.tsx` | ✅ copia | Guard de ruta RBAC: redirige a /login si no hay user (guardando from), a /403 si falta permiso/módulo; muestra EscudoSplash mientras loading. |
| `src/pages/auth/LoginPage.tsx` | ✏️ adapta | ARQUETIPO Alpha Orbital: shell h-[100dvh] con franja institucional superior, grid lg:grid-cols-2 (InstitutionalPanel \| LoginForm), footer institucional. MotionConfig reducedMotion='user'. Marca compacta sin órbita en móvil. |
| `src/pages/auth/components/InstitutionalPanel.tsx` | ✏️ adapta | Panel izquierdo (lg:block, hidden en móvil): gradiente diagonal + textura sigae-paper + 2 orbes (sigae-orb-a/b) + ScjnOrbit + texto institucional con stagger de framer-motion (container/item variants) + nav de capacidades. |
| `src/pages/auth/components/LoginForm.tsx` | ✏️ adapta | Tarjeta glass del formulario: inputs con icono Lucide y focus ring teal, toggle de password, botón con sweep (span.sigae-sweep) + framer-motion whileHover/whileTap, integra useAuth().signIn + useAuthTransition().run('login'), toast de error. |
| `src/pages/auth/components/ScjnOrbit.tsx` | ✏️ adapta | Render de la órbita: container-query (containerType:size, unidades cqmin), SVG con elipses (sigae-flow) por anillo, emblema central, OrbitingDocument que usa useTransform sobre un MotionValue de tiempo (useAnimationFrame) para 60fps; FolderCard dimensional (PALETTE embossed). Pausa con visibilitychange y prefers-reduced-motion. |
| `src/pages/auth/orbit/orbit.ts` | ✅ copia | Geometría PURA: orbitFrame(ring, baseAngle, timeSec) calcula x/y sobre elipse rotada + profundidad por sin(angle) → scale/opacity/z. Constantes SCALE_MIN/MAX, OPACITY_MIN/MAX. Determinista y testeable. |
| `src/pages/auth/orbit/orbit.config.ts` | ✏️ adapta | Datos del dominio: RINGS (3 anillos a/b/tiltDeg/speed/phase) + DOCS (9 ítems id/label/kind/palette/ring/angle, uno stamped) + REQUIRED_LABELS. Esto es lo que se reescribe por dominio. |
| `src/pages/auth/orbit/orbit.types.ts` | ✅ copia | Tipos: RingSpec, DocKind, DocPalette, OrbitDoc, OrbitFrame. Contrato estable del orbit engine. |
| `src/shared/components/brand/ScjnEmblem.tsx` | ✏️ adapta | Sello institucional SVG (anillo bronce + textPath circular + campo crema) con águila PNG importada de assets y fallback Lucide Scale. El emblema cambia 100% por identidad. |
| `src/shared/components/brand/EscudoSplash.tsx` | ✏️ adapta | Pantalla de carga/transición: emblema + anillo girando (framer-motion rotate) + halo (sigae-halo) + shimmer (sigae-shimmer-bar) sobre fondo radial glass. Reutilizada por AuthTransition y ProtectedRoute. |
| `design-system/MASTER.md` | ✏️ adapta | Fuente de verdad visual: paleta (primario #003041, teal #0E8AA0, dorado #C7A968), tipografía Inter, reglas duras (WCAG 4.5:1, solo Lucide, cero emojis, español, tema adaptativo), patrones de cards/hero/charts. |
| `src/pages/auth/orbit/__tests__/orbit.test.ts` | ✅ copia | Tests de la geometría pura: angle=0→derecha, π/2→frente (scale/opacity/z máx), -π/2→fondo, tilt 90° intercambia ejes, rangos acotados. Plantilla de verificación del engine. |
| `src/pages/auth/orbit/__tests__/orbit.config.test.ts` | ✅ copia | Tests de fidelidad del config: exactamente 9 labels, sin ids/labels repetidos, rings válidos, exactamente 1 stamped. Define los invariantes que la skill debe imponer al adaptar el dominio. |


## Templates embebibles (verbatim)


### Motion Kit completo (todas las @keyframes sigae-* + clases) — index.css

_VERBATIM. Es el núcleo de animación reutilizable por los 3 arquetipos. Copiar tal cual; el único punto de adaptación es el prefijo sigae-* (renombrarlo al prefijo del proyecto) y los hex de los gradientes de aurora/sweep si la identidad lo pide. NO depende del layout._

```css
/* ── Aurora / gradiente institucional en movimiento lento ── */
@keyframes sigaeGradientPan {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.sigae-aurora {
  background:
    linear-gradient(135deg, #001C26 0%, #002A39 28%, #003041 55%, #0A6D80 100%);
  background-size: 220% 220%;
  animation: sigaeGradientPan 22s ease-in-out infinite;
}

/* ── Orbes/blobs que se desplazan flotando ── */
@keyframes sigaeFloatA {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(28px, -34px, 0) scale(1.08); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes sigaeFloatB {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(-32px, 26px, 0) scale(1.12); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
.sigae-orb-a { animation: sigaeFloatA 16s ease-in-out infinite; will-change: transform; }
.sigae-orb-b { animation: sigaeFloatB 19s ease-in-out infinite; will-change: transform; }

/* ── Sweep / brillo que recorre el borde de la tarjeta glass ── */
@keyframes sigaeSweep {
  0%   { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}
.sigae-sweep {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}
.sigae-sweep::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 45%;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(255, 255, 255, 0.10) 45%,
    rgba(199, 169, 104, 0.18) 50%,
    rgba(255, 255, 255, 0.10) 55%,
    transparent 100%
  );
  transform: translateX(-120%);
  animation: sigaeSweep 6.5s ease-in-out 1.2s infinite;
}

/* ── Shimmer reutilizable (borde superior animado, divisores) ── */
@keyframes sigaeShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.sigae-shimmer-bar {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(14, 138, 160, 0.0) 20%,
    rgba(14, 138, 160, 0.7) 50%,
    rgba(199, 169, 104, 0.7) 65%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: sigaeShimmer 4.5s linear infinite;
}

/* ── Entrada fade-up (framer-motion o fallback CSS) ── */
@keyframes sigaeFadeUp {
  0%   { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}
.sigae-fade-up { animation: sigaeFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* ── Halo pulsante suave para el monograma de marca ── */
@keyframes sigaePulseHalo {
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50%      { opacity: 0.85; transform: scale(1.06); }
}
.sigae-halo { animation: sigaePulseHalo 4s ease-in-out infinite; }

/* ── Trazo de check (éxito) animado ── */
@keyframes sigaeDrawCheck {
  0%   { stroke-dashoffset: 48; }
  100% { stroke-dashoffset: 0; }
}
.sigae-draw-check path {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: sigaeDrawCheck 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.15s forwards;
}

/* ── Anillo de foco animado para inputs ── */
.sigae-field-ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.98);
  box-shadow: 0 0 0 2px rgba(14, 138, 160, 0.45);
  transition: opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.sigae-field:focus-within .sigae-field-ring {
  opacity: 1;
  transform: scale(1);
}

/* ── Textura sutil de papel/tela de archivo ── */
.sigae-paper {
  background-image:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.022) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.018) 0 1px, transparent 1px 4px);
}

/* ── Líneas de flujo de la órbita (guion en movimiento lento) ── */
@keyframes sigaeFlowDash { to { stroke-dashoffset: -240; } }
.sigae-flow {
  stroke-dasharray: 5 16;
  animation: sigaeFlowDash 12s linear infinite;
}

/* ── Giro lento y digno para la banda de texto del emblema ── */
@keyframes sigaeSpinSlow { to { transform: rotate(360deg); } }
.sigae-spin-slow {
  transform-box: fill-box;
  transform-origin: center;
  animation: sigaeSpinSlow 150s linear infinite;
}

/* ── Respeta prefers-reduced-motion: apaga lo intenso, conserva legibilidad ── */
@media (prefers-reduced-motion: reduce) {
  .sigae-aurora,
  .sigae-orb-a,
  .sigae-orb-b,
  .sigae-halo,
  .sigae-flow,
  .sigae-spin-slow,
  .sigae-shimmer-bar { animation: none !important; }
  .sigae-aurora { background-position: 50% 50%; }
  .sigae-sweep::before { animation: none !important; opacity: 0; }
  .sigae-fade-up { animation: none !important; }
  .sigae-draw-check path { animation: none !important; stroke-dashoffset: 0; }
  .sigae-field-ring { transition: opacity 1ms linear; transform: none; }
}
```


### Bloque :root de tokens de tema (CSS custom properties)

_VERBATIM. Define el contrato de tokens --theme-* que TODOS los componentes consumen. Por proyecto cambian SOLO los valores (escala primaria, secondary, accent, marca); las claves se conservan. DynamicTheme reescribe primary/escala/secondary/accent en runtime, así que estos son los defaults SSR-safe._

```css
:root {
  --theme-primary: #003041;
  --theme-primary-50: #E6EFF1;
  --theme-primary-100: #BFD6DC;
  --theme-primary-200: #93B9C2;
  --theme-primary-300: #679CA8;
  --theme-primary-400: #3C808F;
  --theme-primary-500: #003041;
  --theme-primary-600: #002A39;
  --theme-primary-700: #002330;
  --theme-primary-800: #001C26;
  --theme-primary-900: #00141B;

  --theme-secondary: #0E8AA0;
  --theme-accent: #C7A968;
  --theme-primary-contrast: #FFFFFF;

  --theme-bg-primary: #F5F7F8;
  --theme-bg-secondary: #FFFFFF;
  --theme-bg-tertiary: #EEF2F4;
  --theme-bg-card: #FFFFFF;

  --theme-text-primary: #111827;
  --theme-text-secondary: #4B5563;
  --theme-text-tertiary: #94A3B8;
  --theme-text-accent: var(--theme-primary-600);

  --theme-icon-primary: var(--theme-primary-600);
  --theme-icon-secondary: #64748B;
  --theme-icon-tertiary: #94A3B8;
  --theme-icon-interactive: var(--theme-primary-500);
  --theme-icon-hover: var(--theme-primary-700);

  --theme-border-primary: #E2E8F0;
  --theme-border-secondary: #CBD5E1;
  --theme-border-accent: var(--theme-primary-300);

  --theme-hover-bg: var(--theme-primary-50);
  --theme-hover-text: var(--theme-primary-700);
  --theme-active-bg: var(--theme-primary-100);
  --theme-active-text: var(--theme-primary-800);

  /* Superficie soft (tinte del primario) para heroes/banners con texto adaptativo */
  --theme-surface-soft: var(--theme-primary-50);
  --theme-surface-soft-border: var(--theme-primary-100);

  --theme-header-start: var(--theme-primary);
  --theme-header-end: var(--theme-secondary);

  /* Estados */
  --theme-success: #10B981;
  --theme-warning: #F59E0B;
  --theme-error: #EF4444;
  --theme-info: #3B82F6;
  --theme-success-bg: #DCFCE7;
  --theme-success-text: #166534;
  --theme-warning-bg: #FEF3C7;
  --theme-warning-text: #92400E;
  --theme-error-bg: #FEE2E2;
  --theme-error-text: #991B1B;
  --theme-info-bg: #DBEAFE;
  --theme-info-text: #1E40AF;

  /* Tokens de marca (renombrar por proyecto) */
  --color-azul: #003041;
  --color-azul-light: #E6EFF1;
  --color-teal: #0E8AA0;
  --color-dorado: #C7A968;
}

/* MODO OSCURO: clase .dark o [data-theme='dark'] en <html>. Sobreescribe SOLO
   superficie/texto/borde/estado; la escala --theme-primary* la gobierna DynamicTheme. */
.dark,
[data-theme='dark'] {
  --theme-bg-primary: #0b1418 !important;
  --theme-bg-secondary: #0f1c22 !important;
  --theme-bg-tertiary: #16262d !important;
  --theme-bg-card: #10212a !important;
  --theme-text-primary: #f1f5f9 !important;
  --theme-text-secondary: #cbd5e1 !important;
  --theme-text-tertiary: #94a3b8 !important;
  --theme-border-primary: #22323a !important;
  --theme-border-secondary: #2c4853 !important;
  --theme-hover-bg: rgba(255, 255, 255, 0.06);
  --theme-active-bg: rgba(255, 255, 255, 0.1);
  --theme-surface-soft: color-mix(in srgb, var(--theme-primary) 16%, var(--theme-bg-card)) !important;
  --theme-surface-soft-border: color-mix(in srgb, var(--theme-primary) 34%, var(--theme-bg-card)) !important;
}
```


### orbit.config.ts — 9 ítems en 3 anillos (estructura de dominio)

_VERBATIM como plantilla. ESTE es el archivo que se reescribe por dominio: 3 anillos (RINGS) con misma speed para que el conjunto gire rígido y reparta parejo; 9 documentos (DOCS) intercalados cada 40° (k·40°) rotando el anillo (k%3) para que nunca queden 3 en el mismo radio; exactamente 1 stamped. REQUIRED_LABELS fija el contrato testeable de 9 etiquetas. Adaptar labels/palette/kind al dominio nuevo manteniendo los invariantes._

```ts
import type { OrbitDoc, RingSpec } from './orbit.types';

// Tres anillos REDONDOS y MODERADOS. MISMA velocidad en los tres → el conjunto
// gira rígido y reparte parejo SIEMPRE. Distintos tiltDeg dan variedad orgánica.
// a/b en fracción del semilado.
export const RINGS: RingSpec[] = [
  { a: 0.62, b: 0.56, tiltDeg: -6, speed: 0.05, phase: 0 }, // interno (3)
  { a: 0.82, b: 0.74, tiltDeg: 5, speed: 0.05, phase: 0 },  // medio (3)
  { a: 1.0, b: 0.9, tiltDeg: -4, speed: 0.05, phase: 0 },   // externo (3)
];

// 9 etiquetas en pantalla (subconjunto curado del dominio). Contrato testeable.
export const REQUIRED_LABELS = [
  'SENTENCIAS SCJN',
  'ACTAS DE PLENO',
  'REVISIÓN DE EXPEDIENTES',
  'INVENTARIOS DE ARCHIVO',
  'AMPAROS EN REVISIÓN',
  'DPTO. CONTABILIDAD',
  'CONTROLES DE ACCESO',
  'SUPERVISIÓN DE ARCHIVOS',
  'EXP. 2023-01',
] as const;

// INTERCALADAS cada 40° (k·40°), rotando el anillo (k % 3): nunca 3 en el mismo
// radio. El sello ARCHIVADO va en un solo ítem.
export const DOCS: OrbitDoc[] = [
  { id: 'sentencias',  label: 'SENTENCIAS SCJN',        kind: 'book',   palette: 'azul',   ring: 0, angle: 0.0 },    // 0°
  { id: 'actas-pleno', label: 'ACTAS DE PLENO',         kind: 'book',   palette: 'verde',  ring: 1, angle: 0.6981 }, // 40°
  { id: 'revision',    label: 'REVISIÓN DE EXPEDIENTES', kind: 'folder', palette: 'beige',  ring: 2, angle: 1.3963 }, // 80°
  { id: 'contabilidad',label: 'DPTO. CONTABILIDAD',     kind: 'folder', palette: 'marron', ring: 0, angle: 2.0944 }, // 120°
  { id: 'inventarios', label: 'INVENTARIOS DE ARCHIVO', kind: 'binder', palette: 'crema',  ring: 1, angle: 2.7925, stamped: true }, // 160°
  { id: 'supervision', label: 'SUPERVISIÓN DE ARCHIVOS', kind: 'folder', palette: 'rosa',   ring: 2, angle: 3.4907 }, // 200°
  { id: 'amparos',     label: 'AMPAROS EN REVISIÓN',    kind: 'folder', palette: 'verde',  ring: 0, angle: 4.1888 }, // 240°
  { id: 'controles',   label: 'CONTROLES DE ACCESO',    kind: 'binder', palette: 'marron', ring: 1, angle: 4.8869 }, // 280°
  { id: 'exp-2023-01', label: 'EXP. 2023-01',           kind: 'folder', palette: 'crema',  ring: 2, angle: 5.5851 }, // 320°
];
```


### orbit.ts — geometría pura (elipse/profundidad/frame) + orbit.types.ts

_VERBATIM e INVARIANTE entre proyectos. orbitFrame es determinista (recibe timeSec, sin Date.now ni rAF dentro) → testeable. Calcula posición sobre elipse rotada y deriva profundidad de sin(angle) para scale/opacity/z. La skill debe copiarlo idéntico y conservar los tests. Incluyo los tipos porque son el contrato._

```ts
// ── orbit.types.ts ──
export interface RingSpec {
  a: number;       // semieje horizontal, fracción del semilado (0..1)
  b: number;       // semieje vertical, fracción del semilado
  tiltDeg: number; // inclinación del plano del anillo, en grados
  speed: number;   // velocidad angular rad/seg (signo = sentido)
  phase: number;   // desfase angular inicial, radianes
}
export type DocKind = 'folder' | 'book' | 'binder';
export type DocPalette = 'beige' | 'azul' | 'rosa' | 'verde' | 'crema' | 'marron';
export interface OrbitDoc {
  id: string;
  label: string;
  kind: DocKind;
  palette: DocPalette;
  ring: number;  // índice dentro de RINGS
  angle: number; // posición base sobre el anillo, radianes
  stamped?: boolean;
}
export interface OrbitFrame {
  x: number; y: number; scale: number; opacity: number; z: number; angle: number;
}

// ── orbit.ts ──
export const SCALE_MIN = 0.64;
export const SCALE_MAX = 1.16;
export const OPACITY_MIN = 0.3;
export const OPACITY_MAX = 1;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Posición y profundidad de un documento sobre su anillo elíptico en timeSec.
 *  PURA y determinista. x/y en fracción del semilado. */
export function orbitFrame(ring: RingSpec, baseAngle: number, timeSec: number): OrbitFrame {
  const angle = ring.phase + baseAngle + ring.speed * timeSec;
  // Punto sobre la elipse en el plano propio del anillo.
  const ex = ring.a * Math.cos(angle);
  const ey = ring.b * Math.sin(angle);
  // Inclinación del plano del anillo (rotación 2D del óvalo).
  const tilt = (ring.tiltDeg * Math.PI) / 180;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const x = ex * cos - ey * sin;
  const y = ex * sin + ey * cos;
  // Profundidad ∈ [0,1]: al frente cuando sin(angle) ≈ 1.
  const depth = clamp01((Math.sin(angle) + 1) / 2);
  return {
    x, y,
    scale: lerp(SCALE_MIN, SCALE_MAX, depth),
    opacity: lerp(OPACITY_MIN, OPACITY_MAX, depth),
    z: Math.round(depth * 1000),
    angle,
  };
}
```


### Botón con sweep (LoginForm) — patrón completo

_VERBATIM. Patrón de CTA primario reutilizable en cualquier arquetipo: gradiente diagonal del primario, overlay sweep (span.sigae-sweep con ::before animado), framer-motion whileHover y={-2} / whileTap scale 0.99 con la curva [0.16,1,0.3,1], estado submitting con Loader2 spin, foco accesible. Adaptar SOLO los hex del backgroundImage al primario del proyecto._

```tsx
<motion.button
  type="submit"
  disabled={submitting}
  whileHover={{ y: -2 }}
  whileTap={{ y: 0, scale: 0.99 }}
  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
  className="relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-[box-shadow,opacity] duration-200 hover:shadow-[0_12px_30px_-8px_rgba(14,138,160,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8AA0]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
  style={{ backgroundImage: 'linear-gradient(110deg, #0E8AA0 0%, #0A6D80 50%, #003041 100%)' }}
>
  <span aria-hidden="true" className="sigae-sweep" />
  <span className="relative flex items-center gap-2">
    {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
    {submitting ? 'Ingresando…' : 'Iniciar sesión'}
    {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
  </span>
</motion.button>
```


### theme.extend de tailwind.config.js

_VERBATIM (como objeto JS). Mapea la escala institucional 50-900 + dorado + acento + el namespace theme.* a las CSS vars, fontFamily Inter, spacing extra, animation/keyframes legacy, boxShadow soft/card/floating, backdropBlur xs. Por proyecto se renombra 'institucional' y se cambian los hex; las claves de theme.* se conservan porque las consumen los componentes. Recordar darkMode:'class' y el plugin nextui()._

```jsonc
{
  "darkMode": "class",
  "theme": {
    "extend": {
      "colors": {
        "institucional": {
          "50": "#E6EFF1", "100": "#BFD6DC", "200": "#93B9C2", "300": "#679CA8",
          "400": "#3C808F", "500": "#003041", "600": "#002A39", "700": "#002330",
          "800": "#001C26", "900": "#00141B"
        },
        "dorado": { "400": "#E7D4A8", "500": "#C7A968", "600": "#A8853F" },
        "acento": { "400": "#22A6BC", "500": "#0E8AA0", "600": "#0A6D80" },
        "theme": {
          "primary": "var(--theme-primary)",
          "secondary": "var(--theme-secondary)",
          "accent": "var(--theme-accent)",
          "bg-primary": "var(--theme-bg-primary)",
          "bg-secondary": "var(--theme-bg-secondary)",
          "text-primary": "var(--theme-text-primary)",
          "text-secondary": "var(--theme-text-secondary)",
          "header-start": "var(--theme-header-start)",
          "header-end": "var(--theme-header-end)"
        }
      },
      "fontFamily": { "sans": ["Inter", "system-ui", "sans-serif"] },
      "spacing": { "18": "4.5rem", "88": "22rem" },
      "animation": {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out"
      },
      "keyframes": {
        "fadeIn": { "0%": { "opacity": "0" }, "100%": { "opacity": "1" } },
        "slideUp": { "0%": { "transform": "translateY(20px)", "opacity": "0" }, "100%": { "transform": "translateY(0)", "opacity": "1" } }
      },
      "boxShadow": {
        "soft": "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        "card": "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
        "floating": "0 10px 25px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
      },
      "backdropBlur": { "xs": "2px" }
    }
  }
}
```


### buildPaletteFromHex — generador de escala 50-900 desde un hex base

_VERBATIM e INVARIANTE. Es el algoritmo que convierte UN color primario de marca en la escala completa que alimenta --theme-primary-*. Junto con getReadableTextColor (guard WCAG) es el corazón de la adaptación de identidad: el integrador solo cambia el hex base y todo el sistema se reañina._

```ts
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}
/** Mezcla hex con blanco (amount>0) o negro (amount<0). amount ∈ [-1,1]. */
function mix(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return rgbToHex(r + (target - r) * t, g + (target - g) * t, b + (target - b) * t);
}
/** Genera escala 50–900 desde un color base (que cae en 500). */
export function buildPaletteFromHex(base: string) {
  return {
    50: mix(base, 0.92), 100: mix(base, 0.82), 200: mix(base, 0.62),
    300: mix(base, 0.42), 400: mix(base, 0.2), 500: base,
    600: mix(base, -0.15), 700: mix(base, -0.3), 800: mix(base, -0.45), 900: mix(base, -0.6),
  };
}
/** Texto legible (claro u oscuro) sobre un fondo, garantizando contraste WCAG. */
export function getReadableTextColor(bg: string): string {
  return luminance(bg) > 0.45 ? '#111827' : '#FFFFFF';
}
```


### OrbitingDocument — puente entre orbitFrame y el DOM (60fps, container-query)

_VERBATIM como patrón de render del orbit engine, INVARIANTE. Muestra cómo conectar la función pura orbitFrame con framer-motion useTransform sobre un único MotionValue de tiempo (alimentado por useAnimationFrame en el padre) para componer transform/opacity/zIndex sin re-render React (60fps). Usa unidades cqmin (requiere containerType:'size' en el contenedor) para escalar todo a la caja, y PCT=44 alineado al factor de las elipses SVG (PCT*2)._

```tsx
const PCT = 44; // radio máx como fracción del semilado; alinea con las elipses SVG (rx = a*PCT*2)

function OrbitingDocument({ doc, t }: { doc: OrbitDoc; t: MotionValue<number> }) {
  const ring = RINGS[doc.ring];
  const frame = useTransform(t, (time) => orbitFrame(ring, doc.angle, time));
  const transform = useTransform(
    frame,
    (f) =>
      `translate(-50%, -50%) translate(${(f.x * PCT).toFixed(2)}cqmin, ${(f.y * PCT).toFixed(2)}cqmin) scale(${f.scale.toFixed(3)})`,
  );
  const opacity = useTransform(frame, (f) => f.opacity);
  const zIndex = useTransform(frame, (f) => Math.round(f.z));
  return (
    <motion.div
      style={{ position: 'absolute', left: '50%', top: '50%', width: 'clamp(4rem, 16cqmin, 6.5rem)', transform, opacity, zIndex }}
      className="will-change-transform"
    >
      <FolderCard doc={doc} />
    </motion.div>
  );
}

// En el padre ScjnOrbit: un solo reloj para todos los docs.
// const t = useMotionValue(0);
// useAnimationFrame((_, delta) => { if (animate) t.set(t.get() + delta / 1000); });
// animate = !useReducedMotion() && document.visibilityState === 'visible';
```


### AuthTransition: run(phase, action) — overlay que espera el perfil antes de navegar

_VERBATIM como patrón, INVARIANTE entre arquetipos. Demuestra que el motor de auth es agnóstico al layout: el formulario solo hace signIn() y luego run('login', () => navigate(from)). run muestra el splash, espera waitUntil(user!=null) para no rebotar a /login, ejecuta la navegación y respeta un hold mínimo. La skill copia este contrato; solo cambia el componente de splash y los textos._

```tsx
const TEXT = { login: 'Accediendo…', logout: 'Cerrando sesión…' } as const;

const run = useCallback(async (p, action) => {
  if (runningRef.current) return;
  runningRef.current = true;
  setPhase(p);
  const started = Date.now();
  try {
    if (p === 'login') {
      // No navegar hasta que el perfil esté cargado (evita el rebote feo).
      await waitUntil(() => userRef.current != null, USER_WAIT_TIMEOUT_MS);
    }
    await action();
  } finally {
    const remaining = holdRemaining(Date.now() - started); // MIN_HOLD_MS = 750
    if (remaining > 0) await delay(remaining);
    setPhase('idle');
    runningRef.current = false;
  }
}, []);

// Uso en el formulario (idéntico en cualquier arquetipo):
// const { error } = await signIn(email.trim(), password);
// if (error) { toast.error('Credenciales inválidas…'); return; }
// await run('login', () => navigate(from, { replace: true }));
```
