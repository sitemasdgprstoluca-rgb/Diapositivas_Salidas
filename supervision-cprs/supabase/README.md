# Supabase — Integración

## 1) Aplicar el esquema

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a **SQL Editor → New query**.
3. Pega el contenido completo de [`schema.sql`](./schema.sql).
4. Click **Run**. Todo es idempotente — puedes correrlo varias veces sin romper nada.

Se crearán:
- 4 tablas: `supervisiones`, `rubros`, `criterios_rubro`, `fotos_rubro`
- Políticas RLS (cada usuario solo ve sus datos)
- Bucket `supervisiones-fotos` (privado, carpetado por user_id)
- Trigger para mantener `fecha_modificacion`

## 2) Configurar variables de entorno

Copia `.env.example` → `.env` en la raíz de `supervision-cprs/` y llena:

```
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Dónde los encuentras: **Supabase Dashboard → Project Settings → API**.
- `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
- `anon public` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

⚠️ El archivo `.env` está en `.gitignore` y **no debe subirse**. La `anon key` es diseñada para ser pública pero aun así mantén el archivo local.

## 3) Instalar dependencias

```bash
cd supervision-cprs
npm install
```

## 4) Verificar que sincroniza

Después de Fase 2 (auth + login), al finalizar una supervisión debería aparecer un registro en:
- **Table Editor → supervisiones**
- **Table Editor → rubros** (15 filas por supervisión)
- **Table Editor → criterios_rubro**

## Notas técnicas

- **Offline-first**: AsyncStorage sigue siendo la fuente de verdad local. Supabase es espejo de respaldo.
- **Sync**: por ahora sólo push. Si tus supervisiones cambian, se re-upsertean al siguiente save.
- **Fotos**: se suben al bucket `supervisiones-fotos` al finalizar la supervisión.
- **RLS**: si ves error `new row violates row-level security policy`, revisa que el usuario esté autenticado con `supabase.auth.getSession()`.
