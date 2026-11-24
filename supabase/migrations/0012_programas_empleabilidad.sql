-- UTP+ Service · 0012 · Detalle y postulación a programas de empleabilidad
-- Ejecutar después de 0011. Conserva todas las postulaciones a ofertas.
begin;
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
commit;
