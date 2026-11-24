-- UTP+ Service · ESQUEMA COMPLETO de la base de datos (Supabase)
-- Ejecutar una vez en: Supabase → SQL Editor → New query → Run. Después, ejecutar seed.sql.
-- Se puede repetir sin problema (usa "if not exists" y "create or replace"): sirve también para
-- actualizar una base que ya tenía versiones anteriores.
--
-- Contenido (en este orden): 
--   1. Esquema base, funciones auxiliares y RLS
--   2. Reglas de reserva y de grupos como funciones
--   3. Lecturas que usa la app (mis reservas, ocupación, vista de grupos)
--   4. Ciclo, cursos, matrícula y avance de malla
--   5. Contenido de los cursos y estado del alumno
--   6. Anuncios del campus y asistencia a las actividades
--   7. Registro de conversaciones del asistente
--   8. Centro de notificaciones y avisos automáticos
--   9. El perfil pasa a ser de solo lectura
--   10. Catálogo de trámites, solicitudes y su historial
--   11. Programas, ofertas y postulaciones
--   12. Detalle de programas y postulaciones a programas
--   13. Talleres, grupos, horarios e inscripciones


-- ════════════════════════════════════════════════════════════════════════════
-- 0001 · Esquema base, funciones auxiliares y RLS
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- 0002 · Reglas de reserva y de grupos como funciones
-- ════════════════════════════════════════════════════════════════════════════

-- Cada función corre con los permisos del alumno que la llama (auth.uid()) y valida todo en servidor.

-- ───────────────────────── Disponibilidad ─────────────────────────
-- Devuelve solo las franjas ocupadas (sin datos de quién reservó).
create or replace function public.ocupacion(p_fecha date, p_space_id text default null)
returns table (space_id text, inicio timestamptz, fin timestamptz)
language sql stable security definer set search_path = public as $$
  select r.space_id, r.inicio, r.fin
  from public.reservations r
  where r.estado = 'confirmada'
    and r.inicio >= (p_fecha::timestamp at time zone 'America/Lima')
    and r.inicio <  ((p_fecha + 1)::timestamp at time zone 'America/Lima')
    and (p_space_id is null or r.space_id = p_space_id)
$$;

-- ───────────────────────── Crear reserva ─────────────────────────
create or replace function public.crear_reserva(
  p_space_id text,
  p_fecha    date,
  p_inicio   time,
  p_fin      time,
  p_motivo   text,
  p_miembros text[]
) returns public.reservations
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_codigo  text;
  v_space   public.spaces%rowtype;
  v_ini     timestamptz;
  v_fin     timestamptz;
  v_ahora   timestamptz := now();
  v_hoy     date := (now() at time zone 'America/Lima')::date;
  v_miembros text[];
  v_res     public.reservations%rowtype;
  m         text;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001', hint = 'auth';
  end if;
  v_codigo := public.mi_codigo();

  select * into v_space from public.spaces where id = p_space_id and activo;
  if not found then
    raise exception 'El espacio no existe.' using errcode = 'P0001', hint = 'invalid';
  end if;

  -- Penalidad vigente
  if exists (select 1 from public.penalties where user_id = v_uid and hasta > v_ahora) then
    raise exception 'Tienes una penalidad activa y no puedes reservar por ahora.'
      using errcode = 'P0001', hint = 'penalty';
  end if;

  v_ini := (p_fecha + p_inicio) at time zone 'America/Lima';
  v_fin := (p_fecha + p_fin)    at time zone 'America/Lima';

  if not (v_fin > v_ini) then
    raise exception 'El horario elegido no es válido.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if extract(epoch from (v_fin - v_ini)) / 3600 > public.cfg('maxHours') then
    raise exception 'Cada reserva dura como máximo % horas.', public.cfg('maxHours')
      using errcode = 'P0001', hint = 'duration';
  end if;
  if p_fecha < v_hoy or p_fecha > v_hoy + public.cfg('bookingWindowDays') then
    raise exception 'Solo puedes reservar hasta % días por adelantado.', public.cfg('bookingWindowDays')
      using errcode = 'P0001', hint = 'invalid';
  end if;
  if v_space.tipo = 'sala_grupal' and extract(dow from p_fecha) = 6 then
    raise exception 'Ese día este tipo de espacio no está habilitado.' using errcode = 'P0001', hint = 'closed';
  end if;
  if p_inicio < make_time(public.cfg('openHour'), 0, 0) or p_fin > make_time(public.cfg('closeHour'), 0, 0) then
    raise exception 'El horario está fuera de la atención de la biblioteca.' using errcode = 'P0001', hint = 'closed';
  end if;
  if v_ini <= v_ahora then
    raise exception 'Ese horario ya pasó. Elige uno posterior.' using errcode = 'P0001', hint = 'past';
  end if;

  -- Una reserva activa por tipo de espacio
  if exists (
    select 1 from public.reservations r join public.spaces s on s.id = r.space_id
    where r.user_id = v_uid and r.estado = 'confirmada' and r.fin > v_ahora and s.tipo = v_space.tipo
  ) then
    raise exception 'Ya tienes una reserva activa de este tipo de espacio. Cancélala o espera a que termine.'
      using errcode = 'P0001', hint = 'active_exists';
  end if;

  -- Integrantes (solo salas grupales)
  select coalesce(array_agg(distinct upper(trim(x))), '{}') into v_miembros from unnest(coalesce(p_miembros, '{}')) x;
  if v_space.tipo = 'sala_grupal' then
    if cardinality(v_miembros) < public.cfg('minMembers') then
      raise exception 'La sala requiere mínimo % integrantes.', public.cfg('minMembers')
        using errcode = 'P0001', hint = 'members';
    end if;
    if cardinality(v_miembros) > v_space.capacidad_max then
      raise exception 'Esta sala admite hasta % personas.', v_space.capacidad_max
        using errcode = 'P0001', hint = 'members';
    end if;
    if not (upper(v_codigo) = any (v_miembros)) then
      raise exception 'El organizador debe estar incluido en la lista.' using errcode = 'P0001', hint = 'members';
    end if;
    foreach m in array v_miembros loop
      if not exists (select 1 from public.students where upper(codigo) = m) then
        raise exception 'El código % no corresponde a un alumno.', m using errcode = 'P0001', hint = 'members';
      end if;
    end loop;
  else
    v_miembros := array[upper(v_codigo)];
  end if;

  begin
    insert into public.reservations (codigo, space_id, user_id, inicio, fin, motivo)
    values (
      'RES-' || to_char(v_hoy, 'YYYY') || '-' || lpad(nextval('public.reservation_seq')::text, 4, '0'),
      p_space_id, v_uid, v_ini, v_fin, coalesce(p_motivo, '')
    )
    returning * into v_res;
  exception when exclusion_violation then
    raise exception 'Ese horario se ocupó mientras reservabas.' using errcode = 'P0001', hint = 'conflict';
  end;

  insert into public.reservation_members (reservation_id, codigo_alumno)
  select v_res.id, unnest(v_miembros);

  return v_res;
end $$;

-- ───────────────────────── Cancelar reserva ─────────────────────────
-- Devuelve true si la cancelación fue sin penalidad.
create or replace function public.cancelar_reserva(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_res  public.reservations%rowtype;
  v_free boolean;
begin
  select * into v_res from public.reservations where id = p_id and user_id = v_uid for update;
  if not found then
    raise exception 'No encontramos esa reserva.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if v_res.estado <> 'confirmada' or v_res.fin <= now() then
    raise exception 'Esa reserva ya no se puede cancelar.' using errcode = 'P0001', hint = 'invalid';
  end if;

  v_free := (v_res.inicio - now()) >= make_interval(mins => public.cfg('freeCancelMinutes'));

  update public.reservations set estado = 'cancelada', cancelada_en = now() where id = p_id;

  if not v_free then
    insert into public.penalties (user_id, hasta, motivo)
    values (v_uid, now() + make_interval(days => public.cfg('penaltyDays')), 'Cancelación con menos de 1 hora de anticipación');
  end if;
  return v_free;
end $$;

-- ───────────────────────── Grupos de estudio ─────────────────────────
create or replace function public.unirse_grupo(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  g     public.groups%rowtype;
  n     int;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.' using errcode = 'P0001'; end if;
  select * into g from public.groups where id = p_id for update;
  if not found then raise exception 'No encontramos ese grupo.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.group_members where group_id = p_id and user_id = v_uid) then
    return;
  end if;
  select g.miembros_demo + count(*) into n from public.group_members where group_id = p_id;
  if n >= g.cupos then raise exception 'El grupo ya está completo.' using errcode = 'P0001', hint = 'full'; end if;
  insert into public.group_members (group_id, user_id) values (p_id, v_uid);
end $$;

-- ───────────────────────── Permisos de ejecución ─────────────────────────
revoke execute on function public.ocupacion(date, text)                              from public, anon;
revoke execute on function public.crear_reserva(text, date, time, time, text, text[]) from public, anon;
revoke execute on function public.cancelar_reserva(uuid)                             from public, anon;
revoke execute on function public.unirse_grupo(uuid)                                 from public, anon;
revoke execute on function public.mi_codigo()                                        from public, anon;
revoke execute on function public.es_miembro_de_reserva(uuid)                        from public, anon;
revoke execute on function public.cfg(text)                                          from public, anon;
grant execute on function public.ocupacion(date, text)                              to authenticated;
grant execute on function public.crear_reserva(text, date, time, time, text, text[]) to authenticated;
grant execute on function public.cancelar_reserva(uuid)                             to authenticated;
grant execute on function public.unirse_grupo(uuid)                                 to authenticated;
grant execute on function public.mi_codigo()                                        to authenticated;
grant execute on function public.es_miembro_de_reserva(uuid)                        to authenticated;
grant execute on function public.cfg(text)                                          to authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- 0003 · Lecturas que usa la app (mis reservas, ocupación, vista de grupos)
-- ════════════════════════════════════════════════════════════════════════════

-- Grupos: agrega si el alumno es el organizador.
create or replace view public.groups_view with (security_invoker = true) as
select
  g.*,
  g.miembros_demo + (select count(*) from public.group_members m where m.group_id = g.id)::int as integrantes,
  exists (select 1 from public.group_members m where m.group_id = g.id and m.user_id = auth.uid()) as es_miembro,
  (g.organizador = auth.uid()) as es_organizador
from public.groups g;

-- Reservas del alumno (propias o donde figura como integrante), con fecha y hora de Lima.
create or replace function public.mis_reservas()
returns table (
  id uuid, codigo text, space_id text, organizador text, fecha date, inicio text, fin text,
  motivo text, miembros text[], estado text, creada_en timestamptz, cancelada_en timestamptz
)
language sql stable security definer set search_path = public as $$
  select
    r.id, r.codigo, r.space_id, p.codigo,
    (r.inicio at time zone 'America/Lima')::date,
    to_char(r.inicio at time zone 'America/Lima', 'HH24:MI'),
    to_char(r.fin    at time zone 'America/Lima', 'HH24:MI'),
    r.motivo,
    coalesce((select array_agg(m.codigo_alumno order by m.codigo_alumno)
              from public.reservation_members m where m.reservation_id = r.id), '{}'),
    r.estado, r.created_at, r.cancelada_en
  from public.reservations r
  join public.profiles p on p.id = r.user_id
  where r.user_id = auth.uid() or public.es_miembro_de_reserva(r.id)
  order by r.inicio
$$;

-- Franjas ocupadas por cualquier alumno en un rango de fechas (sin datos personales).
create or replace function public.ocupacion_rango(p_desde date, p_hasta date)
returns table (id uuid, space_id text, fecha date, inicio text, fin text)
language sql stable security definer set search_path = public as $$
  select
    r.id, r.space_id,
    (r.inicio at time zone 'America/Lima')::date,
    to_char(r.inicio at time zone 'America/Lima', 'HH24:MI'),
    to_char(r.fin    at time zone 'America/Lima', 'HH24:MI')
  from public.reservations r
  where r.estado = 'confirmada'
    and r.inicio >= (p_desde::timestamp at time zone 'America/Lima')
    and r.inicio <  ((p_hasta + 1)::timestamp at time zone 'America/Lima')
$$;

revoke execute on function public.mis_reservas()                 from public, anon;
revoke execute on function public.ocupacion_rango(date, date)    from public, anon;
grant  execute on function public.mis_reservas()                 to authenticated;
grant  execute on function public.ocupacion_rango(date, date)    to authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- 0004 · Ciclo, cursos, matrícula y avance de malla
-- ════════════════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists plan_codigo text not null default '';

-- Ciclo académico
create table if not exists public.terms (
  id             text primary key,            -- '2026-2'
  nombre         text not null,               -- 'Ciclo 2026-2'
  estado         text not null,               -- 'En curso'
  semana_actual  int  not null,
  semanas_total  int  not null,
  inicio         date not null,
  fin            date not null
);

-- Catálogo de cursos
create table if not exists public.courses (
  id        text primary key,                 -- 'ihm'
  nombre    text not null,
  docente   text not null,
  creditos  int  not null,
  modalidad text not null check (modalidad in ('Presencial', 'Virtual'))
);

-- Qué alumno lleva qué curso en cada ciclo
create table if not exists public.enrollments (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  course_id  text not null references public.courses(id),
  term_id    text not null references public.terms(id),
  orden      int  not null default 0,
  primary key (user_id, course_id, term_id)
);

-- Avance de malla curricular por alumno (tres grupos de tres cifras)
create table if not exists public.progress_stats (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  grupo     text not null,
  orden     int  not null,
  etiqueta  text not null,
  valor     numeric not null,
  decimales int  not null default 0,
  primary key (user_id, grupo, orden)
);

alter table public.terms          enable row level security;
alter table public.courses        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.progress_stats enable row level security;

drop policy if exists "terms_leer" on public.terms;
create policy "terms_leer" on public.terms for select to authenticated using (true);
drop policy if exists "courses_leer" on public.courses;
create policy "courses_leer" on public.courses for select to authenticated using (true);
drop policy if exists "enrollments_leer" on public.enrollments;
create policy "enrollments_leer" on public.enrollments for select to authenticated using (user_id = auth.uid());
drop policy if exists "progress_leer" on public.progress_stats;
create policy "progress_leer" on public.progress_stats for select to authenticated using (user_id = auth.uid());

revoke all on public.terms, public.courses, public.enrollments, public.progress_stats from anon;


-- ════════════════════════════════════════════════════════════════════════════
-- 0005 · Contenido de los cursos y estado del alumno
-- ════════════════════════════════════════════════════════════════════════════

-- Catálogo (igual para todos): detalles, materiales, evaluaciones, tareas, foros y anuncios.
-- Por alumno: materiales vistos, entregas, notas y anuncios leídos.

-- ───────────────────────── Catálogo ─────────────────────────

create table if not exists public.course_details (
  course_id       text primary key references public.courses(id) on delete cascade,
  codigo          text not null,
  horas           int  not null,
  sumilla         text not null,
  logro           text not null,
  metodologia     text not null,
  proyecto        text not null,
  -- 16 temas: semanas 1-8 y 10-17 (la 9 es el parcial y la 18 el final).
  temas           text[] not null,
  bib_base        text[] not null default '{}',
  bib_comp        text[] not null default '{}',
  -- [{ "dow": 2, "inicio": "10:30", "fin": "12:00", "tipo": "Clase virtual" }], dow 0 = domingo
  zoom_sesiones   jsonb  not null default '[]',
  zoom_meeting_id text not null,
  zoom_passcode   text not null,
  zoom_url        text not null
);

create table if not exists public.course_materials (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  semana    int  not null,
  orden     int  not null default 0,
  tipo      text not null check (tipo in ('Presentación', 'Lectura', 'Video')),
  titulo    text not null,
  detalle   text not null
);
create index if not exists course_materials_curso_idx on public.course_materials (course_id, semana);

create table if not exists public.course_evaluations (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  clave     text not null,
  orden     int  not null default 0,
  nombre    text not null,
  semana    int  not null,
  peso      int  not null check (peso between 0 and 100)
);
create index if not exists course_evaluations_curso_idx on public.course_evaluations (course_id);

create table if not exists public.course_tasks (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  titulo    text not null,
  semana    int  not null
);
create index if not exists course_tasks_curso_idx on public.course_tasks (course_id);

create table if not exists public.course_threads (
  id          text primary key,
  course_id   text not null references public.courses(id) on delete cascade,
  semana      int,
  titulo      text not null,
  tipo        text not null check (tipo in ('calificado', 'no_calificado')),
  descripcion text not null
);
create index if not exists course_threads_curso_idx on public.course_threads (course_id);

create table if not exists public.forum_posts (
  id          text primary key default ('p-' || gen_random_uuid()::text),
  thread_id   text not null references public.course_threads(id) on delete cascade,
  -- Nulo en las publicaciones de ejemplo (docente y compañeros).
  user_id     uuid references public.profiles(id) on delete set null,
  autor       text not null,
  rol         text not null check (rol in ('Docente', 'Estudiante')),
  texto       text not null check (char_length(texto) between 1 and 1000),
  cuando_demo text,
  parent_id   text references public.forum_posts(id) on delete cascade,
  orden       int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists forum_posts_thread_idx on public.forum_posts (thread_id, orden, created_at);

create table if not exists public.announcements (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  titulo    text not null,
  texto     text not null,
  -- La fecha es relativa para que la demo siempre esté vigente:
  -- "hace_dias" días antes de hoy, o el día "dia" de la semana "semana" del curso.
  hace_dias int,
  semana    int,
  dia       int,
  nuevo     boolean not null default false,
  orden     int not null default 0
);
create index if not exists announcements_curso_idx on public.announcements (course_id);

-- ───────────────────────── Estado del alumno ─────────────────────────

create table if not exists public.material_progress (
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id   text not null references public.courses(id) on delete cascade,
  material_id text not null references public.course_materials(id) on delete cascade,
  primary key (user_id, material_id)
);

create table if not exists public.task_submissions (
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id    text not null references public.courses(id) on delete cascade,
  task_id      text not null references public.course_tasks(id) on delete cascade,
  archivo      text not null check (char_length(archivo) between 1 and 200),
  entregada_en timestamptz not null default now(),
  -- La nota la pone el docente: el alumno no puede escribirla.
  nota         int check (nota between 0 and 20),
  primary key (user_id, task_id)
);

create table if not exists public.evaluation_grades (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  course_id     text not null references public.courses(id) on delete cascade,
  evaluation_id text not null references public.course_evaluations(id) on delete cascade,
  nota          int not null check (nota between 0 and 20),
  primary key (user_id, evaluation_id)
);

create table if not exists public.announcement_reads (
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id       text not null references public.courses(id) on delete cascade,
  announcement_id text not null references public.announcements(id) on delete cascade,
  primary key (user_id, announcement_id)
);

-- ───────────────────────── RLS ─────────────────────────

alter table public.course_details     enable row level security;
alter table public.course_materials   enable row level security;
alter table public.course_evaluations enable row level security;
alter table public.course_tasks       enable row level security;
alter table public.course_threads     enable row level security;
alter table public.forum_posts        enable row level security;
alter table public.announcements      enable row level security;
alter table public.material_progress  enable row level security;
alter table public.task_submissions   enable row level security;
alter table public.evaluation_grades  enable row level security;
alter table public.announcement_reads enable row level security;

-- Catálogo: lectura para alumnos autenticados.
drop policy if exists "detalles_leer" on public.course_details;
create policy "detalles_leer" on public.course_details for select to authenticated using (true);
drop policy if exists "materiales_leer" on public.course_materials;
create policy "materiales_leer" on public.course_materials for select to authenticated using (true);
drop policy if exists "evaluaciones_leer" on public.course_evaluations;
create policy "evaluaciones_leer" on public.course_evaluations for select to authenticated using (true);
drop policy if exists "tareas_leer" on public.course_tasks;
create policy "tareas_leer" on public.course_tasks for select to authenticated using (true);
drop policy if exists "foros_leer" on public.course_threads;
create policy "foros_leer" on public.course_threads for select to authenticated using (true);
drop policy if exists "publicaciones_leer" on public.forum_posts;
create policy "publicaciones_leer" on public.forum_posts for select to authenticated using (true);
drop policy if exists "anuncios_leer" on public.announcements;
create policy "anuncios_leer" on public.announcements for select to authenticated using (true);

-- Estado propio.
drop policy if exists "progreso_leer" on public.material_progress;
create policy "progreso_leer" on public.material_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists "progreso_marcar" on public.material_progress;
create policy "progreso_marcar" on public.material_progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "progreso_desmarcar" on public.material_progress;
create policy "progreso_desmarcar" on public.material_progress for delete to authenticated using (user_id = auth.uid());

drop policy if exists "entregas_leer" on public.task_submissions;
create policy "entregas_leer" on public.task_submissions for select to authenticated using (user_id = auth.uid());
drop policy if exists "entregas_crear" on public.task_submissions;
create policy "entregas_crear" on public.task_submissions for insert to authenticated
  with check (user_id = auth.uid() and nota is null);

drop policy if exists "notas_leer" on public.evaluation_grades;
create policy "notas_leer" on public.evaluation_grades for select to authenticated using (user_id = auth.uid());

drop policy if exists "lecturas_leer" on public.announcement_reads;
create policy "lecturas_leer" on public.announcement_reads for select to authenticated using (user_id = auth.uid());
drop policy if exists "lecturas_crear" on public.announcement_reads;
create policy "lecturas_crear" on public.announcement_reads for insert to authenticated with check (user_id = auth.uid());

-- ───────────────────────── Publicar en un foro ─────────────────────────
-- El autor sale del directorio de alumnos, no del cliente: nadie puede firmar como otra persona.
create or replace function public.publicar_comentario(p_thread text, p_texto text, p_parent text default null)
returns public.forum_posts
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_codigo text;
  v_autor  text;
  v_post   public.forum_posts%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.' using errcode = 'P0001'; end if;
  p_texto := btrim(coalesce(p_texto, ''));
  if char_length(p_texto) < 2 or char_length(p_texto) > 1000 then
    raise exception 'El comentario debe tener entre 2 y 1000 caracteres.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.course_threads where id = p_thread) then
    raise exception 'No encontramos ese foro.' using errcode = 'P0001';
  end if;
  if p_parent is not null and not exists (select 1 from public.forum_posts where id = p_parent and thread_id = p_thread) then
    raise exception 'No encontramos el comentario al que respondes.' using errcode = 'P0001';
  end if;

  select codigo into v_codigo from public.profiles where id = v_uid;
  select coalesce(s.nombre, p.nombre) into v_autor
  from public.profiles p left join public.students s on s.codigo = p.codigo
  where p.id = v_uid;

  insert into public.forum_posts (thread_id, user_id, autor, rol, texto, parent_id, orden)
  values (p_thread, v_uid, v_autor, 'Estudiante', p_texto, p_parent, 1000)
  returning * into v_post;
  return v_post;
end $$;

revoke execute on function public.publicar_comentario(text, text, text) from public, anon;
grant  execute on function public.publicar_comentario(text, text, text) to authenticated;

revoke all on public.course_details, public.course_materials, public.course_evaluations, public.course_tasks,
  public.course_threads, public.forum_posts, public.announcements, public.material_progress,
  public.task_submissions, public.evaluation_grades, public.announcement_reads from anon;


-- ════════════════════════════════════════════════════════════════════════════
-- 0006 · Anuncios del campus y asistencia a las actividades
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.campus_announcements (
  id           text primary key,
  categoria    text not null check (categoria in ('salud', 'cultura', 'academico', 'deporte', 'empleabilidad')),
  titulo       text not null,
  resumen      text not null,
  descripcion  text not null,
  lugar        text not null,
  sede         text not null,
  fecha        date not null,
  hora_inicio  time not null,
  hora_fin     time not null,
  -- Nulo: entrada libre, sin límite de asistentes.
  cupos        int check (cupos is null or cupos > 0),
  destacado    boolean not null default false,
  publicado_en timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);
create index if not exists campus_announcements_fecha_idx on public.campus_announcements (fecha, hora_inicio);

-- Quién asistirá a cada actividad.
create table if not exists public.announcement_rsvps (
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  announcement_id text not null references public.campus_announcements(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

alter table public.campus_announcements enable row level security;
alter table public.announcement_rsvps   enable row level security;

drop policy if exists "anuncios_campus_leer" on public.campus_announcements;
create policy "anuncios_campus_leer" on public.campus_announcements for select to authenticated using (true);

-- Cada alumno ve solo su propia asistencia; el total sale de la vista (solo cifras, sin nombres).
drop policy if exists "asistencias_leer" on public.announcement_rsvps;
create policy "asistencias_leer" on public.announcement_rsvps for select to authenticated using (user_id = auth.uid());

-- Anuncios con el total de asistentes y si el alumno ya confirmó. La vista corre con permisos del dueño
-- (sin security_invoker) para poder contar las asistencias de todos sin exponer quién es quién.
create or replace view public.campus_announcements_view as
select
  a.*,
  (select count(*) from public.announcement_rsvps r where r.announcement_id = a.id)::int as asistentes,
  exists (select 1 from public.announcement_rsvps r where r.announcement_id = a.id and r.user_id = auth.uid()) as asistire
from public.campus_announcements a;

-- Confirma o cancela la asistencia validando fecha y cupos en el servidor.
create or replace function public.asistir_anuncio(p_id text, p_asistir boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  a     public.campus_announcements%rowtype;
  n     int;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.' using errcode = 'P0001'; end if;

  select * into a from public.campus_announcements where id = p_id for update;
  if not found then raise exception 'No encontramos esta actividad.' using errcode = 'P0001', hint = 'invalid'; end if;

  if not p_asistir then
    delete from public.announcement_rsvps where user_id = v_uid and announcement_id = p_id;
    return;
  end if;

  if a.fecha < (now() at time zone 'America/Lima')::date then
    raise exception 'Esta actividad ya terminó.' using errcode = 'P0001', hint = 'past';
  end if;
  if exists (select 1 from public.announcement_rsvps where user_id = v_uid and announcement_id = p_id) then
    return;
  end if;
  if a.cupos is not null then
    select count(*) into n from public.announcement_rsvps where announcement_id = p_id;
    if n >= a.cupos then raise exception 'Ya no quedan cupos.' using errcode = 'P0001', hint = 'full'; end if;
  end if;

  insert into public.announcement_rsvps (user_id, announcement_id) values (v_uid, p_id);
end $$;

revoke all on public.campus_announcements, public.announcement_rsvps, public.campus_announcements_view from anon;
grant select on public.campus_announcements_view to authenticated;
revoke execute on function public.asistir_anuncio(text, boolean) from public, anon;
grant  execute on function public.asistir_anuncio(text, boolean) to authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- 0007 · Registro de conversaciones del asistente
-- ════════════════════════════════════════════════════════════════════════════

-- Sirve de evidencia para las pruebas de usabilidad y para limitar el uso por alumno.

create table if not exists public.agent_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  canal         text not null default 'texto' check (canal in ('texto', 'voz')),
  mensaje       text not null,
  respuesta     text,
  herramientas  jsonb not null default '[]',
  propuesta     text,
  latencia_ms   int,
  error         text,
  created_at    timestamptz not null default now()
);
create index if not exists agent_logs_user_idx on public.agent_logs (user_id, created_at desc);

alter table public.agent_logs enable row level security;

drop policy if exists "agent_logs_leer" on public.agent_logs;
create policy "agent_logs_leer" on public.agent_logs for select to authenticated using (user_id = auth.uid());
drop policy if exists "agent_logs_crear" on public.agent_logs;
create policy "agent_logs_crear" on public.agent_logs for insert to authenticated with check (user_id = auth.uid());

revoke all on public.agent_logs from anon;


-- ════════════════════════════════════════════════════════════════════════════
-- 0008 · Centro de notificaciones y avisos automáticos
-- ════════════════════════════════════════════════════════════════════════════

-- Las notificaciones se crean solas cuando el alumno hace algo (reserva, grupo, asistencia) y desde el seed de ejemplo.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tipo        text not null check (tipo in ('reserva', 'tarea', 'nota', 'anuncio', 'grupo', 'sistema')),
  titulo      text not null,
  cuerpo      text not null default '',
  -- Pantalla de la app a la que lleva al tocarla (por ejemplo /reservas/mis).
  ruta        text,
  leida       boolean not null default false,
  -- Identifica las de ejemplo para poder renovarlas sin duplicar.
  clave       text,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create unique index if not exists notifications_clave_idx on public.notifications (user_id, clave) where clave is not null;

alter table public.notifications enable row level security;

drop policy if exists "notif_leer" on public.notifications;
create policy "notif_leer" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "notif_marcar" on public.notifications;
create policy "notif_marcar" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notif_borrar" on public.notifications;
create policy "notif_borrar" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- El alumno solo puede marcar como leída; el contenido lo escribe el servidor.
revoke all on public.notifications from anon;
revoke update on public.notifications from authenticated;
grant update (leida) on public.notifications to authenticated;
revoke insert on public.notifications from authenticated;

-- ───────────────────────── Avisos automáticos ─────────────────────────

create or replace function public.notificar(p_user uuid, p_tipo text, p_titulo text, p_cuerpo text, p_ruta text)
returns void
language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, tipo, titulo, cuerpo, ruta)
  values (p_user, p_tipo, p_titulo, p_cuerpo, p_ruta)
$$;
revoke execute on function public.notificar(uuid, text, text, text, text) from public, anon, authenticated;

-- Reserva confirmada / cancelada
create or replace function public.trg_notif_reserva()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_espacio text;
  v_cuando  text;
begin
  select nombre into v_espacio from public.spaces where id = new.space_id;
  v_cuando := to_char(new.inicio at time zone 'America/Lima', 'DD/MM "a las" HH24:MI');

  if tg_op = 'INSERT' then
    perform public.notificar(new.user_id, 'reserva', 'Reserva confirmada',
      coalesce(v_espacio, 'Espacio') || ' · ' || v_cuando || ' · ' || new.codigo,
      '/reservas/confirmada/' || new.codigo);
  elsif tg_op = 'UPDATE' and old.estado = 'confirmada' and new.estado = 'cancelada' then
    perform public.notificar(new.user_id, 'reserva', 'Reserva cancelada',
      new.codigo || ' · ' || coalesce(v_espacio, 'Espacio') || ' · ' || v_cuando,
      '/reservas/mis');
  end if;
  return new;
end $$;

drop trigger if exists trg_reserva_notif on public.reservations;
create trigger trg_reserva_notif
  after insert or update of estado on public.reservations
  for each row execute function public.trg_notif_reserva();

-- Te agregaron a una reserva de otra persona
create or replace function public.trg_notif_integrante()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r public.reservations%rowtype;
  v_member uuid;
  v_espacio text;
begin
  select * into r from public.reservations where id = new.reservation_id;
  select id into v_member from public.profiles where upper(codigo) = upper(new.codigo_alumno);
  if v_member is null or v_member = r.user_id then return new; end if;
  select nombre into v_espacio from public.spaces where id = r.space_id;
  perform public.notificar(v_member, 'reserva', 'Te agregaron a una reserva',
    coalesce(v_espacio, 'Espacio') || ' · ' || to_char(r.inicio at time zone 'America/Lima', 'DD/MM "a las" HH24:MI'),
    '/reservas/mis');
  return new;
end $$;

drop trigger if exists trg_integrante_notif on public.reservation_members;
create trigger trg_integrante_notif
  after insert on public.reservation_members
  for each row execute function public.trg_notif_integrante();

-- Asistencia a una actividad del campus
create or replace function public.trg_notif_asistencia()
returns trigger language plpgsql security definer set search_path = public as $$
declare a public.campus_announcements%rowtype;
begin
  select * into a from public.campus_announcements where id = new.announcement_id;
  perform public.notificar(new.user_id, 'anuncio', 'Asistencia confirmada',
    a.titulo || ' · ' || to_char(a.fecha, 'DD/MM') || ' a las ' || to_char(a.hora_inicio, 'HH24:MI'),
    '/anuncios/' || a.id);
  return new;
end $$;

drop trigger if exists trg_asistencia_notif on public.announcement_rsvps;
create trigger trg_asistencia_notif
  after insert on public.announcement_rsvps
  for each row execute function public.trg_notif_asistencia();

-- Ingreso a un grupo de estudio
create or replace function public.trg_notif_grupo()
returns trigger language plpgsql security definer set search_path = public as $$
declare g public.groups%rowtype;
begin
  select * into g from public.groups where id = new.group_id;
  perform public.notificar(new.user_id, 'grupo',
    case when g.organizador = new.user_id then 'Grupo creado' else 'Te uniste a un grupo' end,
    g.curso || ' · ' || g.tema || ' · ' || to_char(g.fecha, 'DD/MM') || ' a las ' || to_char(g.inicio, 'HH24:MI'),
    '/grupos/' || g.id);
  return new;
end $$;

drop trigger if exists trg_grupo_notif on public.group_members;
create trigger trg_grupo_notif
  after insert on public.group_members
  for each row execute function public.trg_notif_grupo();


-- ════════════════════════════════════════════════════════════════════════════
-- 0009 · El perfil pasa a ser de solo lectura
-- ════════════════════════════════════════════════════════════════════════════

-- Es una app institucional: nombre, DNI y demás datos vienen de la universidad y el alumno no puede cambiarlos.
-- (Antes se permitía editar nombre y DNI; ahora el servidor también lo impide, no solo la pantalla.)

drop policy if exists "profiles_editar" on public.profiles;
revoke update on public.profiles from authenticated, anon;


-- ════════════════════════════════════════════════════════════════════════════
-- 0010 · Catálogo de trámites, solicitudes y su historial
-- ════════════════════════════════════════════════════════════════════════════

-- Catálogo de trámites (con los campos que pide cada uno), solicitudes de cada alumno y su historial.
-- Las solicitudes se crean y cancelan con funciones que validan todo en el servidor.

-- ───────────────────────── Catálogo ─────────────────────────

create table if not exists public.procedure_types (
  id          text primary key,
  categoria   text not null check (categoria in ('autogestionable', 'sae')),
  titulo      text not null,
  descripcion text not null,
  icono       text not null default 'description',
  costo       numeric(8, 2) not null default 0 check (costo >= 0),
  plazo       text not null,
  modalidad   text not null,
  -- Campos del formulario: [{ "key", "label", "type": select|text|textarea|curso|check, "options": [...], "required": bool }]
  campos      jsonb not null default '[]',
  orden       int not null default 0
);

create sequence if not exists public.tramite_seq start 150;

-- ───────────────────────── Solicitudes ─────────────────────────

create table if not exists public.procedures (
  id             uuid primary key default gen_random_uuid(),
  codigo         text not null unique,
  user_id        uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tipo_id        text not null references public.procedure_types(id),
  estado         text not null default 'en_revision' check (estado in ('en_revision', 'aprobado', 'rechazado', 'cancelada')),
  detalle        jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index if not exists procedures_user_idx on public.procedures (user_id, created_at desc);

create table if not exists public.procedure_events (
  id           uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  estado       text not null,
  nota         text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists procedure_events_idx on public.procedure_events (procedure_id, created_at);

-- ───────────────────────── RLS ─────────────────────────

alter table public.procedure_types  enable row level security;
alter table public.procedures       enable row level security;
alter table public.procedure_events enable row level security;

drop policy if exists "tramites_tipos_leer" on public.procedure_types;
create policy "tramites_tipos_leer" on public.procedure_types for select to authenticated using (true);

drop policy if exists "tramites_leer" on public.procedures;
create policy "tramites_leer" on public.procedures for select to authenticated using (user_id = auth.uid());

drop policy if exists "tramites_eventos_leer" on public.procedure_events;
create policy "tramites_eventos_leer" on public.procedure_events for select to authenticated
  using (exists (select 1 from public.procedures p where p.id = procedure_id and p.user_id = auth.uid()));

revoke all on public.procedure_types, public.procedures, public.procedure_events from anon;
revoke insert, update, delete on public.procedures, public.procedure_events from authenticated;

-- ───────────────────────── Solicitar ─────────────────────────
-- Valida cada campo del trámite en el servidor y solo guarda los campos declarados.
create or replace function public.solicitar_tramite(p_tipo text, p_detalle jsonb)
returns public.procedures
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  t        public.procedure_types%rowtype;
  f        jsonb;
  v_key    text;
  v_val    text;
  v_clean  jsonb := '{}';
  v_proc   public.procedures%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.' using errcode = 'P0001'; end if;

  select * into t from public.procedure_types where id = p_tipo;
  if not found then raise exception 'Ese trámite no existe.' using errcode = 'P0001', hint = 'invalid'; end if;

  if exists (select 1 from public.procedures where user_id = v_uid and tipo_id = p_tipo and estado = 'en_revision') then
    raise exception 'Ya tienes una solicitud de este trámite en revisión.' using errcode = 'P0001', hint = 'duplicate';
  end if;

  for f in select * from jsonb_array_elements(t.campos) loop
    v_key := f ->> 'key';
    v_val := nullif(btrim(coalesce(p_detalle ->> v_key, '')), '');

    if v_val is null then
      if coalesce((f ->> 'required')::boolean, false) then
        raise exception 'Falta completar: %.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
      end if;
      continue;
    end if;

    case f ->> 'type'
      when 'select' then
        if not exists (select 1 from jsonb_array_elements_text(f -> 'options') o where o = v_val) then
          raise exception 'Valor no válido en: %.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
      when 'curso' then
        if not exists (select 1 from public.enrollments e where e.user_id = v_uid and e.course_id = v_val) then
          raise exception 'Ese curso no está en tu matrícula.' using errcode = 'P0001', hint = 'invalid';
        end if;
      when 'check' then
        if v_val <> 'true' then
          raise exception 'Debes aceptar: %.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
      when 'textarea' then
        if char_length(v_val) > 400 then
          raise exception 'El texto de % es demasiado largo.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
      else
        if char_length(v_val) > 120 then
          raise exception 'El texto de % es demasiado largo.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
    end case;

    v_clean := v_clean || jsonb_build_object(v_key, v_val);
  end loop;

  insert into public.procedures (codigo, user_id, tipo_id, detalle)
  values ('SOL-' || to_char(now() at time zone 'America/Lima', 'YYYY') || '-' || lpad(nextval('public.tramite_seq')::text, 4, '0'),
          v_uid, p_tipo, v_clean)
  returning * into v_proc;

  insert into public.procedure_events (procedure_id, estado, nota)
  values (v_proc.id, 'en_revision', 'Solicitud recibida. Está en revisión.');

  return v_proc;
end $$;

-- ───────────────────────── Cancelar ─────────────────────────
create or replace function public.cancelar_tramite(p_codigo text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_proc public.procedures%rowtype;
begin
  select * into v_proc from public.procedures where codigo = p_codigo and user_id = auth.uid() for update;
  if not found then raise exception 'No encontramos esa solicitud.' using errcode = 'P0001', hint = 'invalid'; end if;
  if v_proc.estado <> 'en_revision' then
    raise exception 'Esta solicitud ya no se puede cancelar.' using errcode = 'P0001', hint = 'invalid';
  end if;
  update public.procedures set estado = 'cancelada', actualizado_en = now() where id = v_proc.id;
  insert into public.procedure_events (procedure_id, estado, nota)
  values (v_proc.id, 'cancelada', 'Cancelaste la solicitud.');
end $$;

-- ───────────────────────── Avisos en el centro de notificaciones ─────────────────────────
create or replace function public.trg_notif_tramite()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_titulo text;
begin
  select titulo into v_titulo from public.procedure_types where id = new.tipo_id;
  if tg_op = 'INSERT' then
    perform public.notificar(new.user_id, 'sistema', 'Solicitud enviada',
      coalesce(v_titulo, 'Trámite') || ' · ' || new.codigo, '/tramites/solicitud/' || new.codigo);
  elsif tg_op = 'UPDATE' and new.estado is distinct from old.estado and new.estado in ('aprobado', 'rechazado') then
    perform public.notificar(new.user_id, 'sistema',
      case new.estado when 'aprobado' then 'Solicitud aprobada' else 'Solicitud rechazada' end,
      coalesce(v_titulo, 'Trámite') || ' · ' || new.codigo, '/tramites/solicitud/' || new.codigo);
  end if;
  return new;
end $$;

drop trigger if exists trg_tramite_notif on public.procedures;
create trigger trg_tramite_notif
  after insert or update of estado on public.procedures
  for each row execute function public.trg_notif_tramite();

-- ───────────────────────── Permisos de ejecución ─────────────────────────
revoke execute on function public.solicitar_tramite(text, jsonb) from public, anon;
revoke execute on function public.cancelar_tramite(text)         from public, anon;
grant  execute on function public.solicitar_tramite(text, jsonb) to authenticated;
grant  execute on function public.cancelar_tramite(text)         to authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- 0011 · Programas, ofertas y postulaciones
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.employment_programs (
  id text primary key,
  titulo text not null,
  descripcion text not null,
  ciclos text not null,
  frecuencia text not null,
  requisitos text[] not null default '{}',
  icono text not null default 'school',
  orden integer not null default 0,
  activo boolean not null default true
);

create table if not exists public.job_offers (
  id text primary key,
  empresa text not null,
  puesto text not null,
  tipo text not null check (tipo in ('full_time', 'part_time', 'practica')),
  ciudad text not null,
  ubicacion text not null,
  area text not null,
  nivel_academico text not null,
  carreras text[] not null default '{}',
  descripcion text not null,
  funciones text[] not null default '{}',
  requisitos text[] not null default '{}',
  beneficios text[] not null default '{}',
  experiencia text not null default '',
  publicado_en timestamptz not null default now(),
  cierra_en timestamptz,
  estado text not null default 'publicada' check (estado in ('publicada', 'cerrada', 'archivada')),
  check (cierra_en is null or cierra_en > publicado_en)
);
create index if not exists job_offers_catalogo_idx on public.job_offers (estado, publicado_en desc, id);

create sequence if not exists public.postulacion_seq;
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  oferta_id text not null references public.job_offers(id) on delete restrict,
  nombre_contacto text not null check (char_length(nombre_contacto) between 2 and 120),
  correo_contacto text not null check (char_length(correo_contacto) <= 254
    and correo_contacto ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  puesto_snapshot text not null,
  empresa_snapshot text not null,
  estado text not null default 'enviada' check (estado in ('enviada', 'en_revision', 'seleccionada', 'no_seleccionada')),
  created_at timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (user_id, oferta_id)
);
create index if not exists job_applications_user_idx on public.job_applications (user_id, created_at desc);

alter table public.employment_programs enable row level security;
alter table public.job_offers enable row level security;
alter table public.job_applications enable row level security;

drop policy if exists "programas_leer" on public.employment_programs;
create policy "programas_leer" on public.employment_programs for select to authenticated using (activo);
drop policy if exists "ofertas_leer" on public.job_offers;
create policy "ofertas_leer" on public.job_offers for select to authenticated
  using (estado = 'publicada' and publicado_en <= now() and (cierra_en is null or cierra_en > now()));
drop policy if exists "postulaciones_leer" on public.job_applications;
create policy "postulaciones_leer" on public.job_applications for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.employment_programs, public.job_offers, public.job_applications from public, anon, authenticated;
grant select on public.employment_programs, public.job_offers, public.job_applications to authenticated;
revoke all on sequence public.postulacion_seq from public, anon, authenticated;

-- La identidad y el estado siempre los determina el servidor.
-- El bloqueo coordina el cierre de una oferta con las solicitudes concurrentes.
create or replace function public.postular_oferta(p_oferta_id text, p_nombre_contacto text, p_correo_contacto text)
returns public.job_applications
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_oferta public.job_offers%rowtype;
  v_postulacion public.job_applications%rowtype;
  v_nombre text := btrim(regexp_replace(coalesce(p_nombre_contacto, ''), '[[:space:]]+', ' ', 'g'));
  v_correo text := lower(btrim(coalesce(p_correo_contacto, '')));
begin
  if v_uid is null or not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'Inicia sesión para postular.' using errcode = 'P0001', hint = 'unauthorized';
  end if;

  select * into v_oferta from public.job_offers where id = p_oferta_id for update;
  if not found then
    raise exception 'Esta oferta ya no está disponible.' using errcode = 'P0001', hint = 'unavailable';
  end if;

  -- Un reintento después de perder la respuesta recupera el mismo registro,
  -- incluso si la oferta cerró después de aceptar la primera solicitud.
  select * into v_postulacion from public.job_applications where user_id = v_uid and oferta_id = p_oferta_id;
  if found then return v_postulacion; end if;

  if v_oferta.estado <> 'publicada' or v_oferta.publicado_en > now()
      or (v_oferta.cierra_en is not null and v_oferta.cierra_en <= now()) then
    raise exception 'La convocatoria ha cerrado. Explora otras oportunidades.' using errcode = 'P0001', hint = 'unavailable';
  end if;
  if char_length(v_nombre) not between 2 and 120 then
    raise exception 'Escribe tu nombre completo (entre 2 y 120 caracteres).' using errcode = 'P0001', hint = 'invalid_name';
  end if;
  if char_length(v_correo) > 254 or v_correo !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Ingresa un correo con el formato nombre@dominio.com.' using errcode = 'P0001', hint = 'invalid_email';
  end if;

  insert into public.job_applications (codigo, user_id, oferta_id, nombre_contacto, correo_contacto, puesto_snapshot, empresa_snapshot)
  values ('POS-' || to_char(now() at time zone 'America/Lima', 'YYYY') || '-' || lpad(nextval('public.postulacion_seq')::text, 6, '0'),
    v_uid, v_oferta.id, v_nombre, v_correo, v_oferta.puesto, v_oferta.empresa)
  returning * into v_postulacion;
  return v_postulacion;
end $$;

-- Avisos transaccionales, también para los cambios de estado administrativos.
create or replace function public.trg_notif_postulacion()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform public.notificar(new.user_id, 'sistema', 'Postulación enviada',
      new.puesto_snapshot || ' · ' || new.empresa_snapshot, '/empleabilidad/postulaciones/' || new.id::text);
  elsif new.estado is distinct from old.estado then
    new.actualizado_en := now();
    perform public.notificar(new.user_id, 'sistema', 'Tu postulación tiene novedades',
      new.puesto_snapshot || ' · Consulta el estado de tu postulación.', '/empleabilidad/postulaciones/' || new.id::text);
  end if;
  return new;
end $$;
drop trigger if exists trg_postulacion_notif on public.job_applications;
create trigger trg_postulacion_notif before insert or update of estado on public.job_applications
  for each row execute function public.trg_notif_postulacion();

revoke execute on function public.postular_oferta(text, text, text) from public, anon;
grant execute on function public.postular_oferta(text, text, text) to authenticated;
revoke execute on function public.trg_notif_postulacion() from public, anon, authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- 0012 · Detalle de programas y postulaciones a programas
-- ════════════════════════════════════════════════════════════════════════════

alter table public.employment_programs
  add column if not exists lema text not null default '',
  add column if not exists formato text not null default '',
  add column if not exists beneficios text[] not null default '{}',
  add column if not exists nota text not null default '',
  add column if not exists url_oficial text not null default '';

alter table public.job_applications alter column oferta_id drop not null;
alter table public.job_applications
  add column if not exists programa_id text references public.employment_programs(id) on delete restrict,
  add column if not exists codigo_estudiante text,
  add column if not exists campus text,
  add column if not exists ciclo smallint,
  add column if not exists acepta_requisitos boolean;

alter table public.job_applications drop constraint if exists postulacion_destino_check;
alter table public.job_applications add constraint postulacion_destino_check
  check ((oferta_id is not null) <> (programa_id is not null));
alter table public.job_applications drop constraint if exists postulacion_programa_datos_check;
alter table public.job_applications add constraint postulacion_programa_datos_check
  check (programa_id is null or (
    codigo_estudiante is not null and codigo_estudiante ~ '^U[0-9]{8}$'
    and campus is not null and char_length(btrim(campus)) between 2 and 120
    and ciclo is not null and ciclo between 1 and 12
    and acepta_requisitos is true
    and correo_contacto ~ '^[^[:space:]@]+@utp\.edu\.pe$'
  ));
create unique index if not exists job_applications_programa_user_idx
  on public.job_applications (user_id, programa_id) where programa_id is not null;

create or replace function public.postular_programa(
  p_programa_id text, p_nombre_contacto text, p_correo_contacto text,
  p_campus text, p_ciclo integer, p_acepta_requisitos boolean
)
returns public.job_applications
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_codigo text;
  v_programa public.employment_programs%rowtype;
  v_postulacion public.job_applications%rowtype;
  v_nombre text := btrim(regexp_replace(coalesce(p_nombre_contacto, ''), '[[:space:]]+', ' ', 'g'));
  v_correo text := lower(btrim(coalesce(p_correo_contacto, '')));
  v_campus text := btrim(regexp_replace(coalesce(p_campus, ''), '[[:space:]]+', ' ', 'g'));
  v_numero text;
begin
  select codigo into v_codigo from public.profiles where id = v_uid;
  if v_uid is null or not found then
    raise exception 'Inicia sesión para postular.' using errcode = 'P0001', hint = 'unauthorized';
  end if;
  select * into v_programa from public.employment_programs where id = p_programa_id for update;
  if not found then
    raise exception 'Este programa ya no está disponible.' using errcode = 'P0001', hint = 'unavailable';
  end if;
  -- Idempotencia incluso cuando se cerró el programa después de un envío aceptado.
  select * into v_postulacion from public.job_applications where user_id = v_uid and programa_id = p_programa_id;
  if found then return v_postulacion; end if;
  if not v_programa.activo then
    raise exception 'Este programa ya no recibe postulaciones.' using errcode = 'P0001', hint = 'unavailable';
  end if;
  if char_length(v_nombre) not between 2 and 120 then
    raise exception 'Escribe tu nombre completo (entre 2 y 120 caracteres).' using errcode = 'P0001', hint = 'invalid_name';
  end if;
  if char_length(v_correo) > 254 or v_correo !~ '^[^[:space:]@]+@utp\.edu\.pe$' then
    raise exception 'Usa tu correo institucional @utp.edu.pe.' using errcode = 'P0001', hint = 'invalid_email';
  end if;
  if char_length(v_campus) not between 2 and 120 then
    raise exception 'Ingresa tu campus (entre 2 y 120 caracteres).' using errcode = 'P0001', hint = 'invalid_campus';
  end if;
  if p_ciclo is null or p_ciclo not between 1 and 12 then
    raise exception 'Selecciona tu ciclo actual, del 1 al 12.' using errcode = 'P0001', hint = 'invalid_cycle';
  end if;
  if p_acepta_requisitos is distinct from true then
    raise exception 'Confirma que revisaste los requisitos y que tus datos son correctos.' using errcode = 'P0001', hint = 'invalid_consent';
  end if;
  v_numero := nextval('public.postulacion_seq')::text;
  insert into public.job_applications (codigo, user_id, programa_id, nombre_contacto, correo_contacto,
    puesto_snapshot, empresa_snapshot, codigo_estudiante, campus, ciclo, acepta_requisitos)
  values ('POS-' || to_char(now() at time zone 'America/Lima', 'YYYY') || '-' || lpad(v_numero, greatest(6, length(v_numero)), '0'),
    v_uid, v_programa.id, v_nombre, v_correo, v_programa.titulo, 'Programa de empleabilidad · UTP',
    v_codigo, v_campus, p_ciclo, true)
  returning * into v_postulacion;
  return v_postulacion;
end $$;

-- Se reutilizan las mismas políticas RLS y el disparador de notificaciones de 0011.
revoke execute on function public.postular_programa(text, text, text, text, integer, boolean) from public, anon;
grant execute on function public.postular_programa(text, text, text, text, integer, boolean) to authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- 0013 · Talleres, grupos, horarios e inscripciones
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.workshops (
  id text primary key,
  categoria text not null check (categoria in ('cultural', 'deportivo')),
  titulo text not null check (char_length(btrim(titulo)) between 2 and 160),
  descripcion text not null default '',
  terminos text not null,
  version_terminos text not null check (char_length(btrim(version_terminos)) between 1 and 80),
  declaracion text not null,
  activo boolean not null default true,
  orden integer not null default 0
);

create table if not exists public.workshop_groups (
  id text primary key,
  workshop_id text not null references public.workshops(id) on delete restrict,
  term_id text not null references public.terms(id) on delete restrict,
  campus_id text not null references public.campuses(id) on delete restrict,
  docente text not null,
  modalidad text not null check (modalidad in ('presencial', 'virtual')),
  lugar text not null,
  inicio date not null,
  fin date not null check (fin >= inicio),
  inscripcion_abre timestamptz not null,
  inscripcion_cierra timestamptz not null check (inscripcion_cierra > inscripcion_abre),
  estado text not null default 'abierto' check (estado in ('abierto', 'cerrado', 'finalizado', 'cancelado')),
  capacidad integer not null check (capacidad between 1 and 10000)
);
create index if not exists workshop_groups_workshop_idx on public.workshop_groups (workshop_id, inicio, id);
create index if not exists workshop_groups_term_idx on public.workshop_groups (term_id);

create table if not exists public.workshop_schedule_slots (
  id uuid primary key default gen_random_uuid(),
  grupo_id text not null references public.workshop_groups(id) on delete cascade,
  dia smallint not null check (dia between 1 and 7),
  inicio time not null,
  fin time not null check (fin > inicio),
  unique (grupo_id, dia, inicio, fin)
);

create sequence if not exists public.workshop_enrollment_seq;
create table if not exists public.workshop_enrollments (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  grupo_id text not null references public.workshop_groups(id) on delete restrict,
  estado text not null default 'inscrita' check (estado in ('inscrita', 'baja')),
  acepta_terminos boolean not null check (acepta_terminos),
  acepta_declaracion boolean not null check (acepta_declaracion),
  version_terminos text not null,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (user_id, grupo_id)
);
create index if not exists workshop_enrollments_user_idx on public.workshop_enrollments (user_id, created_at desc);
create index if not exists workshop_enrollments_occupied_idx on public.workshop_enrollments (grupo_id) where estado = 'inscrita';

-- Restricciones administrativas explícitas. No se deducen faltas ni sanciones del paso del tiempo.
-- Un mismo registro por alumno y período evita duplicar bloqueos.
create table if not exists public.workshop_restrictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  term_id text not null references public.terms(id) on delete restrict,
  motivo text not null check (char_length(btrim(motivo)) between 2 and 500),
  inscripcion_origen uuid references public.workshop_enrollments(id) on delete restrict,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, term_id)
);

alter table public.workshops enable row level security;
alter table public.workshop_groups enable row level security;
alter table public.workshop_schedule_slots enable row level security;
alter table public.workshop_enrollments enable row level security;
alter table public.workshop_restrictions enable row level security;

drop policy if exists "talleres_catalogo_leer" on public.workshops;
create policy "talleres_catalogo_leer" on public.workshops for select to authenticated using (activo);
drop policy if exists "talleres_grupos_leer" on public.workshop_groups;
create policy "talleres_grupos_leer" on public.workshop_groups for select to authenticated
  using (exists (select 1 from public.workshops w where w.id = workshop_id and w.activo));
drop policy if exists "talleres_horarios_leer" on public.workshop_schedule_slots;
create policy "talleres_horarios_leer" on public.workshop_schedule_slots for select to authenticated
  using (exists (select 1 from public.workshop_groups g join public.workshops w on w.id = g.workshop_id where g.id = grupo_id and w.activo));
drop policy if exists "talleres_inscripciones_leer" on public.workshop_enrollments;
create policy "talleres_inscripciones_leer" on public.workshop_enrollments for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "talleres_restricciones_leer" on public.workshop_restrictions;
create policy "talleres_restricciones_leer" on public.workshop_restrictions for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.workshops, public.workshop_groups, public.workshop_schedule_slots,
  public.workshop_enrollments, public.workshop_restrictions from public, anon, authenticated;
grant select on public.workshops, public.workshop_groups, public.workshop_schedule_slots,
  public.workshop_enrollments, public.workshop_restrictions to authenticated;
revoke all on sequence public.workshop_enrollment_seq from public, anon, authenticated;

-- Agregado deliberadamente acotado: el alumno ve vacantes, nunca las identidades de otros inscritos.
create or replace function public.listar_talleres()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Inicia sesión para consultar talleres.' using errcode = 'P0001', hint = 'unauthorized';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', w.id, 'categoria', w.categoria, 'titulo', w.titulo, 'descripcion', w.descripcion,
    'terminos', w.terminos, 'version_terminos', w.version_terminos, 'declaracion', w.declaracion,
    'grupos', coalesce((select jsonb_agg(jsonb_build_object(
      'id', g.id, 'term_id', g.term_id, 'periodo', t.nombre, 'campus_id', g.campus_id,
      'sede', c.nombre, 'docente', g.docente, 'modalidad', g.modalidad, 'lugar', g.lugar,
      'inicio', g.inicio, 'fin', g.fin, 'inscripcion_abre', g.inscripcion_abre,
      'inscripcion_cierra', g.inscripcion_cierra,
      'estado', case
        when g.estado = 'abierto' and g.fin < (now() at time zone 'America/Lima')::date then 'finalizado'
        when g.estado = 'abierto' and not exists (select 1 from public.workshop_schedule_slots s where s.grupo_id = g.id) then 'cerrado'
        else g.estado end,
      'capacidad', g.capacidad,
      'vacantes', greatest(0, g.capacidad - (select count(*)::integer from public.workshop_enrollments e where e.grupo_id = g.id and e.estado = 'inscrita')),
      'horarios', coalesce((select jsonb_agg(jsonb_build_object('dia', s.dia, 'inicio', s.inicio, 'fin', s.fin)
        order by s.dia, s.inicio) from public.workshop_schedule_slots s where s.grupo_id = g.id), '[]'::jsonb)
    ) order by g.inicio, c.nombre, g.id)
    from public.workshop_groups g join public.terms t on t.id = g.term_id join public.campuses c on c.id = g.campus_id
    where g.workshop_id = w.id), '[]'::jsonb)
  ) order by w.orden, w.id), '[]'::jsonb) into v_result from public.workshops w where w.activo;
  return v_result;
end $$;

create or replace function public.inscribir_taller(
  p_grupo_id text, p_version_terminos text, p_acepta_terminos boolean, p_acepta_declaracion boolean
)
returns public.workshop_enrollments
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  g public.workshop_groups%rowtype;
  w public.workshops%rowtype;
  v_existing public.workshop_enrollments%rowtype;
  v_horarios jsonb;
  v_snapshot jsonb;
  v_n integer;
  v_numero text;
begin
  -- Todas las escrituras de inscripción/baja/restricción siguen perfil → grupo.
  perform 1 from public.profiles where id = v_uid for update;
  if v_uid is null or not found then
    raise exception 'Inicia sesión para inscribirte.' using errcode = 'P0001', hint = 'unauthorized';
  end if;
  select * into g from public.workshop_groups where id = p_grupo_id for update;
  if not found then
    raise exception 'No encontramos este grupo de taller.' using errcode = 'P0001', hint = 'unavailable';
  end if;
  select * into v_existing from public.workshop_enrollments where user_id = v_uid and grupo_id = g.id;
  if found then
    if v_existing.estado = 'inscrita' then return v_existing; end if;
    raise exception 'Tu inscripción a este grupo fue dada de baja. Consulta con soporte.' using errcode = 'P0001', hint = 'restricted';
  end if;
  select * into w from public.workshops where id = g.workshop_id for share;
  if not found or not w.activo then
    raise exception 'Este taller ya no está disponible.' using errcode = 'P0001', hint = 'unavailable';
  end if;
  if g.estado <> 'abierto' or now() < g.inscripcion_abre or now() >= g.inscripcion_cierra
      or g.fin < (now() at time zone 'America/Lima')::date then
    raise exception 'La inscripción a este grupo no está abierta.' using errcode = 'P0001', hint = 'closed';
  end if;
  if exists (select 1 from public.workshop_restrictions where user_id = v_uid and term_id = g.term_id and activo) then
    raise exception 'Tienes una restricción de inscripción para este período. Consulta con soporte.' using errcode = 'P0001', hint = 'restricted';
  end if;
  if p_version_terminos is distinct from w.version_terminos or p_acepta_terminos is distinct from true then
    raise exception 'Revisa y acepta los términos vigentes del taller.' using errcode = 'P0001', hint = 'invalid_terms';
  end if;
  if p_acepta_declaracion is distinct from true then
    raise exception 'Confirma la declaración antes de inscribirte.' using errcode = 'P0001', hint = 'invalid_declaration';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'inicio', inicio, 'fin', fin) order by dia, inicio), '[]'::jsonb)
    into v_horarios from public.workshop_schedule_slots where grupo_id = g.id;
  if jsonb_array_length(v_horarios) = 0 then
    raise exception 'Este grupo todavía no tiene horarios confirmados.' using errcode = 'P0001', hint = 'closed';
  end if;
  select count(*)::integer into v_n from public.workshop_enrollments where grupo_id = g.id and estado = 'inscrita';
  if v_n >= g.capacidad then
    raise exception 'Este taller ya no tiene vacantes. Puedes elegir otro grupo.' using errcode = 'P0001', hint = 'full';
  end if;
  select jsonb_build_object('taller_id', w.id, 'titulo', w.titulo, 'categoria', w.categoria,
    'term_id', g.term_id, 'periodo', t.nombre, 'sede', c.nombre, 'docente', g.docente,
    'modalidad', g.modalidad, 'lugar', g.lugar, 'inicio', g.inicio, 'fin', g.fin,
    'horarios', v_horarios, 'terminos', w.terminos, 'declaracion', w.declaracion)
    into v_snapshot from public.terms t cross join public.campuses c where t.id = g.term_id and c.id = g.campus_id;
  v_numero := nextval('public.workshop_enrollment_seq')::text;
  insert into public.workshop_enrollments (codigo, user_id, grupo_id, acepta_terminos, acepta_declaracion, version_terminos, snapshot)
  values ('TAL-' || to_char(now() at time zone 'America/Lima', 'YYYY') || '-' || lpad(v_numero, greatest(6, length(v_numero)), '0'),
    v_uid, g.id, true, true, w.version_terminos, v_snapshot)
  returning * into v_existing;
  return v_existing;
end $$;

-- Las notificaciones pertenecen a la transacción: nunca se anuncia una inscripción rechazada.
create or replace function public.trg_notif_taller()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform public.notificar(new.user_id, 'sistema', 'Inscripción a taller completada',
      new.snapshot ->> 'titulo', '/talleres/inscripcion/' || new.id::text);
  elsif new.estado is distinct from old.estado then
    new.actualizado_en := now();
    perform public.notificar(new.user_id, 'sistema', 'Tu inscripción a taller tiene novedades',
      new.snapshot ->> 'titulo', '/talleres/inscripcion/' || new.id::text);
  end if;
  return new;
end $$;
drop trigger if exists trg_taller_inscripcion_notif on public.workshop_enrollments;
create trigger trg_taller_inscripcion_notif before insert or update of estado on public.workshop_enrollments
  for each row execute function public.trg_notif_taller();

-- Operación administrativa: aplica únicamente períodos determinados y justificados por la gestión académica.
-- El alumno no puede ejecutarla. No presupone registros de asistencia que todavía no existen.
create or replace function public.restringir_talleres(
  p_user_id uuid, p_term_ids text[], p_motivo text, p_inscripcion_id uuid default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare v_e public.workshop_enrollments%rowtype; v_term text;
begin
  perform 1 from public.profiles where id = p_user_id for update;
  if not found or char_length(btrim(coalesce(p_motivo, ''))) not between 2 and 500
      or coalesce(array_length(p_term_ids, 1), 0) = 0 then
    raise exception 'Indica un alumno, períodos y un motivo válidos.' using errcode = 'P0001', hint = 'invalid';
  end if;
  if p_inscripcion_id is not null then
    select * into v_e from public.workshop_enrollments where id = p_inscripcion_id and user_id = p_user_id;
    if not found then raise exception 'La inscripción no pertenece al alumno.' using errcode = 'P0001', hint = 'invalid'; end if;
    perform 1 from public.workshop_groups where id = v_e.grupo_id for update;
    update public.workshop_enrollments set estado = 'baja' where id = v_e.id and estado <> 'baja';
  end if;
  foreach v_term in array p_term_ids loop
    if v_term is null or not exists (select 1 from public.terms where id = v_term) then
      raise exception 'El período académico no existe.' using errcode = 'P0001', hint = 'invalid';
    end if;
    insert into public.workshop_restrictions (user_id, term_id, motivo, inscripcion_origen)
    values (p_user_id, v_term, btrim(p_motivo), p_inscripcion_id)
    on conflict (user_id, term_id) do update set motivo = excluded.motivo, inscripcion_origen = excluded.inscripcion_origen, activo = true;
  end loop;
end $$;

revoke execute on function public.listar_talleres() from public, anon;
revoke execute on function public.inscribir_taller(text, text, boolean, boolean) from public, anon;
grant execute on function public.listar_talleres(), public.inscribir_taller(text, text, boolean, boolean) to authenticated;
revoke execute on function public.trg_notif_taller() from public, anon, authenticated;
revoke execute on function public.restringir_talleres(uuid, text[], text, uuid) from public, anon, authenticated;
grant execute on function public.restringir_talleres(uuid, text[], text, uuid) to service_role;
