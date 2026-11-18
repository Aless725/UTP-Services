-- UTP+ Service · seed · Datos de demostración (solo cuentas y datos ficticios)
-- Ejecutar después de 0001 y 0002. Se puede repetir: no duplica datos.
-- Cuentas demo (contraseña: Utp2026!):
--   U22265137 (Isabel) · U22209574 (Mateo) · U22693560 (Rocío)  →  correo interno: <codigo en minúsculas>@utp.edu.pe

-- ───────────────────────── Reglas de negocio ─────────────────────────
insert into public.settings (clave, valor) values
  ('minMembers', '3'), ('maxHours', '2'), ('openHour', '8'), ('closeHour', '20'),
  ('checkinGraceMin', '15'), ('freeCancelMinutes', '60'), ('penaltyDays', '7'), ('bookingWindowDays', '14')
on conflict (clave) do update set valor = excluded.valor;

-- ───────────────────────── Sedes y directorio ─────────────────────────
insert into public.campuses (id, nombre) values ('lima-centro', 'Lima Centro'), ('lima-norte', 'Lima Norte')
on conflict (id) do nothing;

insert into public.students (codigo, nombre) values
  ('U22265137', 'Isabel Aldara'), ('U22209574', 'Mateo Soto'), ('U22693560', 'Rocío Paredes'),
  ('U22104588', 'Diego Fernández'), ('U22311902', 'Valeria Quispe'), ('U21987430', 'Andrés Huamán'),
  ('U22450071', 'Camila Rojas'), ('U22380145', 'Luis Mendoza'), ('U22519933', 'Sofía Vargas'),
  ('U22077214', 'Jorge Castillo')
on conflict (codigo) do nothing;

-- ───────────────────────── Espacios ─────────────────────────
-- Salas grupales
insert into public.spaces (id, campus_id, tipo, nombre, edificio, piso, capacidad_min, capacidad_max, equipamiento, descripcion) values
  ('lc-b201', 'lima-centro', 'sala_grupal', 'Sala Grupal B-201',      'Biblioteca', 3, 3, 6, '{tv,pizarra,enchufes,wifi,ac}', 'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-b204', 'lima-centro', 'sala_grupal', 'Sala Grupal B-204',      'Biblioteca', 3, 3, 4, '{pizarra,enchufes,wifi}',       'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-b202', 'lima-centro', 'sala_grupal', 'Sala Grupal B-202',      'Biblioteca', 3, 3, 6, '{tv,enchufes,wifi,ac}',         'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-b203', 'lima-centro', 'sala_grupal', 'Sala Grupal B-203',      'Biblioteca', 3, 3, 5, '{tv,enchufes,wifi}',            'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-a110', 'lima-centro', 'sala_grupal', 'Sala de Estudio A-110',  'Pabellón A', 1, 3, 8, '{tv,pizarra,enchufes,wifi,ac}', 'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-a112', 'lima-centro', 'sala_grupal', 'Sala de Estudio A-112',  'Pabellón A', 1, 3, 8, '{pizarra,enchufes,wifi}',       'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-c305', 'lima-centro', 'sala_grupal', 'Sala Grupal C-305',      'Pabellón C', 3, 3, 6, '{tv,pizarra,enchufes,wifi}',    'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('lc-c301', 'lima-centro', 'sala_grupal', 'Sala Grupal C-301',      'Pabellón C', 3, 3, 6, '{pizarra,enchufes,wifi,ac}',    'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('ln-n101', 'lima-norte',  'sala_grupal', 'Sala Grupal N-101',      'Edificio Principal', 1, 3, 6, '{tv,pizarra,enchufes,wifi}',    'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('ln-n102', 'lima-norte',  'sala_grupal', 'Sala Grupal N-102',      'Edificio Principal', 1, 3, 4, '{pizarra,enchufes,wifi}',       'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('ln-n201', 'lima-norte',  'sala_grupal', 'Sala de Estudio N-201',  'Edificio Principal', 2, 3, 8, '{tv,pizarra,enchufes,wifi,ac}', 'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.'),
  ('ln-n202', 'lima-norte',  'sala_grupal', 'Sala Grupal N-202',      'Edificio Principal', 2, 3, 6, '{tv,enchufes,wifi}',            'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.')
on conflict (id) do nothing;

-- PCs de biblioteca
insert into public.spaces (id, campus_id, tipo, nombre, edificio, piso, equipamiento, descripcion)
select 'lc-pc' || n, 'lima-centro', 'pc', 'PC ' || n || ' · Zona de cómputo', 'Biblioteca', 2,
       array['software', 'wifi']
         || case when n <= 12 then array['impresion'] else '{}'::text[] end
         || case when n % 6 = 0 then array['escaner'] else '{}'::text[] end,
       'Equipo con software académico, acceso a impresión y red de la universidad.'
from generate_series(1, 24) n
on conflict (id) do nothing;

insert into public.spaces (id, campus_id, tipo, nombre, edificio, piso, equipamiento, descripcion)
select 'ln-pc' || n, 'lima-norte', 'pc', 'PC ' || n || ' · Zona de cómputo', 'Edificio Principal', 1,
       array['software', 'wifi']
         || case when n <= 12 then array['impresion'] else '{}'::text[] end
         || case when n % 6 = 0 then array['escaner'] else '{}'::text[] end,
       'Equipo con software académico, acceso a impresión y red de la universidad.'
from generate_series(1, 10) n
on conflict (id) do nothing;

-- Cubículos de estudio
insert into public.spaces (id, campus_id, tipo, nombre, edificio, piso, equipamiento, descripcion)
select 'lc-c0' || n, 'lima-centro', 'cubiculo', 'Cubículo de estudio C-0' || n, 'Pabellón C', 1,
       array['silencio', 'enchufes', 'wifi', 'lampara'] || case when n % 2 = 0 then array['pizarra'] else '{}'::text[] end,
       'Espacio individual en silencio para estudiar o preparar una evaluación.'
from generate_series(1, 6) n
on conflict (id) do nothing;

insert into public.spaces (id, campus_id, tipo, nombre, edificio, piso, equipamiento, descripcion)
select 'ln-c0' || n, 'lima-norte', 'cubiculo', 'Cubículo de estudio C-0' || n, 'Edificio Principal', 2,
       array['silencio', 'enchufes', 'wifi', 'lampara'] || case when n % 2 = 0 then array['pizarra'] else '{}'::text[] end,
       'Espacio individual en silencio para estudiar o preparar una evaluación.'
from generate_series(1, 3) n
on conflict (id) do nothing;

-- ───────────────────────── Cuentas de demostración ─────────────────────────
do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('a1000000-0000-4000-8000-000000000001'::uuid, 'U22265137', 'Isabel', 'Isabel Kiara Aldara Cruz',      '74581236'),
      ('a1000000-0000-4000-8000-000000000002'::uuid, 'U22209574', 'Mateo',  'Mateo Rafael Soto Quispe',      '72113498'),
      ('a1000000-0000-4000-8000-000000000003'::uuid, 'U22693560', 'Rocío',  'Rocío Fernanda Paredes Lima',   '70458812')
    ) as t(id, codigo, nombre, completo, dni)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
      lower(u.codigo) || '@utp.edu.pe',
      extensions.crypt('Utp2026!', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('codigo', u.codigo), now(), now(),
      '', '', '', ''
    ) on conflict (id) do nothing;

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), u.id, u.id::text, 'email',
      jsonb_build_object('sub', u.id::text, 'email', lower(u.codigo) || '@utp.edu.pe', 'email_verified', true),
      now(), now(), now()
    ) on conflict do nothing;

    insert into public.profiles (id, codigo, nombre, nombre_completo, dni, carrera, modalidad, sede_default)
    values (u.id, u.codigo, u.nombre, u.completo, u.dni, 'Ing. Sistemas e Informática', 'Presencial', 'lima-centro')
    on conflict (id) do nothing;
  end loop;
end $$;

-- ───────────────────────── Grupos de estudio de ejemplo ─────────────────────────
-- Fechas relativas a hoy (hora de Lima). Para renovarlas basta volver a ejecutar este bloque.
delete from public.groups where organizador is null;

insert into public.groups (curso, tema, modalidad, fecha, inicio, fin, lugar, sede, enlace, plataforma, cupos, miembros_demo)
select * from (
  select 'Cálculo II', 'Práctica para PC 3', 'Presencial', (now() at time zone 'America/Lima')::date,     time '17:00', time '18:30',
         'Sala 2 · Lima Centro', 'Lima Centro · Biblioteca', null::text, null::text, 6, 4
  union all
  select 'Interacción Hombre Máquina', 'Evaluación heurística del MVP', 'Virtual', (now() at time zone 'America/Lima')::date + 1, time '19:00', time '20:00',
         null, null, 'https://meet.google.com/utp-ihm-demo', 'Google Meet', 5, 3
  union all
  select 'Desarrollo Web Integrado', 'Repaso de React y rutas', 'Presencial', (now() at time zone 'America/Lima')::date + 2, time '15:00', time '17:00',
         'Sala 3 · Lima Centro', 'Lima Centro · Biblioteca', null, null, 4, 2
  union all
  select 'Gestión del Servicio TI', 'Casos de ITIL para el examen', 'Virtual', (now() at time zone 'America/Lima')::date + 3, time '18:00', time '19:30',
         null, null, 'https://utpvirtual.zoom.us/demo-gti', 'Zoom', 6, 6
) g;
