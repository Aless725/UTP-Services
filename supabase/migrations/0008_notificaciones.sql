-- UTP+ Service · 0008 · Centro de notificaciones
-- Ejecutar después de 0007. Se puede repetir sin problema.
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
