-- UTP+ Service · 0011 · Empleabilidad
-- Ejecutar después de 0010. Catálogos de demostración y postulaciones privadas.
begin;

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
commit;
