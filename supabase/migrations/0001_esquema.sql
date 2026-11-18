-- UTP+ Service · 0001 · Esquema, funciones auxiliares y RLS
-- Ejecutar en: Supabase → SQL Editor → New query → Run (en orden: 0001, 0002 y seed.sql).
-- Es seguro volver a ejecutarlo: usa "if not exists" y "create or replace".

create extension if not exists btree_gist with schema extensions;

-- ───────────────────────── Catálogos ─────────────────────────

create table if not exists public.campuses (
  id      text primary key,
  nombre  text not null
);

create table if not exists public.settings (
  clave  text primary key,
  valor  jsonb not null
);

-- Directorio de alumnos (para agregar integrantes por código).
create table if not exists public.students (
  codigo  text primary key,
  nombre  text not null
);

create table if not exists public.spaces (
  id            text primary key,
  campus_id     text not null references public.campuses(id),
  tipo          text not null check (tipo in ('sala_grupal', 'pc', 'cubiculo')),
  nombre        text not null,
  edificio      text not null,
  piso          int  not null,
  capacidad_min int  not null default 1,
  capacidad_max int  not null default 1,
  equipamiento  text[] not null default '{}',
  descripcion   text not null default '',
  activo        boolean not null default true
);

-- ───────────────────────── Alumnos ─────────────────────────

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  codigo          text not null unique,
  nombre          text not null,
  nombre_completo text not null,
  dni             text not null default '',
  carrera         text not null default '',
  modalidad       text not null default 'Presencial',
  sede_default    text references public.campuses(id)
);

-- ───────────────────────── Reservas ─────────────────────────

create sequence if not exists public.reservation_seq start 871;

create table if not exists public.reservations (
  id            uuid primary key default gen_random_uuid(),
  codigo        text not null unique,
  space_id      text not null references public.spaces(id),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  inicio        timestamptz not null,
  fin           timestamptz not null,
  estado        text not null default 'confirmada'
                check (estado in ('confirmada', 'cancelada', 'completada', 'no_show')),
  motivo        text not null default '',
  created_at    timestamptz not null default now(),
  cancelada_en  timestamptz,
  check (fin > inicio),
  -- Impide dobles reservas del mismo espacio en horarios que se cruzan.
  constraint sin_doble_reserva
    exclude using gist (space_id with =, tstzrange(inicio, fin) with &&)
    where (estado = 'confirmada')
);
create index if not exists reservations_user_idx on public.reservations (user_id, inicio);

create table if not exists public.reservation_members (
  reservation_id  uuid not null references public.reservations(id) on delete cascade,
  codigo_alumno   text not null,
  primary key (reservation_id, codigo_alumno)
);

create table if not exists public.penalties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  hasta       timestamptz not null,
  motivo      text not null,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── Grupos de estudio ─────────────────────────

create table if not exists public.groups (
  id             uuid primary key default gen_random_uuid(),
  curso          text not null,
  tema           text not null,
  modalidad      text not null check (modalidad in ('Presencial', 'Virtual')),
  fecha          date not null,
  inicio         time not null,
  fin            time not null,
  lugar          text,
  sede           text,
  enlace         text,
  plataforma     text,
  cupos          int  not null check (cupos between 2 and 8),
  -- Integrantes de ejemplo que no son cuentas de la app.
  miembros_demo  int  not null default 0,
  organizador    uuid references public.profiles(id) on delete cascade,
  periodo        text not null default '2026-2',
  created_at     timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  primary key (group_id, user_id)
);

-- ───────────────────────── Funciones auxiliares ─────────────────────────
-- SECURITY DEFINER evita recursión entre políticas; todas fijan search_path.

create or replace function public.mi_codigo()
returns text language sql stable security definer set search_path = public as $$
  select codigo from public.profiles where id = auth.uid()
$$;

create or replace function public.es_miembro_de_reserva(p_reserva uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.reservation_members
    where reservation_id = p_reserva and codigo_alumno = public.mi_codigo()
  )
$$;

create or replace function public.cfg(p_clave text)
returns int language sql stable security definer set search_path = public as $$
  select (valor #>> '{}')::int from public.settings where clave = p_clave
$$;

-- Al crear un grupo, el organizador queda como integrante.
create or replace function public.grupo_agrega_organizador()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.organizador is not null then
    insert into public.group_members (group_id, user_id) values (new.id, new.organizador)
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists trg_grupo_organizador on public.groups;
create trigger trg_grupo_organizador
  after insert on public.groups
  for each row execute function public.grupo_agrega_organizador();

-- Vista con el conteo de integrantes y si el alumno ya se unió.
create or replace view public.groups_view with (security_invoker = true) as
select
  g.*,
  g.miembros_demo + (select count(*) from public.group_members m where m.group_id = g.id)::int as integrantes,
  exists (select 1 from public.group_members m where m.group_id = g.id and m.user_id = auth.uid()) as es_miembro
from public.groups g;

-- ───────────────────────── RLS (todas las tablas) ─────────────────────────

alter table public.campuses            enable row level security;
alter table public.settings            enable row level security;
alter table public.students            enable row level security;
alter table public.spaces              enable row level security;
alter table public.profiles            enable row level security;
alter table public.reservations        enable row level security;
alter table public.reservation_members enable row level security;
alter table public.penalties           enable row level security;
alter table public.groups              enable row level security;
alter table public.group_members       enable row level security;

-- Catálogos: solo lectura para usuarios autenticados.
drop policy if exists "campuses_leer" on public.campuses;
create policy "campuses_leer" on public.campuses for select to authenticated using (true);
drop policy if exists "settings_leer" on public.settings;
create policy "settings_leer" on public.settings for select to authenticated using (true);
drop policy if exists "students_leer" on public.students;
create policy "students_leer" on public.students for select to authenticated using (true);
drop policy if exists "spaces_leer" on public.spaces;
create policy "spaces_leer" on public.spaces for select to authenticated using (activo);

-- Perfil: cada alumno ve y edita solo el suyo (y solo nombre y DNI).
drop policy if exists "profiles_leer" on public.profiles;
create policy "profiles_leer" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "profiles_editar" on public.profiles;
create policy "profiles_editar" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant update (nombre_completo, dni) on public.profiles to authenticated;

-- Reservas: solo lectura (se crean y cancelan con las funciones de 0002).
drop policy if exists "reservas_leer" on public.reservations;
create policy "reservas_leer" on public.reservations for select to authenticated
  using (user_id = auth.uid() or public.es_miembro_de_reserva(id));

drop policy if exists "miembros_leer" on public.reservation_members;
create policy "miembros_leer" on public.reservation_members for select to authenticated
  using (
    codigo_alumno = public.mi_codigo()
    or exists (select 1 from public.reservations r where r.id = reservation_id and r.user_id = auth.uid())
  );

drop policy if exists "penalidades_leer" on public.penalties;
create policy "penalidades_leer" on public.penalties for select to authenticated using (user_id = auth.uid());

-- Grupos: todos los alumnos los ven; crean y borran solo los suyos; unirse va por función.
drop policy if exists "grupos_leer" on public.groups;
create policy "grupos_leer" on public.groups for select to authenticated using (true);
drop policy if exists "grupos_crear" on public.groups;
create policy "grupos_crear" on public.groups for insert to authenticated with check (organizador = auth.uid());
drop policy if exists "grupos_borrar" on public.groups;
create policy "grupos_borrar" on public.groups for delete to authenticated using (organizador = auth.uid());

drop policy if exists "integrantes_leer" on public.group_members;
create policy "integrantes_leer" on public.group_members for select to authenticated using (true);
drop policy if exists "integrantes_salir" on public.group_members;
create policy "integrantes_salir" on public.group_members for delete to authenticated using (user_id = auth.uid());

-- Los visitantes sin sesión no tocan nada.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
