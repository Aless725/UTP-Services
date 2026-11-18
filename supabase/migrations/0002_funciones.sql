-- UTP+ Service · 0002 · Reglas de negocio como funciones (el servidor es la fuente de verdad)
-- Ejecutar después de 0001_esquema.sql.
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
