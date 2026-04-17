-- =====================================================================
-- SUPERVISIÓN C.P.R.S. — Esquema Supabase
-- Aplicar en: Supabase Dashboard → SQL Editor → New query → Run
-- Idempotente: puede ejecutarse varias veces sin romper datos existentes.
-- =====================================================================

-- Extensiones requeridas
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tabla: admins
-- Los usuarios listados aquí pueden ver TODAS las supervisiones en el
-- dashboard web. El resto solo ve las suyas.
-- Para marcar a alguien como admin:
--   insert into public.admins (user_id) values ('xxxxx-uuid-del-user');
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  fecha_creacion timestamptz not null default now(),
  notas          text
);

-- Función helper: ¿es el usuario actual admin?
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Tabla: supervisiones
-- ---------------------------------------------------------------------
create table if not exists public.supervisiones (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  estado                  text not null default 'borrador'
                          check (estado in ('borrador', 'finalizado')),
  nombre_cprs             text,
  fecha_hora_supervision  timestamptz,
  genero_director         text check (genero_director in ('hombre', 'mujer')),
  genero_administrador    text check (genero_administrador in ('hombre', 'mujer')),
  imagen_centro_path      text,
  promedio_general        numeric(4, 2) default 0,
  fecha_creacion          timestamptz not null default now(),
  fecha_modificacion      timestamptz not null default now()
);

create index if not exists idx_supervisiones_user_id
  on public.supervisiones(user_id);
create index if not exists idx_supervisiones_estado
  on public.supervisiones(estado);

-- ---------------------------------------------------------------------
-- Tabla: rubros (15 por supervisión)
-- ---------------------------------------------------------------------
create table if not exists public.rubros (
  id                 uuid primary key default gen_random_uuid(),
  supervision_id     uuid not null references public.supervisiones(id) on delete cascade,
  rubro_catalog_id   text not null,
  nombre             text not null,
  orden              int not null,
  no_aplica          boolean not null default false,
  calificacion       int check (calificacion is null or (calificacion between 1 and 10)),
  observacion        text default '',
  sin_novedad        boolean not null default false,
  fecha_creacion     timestamptz not null default now()
);

create index if not exists idx_rubros_supervision_id
  on public.rubros(supervision_id);

-- ---------------------------------------------------------------------
-- Tabla: criterios_rubro (checklist SÍ/NO)
-- ---------------------------------------------------------------------
create table if not exists public.criterios_rubro (
  id                    uuid primary key default gen_random_uuid(),
  rubro_id              uuid not null references public.rubros(id) on delete cascade,
  criterio_catalog_id   text not null,
  texto                 text not null,
  cumple                boolean,  -- null = sin responder
  orden                 int default 0
);

create index if not exists idx_criterios_rubro_id
  on public.criterios_rubro(rubro_id);

-- ---------------------------------------------------------------------
-- Tabla: fotos_rubro
-- ---------------------------------------------------------------------
create table if not exists public.fotos_rubro (
  id              uuid primary key default gen_random_uuid(),
  rubro_id        uuid not null references public.rubros(id) on delete cascade,
  storage_path    text not null,
  orden           int default 0,
  fecha_creacion  timestamptz not null default now()
);

create index if not exists idx_fotos_rubro_id
  on public.fotos_rubro(rubro_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Cada usuario solo puede ver/modificar sus propias supervisiones.
-- =====================================================================

alter table public.admins          enable row level security;
alter table public.supervisiones   enable row level security;
alter table public.rubros          enable row level security;
alter table public.criterios_rubro enable row level security;
alter table public.fotos_rubro     enable row level security;

-- admins: solo admins pueden ver/editar la tabla admins
drop policy if exists "admins_select_solo_admin" on public.admins;
drop policy if exists "admins_insert_solo_admin" on public.admins;
drop policy if exists "admins_update_solo_admin" on public.admins;
drop policy if exists "admins_delete_solo_admin" on public.admins;

create policy "admins_select_solo_admin"
  on public.admins for select
  using (public.es_admin());

create policy "admins_insert_solo_admin"
  on public.admins for insert
  with check (public.es_admin());

create policy "admins_update_solo_admin"
  on public.admins for update
  using (public.es_admin())
  with check (public.es_admin());

create policy "admins_delete_solo_admin"
  on public.admins for delete
  using (public.es_admin());

-- supervisiones: el user_id debe coincidir con el usuario autenticado
drop policy if exists "supervisiones_select_propias"   on public.supervisiones;
drop policy if exists "supervisiones_insert_propias"   on public.supervisiones;
drop policy if exists "supervisiones_update_propias"   on public.supervisiones;
drop policy if exists "supervisiones_delete_propias"   on public.supervisiones;

create policy "supervisiones_select_propias"
  on public.supervisiones for select
  using (auth.uid() = user_id or public.es_admin());

create policy "supervisiones_insert_propias"
  on public.supervisiones for insert
  with check (auth.uid() = user_id);

create policy "supervisiones_update_propias"
  on public.supervisiones for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "supervisiones_delete_propias"
  on public.supervisiones for delete
  using (auth.uid() = user_id);

-- rubros: heredan de supervisiones
drop policy if exists "rubros_select_propios" on public.rubros;
drop policy if exists "rubros_insert_propios" on public.rubros;
drop policy if exists "rubros_update_propios" on public.rubros;
drop policy if exists "rubros_delete_propios" on public.rubros;

create policy "rubros_select_propios"
  on public.rubros for select
  using (
    public.es_admin() or exists (
      select 1 from public.supervisiones s
      where s.id = rubros.supervision_id and s.user_id = auth.uid()
    )
  );

create policy "rubros_insert_propios"
  on public.rubros for insert
  with check (exists (
    select 1 from public.supervisiones s
    where s.id = rubros.supervision_id and s.user_id = auth.uid()
  ));

create policy "rubros_update_propios"
  on public.rubros for update
  using (exists (
    select 1 from public.supervisiones s
    where s.id = rubros.supervision_id and s.user_id = auth.uid()
  ));

create policy "rubros_delete_propios"
  on public.rubros for delete
  using (exists (
    select 1 from public.supervisiones s
    where s.id = rubros.supervision_id and s.user_id = auth.uid()
  ));

-- criterios_rubro: heredan de rubros → supervisiones
drop policy if exists "criterios_select_propios" on public.criterios_rubro;
drop policy if exists "criterios_insert_propios" on public.criterios_rubro;
drop policy if exists "criterios_update_propios" on public.criterios_rubro;
drop policy if exists "criterios_delete_propios" on public.criterios_rubro;

create policy "criterios_select_propios"
  on public.criterios_rubro for select
  using (
    public.es_admin() or exists (
      select 1 from public.rubros r
      join public.supervisiones s on s.id = r.supervision_id
      where r.id = criterios_rubro.rubro_id and s.user_id = auth.uid()
    )
  );

create policy "criterios_insert_propios"
  on public.criterios_rubro for insert
  with check (exists (
    select 1 from public.rubros r
    join public.supervisiones s on s.id = r.supervision_id
    where r.id = criterios_rubro.rubro_id and s.user_id = auth.uid()
  ));

create policy "criterios_update_propios"
  on public.criterios_rubro for update
  using (exists (
    select 1 from public.rubros r
    join public.supervisiones s on s.id = r.supervision_id
    where r.id = criterios_rubro.rubro_id and s.user_id = auth.uid()
  ));

create policy "criterios_delete_propios"
  on public.criterios_rubro for delete
  using (exists (
    select 1 from public.rubros r
    join public.supervisiones s on s.id = r.supervision_id
    where r.id = criterios_rubro.rubro_id and s.user_id = auth.uid()
  ));

-- fotos_rubro: heredan de rubros → supervisiones
drop policy if exists "fotos_select_propias" on public.fotos_rubro;
drop policy if exists "fotos_insert_propias" on public.fotos_rubro;
drop policy if exists "fotos_update_propias" on public.fotos_rubro;
drop policy if exists "fotos_delete_propias" on public.fotos_rubro;

create policy "fotos_select_propias"
  on public.fotos_rubro for select
  using (
    public.es_admin() or exists (
      select 1 from public.rubros r
      join public.supervisiones s on s.id = r.supervision_id
      where r.id = fotos_rubro.rubro_id and s.user_id = auth.uid()
    )
  );

create policy "fotos_insert_propias"
  on public.fotos_rubro for insert
  with check (exists (
    select 1 from public.rubros r
    join public.supervisiones s on s.id = r.supervision_id
    where r.id = fotos_rubro.rubro_id and s.user_id = auth.uid()
  ));

create policy "fotos_update_propias"
  on public.fotos_rubro for update
  using (exists (
    select 1 from public.rubros r
    join public.supervisiones s on s.id = r.supervision_id
    where r.id = fotos_rubro.rubro_id and s.user_id = auth.uid()
  ));

create policy "fotos_delete_propias"
  on public.fotos_rubro for delete
  using (exists (
    select 1 from public.rubros r
    join public.supervisiones s on s.id = r.supervision_id
    where r.id = fotos_rubro.rubro_id and s.user_id = auth.uid()
  ));

-- =====================================================================
-- STORAGE BUCKET para fotos
-- =====================================================================
-- Bucket privado: cada usuario sube a una carpeta con su UID.
-- Path esperado: {user_id}/{supervision_id}/{rubro_id}/{uuid}.jpg

insert into storage.buckets (id, name, public)
values ('supervisiones-fotos', 'supervisiones-fotos', false)
on conflict (id) do nothing;

-- Políticas del bucket
drop policy if exists "fotos_storage_select" on storage.objects;
drop policy if exists "fotos_storage_insert" on storage.objects;
drop policy if exists "fotos_storage_update" on storage.objects;
drop policy if exists "fotos_storage_delete" on storage.objects;

create policy "fotos_storage_select"
  on storage.objects for select
  using (
    bucket_id = 'supervisiones-fotos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.es_admin()
    )
  );

create policy "fotos_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'supervisiones-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "fotos_storage_update"
  on storage.objects for update
  using (
    bucket_id = 'supervisiones-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "fotos_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'supervisiones-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- TRIGGER: mantener fecha_modificacion actualizada
-- =====================================================================

create or replace function public.touch_fecha_modificacion()
returns trigger language plpgsql as $$
begin
  new.fecha_modificacion = now();
  return new;
end;
$$;

drop trigger if exists trg_supervisiones_touch on public.supervisiones;
create trigger trg_supervisiones_touch
  before update on public.supervisiones
  for each row execute function public.touch_fecha_modificacion();
