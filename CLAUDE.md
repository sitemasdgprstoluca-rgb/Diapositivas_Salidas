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
