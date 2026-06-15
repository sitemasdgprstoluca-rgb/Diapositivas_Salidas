# Reference Pack — Gráficas palette-aware — 6 tipos, useChartTheme, gap-fixes (useId, leyendas interactivas, KPI animado)

> Material canónico extraído de SIGAE (la implementación de referencia). Los fragmentos marcados **INVARIANTE** se copian tal cual; los marcados **ADAPTABLE** se reescriben por identidad/dominio; los marcados **ESTÁNDAR-OBJETIVO (gap-fix)** son código que SIGAE aún NO tiene y que la skill DEBE generar.


## Resumen del pilar

El pilar Gráficas/Dashboard de SIGAE es un set de 6 gráficas (TendenciaArea, BarrasCilindro, DonutReservados, RankingSeries, GaugeMeta, KpiCardHud) + un contenedor (ChartCard), todas palette-aware. La FUENTE DE VERDAD de estilos es el hook useChartTheme() (use-chart-theme.ts): lee los colores VIVOS del tema desde CSS custom properties (--theme-primary/-secondary/-accent) y la clase `dark`/`data-theme` de <html>, y se re-evalúa al instante mediante un MutationObserver sobre los atributos style/class/data-theme. Ninguna gráfica hardcodea hex; todo color sale de t.paletteColors / t.paletteColor / t.paletteAccent. Los gradientes y glows se hacen con <defs> SVG (linearGradient + filter feGaussianBlur/feMerge / feDropShadow) con ids únicos por instancia (useId). Los tooltips holográficos (boxShadow con glow + texto con textShadow) solo se aplican en dark; en claro la sombra es suave. Cada número (total de dona, % del gauge) se anima con useAnimatedNumber (cubic-ease-out ≤950ms, respeta prefers-reduced-motion). Las animaciones de entrada de Recharts son 700-800ms ease-out. Los deltas usan ▲/▼ (lucide ArrowUpRight/Down) con verde #10b981 / rosa #f43f5e semánticos. chart-theme.ts es el ÚNICO archivo que cambia entre proyectos (paleta base).


## Reglas duras (innegociables)

- PROHIBIDO hardcodear cualquier color hex dentro de las gráficas: TODO color de serie/acento sale de useChartTheme() (t.paletteColor, t.paletteAccent, t.paletteColors[i % len]). Los únicos hex literales permitidos en componentes son los semánticos del delta (#10b981 verde, #f43f5e rosa) y los neutros de bisel/sombra rgba (luz/oscuridad pura), no colores de marca.
- La FUENTE DE VERDAD de estilos es useChartTheme(); chart-theme.ts solo define constantes base y el hook es el único que las importa. Ningún componente de gráfica importa de chart-theme.ts directamente.
- El hook DEBE re-evaluarse en vivo: MutationObserver sobre <html> con attributeFilter ['style','class','data-theme'] y re-lectura tras montar; nunca cachear el tema fuera del observer.
- Tooltips holográficos (glow en boxShadow `0 0 22px ${c}66`, textShadow en label, backdropFilter blur) SOLO cuando t.isDark; en claro el tooltip lleva sombra difusa neutra sin glow. El glow se deriva del color de la serie/acento, nunca de un hex fijo.
- CartesianGrid SIEMPRE vertical={false} (solo líneas horizontales) con strokeDasharray='3 3' y stroke={t.gridStroke}. XAxis/YAxis con axisLine={false} y tickLine={false}, tick={t.axisTickSm}. Cero chartjunk.
- Gradientes y efectos 3D/glow SIEMPRE vía <defs> SVG (linearGradient + filter feGaussianBlur/feMerge para glow, feDropShadow para sombra suave). Los ids de <defs> deben ser únicos por instancia usando useId().replace(/:/g,'') cuando el componente puede repetirse (KpiCardHud, DonutReservados, GaugeMeta).
- Toda animación de entrada de Recharts: animationDuration entre 700 y 800ms, animationEasing='ease-out'. Transiciones CSS (barras de ranking) 700ms ease-out.
- Todo número destacado (total de dona, % de gauge) pasa por useAnimatedNumber (cubic-ease-out, ≤950ms) y respeta prefers-reduced-motion. Nada de números grandes estáticos.
- Deltas: ▲/▼ con lucide ArrowUpRight/ArrowDownRight; positivo=#10b981, negativo=#f43f5e, en pill con fondo `${deltaColor}1f`. La dirección se decide por signo (>=0 positivo).
- Las gráficas oscuras deben usar lighten() (colorUtils) sobre colores de paleta oscuros para garantizar contraste/vibrancia en dark sin abandonar la paleta; nunca sustituir por un hex claro arbitrario.
- Accesibilidad: contenedores de gráfica con role='img' y aria-label; leyendas que no dependen solo del color (muestran nombre + valor + %). Glow/sombra son decorativos (aria-hidden).
- ChartCard es el único contenedor: material biselado con multi box-shadow (4 capas) distinto en dark/claro, borde translúcido (border-white/10 en dark, border-slate-200/70 en claro), backdrop-blur-xl, brillo superior aria-hidden. Las gráficas no replican su sombra; van dentro de él.


## Puntos de adaptación (qué cambia por proyecto)

- Color de marca: SOLO chart-theme.ts cambia por proyecto (COLOR_AZUL/TEAL/DORADO primario/secundario/acento) y los 3 fallbacks dentro de leerSnapshot() del hook (#003041/#0E8AA0/#C7A968). Los 5 colores semánticos (VERDE/AMBAR/VIOLETA/AZULREY/TEAL_CLARO) que completan paletteColors normalmente se conservan.
- CSS custom properties: el hook lee --theme-primary/--theme-secondary/--theme-accent de <html>. El proyecto debe tener un PalettePicker/DynamicTheme que setee esas vars vía element.style.setProperty (para que el MutationObserver sobre 'style' las capture). Si el proyecto usa otros nombres de var, ajustar leerVar() — punto único de cambio.
- Modo oscuro: el hook detecta dark por clase 'dark' o data-theme='dark' en <html>. Si el proyecto usa otro mecanismo, ajustar leerSnapshot(); el resto es invariante.
- Datos/dominio: los tipos de datos (PuntoTendencia.ejercicio/expedientes, BarraSerie.serie, SegmentoDonut.nombre/valor, RankingItem, etc.) y los dataKey/name de Recharts se renombran al dominio del proyecto. La forma visual no cambia.
- KPI: número de tarjetas y accentIndex por tarjeta es por proyecto; el formato (Intl.NumberFormat 'es-MX') puede localizarse. spark[] alimenta la sparkline de fondo.
- Las 6 gráficas + ChartCard + useAnimatedNumber + colorUtils + el tipo ChartThemeTokens + el patrón MutationObserver del hook son CASI INVARIANTES: se copian verbatim. Lo único que se adapta de verdad es chart-theme.ts (paleta) y los labels/dataKeys del dominio.
- Layout: el dashboard usa bento grid (grid lg:grid-cols-3 con lg:col-span-2 para las gráficas anchas y col-span-1 para dona/gauge). El número y disposición de tarjetas es libre; el ChartCard expone un slot `action` para leyendas/badges en el header.


## Gaps SIGAE vs estándar-objetivo (qué DEBE generar la skill)

- Leyendas interactivas: el prompt pide 'leyendas interactivas', pero en el código ACTUAL las leyendas son HTML estáticas no clicables (DonutReservados usa un <ul> con nombre/valor/% sin onClick; RankingSeries es un <ol> de filas; no hay toggle de series ni Recharts <Legend>). El estándar-objetivo (toggle de visibilidad de serie al click en la leyenda, con estado y atenuación de la serie oculta) NO está implementado — debe añadirse en la skill (p.ej. useState de claves ocultas + onClick en cada item de la leyenda, y filtrar/atenuar la serie).
- No existe un componente de leyenda interactiva reutilizable; cada gráfica improvisa su leyenda. El estándar-objetivo querría un patrón de leyenda común clicable.
- useAnimatedNumber se usa solo en DonutReservados (total) y GaugeMeta (%); KpiCardHud muestra `value` como string ya formateado SIN animar el conteo. El estándar de 'useAnimatedNumber en TODO número' exige animar también el valor grande del KPI (hoy es estático).
- Sombras/cursores de tooltip llevan rgba(0,0,0,0.45) literal en el override de TendenciaArea/BarrasCilindro incluso en modo claro (el glow override no diferencia dark/claro tan limpiamente como el resto); el estándar-objetivo querría que esos overrides también sean condicionales a t.isDark para no meter sombra negra dura en claro.
- Ids de <defs> en TendenciaArea ('sigae-tendencia-fill') y BarrasCilindro ('sigae-barras-glow') son ESTÁTICOS (no usan useId), así que dos instancias en la misma página colisionarían en el DOM SVG. El estándar-objetivo exige useId() en TODA gráfica que pueda repetirse — gap a corregir respecto a KpiCardHud/Donut/Gauge que sí lo hacen.
- No hay tests específicos para los componentes de chart en el directorio dashboard/ (los tests vistos son de tutoriales); el estándar TDD del proyecto pediría cobertura de render palette-aware (dark/claro), animación reduced-motion y leyenda.


## Manifiesto de archivos canónicos


| Archivo | INVARIANTE | Rol |
|---------|:----------:|-----|
| `src/shared/components/dashboard/use-chart-theme.ts` | ✅ copia | Hook FUENTE DE VERDAD de estilos. Define ChartThemeTokens, lee CSS vars del tema + modo via MutationObserver y deriva todo: paletteColors[], tooltipProps (holográfico en dark / suave en claro), grid/axis strokes, textPrimary/Muted/Subtle, cardBgStyle/kpiBgStyle con gradientes radiales, pieSeparatorStroke, ring/shadow classes. |
| `src/shared/components/dashboard/chart-theme.ts` | ✏️ adapta | Paleta y tokens crudos: COLOR_AZUL/TEAL/DORADO + semánticos (VERDE/AMBAR/ROJO/VIOLETA/AZULREY) + PALETA_SERIES + PALETA_NEON. Los fallbacks del hook (#003041/#0E8AA0/#C7A968) viven aquí. |
| `src/shared/components/dashboard/charts/useAnimatedNumber.ts` | ✅ copia | Interpola un número hacia su objetivo con cubic-ease-out; respeta prefers-reduced-motion; SSR/test-safe. Usado en DonutReservados (total) y GaugeMeta (%). |
| `src/shared/components/dashboard/charts/colorUtils.ts` | ✅ copia | mix(a,b,t) + lighten(hex,t). Aclara colores oscuros de la paleta (p.ej. #003041) para que se lean vibrantes en dark sin dejar de derivar de la paleta. Usado por Donut y Gauge. |
| `src/shared/components/dashboard/charts/ChartCard.tsx` | ✅ copia | Contenedor glass/HUD biselado reutilizable: cardBgStyle + multi box-shadow biselado (4 capas, distinto en dark/claro) + borde translúcido + backdrop-blur + brillo superior + header con icono/título/subtítulo + slot `action` (leyenda/badge) + wrapper role=img aria-label. |
| `src/shared/components/dashboard/charts/TendenciaArea.tsx` | ✅ copia | Gráfica de área holográfica (AreaChart): gradiente <defs> linearGradient vertical + filtro glow feGaussianBlur/feMerge, CartesianGrid solo horizontal, tooltip con glow override, animación 700ms ease-out. |
| `src/shared/components/dashboard/charts/BarrasCilindro.tsx` | ✅ copia | Barras tipo cilindro 3D (BarChart): un linearGradient horizontal (0.5→1→0.5 opacidad, efecto cilindro) por color de paleta + glow + radius [6,6,0,0] + maxBarSize + Cell por dato. |
| `src/shared/components/dashboard/charts/DonutReservados.tsx` | ✅ copia | Dona limpia (PieChart): innerRadius 64%/outerRadius 88%, cornerRadius 8, paddingAngle 2, feDropShadow suave (no glow), gradiente sutil por segmento (segTop→segColor con lighten), total central animado, leyenda HTML accesible con % por segmento. |
| `src/shared/components/dashboard/charts/RankingSeries.tsx` | ✅ copia | Ranking tipo tabla premium SIN Recharts: medalla de posición, barra proporcional CSS animada (transition width 700ms ease-out + glow en dark), conteo y % del total; ordena desc y corta top-N. |
| `src/shared/components/dashboard/charts/GaugeMeta.tsx` | ✅ copia | Gauge semicircular SVG manual (arco path A): pista + arco de progreso con linearGradient + strokeDasharray/offset, drop-shadow suave, % animado con useAnimatedNumber, comparativa valor/meta. |
| `src/shared/components/dashboard/charts/KpiCardHud.tsx` | ✅ copia | Tarjeta KPI HUD: valor grande con textShadow glow (dark), delta ▲/▼ con color semántico (verde/rosa) en pill, icono Lucide, sparkline AreaChart de fondo con mask gradient, material 3D biselado + micro-elevación hover (motion-safe). |
| `src/shared/components/dashboard/charts/index.ts` | ✅ copia | Barrel: re-exporta los 7 componentes y sus tipos (props + tipos de datos como PuntoTendencia, BarraSerie, SegmentoDonut, RankingItem). |


## Templates embebibles (verbatim)


### chart-theme.ts (paleta base — ÚNICO archivo a adaptar por proyecto)

_Es el único punto de adaptación de color por proyecto. Las 6 gráficas NUNCA importan estos hex directamente; los reciben vía useChartTheme(). Solo el hook importa los semánticos (VERDE/AMBAR/VIOLETA/AZULREY/TEAL_CLARO) para completar paletteColors tras los 3 colores vivos del tema. Cambiar identidad = cambiar COLOR_AZUL/TEAL/DORADO y los fallbacks del hook._

```ts
/**
 * Paleta y tokens crudos para gráficas. El hook `useChartTheme()` (use-chart-theme.ts)
 * es la FUENTE DE VERDAD de estilos; aquí solo se definen los colores base.
 * Primario azul institucional #003041 (ADAPTAR por proyecto/identidad).
 */

export const COLOR_AZUL = '#003041'; // institucional (primario)
export const COLOR_AZUL_CLARO = '#0E5A6E';
export const COLOR_TEAL = '#0E8AA0'; // secundario
export const COLOR_TEAL_CLARO = '#22A6BC';
export const COLOR_DORADO = '#C7A968'; // acento
export const COLOR_DORADO_CLARO = '#E0C68C';
export const COLOR_VERDE = '#10b981';
export const COLOR_AMBAR = '#f59e0b';
export const COLOR_ROJO = '#dc2626';
export const COLOR_VIOLETA = '#8b5cf6';
export const COLOR_AZULREY = '#0ea5e9';

/** Serie institucional (datos de negocio). */
export const PALETA_SERIES = [
  COLOR_AZUL,
  COLOR_TEAL,
  COLOR_DORADO,
  COLOR_VERDE,
  COLOR_AMBAR,
  COLOR_VIOLETA,
  COLOR_AZULREY,
  COLOR_TEAL_CLARO,
];

/** Paleta neón/futurista para impacto (HUD, modo oscuro). */
export const PALETA_NEON = [
  '#22d3ee', // cyan
  '#38bdf8', // sky
  '#2dd4bf', // teal
  '#4ade80', // verde neón
  '#a855f7', // violeta
  '#f472b6', // rosa
  '#fbbf24', // ámbar
  '#818cf8', // índigo
  '#34d399', // esmeralda
  '#facc15', // amarillo
];
```


### ChartThemeTokens (contrato del tema palette-aware)

_Contrato que toda gráfica consume. Invariante entre proyectos. Define qué tokens existen; ninguna gráfica debe leer hex fuera de este objeto. paletteColors[] siempre empieza por los 3 colores vivos del tema y se completa con semánticos._

```ts
import type { CSSProperties } from 'react';

export interface ChartThemeTokens {
  isDark: boolean;
  cardBgStyle: CSSProperties;
  kpiBgStyle: (accent: string) => CSSProperties;
  tooltipProps: {
    contentStyle: CSSProperties;
    labelStyle: CSSProperties;
    itemStyle: CSSProperties;
    cursor: { fill: string };
  };
  axisTickSm: { fill: string; fontSize: number };
  gridStroke: string;
  axisStroke: string;
  labelColor: string;
  textPrimary: string;
  textMuted: string;
  textSubtle: string;
  ringClass: string;
  shadowClass: string;
  pieSeparatorStroke: string;
  paletteColor: string;   // = primary vivo del tema
  paletteAccent: string;  // = secondary vivo del tema
  paletteColors: string[]; // [primary, secondary, accent, ...semánticos]
}
```


### useChartTheme — patrón MutationObserver + snapshot del tema

_Núcleo del sistema palette-aware. El MutationObserver sobre style/class/data-theme de <html> es lo que hace que las gráficas cambien de color al instante al cambiar paleta o modo, sin recargar. paletteColors antepone los 3 colores vivos del tema. Invariante; solo cambian los fallbacks por proyecto._

```ts
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  COLOR_VERDE, COLOR_AMBAR, COLOR_VIOLETA, COLOR_AZULREY, COLOR_TEAL_CLARO,
} from './chart-theme';

interface TemaSnapshot { isDark: boolean; primary: string; secondary: string; accent: string; }

/** Lee una CSS custom property de <html> (con fallback si aún no está aplicada). */
function leerVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Captura el estado actual del tema (colores vivos + modo). */
function leerSnapshot(): TemaSnapshot {
  if (typeof document === 'undefined') {
    return { isDark: false, primary: '#003041', secondary: '#0E8AA0', accent: '#C7A968' };
  }
  const root = document.documentElement;
  const isDark = root.classList.contains('dark') || root.getAttribute('data-theme') === 'dark';
  return {
    isDark,
    primary: leerVar('--theme-primary', '#003041'),
    secondary: leerVar('--theme-secondary', '#0E8AA0'),
    accent: leerVar('--theme-accent', '#C7A968'),
  };
}

/**
 * Suscribe a cambios de paleta (atributo `style` en <html> que el PalettePicker
 * muta vía setProperty) y de modo (`class`/`data-theme`); devuelve SIEMPRE los
 * colores vivos. Así cualquier gráfica que use este hook se re-renderiza al
 * cambiar la paleta o el modo oscuro.
 */
function useTemaSnapshot(): TemaSnapshot {
  const [snap, setSnap] = useState<TemaSnapshot>(leerSnapshot);
  useEffect(() => {
    const root = document.documentElement;
    const actualizar = () => {
      const next = leerSnapshot();
      setSnap((prev) =>
        prev.isDark === next.isDark && prev.primary === next.primary &&
        prev.secondary === next.secondary && prev.accent === next.accent ? prev : next,
      );
    };
    const obs = new MutationObserver(actualizar);
    obs.observe(root, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] });
    actualizar(); // re-lee tras montar: DynamicTheme/PalettePicker ya aplicaron las vars
    return () => obs.disconnect();
  }, []);
  return snap;
}

export function useChartTheme(): ChartThemeTokens {
  const { isDark, primary, secondary, accent } = useTemaSnapshot();
  return useMemo<ChartThemeTokens>(() => {
    const paletteColors = [
      primary, secondary, accent,
      COLOR_VERDE, COLOR_AMBAR, COLOR_VIOLETA, COLOR_AZULREY, COLOR_TEAL_CLARO,
    ];
    if (isDark) {
      return { /* ...tokens dark (ver bloque de tokens dark/claro)... */ } as ChartThemeTokens;
    }
    return { /* ...tokens claro... */ } as ChartThemeTokens;
  }, [isDark, primary, secondary, accent]);
}
```


### Tokens dark vs claro del hook (tooltips holográficos + grids + backgrounds)

_Define la diferencia dark/claro. CLAVE: en dark el tooltip y los KPI llevan glow (boxShadow con `0 0 22px ${secondary}55`, textShadow); en claro solo sombra difusa neutra. Los colores de glow/borde se derivan SIEMPRE de primary/secondary del tema (interpolación con sufijos de opacidad hex como `55`,`33`,`14`,`1f`,`30`,`26`,`10`). Invariante; solo se ajusta si el proyecto quiere otra densidad de blur/opacidad._

```ts
// ---- RAMA DARK (tooltip holográfico con glow) ----
const DARK = {
  isDark: true,
  cardBgStyle: {
    backgroundColor: 'rgba(8,18,24,0.55)',
    backgroundImage: `
      radial-gradient(circle at 15% 10%, ${primary}55 0%, transparent 45%),
      radial-gradient(circle at 85% 90%, ${secondary}33 0%, transparent 45%)`,
    backdropFilter: 'blur(18px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
  },
  kpiBgStyle: (a: string) => ({
    backgroundColor: 'rgba(8,18,24,0.5)',
    backgroundImage: `
      radial-gradient(circle at 0% 0%, ${a}40 0%, transparent 55%),
      radial-gradient(circle at 100% 100%, ${secondary}1f 0%, transparent 55%)`,
  }),
  tooltipProps: {
    contentStyle: {
      background: 'rgba(8,18,24,0.95)',
      border: `1px solid ${secondary}55`,
      borderRadius: 12, padding: '8px 12px', color: '#e2e8f0',
      boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 22px ${secondary}55, inset 0 1px 0 rgba(255,255,255,0.08)`,
      backdropFilter: 'blur(8px)', fontSize: 12,
    },
    labelStyle: { color: '#fff', fontWeight: 700, fontSize: 12 },
    itemStyle: { color: '#e2e8f0' },
    cursor: { fill: `${secondary}14` },
  },
  axisTickSm: { fill: '#94a3b8', fontSize: 10 },
  gridStroke: 'rgba(148,163,184,0.15)',
  axisStroke: 'rgba(148,163,184,0.3)',
  textPrimary: '#f1f5f9', textMuted: '#94a3b8', textSubtle: '#64748b',
  pieSeparatorStroke: '#08121a',
  paletteColor: primary, paletteAccent: secondary,
};

// ---- RAMA CLARO (sombra suave, SIN glow neón) ----
const CLARO = {
  isDark: false,
  cardBgStyle: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    backgroundImage: `
      radial-gradient(circle at 15% 0%, ${primary}1a 0%, transparent 50%),
      radial-gradient(circle at 85% 100%, ${secondary}1a 0%, transparent 50%)`,
    backdropFilter: 'blur(16px) saturate(1.5)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
  },
  tooltipProps: {
    contentStyle: {
      background: 'rgba(255,255,255,0.98)',
      border: `1px solid ${primary}30`,
      borderRadius: 12, padding: '8px 12px', color: '#0f172a',
      boxShadow: `0 12px 28px rgba(15,23,42,0.12), 0 0 0 1px ${secondary}26`,
      backdropFilter: 'blur(6px)', fontSize: 12,
    },
    labelStyle: { color: '#0f172a', fontWeight: 700, fontSize: 12 },
    itemStyle: { color: '#1e293b' },
    cursor: { fill: `${primary}10` },
  },
  axisTickSm: { fill: '#64748b', fontSize: 10 },
  gridStroke: 'rgba(15,23,42,0.08)',
  axisStroke: 'rgba(15,23,42,0.18)',
  textPrimary: '#0f172a', textMuted: '#64748b', textSubtle: '#94a3b8',
  pieSeparatorStroke: '#ffffff',
  paletteColor: primary, paletteAccent: secondary,
};
```


### useAnimatedNumber.ts (conteo animado cubic-ease-out, reduced-motion-safe)

_Copia verbatim. Todo número destacado (total de dona, % de gauge, y opcionalmente KPIs) pasa por aquí. La regla del estándar: NINGÚN número grande estático. Easing cubic-out (1-(1-p)^3); duración ≤950ms. Invariante._

```ts
// ============================================================
// useAnimatedNumber — interpola un número hacia su objetivo con easing (cubic
// out). Respeta prefers-reduced-motion (salta al valor). SSR/test-safe.
// Da vida a los conteos (total de la dona, % del gauge) al montar o al cambiar.
// ============================================================
import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(target: number, duration = 800): number {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof requestAnimationFrame === 'undefined' || typeof performance === 'undefined') {
      setVal(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

export default useAnimatedNumber;
```


### colorUtils.ts — lighten()/mix() para vibrancia en dark

_Copia verbatim. Resuelve el problema de paletas con primario muy oscuro: en dark se hace lighten(color, 0.2-0.3) para que segmentos de dona/arco de gauge sean visibles sin abandonar la paleta. Invariante._

```ts
// colorUtils — mezcla/aclarado de colores HEX para dar brillo a las gráficas.
// Permite que un color de paleta muy oscuro (p.ej. el primario #003041) se vea
// vibrante sobre fondo oscuro sin dejar de derivar de la paleta activa.

function parseHex(hex: string): [number, number, number] | null {
  if (typeof hex !== 'string' || hex[0] !== '#') return null;
  let h = hex.slice(1).trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length < 6) return null;
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const c = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Interpola dos colores HEX en t∈[0,1]. Si alguno no parsea, devuelve `a`. */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;
  return toHex(ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t);
}

/** Aclara un color HEX hacia blanco (t∈[0,1]). */
export function lighten(hex: string, t: number): string {
  return mix(hex, '#ffffff', t);
}
```


### Patrón <defs> de referencia: linearGradient + filtro glow + tooltip holográfico (TendenciaArea)

_Plantilla de referencia para CUALQUIER gráfica Recharts del set. Muestra el patrón canónico: (1) color = t.paletteAccent/paletteColors, nunca hex; (2) gradiente vertical via <defs> linearGradient con stopOpacity dependiente de t.isDark; (3) filtro glow feGaussianBlur+feMerge con stdDeviation mayor en dark; (4) CartesianGrid vertical={false} (solo horizontal); (5) Tooltip spread de t.tooltipProps + override de glow; (6) animación 700ms ease-out. Adaptar el dataKey/nombre por dominio._

```tsx
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartTheme } from '@/shared/components/dashboard/use-chart-theme';

export function TendenciaArea({ data, height = 248 }: TendenciaAreaProps) {
  const t = useChartTheme();
  const c = t.paletteAccent; // respeta la paleta activa (NO hardcodear)
  const gradId = 'sigae-tendencia-fill';
  const glowId = 'sigae-tendencia-glow';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 14, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity={t.isDark ? 0.45 : 0.32} />
            <stop offset="100%" stopColor={c} stopOpacity={0} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={t.isDark ? 4 : 2} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid vertical={false} stroke={t.gridStroke} strokeDasharray="3 3" />
        <XAxis dataKey="ejercicio" tick={t.axisTickSm} tickLine={false} axisLine={false} dy={4} />
        <YAxis tick={t.axisTickSm} tickLine={false} axisLine={false} width={40} />

        <Tooltip
          {...t.tooltipProps}
          contentStyle={{
            ...t.tooltipProps.contentStyle,
            boxShadow: `0 0 0 1px ${c}40, 0 0 22px ${c}66, 0 12px 30px rgba(0,0,0,0.45)`,
          }}
          labelStyle={{ ...t.tooltipProps.labelStyle, textShadow: `0 0 8px ${c}` }}
        />

        <Area
          type="monotone" dataKey="expedientes" name="Expedientes"
          stroke={c} strokeWidth={2.5}
          fill={`url(#${gradId})`} filter={`url(#${glowId})`} dot={false}
          activeDot={{ r: 4, fill: c, stroke: t.isDark ? '#0b1620' : '#ffffff', strokeWidth: 2 }}
          animationDuration={700} animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```


### Patrón gradiente cilindro 3D (BarrasCilindro — efecto pilar)

_Receta del efecto 3D 'cilindro/pilar': el gradiente horizontal x1=0→x2=1 con opacidad 0.5→1→0.5 simula reflejo central de un cilindro. Un gradiente por color de t.paletteColors, indexado por % palette.length. radius redondea solo la tapa superior. Adaptar dataKey por dominio._

```tsx
// Un linearGradient HORIZONTAL por color de paleta: oscuro→pleno→oscuro = volumen cilíndrico
<defs>
  {palette.map((color, i) => (
    <linearGradient key={i} id={`sigae-cil-${i}`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={color} stopOpacity={0.5} />
      <stop offset="50%" stopColor={color} stopOpacity={1} />
      <stop offset="100%" stopColor={color} stopOpacity={0.5} />
    </linearGradient>
  ))}
  <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={t.isDark ? 3.5 : 1.5} result="blur" />
    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter>
</defs>
// ...
<Bar dataKey="expedientes" radius={[6, 6, 0, 0]} maxBarSize={52} filter={`url(#${glowId})`}
     animationDuration={700} animationEasing="ease-out">
  {data.map((_, i) => <Cell key={i} fill={`url(#sigae-cil-${i % palette.length})`} />)}
</Bar>
```


### Patrón gauge SVG manual (GaugeMeta — arco con dasharray animado)

_Receta del gauge semicircular sin librería: arco SVG (A command) + strokeDasharray=semicírculo y strokeDashoffset animado vía useAnimatedNumber. lighten() asegura visibilidad del extremo en dark. drop-shadow con glow solo en dark. Invariante salvo accentIndex/etiqueta por dominio._

```tsx
const colorA = t.isDark ? lighten(t.paletteColor, 0.3) : lighten(t.paletteColor, 0.08);
const colorB = t.paletteColors[accentIndex % t.paletteColors.length] ?? t.paletteAccent;
const pctAnim = useAnimatedNumber(ratio * 100, 950);
const rAnim = Math.min(Math.max(pctAnim / 100, 0), 1);
const r = 82, cx = 100, cy = 100, sw = 13;
const semi = Math.PI * r;
const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
const track = t.isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.07)';
// ...
<svg viewBox="0 0 200 112" className="w-full">
  <defs>
    <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={colorA} />
      <stop offset="100%" stopColor={colorB} />
    </linearGradient>
  </defs>
  <path d={arc} fill="none" stroke={track} strokeWidth={sw} strokeLinecap="round" />
  <path d={arc} fill="none" stroke={`url(#${gradId})`} strokeWidth={sw} strokeLinecap="round"
    strokeDasharray={semi} strokeDashoffset={semi * (1 - rAnim)}
    style={t.isDark ? { filter: `drop-shadow(0 2px 6px ${colorB}55)` } : { filter: 'drop-shadow(0 2px 4px rgba(15,23,42,0.18))' }} />
</svg>
```
