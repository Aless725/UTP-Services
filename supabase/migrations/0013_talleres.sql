-- UTP+ Service · 0013 · Talleres culturales y deportivos
-- Ejecutar después de 0012. Lecturas privadas e inscripción transaccional con control de cupos.
begin;

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
commit;
