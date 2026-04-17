# 🚀 Migración a la nube — Guía completa

El proyecto tiene 3 piezas que viven en la nube:

```
┌─────────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  📱 App móvil       │    │  🗄️ Supabase    │    │  🖥️ Dashboard   │
│  (Expo Go / APK)    │───▶│  (tu cuenta)     │◀───│  (Vercel)       │
│  - captura          │    │  - datos          │    │  - admin        │
│  - funciona offline │    │  - fotos          │    │  - analítica    │
└─────────────────────┘    └──────────────────┘    └─────────────────┘
```

**Nada vive en tu computadora en producción.** Tu PC solo se usa para:
- Disparar un build en EAS (un comando)
- Conectar el repo a Vercel (un clic)

El resto corre solo.

---

## 1️⃣ Supabase — ya está ✅

- Proyecto: `rtbbtnqttxmqzlwagays.supabase.co`
- Schema aplicado (5 tablas + RLS + bucket + función `es_admin()`)
- 19/19 pruebas pasan

**Único pendiente tuyo:** agregar tu user_id a `public.admins` después de registrarte desde la app móvil (paso 3).

---

## 2️⃣ Dashboard Web → Vercel (1 clic)

### Opción A — Conectar repo a Vercel (recomendado)

1. Sube el proyecto a GitHub (si aún no lo tienes):
   ```powershell
   cd C:\Users\zarag\Documents\Proyectos_Code\Diapositivas_APP
   git init
   git add .
   git commit -m "Setup inicial: móvil + dashboard + supabase"
   git remote add origin https://github.com/TU_USUARIO/supervision-cprs.git
   git push -u origin main
   ```

2. Entra a [vercel.com](https://vercel.com) con tu cuenta (gratis).

3. **Add New → Project** → importa tu repo de GitHub.

4. Configuración del proyecto en Vercel:
   | Campo | Valor |
   |---|---|
   | **Framework Preset** | Next.js (se detecta solo) |
   | **Root Directory** | `dashboard-web` |
   | **Build Command** | `next build` (default) |
   | **Output Directory** | `.next` (default) |

5. **Environment Variables** (click en "Environment Variables" antes de Deploy):
   ```
   NEXT_PUBLIC_SUPABASE_URL  =  https://rtbbtnqttxmqzlwagays.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  =  (tu anon key de Supabase → Settings → API)
   ```

6. **Deploy**. Vercel compila y te da una URL tipo `https://supervision-cprs-xxxx.vercel.app` en 2-3 min.

A partir de ahí, cada `git push` a main redeploya automáticamente.

### Opción B — Vercel CLI (sin GitHub)

```powershell
cd C:\Users\zarag\Documents\Proyectos_Code\Diapositivas_APP\dashboard-web
npm install -g vercel
vercel login
vercel --prod
```

---

## 3️⃣ App Móvil — Dos flujos

### 🧪 Flujo A: Expo Go (pruebas rápidas, para ti mientras desarrollas)

No requiere build. Tu PC corre Metro bundler y el teléfono descarga el JS.

```powershell
cd C:\Users\zarag\Documents\Proyectos_Code\Diapositivas_APP\supervision-cprs
npx expo start -c
```

- Descarga **Expo Go** en tu teléfono (Play Store / App Store)
- Escanea el QR que aparece en la terminal
- La app abre en el celu

Pros: rápido, gratis.
Contras: necesitas tu PC encendida + misma WiFi que el celu.

### 🚀 Flujo B: APK en la nube (producción, distribuye a supervisores)

Este es el flujo real para que los supervisores instalen la app sin depender de tu PC.

```powershell
cd C:\Users\zarag\Documents\Proyectos_Code\Diapositivas_APP\supervision-cprs
npm install -g eas-cli
eas login       # crea cuenta Expo (gratis) si no tienes
eas build --platform android --profile preview
```

- Tarda ~15-20 min (compila en los servidores de Expo, no tu PC).
- Al terminar te da una URL: `https://expo.dev/artifacts/eas/xxx.apk`.
- La compartes por WhatsApp / correo al equipo.
- Cada supervisor abre el link desde su Android → se descarga → instala como app normal (puede que tengan que permitir "instalar de fuentes desconocidas").

Para iPhone (IPA) se requiere cuenta Apple Developer ($99/año); con Android sale gratis para distribución interna.

---

## 4️⃣ Crear tu cuenta de administrador (una sola vez)

Después de tener el dashboard en Vercel y la app en tu celu:

1. Abre la app móvil → **Regístrate** con tu correo.
2. Ve a [Supabase Dashboard → Authentication → Users](https://supabase.com/dashboard) → copia tu `user_id` (uuid).
3. En **SQL Editor** corre:
   ```sql
   insert into public.admins (user_id, notas)
   values ('PEGA-TU-UUID-AQUI', 'Administrador principal');
   ```
4. Entra a tu Vercel URL con ese mismo correo → ya ves todas las supervisiones.

---

## 5️⃣ Flujo end-to-end en producción

1. **Supervisor en campo** abre la app (APK instalado en su celu).
2. Toma fotos y evalúa los 15 rubros. La app funciona sin internet.
3. Al finalizar, se marca como "finalizado" y queda en cola.
4. Cuando el celu recupera red, la app sube supervisión + fotos a Supabase automáticamente.
5. **Admin** abre el dashboard en Vercel desde cualquier navegador → ve fotos y estadísticas en tiempo real.

---

## 🔐 Variables de entorno (resumen)

| Variable | Dónde se setea | Valor |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `eas.json` del móvil + `.env` local | `https://rtbbtnqttxmqzlwagays.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eas.json` del móvil + `.env` local | (anon key) |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel Project Env Vars | Mismo valor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel Project Env Vars | Mismo valor |

La `anon key` es pública por diseño de Supabase — es seguro commitearla y publicarla. La seguridad real la dan las políticas RLS.

---

## 🩺 Diagnóstico rápido si algo falla

| Síntoma | Causa probable | Fix |
|---|---|---|
| App móvil no abre en Expo Go | Caché de Metro corrupto | `npx expo start -c` |
| App abre pero no autentica | ANON_KEY mal en `.env` | Revisa `supervision-cprs/.env` |
| Dashboard muestra "acceso restringido" | No estás en tabla admins | SQL `insert into public.admins...` |
| APK no instala en Android | Fuentes desconocidas bloqueadas | Ajustes → Seguridad → permitir |
| Sync se queda colgado | Sin internet | Se autoresuelve al recuperar red |

---

## ✅ Checklist de migración total

- [x] Supabase schema aplicado (19/19 tests)
- [x] Cliente móvil compila (Android + iOS bundle 200 OK)
- [x] Dashboard build limpio
- [x] ErrorBoundary instalado (app no se cerrará)
- [ ] Subir repo a GitHub
- [ ] Conectar Vercel + Deploy
- [ ] `eas build` para APK
- [ ] Registrarte como admin (SQL)
- [ ] Distribuir APK a supervisores
- [ ] Rotar contraseña postgres de Supabase
