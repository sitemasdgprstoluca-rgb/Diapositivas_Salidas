# Dashboard Supervisión C.P.R.S.

Dashboard web para administradores. Muestra analítica de supervisiones de todos los C.P.R.S. sincronizadas por los supervisores desde la app móvil.

## Stack

- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** para estilos
- **Recharts** para gráficas
- **@supabase/ssr** para auth en servidor + middleware
- **Vercel** para deploy

## Páginas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión |
| `/` | Lista de todos los C.P.R.S. con promedio actual y tendencia |
| `/cprs/[nombre]` | Histórico temporal + evolución por rubro de un centro |
| `/comparar` | Comparativo entre múltiples centros (hasta 7) |
| `/no-admin` | Se muestra si el usuario no es admin |

## Ejecutar en local (PowerShell)

```powershell
cd dashboard-web
npm install
npm run dev
```

Abre http://localhost:3000

## Crear el primer admin

El dashboard es **exclusivo para admins**. Cada usuario queda bloqueado en `/no-admin` hasta que su `user_id` aparezca en `public.admins`.

Pasos:

1. Registra un usuario desde la **app móvil** (pantalla de Registro) con el email que quieras usar como admin.
2. Ve a **Supabase Dashboard → Authentication → Users** y copia el `id` (uuid) de ese usuario.
3. En **SQL Editor**, ejecuta:

   ```sql
   insert into public.admins (user_id, notas)
   values ('PEGA-AQUI-EL-UUID', 'Administrador principal');
   ```

4. Entra al dashboard con ese email/contraseña.

## Deploy en Vercel

### Opción recomendada — GitHub + Vercel

1. Empuja el repo completo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. En **Root Directory** pon `dashboard-web`.
4. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://rtbbtnqttxmqzlwagays.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key)
5. **Deploy**. Vercel detecta Next.js automáticamente.

### Opción 2 — Vercel CLI

```powershell
cd dashboard-web
npm install -g vercel
vercel
```

Al pedirte variables, pega las mismas de arriba.

## Notas de seguridad

- Las políticas RLS de Supabase garantizan que aunque un no-admin logre llamar al API directamente, no verá datos de otros usuarios.
- El middleware hace redirect del lado del servidor, así que el admin gate no se puede saltar desde el cliente.
- La `anon key` es segura de exponer (está diseñada para ello). La contraseña de postgres (service role) **nunca** se usa en este dashboard.
