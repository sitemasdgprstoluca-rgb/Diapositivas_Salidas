# Supervisión C.P.R.S. — Guía para Claude

Repo con **dos sub-proyectos** que comparten Supabase como backend.

```
Diapositivas_APP/
├── supervision-cprs/   ← App móvil (React Native + Expo)
├── dashboard-web/      ← Dashboard analítico admin (Next.js 14)
└── supabase/schema.sql ← (en supervision-cprs/) esquema único de la BD
```

## Stack por sub-proyecto

### `supervision-cprs/` — App móvil
- **Framework**: Expo SDK 54 + React Native + JavaScript
- **Routing**: expo-router
- **Estado**: React Context (`SupervisionContext`, `AuthContext`, `SyncProvider`)
- **Storage local**: AsyncStorage (offline-first)
- **Backend**: Supabase Auth + Postgres + Storage
- **Salida**: PowerPoint (.pptx) generado on-device con `pptxgenjs`
- **Tests**: Jest + 221 tests verdes (`npm test`)
- **Build**: EAS Build → APK distribuible

### `dashboard-web/` — Dashboard
- **Framework**: Next.js 14 App Router + JavaScript
- **Estilos**: Tailwind CSS
- **Charts**: Recharts (Radar, Line, Bar)
- **Auth**: Supabase SSR + middleware (admin-gate)
- **Tests**: Vitest + Testing Library + jsdom
- **Deploy**: Vercel

## Backend compartido — Supabase

Tablas:
- `supervisiones` — encabezados (CPRS, fecha, promedio_general, estado)
- `rubros` — los 15 rubros del Excel oficial con calificación 1-10 + no_aplica
- `criterios_rubro` — checklist SÍ/NO heredado del Excel
- `fotos_rubro` — paths a Storage bucket privado `supervisiones-fotos`
- `admins` — gate para acceso al dashboard

RLS estricto: usuarios normales solo ven lo suyo, admins ven todo (función `public.es_admin()`).

## Comandos clave

### Móvil
```powershell
cd supervision-cprs
npm install
npx expo start -c        # dev (Expo Go)
eas build --platform android --profile preview   # APK
npm test                 # Jest 221 tests
```

### Dashboard
```powershell
cd dashboard-web
npm install
npm run dev              # Next.js dev
npm run build            # Producción
npm run test:run         # Vitest one-shot
npm run test             # Vitest watch
```

### BD (Supabase)
SQL Editor del proyecto Supabase → pegar `supervision-cprs/supabase/schema.sql`. Idempotente.

## Variables de entorno

`supervision-cprs/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://rtbbtnqttxmqzlwagays.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`dashboard-web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://rtbbtnqttxmqzlwagays.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Vercel: las mismas dos vars como Environment Variables del proyecto.

## Cómo dejar la app móvil "siempre viva"

La app debe quedar funcional en los teléfonos sin que un supervisor tenga que reinstalar el APK cada vez que arregles algo. Cuatro capas:

### 1. OTA Updates (lo principal — fixes en JS al instante)

`expo-updates` está activo. Cualquier cambio que NO toque módulos nativos (UI, lógica JS, fixes de bugs, textos) se publica con:

```powershell
cd supervision-cprs
eas update --branch production --message "fix: descripción corta"
```

Los teléfonos descargan la actualización al abrir la app. Tres canales: `development`, `preview`, `production` (definidos en `eas.json`).

**Cuándo NO sirve OTA — requiere rebuild + reinstall**:
- Nuevas dependencias nativas (`expo install ...` que añade `*.podspec`)
- Cambio de permisos en `app.json` (Android: `permissions`, iOS: `infoPlist`)
- Bump de Expo SDK
- Cambio de `runtimeVersion` (atado a `appVersion` actualmente — bumpear `version` en `app.json` invalida los OTA viejos)

### 2. CI/CD que dispara OTA al merge a main

`.github/workflows/ci.yml` tiene job `mobile-ota`:
- Corre **después** de que pasen los 3 jobs de tests (`mobile-jest`, `dashboard-vitest`, `dashboard-build`).
- Solo se ejecuta en `push` a `main` (no en PRs).
- Requiere secret `EXPO_TOKEN` en GitHub (Settings → Secrets → Actions).
  - Genera el token en https://expo.dev/accounts/[user]/settings/access-tokens

Sin el secret, el step `Publish OTA update` se salta gracefully (no rompe el CI).

### 3. Distribución del APK (solo cuando hay rebuild)

```powershell
cd supervision-cprs
eas build --platform android --profile preview      # genera APK distribuible
eas build --platform android --profile production   # genera AAB para Play Store
```

Para 22 supervisores la opción más sostenible es **Internal Testing en Google Play**: subes el AAB una vez, registras los emails de los supervisores, y reciben futuros rebuilds automáticamente.

### 4. Crash reporting (recomendado, no instalado aún)

Sin esto, si la app crashea en un teléfono nunca te enteras. Sentry para Expo es la opción estándar:

```powershell
cd supervision-cprs
npx expo install sentry-expo @sentry/react-native
```

Luego envuelver la app en `Sentry.wrap(App)` y configurar DSN en `.env`. Crear cuenta gratis en sentry.io (5K eventos/mes gratis bastan para 22 usuarios).

### Resumen del flujo recurrente

| Tipo de cambio | Acción |
|---|---|
| Fix de UI/lógica JS | `git push main` → CI dispara OTA → teléfonos se actualizan al abrir |
| Nueva dependencia nativa o permiso | Bump `version` en `app.json` → `eas build` → distribuir nuevo APK/AAB |
| Crash en producción | (con Sentry) recibes alerta → fix → OTA |
| Rotación de credenciales Supabase | Update `.env` y secrets de Vercel → push (dashboard) + bump version + rebuild (móvil) |

## DISCIPLINAS DE SUPERPOWERS (complementan SDD)

SDD planifica (proposal → spec → design → tasks). Superpowers impone disciplina al ejecutar:

1. **Iron Law (TDD)**: no production code without a failing test first.
   - Test runners:
     - Móvil: **Jest** (`cd supervision-cprs && npm test`)
     - Web: **Vitest** (`cd dashboard-web && npm run test:run`)
   - Para módulos nuevos: escribir test que falle → implementar → refactor.
   - Para módulos legacy sin tests: aplicar Iron Law solo en código nuevo.

2. **3-strike debug rule**: si un bug no cede en 3 intentos:
   - Pará. Reproducí (test que falle representando el bug).
   - Aislá causa raíz (no parchees síntoma).
   - Una hipótesis a la vez — descartala antes de probar otra.

3. **Two-stage review**:
   - Stage 1 — `/sdd-verify` (spec compliance: ¿cumple lo prometido en spec?)
   - Stage 2 — GGA u otra herramienta de quality (code quality: ¿es código mantenible?)
   - Ambos deben pasar antes del merge.

### Convención de archivos de test

| Sub-proyecto | Ubicación | Extensión |
|---|---|---|
| `supervision-cprs/` | `__tests__/{unit,integration,...}/` | `.test.js` |
| `dashboard-web/` | `__tests__/` o junto al componente | `.test.jsx` (JSX requiere .jsx) o `.test.js` (lógica pura) |
