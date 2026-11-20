-- UTP+ Service · 0006 · Anuncios del campus (campañas, eventos y actividades)
-- Ejecutar después de 0005. Se puede repetir sin problema.

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
