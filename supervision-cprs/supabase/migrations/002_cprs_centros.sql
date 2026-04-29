-- =====================================================================
-- MIGRATION 002: Catálogo cprs_centros
-- Aplicar UNA SOLA VEZ. Idempotente (IF NOT EXISTS / ON CONFLICT).
-- NO TOCA ninguna tabla del sistema farmacia que coexiste en este schema.
-- =====================================================================

-- 1) Tabla catálogo
create table if not exists public.cprs_centros (
  id             uuid primary key default gen_random_uuid(),
  nombre         text unique not null,
  orden          int default 999,
  activo         boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_cprs_centros_orden
  on public.cprs_centros(orden, nombre);

-- 2) RLS
alter table public.cprs_centros enable row level security;

drop policy if exists "cprs_centros_select_auth"  on public.cprs_centros;
drop policy if exists "cprs_centros_insert_admin" on public.cprs_centros;
drop policy if exists "cprs_centros_update_admin" on public.cprs_centros;
drop policy if exists "cprs_centros_delete_admin" on public.cprs_centros;

create policy "cprs_centros_select_auth"
  on public.cprs_centros for select
  using (auth.uid() is not null);

create policy "cprs_centros_insert_admin"
  on public.cprs_centros for insert
  with check (public.es_admin());

create policy "cprs_centros_update_admin"
  on public.cprs_centros for update
  using (public.es_admin());

create policy "cprs_centros_delete_admin"
  on public.cprs_centros for delete
  using (public.es_admin());

-- 3) Seed: 22 centros oficiales
insert into public.cprs_centros (nombre, orden) values
  ('TENANCINGO SUR', 1),
  ('PENITENCIARÍA MODELO', 2),
  ('OTUMBA TEPACHICO', 3),
  ('LERMA', 4),
  ('TLALNEPANTLA', 5),
  ('CUAUTITLAN', 6),
  ('CHALCO', 7),
  ('ZUMPANGO', 8),
  ('TENANGO DEL VALLE', 9),
  ('JILOTEPEC', 10),
  ('NEZAHUALCOYOTL SUR', 11),
  ('VALLE DE BRAVO', 12),
  ('EL ORO', 13),
  ('SULTEPEC', 14),
  ('NEZAHUALCOYOTL NORTE', 15),
  ('TEXCOCO', 16),
  ('NEZA BORDO', 17),
  ('ECATEPEC', 18),
  ('TENANCINGO CENTRO', 19),
  ('IXTLAHUACA', 20),
  ('Centro de Internamiento para adolescentes "QUINTA DEL BOSQUE"', 21),
  ('SANTIAGUITO', 22)
on conflict (nombre) do nothing;
