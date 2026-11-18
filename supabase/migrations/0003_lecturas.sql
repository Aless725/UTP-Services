-- UTP+ Service · 0003 · Lecturas que usa la app
-- Ejecutar después de 0002. Se puede repetir sin problema.

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
