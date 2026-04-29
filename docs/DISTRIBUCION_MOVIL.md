# Distribución de la app móvil — guía operativa

Documento maestro de cómo dejar la app **Supervisión CPRS** instalable y
actualizable en los teléfonos y tablets de los supervisores, sin que
nada caduque y sin tener que reinstalar manualmente.

Última actualización: 2026-04-29.

---

## TL;DR — los 3 enlaces que importan

| Para qué | URL |
|---|---|
| Descargar la última versión del APK (Android) | `https://github.com/sitemasdgprstoluca-rgb/Diapositivas_Salidas/releases/latest` |
| Disparar un nuevo build manual desde GitHub | `https://github.com/sitemasdgprstoluca-rgb/Diapositivas_Salidas/actions/workflows/release-mobile.yml` |
| Dashboard analítico web | `https://diapositivas-salidas.vercel.app` |

---

## Arquitectura de "siempre vivo"

La app permanece funcional y actualizada en los dispositivos gracias a
**4 capas** complementarias:

```
┌─────────────────────────────────────────────────────────────┐
│  Capa 1: OTA Updates (cambios de JS/UI sin reinstalar)      │
│  ─ disparado automáticamente por CI al merge a main         │
│  ─ los teléfonos descargan al abrir la app                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Capa 2: GitHub Releases (APK firmado permanente)            │
│  ─ disparado al pushear tag vX.Y.Z                          │
│  ─ URL nunca caduca                                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Capa 3: TestFlight para iPhone (pendiente Apple Developer)  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Capa 4: Crash reporting (Sentry — pendiente)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Capa 1 — OTA Updates (lo más usado)

**Qué hace**: cuando arreglas un bug en JS, cambias colores, ajustas
textos, modificas lógica de cálculo, etc., el cambio llega a los
teléfonos sin que nadie reinstale el APK.

**Cómo funciona**:
1. Push a `main` con tu cambio.
2. GitHub Actions corre los 3 jobs de tests (`mobile-jest`,
   `dashboard-vitest`, `dashboard-build`).
3. Si pasan, el job `mobile-ota` corre `eas update --branch production`.
4. Los teléfonos con la app instalada descargan el bundle nuevo la
   próxima vez que la abren.

**Configuración una sola vez** (ya hecho si ya activaste el secreto):
1. Crear token: https://expo.dev/accounts/sitemasdgprstoluca-rgb/settings/access-tokens
2. GitHub → Settings → Secrets → Actions → `EXPO_TOKEN` con el valor del paso 1.

**Limitaciones de OTA** — estos cambios SÍ requieren rebuild + reinstalar APK:
- Nuevos permisos en `app.json` (Android `permissions`, iOS `infoPlist`).
- Nuevas dependencias nativas (`expo install ...` que añade módulos nativos).
- Bump de Expo SDK.
- Bump de `version` en `app.json` (porque `runtimeVersion: appVersion`).

---

## Capa 2 — GitHub Releases (APK firmado permanente)

**Qué resuelve**: los enlaces de descarga que da EAS Build directamente
(`https://expo.dev/.../builds/...`) **caducan a los 30 días**. Si solo
compartes ese link, los supervisores no pueden reinstalar al mes
siguiente. Las URLs de GitHub Releases NO caducan.

### Disparar un build nuevo

**Opción A — desde la web (más fácil)**

1. https://github.com/sitemasdgprstoluca-rgb/Diapositivas_Salidas/actions/workflows/release-mobile.yml
2. Click en **"Run workflow"** (botón derecha).
3. Versión: `1.0.0` (o la que toque).
4. Click verde "Run workflow".
5. Esperar ~10 min.

**Opción B — desde tu terminal**

```powershell
cd c:\Users\zarag\Documents\Proyectos_Code\Diapositivas_APP
git tag v1.0.0
git push origin v1.0.0
```

### Qué hace el workflow

1. Corre `eas build --platform android --profile preview` (APK firmado).
2. Espera a que termine, descarga el APK del CDN de Expo.
3. Crea automáticamente un **GitHub Release** con el APK adjunto.
4. URL pública estable que **nunca caduca**.

### Distribuir a los supervisores

Comparte cualquiera de estos dos URLs (ambos quedan permanentes):
- Última versión: `https://github.com/sitemasdgprstoluca-rgb/Diapositivas_Salidas/releases/latest`
- Versión específica: `https://github.com/sitemasdgprstoluca-rgb/Diapositivas_Salidas/releases/tag/v1.0.0`

### Cómo instala el supervisor

1. Abre el link en Chrome del teléfono Android.
2. Toca **Assets** y descarga el `.apk`.
3. Toca el archivo descargado.
4. Si Android bloquea: **Ajustes → Aplicaciones → Acceso especial → Instalar apps desconocidas → Chrome → Permitir**.
5. Reabre el archivo, instalar.
6. Login con sus credenciales de supervisor.

A partir de aquí, cualquier corrección JS llega via **OTA** (Capa 1)
sin tocar nada más.

---

## Capa 3 — iPhone (TestFlight)

**Estado**: pendiente de cuenta Apple Developer.

Apple bloquea por completo la instalación directa de IPAs (no hay
equivalente al APK de Android). Las únicas formas legales de poner una
app en iPhones de supervisores son:

| Opción | Requiere | Costo | Uso |
|---|---|---|---|
| **TestFlight** | Cuenta Apple Developer | $99 USD/año | hasta 100 testers internos sin review |
| **App Store** | Cuenta Apple Developer + review público | $99 USD/año | distribución pública |
| **Apple Business Enterprise** | Cuenta corporativa | $299 USD/año | distribución privada institucional |
| **Web app (PWA)** | Nada | Gratis | NO sirve — iOS bloquea cámara nativa |
| **Expo Go** | App gratis del App Store | Gratis | solo desarrollo, no producción |

**Camino recomendado para 22 supervisores institucionales**: TestFlight.

### Pasos para activar TestFlight (cuando se decida proceder)

1. **Verificar primero** con TI del Gobierno EdoMex / DGPRS si la
   institución ya tiene una cuenta Apple Developer activa. Si la tiene,
   te dan acceso al "team" y no pagas nada nuevo.

2. Si no la tiene, crear una en https://developer.apple.com/programs/
   ($99 USD/año, aprobación 1–3 días).

3. Una vez tengas el **Team ID**, en este repo:
   ```jsonc
   // supervision-cprs/app.json
   "ios": {
     "supportsTablet": true,
     "bundleIdentifier": "com.supervision.cprs",
     "appleTeamId": "ABCD1234EF"  // ← agregar
   }
   ```

4. Configurar credenciales:
   ```powershell
   cd supervision-cprs
   eas credentials  # configurar Apple ID, certificados (EAS lo hace casi todo)
   ```

5. Generar el primer IPA:
   ```powershell
   eas build --platform ios --profile production
   ```

6. Subir a TestFlight:
   ```powershell
   eas submit --platform ios
   ```

7. En App Store Connect, agregar los 22 emails de los supervisores como
   testers internos. Cada uno descarga la app **TestFlight** del App Store
   gratis y recibe la invitación.

### Updates de iOS

- **Cambios JS/UI**: el mismo workflow OTA funciona en iOS sin cambios.
- **Cambios nativos**: `eas build --platform ios` + `eas submit`. Apple
  re-revisa cada build (24–48h normalmente).

---

## Capa 4 — Crash reporting (Sentry, pendiente)

Sin esto, si la app crashea en un teléfono nunca te enteras. Setup
sugerido (~5 min):

1. Crear cuenta gratis en https://sentry.io/signup/ (5K eventos/mes
   gratis bastan para 22 usuarios).
2. Crear proyecto tipo "React Native".
3. Copiar el DSN.
4. En el repo:
   ```powershell
   cd supervision-cprs
   npx expo install sentry-expo @sentry/react-native
   ```
5. Configurar en `app/_layout.js` o equivalente:
   ```javascript
   import * as Sentry from 'sentry-expo';
   Sentry.init({
     dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
     enableInExpoDevelopment: false,
   });
   ```
6. Agregar `EXPO_PUBLIC_SENTRY_DSN` a `eas.json` profiles `preview` y
   `production`.

---

## Compatibilidad teléfonos / tablets

`supervision-cprs/app.json`:
- `orientation: "default"` → portrait + landscape automáticos.
- `ios.supportsTablet: true` → iPad con UI escalada.
- Android tablets: soportadas por defecto.

**Convenciones para que la UI se vea bien en cualquier tamaño**:
- Evitar `width`/`height` fijos en pixels grandes (>200px).
- Usar `flex`, porcentajes, o `Dimensions.get('window')`.
- Probar en al menos un teléfono (5"–6") y un tablet (10"+) antes de
  cada release que toque layouts.

---

## Matriz: cuándo usar OTA vs Release nuevo

| Tipo de cambio | Acción | Tiempo a usuarios |
|---|---|---|
| Texto de un botón | OTA — push a main | ~5 min (al abrir la app) |
| Color institucional | OTA — push a main | ~5 min |
| Bug de cálculo en analytics | OTA — push a main | ~5 min |
| Nueva pantalla con `expo-router` | OTA — push a main | ~5 min |
| Nuevo permiso (cámara, ubicación) | Tag `vX.Y.Z` → Release nuevo | ~15 min build + reinstall |
| Nueva dependencia nativa | Tag `vX.Y.Z` → Release nuevo | ~15 min build + reinstall |
| Bump Expo SDK | Tag `vX.Y.Z` → Release nuevo | ~30 min |
| Cambio de credenciales Supabase | Tag `vX.Y.Z` (env en eas.json) | ~15 min |

Regla simple: **¿el cambio toca JS/JSX y nada más?** → OTA. **¿Toca app.json
o package.json con módulos nativos?** → tag + release.

---

## Troubleshooting

### "El workflow falló con `EXPO_TOKEN not set`"
Falta el secret. Pasos en *Capa 1* arriba.

### "El APK descargado no se instala"
Andora Android bloquea APKs de orígenes desconocidos por defecto.
Ajustes → Aplicaciones → Acceso especial → Instalar apps desconocidas →
elegir Chrome (o desde donde se descargó) → Permitir.

### "El supervisor abrió la app y sigue viendo la versión vieja"
- OTAs llegan al **abrir la app** (no en background). Pedirle que cierre
  y reabra.
- Si pasaron 24h y no actualiza, verificar https://expo.dev/accounts/sitemasdgprstoluca-rgb/projects/supervision-cprs/updates
  que el branch `production` tenga el commit esperado.
- Si el `runtimeVersion` cambió (bump de `version` en `app.json`), el
  OTA viejo no aplica al APK viejo. Necesitan reinstalar el APK nuevo.

### "El build de EAS falla con permisos"
Revisar `app.json`:
- Android: `android.permissions` debe contener solo los necesarios.
- iOS: cada `NSXxxUsageDescription` requerido por `expo-image-picker`
  / `expo-camera` / `expo-media-library` debe estar presente.

### "Vence el link de descarga"
Si compartiste un link de `expo.dev/.../builds/...` se cae a los 30 días.
**Siempre** comparte el link de **GitHub Releases** que es permanente.

---

## Anexo — comandos útiles

```powershell
# Estado del proyecto
cd c:\Users\zarag\Documents\Proyectos_Code\Diapositivas_APP

# Ver últimos commits
git log --oneline -10

# Ver tags publicados (= releases)
git tag --sort=-creatordate | head -5

# Ver el branch de updates de Expo
cd supervision-cprs
eas update:list --branch production

# Forzar OTA manual sin esperar al CI
eas update --branch production --message "manual: descripción"

# Build local para probar (no genera Release)
eas build --platform android --profile preview --local

# Ver builds pasados
eas build:list --limit 5
```
