# Reference Pack — Gobernanza, Infraestructura y Calidad

> Stack y configs **autoritativos**, tomados verbatim de SIGAE (la implementación de referencia). Las versiones son reales y probadas en producción. Las adiciones marcadas **(+ rodrich-design)** no existen aún en SIGAE pero el estándar las exige desde el día 1.

---

## Stack base (invariable)

```text
React 18.3 + Vite 5.4 + TypeScript 5.5 (strict) + Tailwind 3.4
NextUI/@nextui-org 2.6 + Framer Motion 12 + tailwind-merge + clsx
TanStack React Query 5 (+ @tanstack/react-virtual para tablas grandes)
React Hook Form 7 + @hookform/resolvers + Zod 4
Recharts 3.8 + Lucide React
react-hot-toast + jsPDF + jspdf-autotable + xlsx + date-fns
Supabase JS ~2.104 (PostgreSQL + Auth + Storage + RLS)   ← si BD = Supabase
Vitest 2 (unit/integration) + Playwright (E2E, solo CI)
Gestor: pnpm (OBLIGATORIO).  Deploy: Vercel SPA.  Puerto dev: 5000.
```

---

## `package.json` — dependencias canónicas (versiones reales de SIGAE)

Adapta `name`/`description`/`packageManager` por proyecto. **No bajes versiones** sin razón.

```jsonc
{
  "name": "<sigla-proyecto>",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "packageManager": "pnpm@10.33.0",
  "engines": { "node": ">=20", "pnpm": ">=10" },          // (+ rodrich-design)
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "test": "vitest",
    "test:run": "vitest run",
    "validate": "pnpm run typecheck && pnpm run lint && pnpm run test:run",
    "gen:types": "supabase gen types typescript --project-id <ref> > src/core/types/database.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@nextui-org/react": "^2.6.11",
    "@radix-ui/react-dialog": "^1.1.15",
    "@supabase/supabase-js": "~2.104.1",
    "@tanstack/react-query": "^5.90.2",
    "@tanstack/react-virtual": "^3.13.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.29.2",
    "jspdf": "^3.0.4",
    "jspdf-autotable": "^5.0.2",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.71.1",
    "react-hot-toast": "^2.6.0",
    "react-router-dom": "^7.9.2",
    "recharts": "^3.8.0",
    "tailwind-merge": "^3.6.0",
    "uuid": "^13.0.0",
    "xlsx": "^0.18.5",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@playwright/test": "^1.60.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^24.10.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "husky": "^9.1.0",                                     // (+ rodrich-design)
    "jsdom": "^29.1.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2",
    "vitest": "^2.1.9"
  }
}
```

---

## `.npmrc` (+ rodrich-design — fuerza pnpm)

```ini
engine-strict=true
auto-install-peers=true
```

---

## Estructura modular obligatoria

```text
src/
  core/                 # infra transversal, NO negocio
    auth/               # AuthProvider, AuthTransitionProvider, ProtectedRoute, authTransition.ts
    theme/              # DynamicTheme, colorUtils (buildPaletteFromHex)
    branding/           # BRANDING: { colors:{primary,secondary,accent}, assets, nombres } ← contrato por proyecto
    types/              # database.ts (generado), tipos globales
    query/              # queryClient, persistencia
  modules/              # un directorio por módulo de negocio
    <modulo>/
      types/  services/  hooks/  components/  pages/
      permissions.ts    scopes.ts    index.ts
  shared/
    components/         # ui/  tables/  dashboard/  layout/  brand/
    services/           # exportService, storageService
    hooks/              # useDebounce, usePagination, useHasPermission…
    utils/              # searchNormalize (coincideBusqueda), formatters
  pages/
    auth/               # LoginPage (arquetipo elegido) + components/ + orbit/
    errors/             # 403, 404
modules base de UI ↑ los entrega rodrich-design
design-system/
  MASTER.md             # fuente de verdad de paleta + tokens + reglas duras
supabase/migrations/    # si BD = Supabase (idempotentes, con rollback)
docs/superpowers/specs/ # specs SDD del proyecto
```

Regla: `core/` no importa de `modules/`. `modules/` no importan entre sí salvo vía `shared/` o contratos públicos (`index.ts`). Alias `@/*` → `src/*`.

---

## `tsconfig.app.json` (strict — verbatim de SIGAE)

```jsonc
{
  "compilerOptions": {
    "target": "ES2021",
    "useDefineForClassFields": true,
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

`tsconfig.json` raíz solo referencia `tsconfig.app.json` + `tsconfig.node.json` (project references).

---

## `vite.config.ts` (verbatim de SIGAE — alias @, vitest, chunks, SPA)

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  appType: 'spa',                       // BrowserRouter: sirve index.html en cualquier ruta
  server: { port: 5000, host: true },
  plugins: [react()],
  optimizeDeps: { exclude: ['lucide-react'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'react-hot-toast', 'lucide-react'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
});
```

---

## `eslint.config.js` (flat config — verbatim de SIGAE)

```js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

---

## CI/CD (+ rodrich-design) — `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm run test:run
      - run: pnpm run build
```

E2E (Playwright) corre en un job aparte solo en CI (en WSL2 local Cypress da SIGILL — preferir Playwright). Deploy preview a Vercel en PR vía `preview.yml` (token en secrets).

---

## Commits y pre-commit (+ rodrich-design)

`.husky/pre-commit`:

```sh
pnpm run validate
```

Commits **Conventional** (`feat:`, `fix:`, `style:`, `refactor:`…), en **español**, cerrando con:

```text
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

## `AGENTS.md` del proyecto nuevo — plantilla (modelada de SIGAE)

`AGENTS.md` es la **fuente de verdad** para todo agente IA. Estructura mínima a generar:

```markdown
# AGENTS.md — <SIGLA> (FUENTE DE VERDAD para todos los agentes IA)
> Si algo aquí contradice una skill, manda este archivo.

## 0. Identidad
- Sistema: <NOMBRE COMPLETO>. Para: <INSTITUCIÓN>. Tagline: <TAGLINE>.
- Color primario: <HEX>. Arquetipo de login: <Alpha Orbital | Glassmorphic Zero | Asymmetric Hero>.

## 1. Idioma — SIEMPRE español (UI, mensajes, comentarios, commits).

## 2. Stack — (copiar bloque "Stack base" de arriba). Gestor: pnpm. Puerto dev: 5000.

## 3. Base de datos — prefijo único `<pfx>_` en TODAS las tablas; RLS habilitada;
   soft-delete (activo=false); auditoría por trigger; `.limit(5000)` en multi-fila.

## 4. Convención — tablas `<pfx>_*`; permisos `modulo.accion.recurso.scope`;
   roles del proyecto; patrón de módulo types/services/hooks/components/pages/permissions.ts.

## 5. Testing — Vitest (`pnpm test:run`); pre-commit `pnpm validate`; E2E solo CI.

## 6. Disciplinas — TDD (test primero); 3-strike debug; two-stage review (sdd-verify + /code-review);
   verification-before-completion (evidencia antes de "listo").

## 7. UI obligatoria (rodrich-design) — los 4 pilares (Auth Vault, DataTable Estándar de Oro,
   6 gráficas palette-aware, Tutorial Engine) y los Estándares Enterprise Premium son línea base.
   Diseño/gráficas: usar la skill `/diseno`. Tokens `--theme-*`, solo Lucide, tema adaptativo.

## 8. Memoria — Engram proyecto `<sigla>`: mem_save proactivo tras cada decisión/bug/convención.
```

`CLAUDE.md` del proyecto: thin, apunta a `AGENTS.md` como fuente de verdad + recuerda Engram + color primario + `/rodrich-design` ya ejecutado.
