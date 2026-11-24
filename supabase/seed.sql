-- UTP+ Service · DATOS DE DEMOSTRACIÓN (solo cuentas y datos ficticios)
-- Ejecutar después de schema.sql, en: Supabase → SQL Editor → New query → Run.
-- Se puede repetir cuando quieras: renueva las fechas relativas a hoy sin duplicar datos.
--
-- Ciclo 2026-2: del lunes 17 de agosto al viernes 18 de diciembre de 2026 (18 semanas). La semana actual y
-- las fechas de tareas, evaluaciones, actividades y notificaciones salen de la fecha de hoy.
--
-- Cuentas demo (contraseña: Utp2026!), correo interno <código en minúsculas>@utp.edu.pe:
--   U22265137 (Isabel) · U22209574 (Mateo) · U22693560 (Rocío)
--
-- Contenido: 
--   1. Reglas, sedes, espacios, cuentas demo, grupos, ciclo, cursos y matrícula
--   2. Contenido de los cursos (incluye Herramientas de Prototipado, con Figma)
--   3. Notas, entregas y foros hasta la semana actual
--   4. Anuncios del campus (fechas relativas a hoy)
--   5. Notificaciones de ejemplo (horas relativas a ahora)
--   6. Trámites: 26 trámites y solicitudes de ejemplo
--   7. Empleabilidad: ofertas laborales
--   8. Empleabilidad: detalle de los programas
--   9. Talleres culturales y deportivos
--   10. Reserva de equipos: laptops, computadoras y tablets

-- ════════════════════════════════════════════════════════════════════════════
-- Reglas, sedes, espacios, cuentas demo, grupos, ciclo, cursos y matrícula
-- ════════════════════════════════════════════════════════════════════════════

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

-- ───────────────────────── Cursos, matrícula y avance (0004) ─────────────────────────
update public.profiles set plan_codigo = 'SIST26P2A' where plan_codigo = '';

-- El ciclo termina el viernes 18 de diciembre de 2026 (semana 18). La semana actual se calcula con la fecha de hoy
-- (hora de Lima); la app y el asistente también la recalculan solos, así que no se desfasa.
insert into public.terms (id, nombre, estado, semana_actual, semanas_total, inicio, fin)
values ('2026-2', 'Ciclo 2026-2', 'En curso',
        greatest(1, least(18, (((now() at time zone 'America/Lima')::date - date '2026-08-17') / 7) + 1)),
        18, '2026-08-17', '2026-12-18')
on conflict (id) do update set
  nombre = excluded.nombre, estado = excluded.estado, semana_actual = excluded.semana_actual,
  semanas_total = excluded.semanas_total, inicio = excluded.inicio, fin = excluded.fin;

insert into public.courses (id, nombre, docente, creditos, modalidad) values
  ('gti', 'Gestión del Servicio TI',     'García Flores, Mateo',      4, 'Presencial'),
  ('ihm', 'Interacción Hombre Máquina',  'Salazar Ruiz, Kevin',       4, 'Virtual'),
  ('dwi', 'Desarrollo Web Integrado',    'Minaya Castillo, Juan',     3, 'Presencial'),
  ('ci2', 'Curso Integrador II',         'Álvarez Velasquez, Rocío',  5, 'Presencial'),
  ('hpr', 'Herramientas de Prototipado', 'Rivas Montoya, Daniela',    3, 'Presencial')
on conflict (id) do update set
  nombre = excluded.nombre, docente = excluded.docente, creditos = excluded.creditos, modalidad = excluded.modalidad;

-- Los 3 alumnos de demostración llevan los 5 cursos del ciclo.
insert into public.enrollments (user_id, course_id, term_id, orden)
select p.id, c.id, '2026-2', c.orden
from public.profiles p
cross join (values ('gti', 1), ('ihm', 2), ('dwi', 3), ('ci2', 4), ('hpr', 5)) as c(id, orden)
on conflict do nothing;

insert into public.progress_stats (user_id, grupo, orden, etiqueta, valor, decimales)
select p.id, s.grupo, s.orden, s.etiqueta, s.valor, s.decimales
from public.profiles p
cross join (values
  ('Avance',    1, 'Cursos requeridos', 66,   0), ('Avance',    2, 'Aprobados',  50,   0), ('Avance',    3, 'Pendientes', 16,   0),
  ('Créditos',  1, 'Créditos requeridos', 197, 0), ('Créditos',  2, 'Aprobados', 149,  0), ('Créditos',  3, 'Pendientes', 48,  0),
  ('Electivos', 1, 'Créditos requeridos', 3,  0), ('Electivos', 2, 'Aprobados', 0.28, 2), ('Electivos', 3, 'Pendientes', 2.72, 2)
) as s(grupo, orden, etiqueta, valor, decimales)
on conflict (user_id, grupo, orden) do update set etiqueta = excluded.etiqueta, valor = excluded.valor, decimales = excluded.decimales;

-- ════════════════════════════════════════════════════════════════════════════
-- Contenido de los cursos (incluye Herramientas de Prototipado, con Figma)
-- ════════════════════════════════════════════════════════════════════════════

insert into public.course_details (course_id, codigo, horas, sumilla, logro, metodologia, proyecto, temas, bib_base, bib_comp, zoom_sesiones, zoom_meeting_id, zoom_passcode, zoom_url) values
  ('gti', 'ISIS-3310', 4, 'El curso presenta los fundamentos de la gestión de servicios de tecnologías de la información. Revisa el ciclo de vida del servicio, los procesos de estrategia, diseño, transición y operación, y el gobierno de TI con marcos de referencia como ITIL y COBIT.', 'Al finalizar el curso, el estudiante propone y documenta un modelo de gestión de servicios de TI para una organización, definiendo catálogo, niveles de servicio y procesos de operación y mejora continua.', 'Clases con estudio de casos, simulaciones de mesa de servicio y trabajo colaborativo. La evaluación combina prácticas calificadas, tareas académicas y un caso de estudio integrador.', 'Caso de estudio', array['Fundamentos de la gestión de servicios de TI', 'Ciclo de vida del servicio', 'Estrategia del servicio', 'Diseño del servicio', 'Catálogo y niveles de servicio (SLA)', 'Gestión de la demanda y la capacidad', 'Gestión de la disponibilidad', 'Transición del servicio', 'Gestión de cambios', 'Gestión de configuraciones y activos', 'Operación del servicio', 'Gestión de incidentes', 'Gestión de problemas', 'Mesa de servicio', 'Mejora continua del servicio', 'Gobierno de TI y casos integradores'], array['AXELOS (2019). ITIL Foundation, ITIL 4 Edition. TSO.', 'ISACA (2018). COBIT 2019 Framework: Introduction and Methodology. ISACA.'], array['ISO/IEC 20000-1:2018. Information technology — Service management.', 'Hunnebeck, L. (2011). ITIL Service Design (ed. 2011). TSO.'], '[{"dow":5,"inicio":"18:00","fin":"19:00","tipo":"Asesoría"}]'::jsonb, '8258422608', '811394', 'https://utpvirtual.zoom.us/j/8258422608'),
  ('ihm', 'ISIS-4521', 4, 'El curso introduce los principios de la interacción humano-computador y del diseño centrado en el usuario. Aborda la investigación con usuarios, el diseño y prototipado de interfaces, la accesibilidad y la evaluación de usabilidad, incluyendo modalidades emergentes como la voz y los entornos móviles.', 'Al finalizar el curso, el estudiante diseña, implementa y evalúa un producto interactivo funcional, aplicando principios de usabilidad, accesibilidad y diseño inclusivo con evidencia de pruebas con usuarios.', 'Aprendizaje basado en proyectos. Cada semana combina una sesión de teoría aplicada, un taller de diseño y un espacio de consulta en el aula virtual. El proyecto se construye de forma incremental y se evalúa con usuarios reales.', 'Proyecto final (MVP)', array['Introducción a la IHC y la usabilidad', 'Factores humanos y percepción', 'Principios del diseño de interacción', 'Heurísticas de Nielsen', 'Investigación con usuarios', 'Personas y escenarios de uso', 'Arquitectura de información', 'Prototipado de baja fidelidad', 'Prototipado de alta fidelidad', 'Sistemas de diseño', 'Accesibilidad e inclusión', 'Interfaces por voz y multimodales', 'Evaluación heurística', 'Pruebas de usabilidad y cuestionario SUS', 'Inteligencia artificial en la interacción', 'Presentación de proyectos'], array['Norman, D. (2013). The Design of Everyday Things (ed. revisada). Basic Books.', 'Preece, J., Sharp, H. y Rogers, Y. (2019). Interaction Design: Beyond Human-Computer Interaction (5.ª ed.). Wiley.'], array['Nielsen, J. (1993). Usability Engineering. Morgan Kaufmann.', 'Shneiderman, B. et al. (2016). Designing the User Interface (6.ª ed.). Pearson.', 'Krug, S. (2014). Don’t Make Me Think, Revisited. New Riders.'], '[{"dow":2,"inicio":"10:30","fin":"12:00","tipo":"Clase virtual"},{"dow":4,"inicio":"10:30","fin":"12:00","tipo":"Clase virtual"}]'::jsonb, '8787721482', '624776', 'https://utpvirtual.zoom.us/j/8787721482'),
  ('dwi', 'ISIS-3405', 5, 'El curso desarrolla las competencias para construir aplicaciones web modernas de extremo a extremo. Aborda HTML, CSS y JavaScript, el desarrollo de interfaces con React y TypeScript, el consumo de APIs, la seguridad, las pruebas y el despliegue.', 'Al finalizar el curso, el estudiante desarrolla y despliega una aplicación web completa, responsiva y accesible, integrando un servicio de backend y aplicando buenas prácticas de calidad y seguridad.', 'Laboratorios guiados en cada sesión, desarrollo incremental de un proyecto web y revisiones de código entre pares. El avance se verifica en repositorio y en el despliegue.', 'Proyecto web', array['Fundamentos de la web moderna', 'HTML5 semántico y accesibilidad', 'CSS y diseño responsivo', 'JavaScript moderno (ES6+)', 'Programación asíncrona y APIs REST', 'TypeScript esencial', 'Introducción a React', 'Estado y eventos en React', 'Enrutamiento y formularios', 'Consumo de datos y caché', 'Autenticación y seguridad web', 'Backend como servicio (Supabase)', 'Pruebas y calidad de código', 'Rendimiento y despliegue', 'PWA y experiencia móvil', 'Presentación del proyecto web'], array['Banks, A. y Porcello, E. (2020). Learning React (2.ª ed.). O’Reilly.', 'Haverbeke, M. (2018). Eloquent JavaScript (3.ª ed.). No Starch Press.'], array['Flanagan, D. (2020). JavaScript: The Definitive Guide (7.ª ed.). O’Reilly.', 'Freeman, A. (2019). Pro TypeScript. Apress.'], '[{"dow":3,"inicio":"19:00","fin":"20:00","tipo":"Asesoría"}]'::jsonb, '8450889930', '137180', 'https://utpvirtual.zoom.us/j/8450889930'),
  ('ci2', 'ISIS-4610', 6, 'El curso integra los conocimientos de la carrera en el desarrollo de una solución de software para un problema real. Cubre metodologías ágiles, requerimientos, arquitectura, calidad, integración continua, documentación técnica y la sustentación del producto.', 'Al finalizar el curso, el estudiante gestiona y entrega una solución de software integrada, trabajando en equipo con una metodología ágil, y la sustenta con evidencias técnicas y de calidad.', 'Trabajo en equipos por sprints con revisiones quincenales. Cada sprint produce un incremento funcional que se demuestra y se retroalimenta con el docente.', 'Proyecto integrador', array['Metodologías ágiles y Scrum', 'Levantamiento de requerimientos', 'Historias de usuario y backlog', 'Arquitectura de software', 'Modelado y diseño de la solución', 'Control de versiones y trabajo colaborativo', 'Integración continua', 'Planificación del proyecto integrador', 'Desarrollo incremental', 'Aseguramiento de la calidad', 'Pruebas de integración', 'Gestión de riesgos', 'Documentación técnica', 'Despliegue y operación', 'Sustentación y demostración', 'Cierre y lecciones aprendidas'], array['Hunt, A. y Thomas, D. (2019). The Pragmatic Programmer (2.ª ed.). Addison-Wesley.', 'Schwaber, K. y Sutherland, J. (2020). The Scrum Guide. scrumguides.org.'], array['Martin, R. (2017). Clean Architecture. Prentice Hall.', 'Sommerville, I. (2016). Software Engineering (10.ª ed.). Pearson.'], '[{"dow":4,"inicio":"18:30","fin":"19:30","tipo":"Asesoría"}]'::jsonb, '8089797788', '460490', 'https://utpvirtual.zoom.us/j/8089797788')
on conflict (course_id) do update set codigo = excluded.codigo, horas = excluded.horas, sumilla = excluded.sumilla, logro = excluded.logro,
  metodologia = excluded.metodologia, proyecto = excluded.proyecto, temas = excluded.temas, bib_base = excluded.bib_base, bib_comp = excluded.bib_comp,
  zoom_sesiones = excluded.zoom_sesiones, zoom_meeting_id = excluded.zoom_meeting_id, zoom_passcode = excluded.zoom_passcode, zoom_url = excluded.zoom_url;

insert into public.course_materials (id, course_id, semana, orden, tipo, titulo, detalle) values
  ('gti-s1-pres', 'gti', 1, 0, 'Presentación', 'Presentación — Fundamentos de la gestión de servicios de TI', '22 diapositivas'),
  ('gti-s1-lect', 'gti', 1, 1, 'Lectura', 'Lectura de la semana 1', '12 páginas'),
  ('gti-s1-vid', 'gti', 1, 2, 'Video', 'Video — Fundamentos de la gestión de servicios de TI', '16 min'),
  ('gti-s2-pres', 'gti', 2, 0, 'Presentación', 'Presentación — Ciclo de vida del servicio', '19 diapositivas'),
  ('gti-s2-lect', 'gti', 2, 1, 'Lectura', 'Lectura de la semana 2', '21 páginas'),
  ('gti-s2-vid', 'gti', 2, 2, 'Video', 'Video — Ciclo de vida del servicio', '13 min'),
  ('gti-s3-pres', 'gti', 3, 0, 'Presentación', 'Presentación — Estrategia del servicio', '20 diapositivas'),
  ('gti-s3-lect', 'gti', 3, 1, 'Lectura', 'Lectura de la semana 3', '16 páginas'),
  ('gti-s3-vid', 'gti', 3, 2, 'Video', 'Video — Estrategia del servicio', '14 min'),
  ('gti-s4-pres', 'gti', 4, 0, 'Presentación', 'Presentación — Diseño del servicio', '25 diapositivas'),
  ('gti-s4-lect', 'gti', 4, 1, 'Lectura', 'Lectura de la semana 4', '9 páginas'),
  ('gti-s4-vid', 'gti', 4, 2, 'Video', 'Video — Diseño del servicio', '11 min'),
  ('gti-s5-pres', 'gti', 5, 0, 'Presentación', 'Presentación — Catálogo y niveles de servicio (SLA)', '14 diapositivas'),
  ('gti-s5-lect', 'gti', 5, 1, 'Lectura', 'Lectura de la semana 5', '18 páginas'),
  ('gti-s5-vid', 'gti', 5, 2, 'Video', 'Video — Catálogo y niveles de servicio (SLA)', '12 min'),
  ('gti-s6-pres', 'gti', 6, 0, 'Presentación', 'Presentación — Gestión de la demanda y la capacidad', '23 diapositivas'),
  ('gti-s6-lect', 'gti', 6, 1, 'Lectura', 'Lectura de la semana 6', '13 páginas'),
  ('gti-s6-vid', 'gti', 6, 2, 'Video', 'Video — Gestión de la demanda y la capacidad', '9 min'),
  ('gti-s7-pres', 'gti', 7, 0, 'Presentación', 'Presentación — Gestión de la disponibilidad', '24 diapositivas'),
  ('gti-s7-lect', 'gti', 7, 1, 'Lectura', 'Lectura de la semana 7', '8 páginas'),
  ('gti-s7-vid', 'gti', 7, 2, 'Video', 'Video — Gestión de la disponibilidad', '10 min'),
  ('gti-s8-pres', 'gti', 8, 0, 'Presentación', 'Presentación — Transición del servicio', '17 diapositivas'),
  ('gti-s8-lect', 'gti', 8, 1, 'Lectura', 'Lectura de la semana 8', '15 páginas'),
  ('gti-s8-vid', 'gti', 8, 2, 'Video', 'Video — Transición del servicio', '17 min'),
  ('gti-s9-guia', 'gti', 9, 0, 'Lectura', 'Guía de repaso — Examen parcial', '12 páginas'),
  ('gti-s9-pres', 'gti', 9, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('gti-s10-pres', 'gti', 10, 0, 'Presentación', 'Presentación — Gestión de cambios', '18 diapositivas'),
  ('gti-s10-lect', 'gti', 10, 1, 'Lectura', 'Lectura de la semana 10', '14 páginas'),
  ('gti-s10-vid', 'gti', 10, 2, 'Video', 'Video — Gestión de cambios', '12 min'),
  ('gti-s11-pres', 'gti', 11, 0, 'Presentación', 'Presentación — Gestión de configuraciones y activos', '17 diapositivas'),
  ('gti-s11-lect', 'gti', 11, 1, 'Lectura', 'Lectura de la semana 11', '19 páginas'),
  ('gti-s11-vid', 'gti', 11, 2, 'Video', 'Video — Gestión de configuraciones y activos', '11 min'),
  ('gti-s12-pres', 'gti', 12, 0, 'Presentación', 'Presentación — Operación del servicio', '16 diapositivas'),
  ('gti-s12-lect', 'gti', 12, 1, 'Lectura', 'Lectura de la semana 12', '18 páginas'),
  ('gti-s12-vid', 'gti', 12, 2, 'Video', 'Video — Operación del servicio', '10 min'),
  ('gti-s13-pres', 'gti', 13, 0, 'Presentación', 'Presentación — Gestión de incidentes', '15 diapositivas'),
  ('gti-s13-lect', 'gti', 13, 1, 'Lectura', 'Lectura de la semana 13', '9 páginas'),
  ('gti-s13-vid', 'gti', 13, 2, 'Video', 'Video — Gestión de incidentes', '9 min'),
  ('gti-s14-pres', 'gti', 14, 0, 'Presentación', 'Presentación — Gestión de problemas', '22 diapositivas'),
  ('gti-s14-lect', 'gti', 14, 1, 'Lectura', 'Lectura de la semana 14', '8 páginas'),
  ('gti-s14-vid', 'gti', 14, 2, 'Video', 'Video — Gestión de problemas', '8 min'),
  ('gti-s15-pres', 'gti', 15, 0, 'Presentación', 'Presentación — Mesa de servicio', '21 diapositivas'),
  ('gti-s15-lect', 'gti', 15, 1, 'Lectura', 'Lectura de la semana 15', '13 páginas'),
  ('gti-s15-vid', 'gti', 15, 2, 'Video', 'Video — Mesa de servicio', '17 min'),
  ('gti-s16-pres', 'gti', 16, 0, 'Presentación', 'Presentación — Mejora continua del servicio', '20 diapositivas'),
  ('gti-s16-lect', 'gti', 16, 1, 'Lectura', 'Lectura de la semana 16', '12 páginas'),
  ('gti-s16-vid', 'gti', 16, 2, 'Video', 'Video — Mejora continua del servicio', '16 min'),
  ('gti-s17-pres', 'gti', 17, 0, 'Presentación', 'Presentación — Gobierno de TI y casos integradores', '19 diapositivas'),
  ('gti-s17-lect', 'gti', 17, 1, 'Lectura', 'Lectura de la semana 17', '17 páginas'),
  ('gti-s17-vid', 'gti', 17, 2, 'Video', 'Video — Gobierno de TI y casos integradores', '15 min'),
  ('gti-s18-guia', 'gti', 18, 0, 'Lectura', 'Guía de repaso — Examen final', '12 páginas'),
  ('gti-s18-pres', 'gti', 18, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('ihm-s1-pres', 'ihm', 1, 0, 'Presentación', 'Presentación — Introducción a la IHC y la usabilidad', '16 diapositivas'),
  ('ihm-s1-lect', 'ihm', 1, 1, 'Lectura', 'Lectura de la semana 1', '8 páginas'),
  ('ihm-s1-vid', 'ihm', 1, 2, 'Video', 'Video — Introducción a la IHC y la usabilidad', '12 min'),
  ('ihm-s2-pres', 'ihm', 2, 0, 'Presentación', 'Presentación — Factores humanos y percepción', '17 diapositivas'),
  ('ihm-s2-lect', 'ihm', 2, 1, 'Lectura', 'Lectura de la semana 2', '9 páginas'),
  ('ihm-s2-vid', 'ihm', 2, 2, 'Video', 'Video — Factores humanos y percepción', '13 min'),
  ('ihm-s3-pres', 'ihm', 3, 0, 'Presentación', 'Presentación — Principios del diseño de interacción', '18 diapositivas'),
  ('ihm-s3-lect', 'ihm', 3, 1, 'Lectura', 'Lectura de la semana 3', '18 páginas'),
  ('ihm-s3-vid', 'ihm', 3, 2, 'Video', 'Video — Principios del diseño de interacción', '14 min'),
  ('ihm-s4-pres', 'ihm', 4, 0, 'Presentación', 'Presentación — Heurísticas de Nielsen', '23 diapositivas'),
  ('ihm-s4-lect', 'ihm', 4, 1, 'Lectura', 'Lectura de la semana 4', '21 páginas'),
  ('ihm-s4-vid', 'ihm', 4, 2, 'Video', 'Video — Heurísticas de Nielsen', '15 min'),
  ('ihm-s5-pres', 'ihm', 5, 0, 'Presentación', 'Presentación — Investigación con usuarios', '24 diapositivas'),
  ('ihm-s5-lect', 'ihm', 5, 1, 'Lectura', 'Lectura de la semana 5', '16 páginas'),
  ('ihm-s5-vid', 'ihm', 5, 2, 'Video', 'Video — Investigación con usuarios', '16 min'),
  ('ihm-s6-pres', 'ihm', 6, 0, 'Presentación', 'Presentación — Personas y escenarios de uso', '25 diapositivas'),
  ('ihm-s6-lect', 'ihm', 6, 1, 'Lectura', 'Lectura de la semana 6', '17 páginas'),
  ('ihm-s6-vid', 'ihm', 6, 2, 'Video', 'Video — Personas y escenarios de uso', '17 min'),
  ('ihm-s7-pres', 'ihm', 7, 0, 'Presentación', 'Presentación — Arquitectura de información', '14 diapositivas'),
  ('ihm-s7-lect', 'ihm', 7, 1, 'Lectura', 'Lectura de la semana 7', '12 páginas'),
  ('ihm-s7-vid', 'ihm', 7, 2, 'Video', 'Video — Arquitectura de información', '8 min'),
  ('ihm-s8-pres', 'ihm', 8, 0, 'Presentación', 'Presentación — Prototipado de baja fidelidad', '23 diapositivas'),
  ('ihm-s8-lect', 'ihm', 8, 1, 'Lectura', 'Lectura de la semana 8', '11 páginas'),
  ('ihm-s8-vid', 'ihm', 8, 2, 'Video', 'Video — Prototipado de baja fidelidad', '13 min'),
  ('ihm-s9-guia', 'ihm', 9, 0, 'Lectura', 'Guía de repaso — Examen parcial', '12 páginas'),
  ('ihm-s9-pres', 'ihm', 9, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('ihm-s10-pres', 'ihm', 10, 0, 'Presentación', 'Presentación — Prototipado de alta fidelidad', '16 diapositivas'),
  ('ihm-s10-lect', 'ihm', 10, 1, 'Lectura', 'Lectura de la semana 10', '10 páginas'),
  ('ihm-s10-vid', 'ihm', 10, 2, 'Video', 'Video — Prototipado de alta fidelidad', '16 min'),
  ('ihm-s11-pres', 'ihm', 11, 0, 'Presentación', 'Presentación — Sistemas de diseño', '15 diapositivas'),
  ('ihm-s11-lect', 'ihm', 11, 1, 'Lectura', 'Lectura de la semana 11', '15 páginas'),
  ('ihm-s11-vid', 'ihm', 11, 2, 'Video', 'Video — Sistemas de diseño', '15 min'),
  ('ihm-s12-pres', 'ihm', 12, 0, 'Presentación', 'Presentación — Accesibilidad e inclusión', '18 diapositivas'),
  ('ihm-s12-lect', 'ihm', 12, 1, 'Lectura', 'Lectura de la semana 12', '20 páginas'),
  ('ihm-s12-vid', 'ihm', 12, 2, 'Video', 'Video — Accesibilidad e inclusión', '8 min'),
  ('ihm-s13-pres', 'ihm', 13, 0, 'Presentación', 'Presentación — Interfaces por voz y multimodales', '17 diapositivas'),
  ('ihm-s13-lect', 'ihm', 13, 1, 'Lectura', 'Lectura de la semana 13', '11 páginas'),
  ('ihm-s13-vid', 'ihm', 13, 2, 'Video', 'Video — Interfaces por voz y multimodales', '17 min'),
  ('ihm-s14-pres', 'ihm', 14, 0, 'Presentación', 'Presentación — Evaluación heurística', '20 diapositivas'),
  ('ihm-s14-lect', 'ihm', 14, 1, 'Lectura', 'Lectura de la semana 14', '18 páginas'),
  ('ihm-s14-vid', 'ihm', 14, 2, 'Video', 'Video — Evaluación heurística', '12 min'),
  ('ihm-s15-pres', 'ihm', 15, 0, 'Presentación', 'Presentación — Pruebas de usabilidad y cuestionario SUS', '19 diapositivas'),
  ('ihm-s15-lect', 'ihm', 15, 1, 'Lectura', 'Lectura de la semana 15', '9 páginas'),
  ('ihm-s15-vid', 'ihm', 15, 2, 'Video', 'Video — Pruebas de usabilidad y cuestionario SUS', '11 min'),
  ('ihm-s16-pres', 'ihm', 16, 0, 'Presentación', 'Presentación — Inteligencia artificial en la interacción', '22 diapositivas'),
  ('ihm-s16-lect', 'ihm', 16, 1, 'Lectura', 'Lectura de la semana 16', '14 páginas'),
  ('ihm-s16-vid', 'ihm', 16, 2, 'Video', 'Video — Inteligencia artificial en la interacción', '14 min'),
  ('ihm-s17-pres', 'ihm', 17, 0, 'Presentación', 'Presentación — Presentación de proyectos', '21 diapositivas'),
  ('ihm-s17-lect', 'ihm', 17, 1, 'Lectura', 'Lectura de la semana 17', '19 páginas'),
  ('ihm-s17-vid', 'ihm', 17, 2, 'Video', 'Video — Presentación de proyectos', '13 min'),
  ('ihm-s18-guia', 'ihm', 18, 0, 'Lectura', 'Guía de repaso — Examen final', '12 páginas'),
  ('ihm-s18-pres', 'ihm', 18, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('dwi-s1-pres', 'dwi', 1, 0, 'Presentación', 'Presentación — Fundamentos de la web moderna', '16 diapositivas'),
  ('dwi-s1-lect', 'dwi', 1, 1, 'Lectura', 'Lectura de la semana 1', '8 páginas'),
  ('dwi-s1-vid', 'dwi', 1, 2, 'Video', 'Video — Fundamentos de la web moderna', '14 min'),
  ('dwi-s2-pres', 'dwi', 2, 0, 'Presentación', 'Presentación — HTML5 semántico y accesibilidad', '17 diapositivas'),
  ('dwi-s2-lect', 'dwi', 2, 1, 'Lectura', 'Lectura de la semana 2', '9 páginas'),
  ('dwi-s2-vid', 'dwi', 2, 2, 'Video', 'Video — HTML5 semántico y accesibilidad', '15 min'),
  ('dwi-s3-pres', 'dwi', 3, 0, 'Presentación', 'Presentación — CSS y diseño responsivo', '18 diapositivas'),
  ('dwi-s3-lect', 'dwi', 3, 1, 'Lectura', 'Lectura de la semana 3', '18 páginas'),
  ('dwi-s3-vid', 'dwi', 3, 2, 'Video', 'Video — CSS y diseño responsivo', '16 min'),
  ('dwi-s4-pres', 'dwi', 4, 0, 'Presentación', 'Presentación — JavaScript moderno (ES6+)', '19 diapositivas'),
  ('dwi-s4-lect', 'dwi', 4, 1, 'Lectura', 'Lectura de la semana 4', '19 páginas'),
  ('dwi-s4-vid', 'dwi', 4, 2, 'Video', 'Video — JavaScript moderno (ES6+)', '9 min'),
  ('dwi-s5-pres', 'dwi', 5, 0, 'Presentación', 'Presentación — Programación asíncrona y APIs REST', '20 diapositivas'),
  ('dwi-s5-lect', 'dwi', 5, 1, 'Lectura', 'Lectura de la semana 5', '14 páginas'),
  ('dwi-s5-vid', 'dwi', 5, 2, 'Video', 'Video — Programación asíncrona y APIs REST', '10 min'),
  ('dwi-s6-pres', 'dwi', 6, 0, 'Presentación', 'Presentación — TypeScript esencial', '21 diapositivas'),
  ('dwi-s6-lect', 'dwi', 6, 1, 'Lectura', 'Lectura de la semana 6', '15 páginas'),
  ('dwi-s6-vid', 'dwi', 6, 2, 'Video', 'Video — TypeScript esencial', '11 min'),
  ('dwi-s7-pres', 'dwi', 7, 0, 'Presentación', 'Presentación — Introducción a React', '22 diapositivas'),
  ('dwi-s7-lect', 'dwi', 7, 1, 'Lectura', 'Lectura de la semana 7', '10 páginas'),
  ('dwi-s7-vid', 'dwi', 7, 2, 'Video', 'Video — Introducción a React', '12 min'),
  ('dwi-s8-pres', 'dwi', 8, 0, 'Presentación', 'Presentación — Estado y eventos en React', '23 diapositivas'),
  ('dwi-s8-lect', 'dwi', 8, 1, 'Lectura', 'Lectura de la semana 8', '15 páginas'),
  ('dwi-s8-vid', 'dwi', 8, 2, 'Video', 'Video — Estado y eventos en React', '11 min'),
  ('dwi-s9-guia', 'dwi', 9, 0, 'Lectura', 'Guía de repaso — Examen parcial', '12 páginas'),
  ('dwi-s9-pres', 'dwi', 9, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('dwi-s10-pres', 'dwi', 10, 0, 'Presentación', 'Presentación — Enrutamiento y formularios', '24 diapositivas'),
  ('dwi-s10-lect', 'dwi', 10, 1, 'Lectura', 'Lectura de la semana 10', '16 páginas'),
  ('dwi-s10-vid', 'dwi', 10, 2, 'Video', 'Video — Enrutamiento y formularios', '14 min'),
  ('dwi-s11-pres', 'dwi', 11, 0, 'Presentación', 'Presentación — Consumo de datos y caché', '23 diapositivas'),
  ('dwi-s11-lect', 'dwi', 11, 1, 'Lectura', 'Lectura de la semana 11', '21 páginas'),
  ('dwi-s11-vid', 'dwi', 11, 2, 'Video', 'Video — Consumo de datos y caché', '13 min'),
  ('dwi-s12-pres', 'dwi', 12, 0, 'Presentación', 'Presentación — Autenticación y seguridad web', '14 diapositivas'),
  ('dwi-s12-lect', 'dwi', 12, 1, 'Lectura', 'Lectura de la semana 12', '12 páginas'),
  ('dwi-s12-vid', 'dwi', 12, 2, 'Video', 'Video — Autenticación y seguridad web', '16 min'),
  ('dwi-s13-pres', 'dwi', 13, 0, 'Presentación', 'Presentación — Backend como servicio (Supabase)', '25 diapositivas'),
  ('dwi-s13-lect', 'dwi', 13, 1, 'Lectura', 'Lectura de la semana 13', '17 páginas'),
  ('dwi-s13-vid', 'dwi', 13, 2, 'Video', 'Video — Backend como servicio (Supabase)', '15 min'),
  ('dwi-s14-pres', 'dwi', 14, 0, 'Presentación', 'Presentación — Pruebas y calidad de código', '20 diapositivas'),
  ('dwi-s14-lect', 'dwi', 14, 1, 'Lectura', 'Lectura de la semana 14', '8 páginas'),
  ('dwi-s14-vid', 'dwi', 14, 2, 'Video', 'Video — Pruebas y calidad de código', '8 min'),
  ('dwi-s15-pres', 'dwi', 15, 0, 'Presentación', 'Presentación — Rendimiento y despliegue', '19 diapositivas'),
  ('dwi-s15-lect', 'dwi', 15, 1, 'Lectura', 'Lectura de la semana 15', '13 páginas'),
  ('dwi-s15-vid', 'dwi', 15, 2, 'Video', 'Video — Rendimiento y despliegue', '17 min'),
  ('dwi-s16-pres', 'dwi', 16, 0, 'Presentación', 'Presentación — PWA y experiencia móvil', '22 diapositivas'),
  ('dwi-s16-lect', 'dwi', 16, 1, 'Lectura', 'Lectura de la semana 16', '18 páginas'),
  ('dwi-s16-vid', 'dwi', 16, 2, 'Video', 'Video — PWA y experiencia móvil', '10 min'),
  ('dwi-s17-pres', 'dwi', 17, 0, 'Presentación', 'Presentación — Presentación del proyecto web', '21 diapositivas'),
  ('dwi-s17-lect', 'dwi', 17, 1, 'Lectura', 'Lectura de la semana 17', '9 páginas'),
  ('dwi-s17-vid', 'dwi', 17, 2, 'Video', 'Video — Presentación del proyecto web', '9 min'),
  ('dwi-s18-guia', 'dwi', 18, 0, 'Lectura', 'Guía de repaso — Examen final', '12 páginas'),
  ('dwi-s18-pres', 'dwi', 18, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('ci2-s1-pres', 'ci2', 1, 0, 'Presentación', 'Presentación — Metodologías ágiles y Scrum', '14 diapositivas'),
  ('ci2-s1-lect', 'ci2', 1, 1, 'Lectura', 'Lectura de la semana 1', '16 páginas'),
  ('ci2-s1-vid', 'ci2', 1, 2, 'Video', 'Video — Metodologías ágiles y Scrum', '8 min'),
  ('ci2-s2-pres', 'ci2', 2, 0, 'Presentación', 'Presentación — Levantamiento de requerimientos', '23 diapositivas'),
  ('ci2-s2-lect', 'ci2', 2, 1, 'Lectura', 'Lectura de la semana 2', '11 páginas'),
  ('ci2-s2-vid', 'ci2', 2, 2, 'Video', 'Video — Levantamiento de requerimientos', '15 min'),
  ('ci2-s3-pres', 'ci2', 3, 0, 'Presentación', 'Presentación — Historias de usuario y backlog', '24 diapositivas'),
  ('ci2-s3-lect', 'ci2', 3, 1, 'Lectura', 'Lectura de la semana 3', '20 páginas'),
  ('ci2-s3-vid', 'ci2', 3, 2, 'Video', 'Video — Historias de usuario y backlog', '16 min'),
  ('ci2-s4-pres', 'ci2', 4, 0, 'Presentación', 'Presentación — Arquitectura de software', '21 diapositivas'),
  ('ci2-s4-lect', 'ci2', 4, 1, 'Lectura', 'Lectura de la semana 4', '15 páginas'),
  ('ci2-s4-vid', 'ci2', 4, 2, 'Video', 'Video — Arquitectura de software', '11 min'),
  ('ci2-s5-pres', 'ci2', 5, 0, 'Presentación', 'Presentación — Modelado y diseño de la solución', '22 diapositivas'),
  ('ci2-s5-lect', 'ci2', 5, 1, 'Lectura', 'Lectura de la semana 5', '10 páginas'),
  ('ci2-s5-vid', 'ci2', 5, 2, 'Video', 'Video — Modelado y diseño de la solución', '12 min'),
  ('ci2-s6-pres', 'ci2', 6, 0, 'Presentación', 'Presentación — Control de versiones y trabajo colaborativo', '19 diapositivas'),
  ('ci2-s6-lect', 'ci2', 6, 1, 'Lectura', 'Lectura de la semana 6', '19 páginas'),
  ('ci2-s6-vid', 'ci2', 6, 2, 'Video', 'Video — Control de versiones y trabajo colaborativo', '9 min'),
  ('ci2-s7-pres', 'ci2', 7, 0, 'Presentación', 'Presentación — Integración continua', '20 diapositivas'),
  ('ci2-s7-lect', 'ci2', 7, 1, 'Lectura', 'Lectura de la semana 7', '14 páginas'),
  ('ci2-s7-vid', 'ci2', 7, 2, 'Video', 'Video — Integración continua', '10 min'),
  ('ci2-s8-pres', 'ci2', 8, 0, 'Presentación', 'Presentación — Planificación del proyecto integrador', '21 diapositivas'),
  ('ci2-s8-lect', 'ci2', 8, 1, 'Lectura', 'Lectura de la semana 8', '9 páginas'),
  ('ci2-s8-vid', 'ci2', 8, 2, 'Video', 'Video — Planificación del proyecto integrador', '15 min'),
  ('ci2-s9-guia', 'ci2', 9, 0, 'Lectura', 'Guía de repaso — Examen parcial', '12 páginas'),
  ('ci2-s9-pres', 'ci2', 9, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('ci2-s10-pres', 'ci2', 10, 0, 'Presentación', 'Presentación — Desarrollo incremental', '18 diapositivas'),
  ('ci2-s10-lect', 'ci2', 10, 1, 'Lectura', 'Lectura de la semana 10', '8 páginas'),
  ('ci2-s10-vid', 'ci2', 10, 2, 'Video', 'Video — Desarrollo incremental', '10 min'),
  ('ci2-s11-pres', 'ci2', 11, 0, 'Presentación', 'Presentación — Aseguramiento de la calidad', '17 diapositivas'),
  ('ci2-s11-lect', 'ci2', 11, 1, 'Lectura', 'Lectura de la semana 11', '13 páginas'),
  ('ci2-s11-vid', 'ci2', 11, 2, 'Video', 'Video — Aseguramiento de la calidad', '9 min'),
  ('ci2-s12-pres', 'ci2', 12, 0, 'Presentación', 'Presentación — Pruebas de integración', '16 diapositivas'),
  ('ci2-s12-lect', 'ci2', 12, 1, 'Lectura', 'Lectura de la semana 12', '12 páginas'),
  ('ci2-s12-vid', 'ci2', 12, 2, 'Video', 'Video — Pruebas de integración', '8 min'),
  ('ci2-s13-pres', 'ci2', 13, 0, 'Presentación', 'Presentación — Gestión de riesgos', '15 diapositivas'),
  ('ci2-s13-lect', 'ci2', 13, 1, 'Lectura', 'Lectura de la semana 13', '17 páginas'),
  ('ci2-s13-vid', 'ci2', 13, 2, 'Video', 'Video — Gestión de riesgos', '17 min'),
  ('ci2-s14-pres', 'ci2', 14, 0, 'Presentación', 'Presentación — Documentación técnica', '14 diapositivas'),
  ('ci2-s14-lect', 'ci2', 14, 1, 'Lectura', 'Lectura de la semana 14', '14 páginas'),
  ('ci2-s14-vid', 'ci2', 14, 2, 'Video', 'Video — Documentación técnica', '14 min'),
  ('ci2-s15-pres', 'ci2', 15, 0, 'Presentación', 'Presentación — Despliegue y operación', '25 diapositivas'),
  ('ci2-s15-lect', 'ci2', 15, 1, 'Lectura', 'Lectura de la semana 15', '19 páginas'),
  ('ci2-s15-vid', 'ci2', 15, 2, 'Video', 'Video — Despliegue y operación', '13 min'),
  ('ci2-s16-pres', 'ci2', 16, 0, 'Presentación', 'Presentación — Sustentación y demostración', '24 diapositivas'),
  ('ci2-s16-lect', 'ci2', 16, 1, 'Lectura', 'Lectura de la semana 16', '18 páginas'),
  ('ci2-s16-vid', 'ci2', 16, 2, 'Video', 'Video — Sustentación y demostración', '12 min'),
  ('ci2-s17-pres', 'ci2', 17, 0, 'Presentación', 'Presentación — Cierre y lecciones aprendidas', '23 diapositivas'),
  ('ci2-s17-lect', 'ci2', 17, 1, 'Lectura', 'Lectura de la semana 17', '9 páginas'),
  ('ci2-s17-vid', 'ci2', 17, 2, 'Video', 'Video — Cierre y lecciones aprendidas', '11 min'),
  ('ci2-s18-guia', 'ci2', 18, 0, 'Lectura', 'Guía de repaso — Examen final', '12 páginas'),
  ('ci2-s18-pres', 'ci2', 18, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas')
on conflict (id) do update set semana = excluded.semana, orden = excluded.orden, tipo = excluded.tipo, titulo = excluded.titulo, detalle = excluded.detalle;

insert into public.course_evaluations (id, course_id, clave, orden, nombre, semana, peso) values
  ('gti-ta1', 'gti', 'ta1', 0, 'Tarea académica 1', 3, 5),
  ('gti-pc1', 'gti', 'pc1', 1, 'Práctica calificada 1', 5, 10),
  ('gti-ep', 'gti', 'ep', 2, 'Examen parcial', 9, 20),
  ('gti-ta2', 'gti', 'ta2', 3, 'Tarea académica 2', 11, 5),
  ('gti-pc2', 'gti', 'pc2', 4, 'Práctica calificada 2', 13, 15),
  ('gti-pf', 'gti', 'pf', 5, 'Caso de estudio', 16, 15),
  ('gti-ef', 'gti', 'ef', 6, 'Examen final', 18, 30),
  ('ihm-ta1', 'ihm', 'ta1', 0, 'Tarea académica 1', 3, 5),
  ('ihm-pc1', 'ihm', 'pc1', 1, 'Práctica calificada 1', 5, 10),
  ('ihm-ep', 'ihm', 'ep', 2, 'Examen parcial', 9, 20),
  ('ihm-ta2', 'ihm', 'ta2', 3, 'Tarea académica 2', 11, 5),
  ('ihm-pc2', 'ihm', 'pc2', 4, 'Práctica calificada 2', 13, 15),
  ('ihm-pf', 'ihm', 'pf', 5, 'Proyecto final (MVP)', 16, 15),
  ('ihm-ef', 'ihm', 'ef', 6, 'Examen final', 18, 30),
  ('dwi-ta1', 'dwi', 'ta1', 0, 'Tarea académica 1', 3, 5),
  ('dwi-pc1', 'dwi', 'pc1', 1, 'Práctica calificada 1', 5, 10),
  ('dwi-ep', 'dwi', 'ep', 2, 'Examen parcial', 9, 20),
  ('dwi-ta2', 'dwi', 'ta2', 3, 'Tarea académica 2', 11, 5),
  ('dwi-pc2', 'dwi', 'pc2', 4, 'Práctica calificada 2', 13, 15),
  ('dwi-pf', 'dwi', 'pf', 5, 'Proyecto web', 16, 15),
  ('dwi-ef', 'dwi', 'ef', 6, 'Examen final', 18, 30),
  ('ci2-ta1', 'ci2', 'ta1', 0, 'Tarea académica 1', 3, 5),
  ('ci2-pc1', 'ci2', 'pc1', 1, 'Práctica calificada 1', 5, 10),
  ('ci2-ep', 'ci2', 'ep', 2, 'Examen parcial', 9, 20),
  ('ci2-ta2', 'ci2', 'ta2', 3, 'Tarea académica 2', 11, 5),
  ('ci2-pc2', 'ci2', 'pc2', 4, 'Práctica calificada 2', 13, 15),
  ('ci2-pf', 'ci2', 'pf', 5, 'Proyecto integrador', 16, 15),
  ('ci2-ef', 'ci2', 'ef', 6, 'Examen final', 18, 30)
on conflict (id) do update set clave = excluded.clave, orden = excluded.orden, nombre = excluded.nombre, semana = excluded.semana, peso = excluded.peso;

insert into public.course_tasks (id, course_id, titulo, semana) values
  ('gti-t2', 'gti', 'Actividad 1: Ciclo de vida del servicio', 2),
  ('gti-t4', 'gti', 'Actividad 2: Diseño del servicio', 4),
  ('gti-t6', 'gti', 'Actividad 3: Gestión de la demanda y la capacidad', 6),
  ('gti-t8', 'gti', 'Actividad 4: Transición del servicio', 8),
  ('gti-t10', 'gti', 'Actividad 5: Gestión de cambios', 10),
  ('gti-t12', 'gti', 'Actividad 6: Operación del servicio', 12),
  ('gti-t13', 'gti', 'Actividad 7: Gestión de incidentes', 13),
  ('gti-t14', 'gti', 'Actividad 8: Gestión de problemas', 14),
  ('gti-t15', 'gti', 'Actividad 9: Mesa de servicio', 15),
  ('ihm-t2', 'ihm', 'Actividad 1: Factores humanos y percepción', 2),
  ('ihm-t4', 'ihm', 'Actividad 2: Heurísticas de Nielsen', 4),
  ('ihm-t6', 'ihm', 'Actividad 3: Personas y escenarios de uso', 6),
  ('ihm-t8', 'ihm', 'Actividad 4: Prototipado de baja fidelidad', 8),
  ('ihm-t10', 'ihm', 'Actividad 5: Prototipado de alta fidelidad', 10),
  ('ihm-t12', 'ihm', 'Actividad 6: Accesibilidad e inclusión', 12),
  ('ihm-t13', 'ihm', 'Actividad 7: Interfaces por voz y multimodales', 13),
  ('ihm-t14', 'ihm', 'Actividad 8: Evaluación heurística', 14),
  ('ihm-t15', 'ihm', 'Actividad 9: Pruebas de usabilidad y cuestionario SUS', 15),
  ('dwi-t2', 'dwi', 'Actividad 1: HTML5 semántico y accesibilidad', 2),
  ('dwi-t4', 'dwi', 'Actividad 2: JavaScript moderno (ES6+)', 4),
  ('dwi-t6', 'dwi', 'Actividad 3: TypeScript esencial', 6),
  ('dwi-t8', 'dwi', 'Actividad 4: Estado y eventos en React', 8),
  ('dwi-t10', 'dwi', 'Actividad 5: Enrutamiento y formularios', 10),
  ('dwi-t12', 'dwi', 'Actividad 6: Autenticación y seguridad web', 12),
  ('dwi-t13', 'dwi', 'Actividad 7: Backend como servicio (Supabase)', 13),
  ('dwi-t14', 'dwi', 'Actividad 8: Pruebas y calidad de código', 14),
  ('dwi-t15', 'dwi', 'Actividad 9: Rendimiento y despliegue', 15),
  ('ci2-t2', 'ci2', 'Actividad 1: Levantamiento de requerimientos', 2),
  ('ci2-t4', 'ci2', 'Actividad 2: Arquitectura de software', 4),
  ('ci2-t6', 'ci2', 'Actividad 3: Control de versiones y trabajo colaborativo', 6),
  ('ci2-t8', 'ci2', 'Actividad 4: Planificación del proyecto integrador', 8),
  ('ci2-t10', 'ci2', 'Actividad 5: Desarrollo incremental', 10),
  ('ci2-t12', 'ci2', 'Actividad 6: Pruebas de integración', 12),
  ('ci2-t13', 'ci2', 'Actividad 7: Gestión de riesgos', 13),
  ('ci2-t14', 'ci2', 'Actividad 8: Documentación técnica', 14),
  ('ci2-t15', 'ci2', 'Actividad 9: Despliegue y operación', 15)
on conflict (id) do update set titulo = excluded.titulo, semana = excluded.semana;

insert into public.course_threads (id, course_id, semana, titulo, tipo, descripcion) values
  ('gti-general', 'gti', null, 'Foro general del curso', 'no_calificado', 'Espacio para dudas generales del curso, coordinación entre compañeros y avisos no urgentes.'),
  ('gti-f1', 'gti', 1, 'Foro de Consultas - Semana 1', 'no_calificado', 'Comparte aquí tus dudas sobre «Fundamentos de la gestión de servicios de TI». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f2', 'gti', 2, 'Foro de Consultas - Semana 2', 'no_calificado', 'Comparte aquí tus dudas sobre «Ciclo de vida del servicio». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f3', 'gti', 3, 'Foro calificado - Semana 3', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Estrategia del servicio». Se califica la calidad del análisis, no la extensión.'),
  ('gti-f4', 'gti', 4, 'Foro de Consultas - Semana 4', 'no_calificado', 'Comparte aquí tus dudas sobre «Diseño del servicio». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f5', 'gti', 5, 'Foro de Consultas - Semana 5', 'no_calificado', 'Comparte aquí tus dudas sobre «Catálogo y niveles de servicio (SLA)». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f6', 'gti', 6, 'Foro de Consultas - Semana 6', 'no_calificado', 'Comparte aquí tus dudas sobre «Gestión de la demanda y la capacidad». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f7', 'gti', 7, 'Foro calificado - Semana 7', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Gestión de la disponibilidad». Se califica la calidad del análisis, no la extensión.'),
  ('gti-f8', 'gti', 8, 'Foro de Consultas - Semana 8', 'no_calificado', 'Comparte aquí tus dudas sobre «Transición del servicio». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f9', 'gti', 9, 'Foro de Consultas - Semana 9', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen parcial». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f10', 'gti', 10, 'Foro de Consultas - Semana 10', 'no_calificado', 'Comparte aquí tus dudas sobre «Gestión de cambios». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f11', 'gti', 11, 'Foro calificado - Semana 11', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Gestión de configuraciones y activos». Se califica la calidad del análisis, no la extensión.'),
  ('gti-f12', 'gti', 12, 'Foro de Consultas - Semana 12', 'no_calificado', 'Comparte aquí tus dudas sobre «Operación del servicio». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f13', 'gti', 13, 'Foro de Consultas - Semana 13', 'no_calificado', 'Comparte aquí tus dudas sobre «Gestión de incidentes». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f14', 'gti', 14, 'Foro de Consultas - Semana 14', 'no_calificado', 'Comparte aquí tus dudas sobre «Gestión de problemas». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f15', 'gti', 15, 'Foro calificado - Semana 15', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Mesa de servicio». Se califica la calidad del análisis, no la extensión.'),
  ('gti-f16', 'gti', 16, 'Foro de Consultas - Semana 16', 'no_calificado', 'Comparte aquí tus dudas sobre «Mejora continua del servicio». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f17', 'gti', 17, 'Foro de Consultas - Semana 17', 'no_calificado', 'Comparte aquí tus dudas sobre «Gobierno de TI y casos integradores». El docente y tus compañeros responderán durante la semana.'),
  ('gti-f18', 'gti', 18, 'Foro de Consultas - Semana 18', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen final». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-general', 'ihm', null, 'Foro general del curso', 'no_calificado', 'Espacio para dudas generales del curso, coordinación entre compañeros y avisos no urgentes.'),
  ('ihm-f1', 'ihm', 1, 'Foro de Consultas - Semana 1', 'no_calificado', 'Comparte aquí tus dudas sobre «Introducción a la IHC y la usabilidad». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f2', 'ihm', 2, 'Foro de Consultas - Semana 2', 'no_calificado', 'Comparte aquí tus dudas sobre «Factores humanos y percepción». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f3', 'ihm', 3, 'Foro calificado - Semana 3', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Principios del diseño de interacción». Se califica la calidad del análisis, no la extensión.'),
  ('ihm-f4', 'ihm', 4, 'Foro de Consultas - Semana 4', 'no_calificado', 'Comparte aquí tus dudas sobre «Heurísticas de Nielsen». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f5', 'ihm', 5, 'Foro de Consultas - Semana 5', 'no_calificado', 'Comparte aquí tus dudas sobre «Investigación con usuarios». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f6', 'ihm', 6, 'Foro de Consultas - Semana 6', 'no_calificado', 'Comparte aquí tus dudas sobre «Personas y escenarios de uso». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f7', 'ihm', 7, 'Foro calificado - Semana 7', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Arquitectura de información». Se califica la calidad del análisis, no la extensión.'),
  ('ihm-f8', 'ihm', 8, 'Foro de Consultas - Semana 8', 'no_calificado', 'Comparte aquí tus dudas sobre «Prototipado de baja fidelidad». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f9', 'ihm', 9, 'Foro de Consultas - Semana 9', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen parcial». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f10', 'ihm', 10, 'Foro de Consultas - Semana 10', 'no_calificado', 'Comparte aquí tus dudas sobre «Prototipado de alta fidelidad». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f11', 'ihm', 11, 'Foro calificado - Semana 11', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Sistemas de diseño». Se califica la calidad del análisis, no la extensión.'),
  ('ihm-f12', 'ihm', 12, 'Foro de Consultas - Semana 12', 'no_calificado', 'Comparte aquí tus dudas sobre «Accesibilidad e inclusión». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f13', 'ihm', 13, 'Foro de Consultas - Semana 13', 'no_calificado', 'Comparte aquí tus dudas sobre «Interfaces por voz y multimodales». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f14', 'ihm', 14, 'Foro de Consultas - Semana 14', 'no_calificado', 'Comparte aquí tus dudas sobre «Evaluación heurística». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f15', 'ihm', 15, 'Foro calificado - Semana 15', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Pruebas de usabilidad y cuestionario SUS». Se califica la calidad del análisis, no la extensión.'),
  ('ihm-f16', 'ihm', 16, 'Foro de Consultas - Semana 16', 'no_calificado', 'Comparte aquí tus dudas sobre «Inteligencia artificial en la interacción». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f17', 'ihm', 17, 'Foro de Consultas - Semana 17', 'no_calificado', 'Comparte aquí tus dudas sobre «Presentación de proyectos». El docente y tus compañeros responderán durante la semana.'),
  ('ihm-f18', 'ihm', 18, 'Foro de Consultas - Semana 18', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen final». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-general', 'dwi', null, 'Foro general del curso', 'no_calificado', 'Espacio para dudas generales del curso, coordinación entre compañeros y avisos no urgentes.'),
  ('dwi-f1', 'dwi', 1, 'Foro de Consultas - Semana 1', 'no_calificado', 'Comparte aquí tus dudas sobre «Fundamentos de la web moderna». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f2', 'dwi', 2, 'Foro de Consultas - Semana 2', 'no_calificado', 'Comparte aquí tus dudas sobre «HTML5 semántico y accesibilidad». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f3', 'dwi', 3, 'Foro calificado - Semana 3', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «CSS y diseño responsivo». Se califica la calidad del análisis, no la extensión.'),
  ('dwi-f4', 'dwi', 4, 'Foro de Consultas - Semana 4', 'no_calificado', 'Comparte aquí tus dudas sobre «JavaScript moderno (ES6+)». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f5', 'dwi', 5, 'Foro de Consultas - Semana 5', 'no_calificado', 'Comparte aquí tus dudas sobre «Programación asíncrona y APIs REST». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f6', 'dwi', 6, 'Foro de Consultas - Semana 6', 'no_calificado', 'Comparte aquí tus dudas sobre «TypeScript esencial». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f7', 'dwi', 7, 'Foro calificado - Semana 7', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Introducción a React». Se califica la calidad del análisis, no la extensión.'),
  ('dwi-f8', 'dwi', 8, 'Foro de Consultas - Semana 8', 'no_calificado', 'Comparte aquí tus dudas sobre «Estado y eventos en React». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f9', 'dwi', 9, 'Foro de Consultas - Semana 9', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen parcial». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f10', 'dwi', 10, 'Foro de Consultas - Semana 10', 'no_calificado', 'Comparte aquí tus dudas sobre «Enrutamiento y formularios». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f11', 'dwi', 11, 'Foro calificado - Semana 11', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Consumo de datos y caché». Se califica la calidad del análisis, no la extensión.'),
  ('dwi-f12', 'dwi', 12, 'Foro de Consultas - Semana 12', 'no_calificado', 'Comparte aquí tus dudas sobre «Autenticación y seguridad web». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f13', 'dwi', 13, 'Foro de Consultas - Semana 13', 'no_calificado', 'Comparte aquí tus dudas sobre «Backend como servicio (Supabase)». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f14', 'dwi', 14, 'Foro de Consultas - Semana 14', 'no_calificado', 'Comparte aquí tus dudas sobre «Pruebas y calidad de código». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f15', 'dwi', 15, 'Foro calificado - Semana 15', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Rendimiento y despliegue». Se califica la calidad del análisis, no la extensión.'),
  ('dwi-f16', 'dwi', 16, 'Foro de Consultas - Semana 16', 'no_calificado', 'Comparte aquí tus dudas sobre «PWA y experiencia móvil». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f17', 'dwi', 17, 'Foro de Consultas - Semana 17', 'no_calificado', 'Comparte aquí tus dudas sobre «Presentación del proyecto web». El docente y tus compañeros responderán durante la semana.'),
  ('dwi-f18', 'dwi', 18, 'Foro de Consultas - Semana 18', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen final». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-general', 'ci2', null, 'Foro general del curso', 'no_calificado', 'Espacio para dudas generales del curso, coordinación entre compañeros y avisos no urgentes.'),
  ('ci2-f1', 'ci2', 1, 'Foro de Consultas - Semana 1', 'no_calificado', 'Comparte aquí tus dudas sobre «Metodologías ágiles y Scrum». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f2', 'ci2', 2, 'Foro de Consultas - Semana 2', 'no_calificado', 'Comparte aquí tus dudas sobre «Levantamiento de requerimientos». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f3', 'ci2', 3, 'Foro calificado - Semana 3', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Historias de usuario y backlog». Se califica la calidad del análisis, no la extensión.'),
  ('ci2-f4', 'ci2', 4, 'Foro de Consultas - Semana 4', 'no_calificado', 'Comparte aquí tus dudas sobre «Arquitectura de software». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f5', 'ci2', 5, 'Foro de Consultas - Semana 5', 'no_calificado', 'Comparte aquí tus dudas sobre «Modelado y diseño de la solución». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f6', 'ci2', 6, 'Foro de Consultas - Semana 6', 'no_calificado', 'Comparte aquí tus dudas sobre «Control de versiones y trabajo colaborativo». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f7', 'ci2', 7, 'Foro calificado - Semana 7', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Integración continua». Se califica la calidad del análisis, no la extensión.'),
  ('ci2-f8', 'ci2', 8, 'Foro de Consultas - Semana 8', 'no_calificado', 'Comparte aquí tus dudas sobre «Planificación del proyecto integrador». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f9', 'ci2', 9, 'Foro de Consultas - Semana 9', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen parcial». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f10', 'ci2', 10, 'Foro de Consultas - Semana 10', 'no_calificado', 'Comparte aquí tus dudas sobre «Desarrollo incremental». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f11', 'ci2', 11, 'Foro calificado - Semana 11', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Aseguramiento de la calidad». Se califica la calidad del análisis, no la extensión.'),
  ('ci2-f12', 'ci2', 12, 'Foro de Consultas - Semana 12', 'no_calificado', 'Comparte aquí tus dudas sobre «Pruebas de integración». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f13', 'ci2', 13, 'Foro de Consultas - Semana 13', 'no_calificado', 'Comparte aquí tus dudas sobre «Gestión de riesgos». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f14', 'ci2', 14, 'Foro de Consultas - Semana 14', 'no_calificado', 'Comparte aquí tus dudas sobre «Documentación técnica». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f15', 'ci2', 15, 'Foro calificado - Semana 15', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Despliegue y operación». Se califica la calidad del análisis, no la extensión.'),
  ('ci2-f16', 'ci2', 16, 'Foro de Consultas - Semana 16', 'no_calificado', 'Comparte aquí tus dudas sobre «Sustentación y demostración». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f17', 'ci2', 17, 'Foro de Consultas - Semana 17', 'no_calificado', 'Comparte aquí tus dudas sobre «Cierre y lecciones aprendidas». El docente y tus compañeros responderán durante la semana.'),
  ('ci2-f18', 'ci2', 18, 'Foro de Consultas - Semana 18', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen final». El docente y tus compañeros responderán durante la semana.')
on conflict (id) do update set semana = excluded.semana, titulo = excluded.titulo, tipo = excluded.tipo, descripcion = excluded.descripcion;

insert into public.forum_posts (id, thread_id, autor, rol, texto, cuando_demo, parent_id, orden) values
  ('gti-g1', 'gti-general', 'Mateo Soto', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 2 meses', null, 0),
  ('gti-g1r', 'gti-general', 'García Flores, Mateo', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 2 meses', 'gti-g1', 1),
  ('gti-f1-c0', 'gti-f1', 'Isabel Aldara', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 83 días', null, 0),
  ('gti-f1-c1', 'gti-f1', 'Jorge Castillo', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 82 días', null, 1),
  ('gti-f2-c0', 'gti-f2', 'Diego Fernández', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 76 días', null, 0),
  ('gti-f2-c0r', 'gti-f2', 'García Flores, Mateo', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 75 días', 'gti-f2-c0', 1),
  ('gti-f2-c1', 'gti-f2', 'Valeria Quispe', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 75 días', null, 2),
  ('gti-f2-c1r', 'gti-f2', 'García Flores, Mateo', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 74 días', 'gti-f2-c1', 3),
  ('gti-f2-c2', 'gti-f2', 'Mateo Soto', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 74 días', null, 4),
  ('gti-f3-c0', 'gti-f3', 'Valeria Quispe', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 69 días', null, 0),
  ('gti-f3-c0r', 'gti-f3', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 68 días', 'gti-f3-c0', 1),
  ('gti-f4-c0', 'gti-f4', 'Jorge Castillo', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 62 días', null, 0),
  ('gti-f4-c1', 'gti-f4', 'Isabel Aldara', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 61 días', null, 1),
  ('gti-f4-c1r', 'gti-f4', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 60 días', 'gti-f4-c1', 2),
  ('gti-f5-c0', 'gti-f5', 'Isabel Aldara', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 55 días', null, 0),
  ('gti-f5-c0r', 'gti-f5', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 54 días', 'gti-f5-c0', 1),
  ('gti-f5-c1', 'gti-f5', 'Jorge Castillo', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 54 días', null, 2),
  ('gti-f5-c1r', 'gti-f5', 'García Flores, Mateo', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 53 días', 'gti-f5-c1', 3),
  ('gti-f5-c2', 'gti-f5', 'Sofía Vargas', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 53 días', null, 4),
  ('gti-f5-c2r', 'gti-f5', 'García Flores, Mateo', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 52 días', 'gti-f5-c2', 5),
  ('gti-f6-c0', 'gti-f6', 'Mateo Soto', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 48 días', null, 0),
  ('gti-f6-c0r', 'gti-f6', 'García Flores, Mateo', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 47 días', 'gti-f6-c0', 1),
  ('gti-f7-c0', 'gti-f7', 'Isabel Aldara', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 41 días', null, 0),
  ('gti-f7-c0r', 'gti-f7', 'García Flores, Mateo', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 40 días', 'gti-f7-c0', 1),
  ('gti-f7-c1', 'gti-f7', 'Jorge Castillo', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 40 días', null, 2),
  ('gti-f7-c1r', 'gti-f7', 'García Flores, Mateo', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 39 días', 'gti-f7-c1', 3),
  ('gti-f8-c0', 'gti-f8', 'Andrés Huamán', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 34 días', null, 0),
  ('gti-f8-c1', 'gti-f8', 'Camila Rojas', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 33 días', null, 1),
  ('gti-f8-c1r', 'gti-f8', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 32 días', 'gti-f8-c1', 2),
  ('gti-f8-c2', 'gti-f8', 'Luis Mendoza', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 32 días', null, 3),
  ('gti-f9-c0', 'gti-f9', 'Camila Rojas', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 27 días', null, 0),
  ('gti-f9-c0r', 'gti-f9', 'García Flores, Mateo', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 26 días', 'gti-f9-c0', 1),
  ('gti-f10-c0', 'gti-f10', 'Valeria Quispe', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 20 días', null, 0),
  ('gti-f10-c0r', 'gti-f10', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 19 días', 'gti-f10-c0', 1),
  ('gti-f10-c1', 'gti-f10', 'Diego Fernández', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 19 días', null, 2),
  ('gti-f10-c1r', 'gti-f10', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 18 días', 'gti-f10-c1', 3),
  ('gti-f11-c0', 'gti-f11', 'Diego Fernández', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 13 días', null, 0),
  ('gti-f11-c0r', 'gti-f11', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 12 días', 'gti-f11-c0', 1),
  ('gti-f12-c0', 'gti-f12', 'Valeria Quispe', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 6 días', null, 0),
  ('gti-f12-c0r', 'gti-f12', 'García Flores, Mateo', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 5 días', 'gti-f12-c0', 1),
  ('gti-f13-c0', 'gti-f13', 'Andrés Huamán', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 1 día', null, 0),
  ('gti-f13-c0r', 'gti-f13', 'García Flores, Mateo', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hoy', 'gti-f13-c0', 1),
  ('gti-f13-c1', 'gti-f13', 'Camila Rojas', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 1 día', null, 2),
  ('gti-f13-c1r', 'gti-f13', 'García Flores, Mateo', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hoy', 'gti-f13-c1', 3),
  ('gti-f13-c2', 'gti-f13', 'Diego Fernández', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 1 día', null, 4),
  ('gti-f13-c2r', 'gti-f13', 'García Flores, Mateo', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hoy', 'gti-f13-c2', 5),
  ('ihm-g1', 'ihm-general', 'Jorge Castillo', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 2 meses', null, 0),
  ('ihm-g1r', 'ihm-general', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 2 meses', 'ihm-g1', 1),
  ('ihm-f1-c0', 'ihm-f1', 'Valeria Quispe', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 83 días', null, 0),
  ('ihm-f1-c0r', 'ihm-f1', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 82 días', 'ihm-f1-c0', 1),
  ('ihm-f2-c0', 'ihm-f2', 'Jorge Castillo', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 76 días', null, 0),
  ('ihm-f3-c0', 'ihm-f3', 'Isabel Aldara', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 69 días', null, 0),
  ('ihm-f3-c0r', 'ihm-f3', 'Salazar Ruiz, Kevin', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 68 días', 'ihm-f3-c0', 1),
  ('ihm-f3-c1', 'ihm-f3', 'Jorge Castillo', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 68 días', null, 2),
  ('ihm-f3-c1r', 'ihm-f3', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 67 días', 'ihm-f3-c1', 3),
  ('ihm-f4-c0', 'ihm-f4', 'Diego Fernández', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 62 días', null, 0),
  ('ihm-f4-c1', 'ihm-f4', 'Valeria Quispe', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 61 días', null, 1),
  ('ihm-f5-c0', 'ihm-f5', 'Valeria Quispe', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 55 días', null, 0),
  ('ihm-f5-c1', 'ihm-f5', 'Diego Fernández', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 54 días', null, 1),
  ('ihm-f5-c2', 'ihm-f5', 'Camila Rojas', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 53 días', null, 2),
  ('ihm-f6-c0', 'ihm-f6', 'Andrés Huamán', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 48 días', null, 0),
  ('ihm-f6-c1', 'ihm-f6', 'Camila Rojas', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 47 días', null, 1),
  ('ihm-f6-c1r', 'ihm-f6', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 46 días', 'ihm-f6-c1', 2),
  ('ihm-f6-c2', 'ihm-f6', 'Luis Mendoza', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 46 días', null, 3),
  ('ihm-f7-c0', 'ihm-f7', 'Valeria Quispe', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 41 días', null, 0),
  ('ihm-f8-c0', 'ihm-f8', 'Mateo Soto', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 34 días', null, 0),
  ('ihm-f8-c0r', 'ihm-f8', 'Salazar Ruiz, Kevin', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 33 días', 'ihm-f8-c0', 1),
  ('ihm-f8-c1', 'ihm-f8', 'Rocío Paredes', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 33 días', null, 2),
  ('ihm-f8-c1r', 'ihm-f8', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 32 días', 'ihm-f8-c1', 3),
  ('ihm-f9-c0', 'ihm-f9', 'Camila Rojas', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 27 días', null, 0),
  ('ihm-f9-c0r', 'ihm-f9', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 26 días', 'ihm-f9-c0', 1),
  ('ihm-f9-c1', 'ihm-f9', 'Andrés Huamán', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 26 días', null, 2),
  ('ihm-f9-c2', 'ihm-f9', 'Sofía Vargas', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 25 días', null, 3),
  ('ihm-f10-c0', 'ihm-f10', 'Camila Rojas', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 20 días', null, 0),
  ('ihm-f10-c1', 'ihm-f10', 'Andrés Huamán', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 19 días', null, 1),
  ('ihm-f11-c0', 'ihm-f11', 'Andrés Huamán', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 13 días', null, 0),
  ('ihm-f12-c0', 'ihm-f12', 'Rocío Paredes', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 6 días', null, 0),
  ('ihm-f12-c0r', 'ihm-f12', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 5 días', 'ihm-f12-c0', 1),
  ('ihm-f12-c1', 'ihm-f12', 'Mateo Soto', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 5 días', null, 2),
  ('ihm-f12-c1r', 'ihm-f12', 'Salazar Ruiz, Kevin', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 4 días', 'ihm-f12-c1', 3),
  ('ihm-f12-c2', 'ihm-f12', 'Isabel Aldara', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 4 días', null, 4),
  ('ihm-f12-c2r', 'ihm-f12', 'Salazar Ruiz, Kevin', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 3 días', 'ihm-f12-c2', 5),
  ('ihm-f13-c0', 'ihm-f13', 'Luis Mendoza', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 1 día', null, 0),
  ('ihm-f13-c1', 'ihm-f13', 'Sofía Vargas', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 1 día', null, 1),
  ('ihm-f13-c1r', 'ihm-f13', 'Salazar Ruiz, Kevin', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hoy', 'ihm-f13-c1', 2),
  ('dwi-g1', 'dwi-general', 'Luis Mendoza', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 2 meses', null, 0),
  ('dwi-g1r', 'dwi-general', 'Minaya Castillo, Juan', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 2 meses', 'dwi-g1', 1),
  ('dwi-f1-c0', 'dwi-f1', 'Rocío Paredes', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 83 días', null, 0),
  ('dwi-f2-c0', 'dwi-f2', 'Mateo Soto', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 76 días', null, 0),
  ('dwi-f2-c0r', 'dwi-f2', 'Minaya Castillo, Juan', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 75 días', 'dwi-f2-c0', 1),
  ('dwi-f3-c0', 'dwi-f3', 'Rocío Paredes', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 69 días', null, 0),
  ('dwi-f3-c0r', 'dwi-f3', 'Minaya Castillo, Juan', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 68 días', 'dwi-f3-c0', 1),
  ('dwi-f3-c1', 'dwi-f3', 'Mateo Soto', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 68 días', null, 2),
  ('dwi-f3-c1r', 'dwi-f3', 'Minaya Castillo, Juan', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 67 días', 'dwi-f3-c1', 3),
  ('dwi-f4-c0', 'dwi-f4', 'Diego Fernández', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 62 días', null, 0),
  ('dwi-f4-c0r', 'dwi-f4', 'Minaya Castillo, Juan', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 61 días', 'dwi-f4-c0', 1),
  ('dwi-f5-c0', 'dwi-f5', 'Camila Rojas', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 55 días', null, 0),
  ('dwi-f5-c0r', 'dwi-f5', 'Minaya Castillo, Juan', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 54 días', 'dwi-f5-c0', 1),
  ('dwi-f5-c1', 'dwi-f5', 'Andrés Huamán', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 54 días', null, 2),
  ('dwi-f5-c1r', 'dwi-f5', 'Minaya Castillo, Juan', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 53 días', 'dwi-f5-c1', 3),
  ('dwi-f6-c0', 'dwi-f6', 'Luis Mendoza', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 48 días', null, 0),
  ('dwi-f6-c0r', 'dwi-f6', 'Minaya Castillo, Juan', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 47 días', 'dwi-f6-c0', 1),
  ('dwi-f6-c1', 'dwi-f6', 'Sofía Vargas', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 47 días', null, 2),
  ('dwi-f7-c0', 'dwi-f7', 'Sofía Vargas', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 41 días', null, 0),
  ('dwi-f7-c1', 'dwi-f7', 'Luis Mendoza', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 40 días', null, 1),
  ('dwi-f7-c1r', 'dwi-f7', 'Minaya Castillo, Juan', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 39 días', 'dwi-f7-c1', 2),
  ('dwi-f7-c2', 'dwi-f7', 'Camila Rojas', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 39 días', null, 3),
  ('dwi-f8-c0', 'dwi-f8', 'Jorge Castillo', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 34 días', null, 0),
  ('dwi-f8-c1', 'dwi-f8', 'Isabel Aldara', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 33 días', null, 1),
  ('dwi-f9-c0', 'dwi-f9', 'Sofía Vargas', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 27 días', null, 0),
  ('dwi-f9-c1', 'dwi-f9', 'Luis Mendoza', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 26 días', null, 1),
  ('dwi-f9-c1r', 'dwi-f9', 'Minaya Castillo, Juan', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 25 días', 'dwi-f9-c1', 2),
  ('dwi-f9-c2', 'dwi-f9', 'Isabel Aldara', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 25 días', null, 3),
  ('dwi-f9-c2r', 'dwi-f9', 'Minaya Castillo, Juan', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 24 días', 'dwi-f9-c2', 4),
  ('dwi-f10-c0', 'dwi-f10', 'Sofía Vargas', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 20 días', null, 0),
  ('dwi-f10-c0r', 'dwi-f10', 'Minaya Castillo, Juan', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 19 días', 'dwi-f10-c0', 1),
  ('dwi-f11-c0', 'dwi-f11', 'Jorge Castillo', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 13 días', null, 0),
  ('dwi-f11-c0r', 'dwi-f11', 'Minaya Castillo, Juan', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 12 días', 'dwi-f11-c0', 1),
  ('dwi-f11-c1', 'dwi-f11', 'Isabel Aldara', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 12 días', null, 2),
  ('dwi-f11-c2', 'dwi-f11', 'Luis Mendoza', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 11 días', null, 3),
  ('dwi-f11-c2r', 'dwi-f11', 'Minaya Castillo, Juan', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 10 días', 'dwi-f11-c2', 4),
  ('dwi-f12-c0', 'dwi-f12', 'Valeria Quispe', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 6 días', null, 0),
  ('dwi-f12-c1', 'dwi-f12', 'Diego Fernández', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 5 días', null, 1),
  ('dwi-f13-c0', 'dwi-f13', 'Diego Fernández', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 1 día', null, 0),
  ('dwi-f13-c0r', 'dwi-f13', 'Minaya Castillo, Juan', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hoy', 'dwi-f13-c0', 1),
  ('ci2-g1', 'ci2-general', 'Diego Fernández', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 2 meses', null, 0),
  ('ci2-g1r', 'ci2-general', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 2 meses', 'ci2-g1', 1),
  ('ci2-f1-c0', 'ci2-f1', 'Sofía Vargas', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 83 días', null, 0),
  ('ci2-f1-c0r', 'ci2-f1', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 82 días', 'ci2-f1-c0', 1),
  ('ci2-f1-c1', 'ci2-f1', 'Luis Mendoza', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 82 días', null, 2),
  ('ci2-f1-c1r', 'ci2-f1', 'Álvarez Velasquez, Rocío', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 81 días', 'ci2-f1-c1', 3),
  ('ci2-f1-c2', 'ci2-f1', 'Camila Rojas', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 81 días', null, 4),
  ('ci2-f1-c2r', 'ci2-f1', 'Álvarez Velasquez, Rocío', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 80 días', 'ci2-f1-c2', 5),
  ('ci2-f2-c0', 'ci2-f2', 'Jorge Castillo', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 76 días', null, 0),
  ('ci2-f2-c0r', 'ci2-f2', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 75 días', 'ci2-f2-c0', 1),
  ('ci2-f3-c0', 'ci2-f3', 'Camila Rojas', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 69 días', null, 0),
  ('ci2-f3-c0r', 'ci2-f3', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 68 días', 'ci2-f3-c0', 1),
  ('ci2-f3-c1', 'ci2-f3', 'Andrés Huamán', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 68 días', null, 2),
  ('ci2-f4-c0', 'ci2-f4', 'Mateo Soto', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 62 días', null, 0),
  ('ci2-f5-c0', 'ci2-f5', 'Rocío Paredes', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 55 días', null, 0),
  ('ci2-f5-c0r', 'ci2-f5', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 54 días', 'ci2-f5-c0', 1),
  ('ci2-f5-c1', 'ci2-f5', 'Mateo Soto', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 54 días', null, 2),
  ('ci2-f5-c1r', 'ci2-f5', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 53 días', 'ci2-f5-c1', 3),
  ('ci2-f6-c0', 'ci2-f6', 'Mateo Soto', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 48 días', null, 0),
  ('ci2-f6-c0r', 'ci2-f6', 'Álvarez Velasquez, Rocío', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 47 días', 'ci2-f6-c0', 1),
  ('ci2-f6-c1', 'ci2-f6', 'Rocío Paredes', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 47 días', null, 2),
  ('ci2-f6-c1r', 'ci2-f6', 'Álvarez Velasquez, Rocío', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 46 días', 'ci2-f6-c1', 3),
  ('ci2-f6-c2', 'ci2-f6', 'Jorge Castillo', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 46 días', null, 4),
  ('ci2-f6-c2r', 'ci2-f6', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 45 días', 'ci2-f6-c2', 5),
  ('ci2-f7-c0', 'ci2-f7', 'Isabel Aldara', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 41 días', null, 0),
  ('ci2-f7-c0r', 'ci2-f7', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 40 días', 'ci2-f7-c0', 1),
  ('ci2-f8-c0', 'ci2-f8', 'Andrés Huamán', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 34 días', null, 0),
  ('ci2-f8-c0r', 'ci2-f8', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 33 días', 'ci2-f8-c0', 1),
  ('ci2-f9-c0', 'ci2-f9', 'Isabel Aldara', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 27 días', null, 0),
  ('ci2-f9-c0r', 'ci2-f9', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 26 días', 'ci2-f9-c0', 1),
  ('ci2-f9-c1', 'ci2-f9', 'Jorge Castillo', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 26 días', null, 2),
  ('ci2-f9-c1r', 'ci2-f9', 'Álvarez Velasquez, Rocío', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 25 días', 'ci2-f9-c1', 3),
  ('ci2-f10-c0', 'ci2-f10', 'Sofía Vargas', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 20 días', null, 0),
  ('ci2-f10-c0r', 'ci2-f10', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 19 días', 'ci2-f10-c0', 1),
  ('ci2-f11-c0', 'ci2-f11', 'Luis Mendoza', 'Estudiante', 'Me ayudó mucho la lectura, pero no me quedó claro el segundo caso.', 'Hace 13 días', null, 0),
  ('ci2-f11-c0r', 'ci2-f11', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 12 días', 'ci2-f11-c0', 1),
  ('ci2-f11-c1', 'ci2-f11', 'Sofía Vargas', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 12 días', null, 2),
  ('ci2-f11-c1r', 'ci2-f11', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 11 días', 'ci2-f11-c1', 3),
  ('ci2-f11-c2', 'ci2-f11', 'Jorge Castillo', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 11 días', null, 4),
  ('ci2-f11-c2r', 'ci2-f11', 'Álvarez Velasquez, Rocío', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 10 días', 'ci2-f11-c2', 5),
  ('ci2-f12-c0', 'ci2-f12', 'Sofía Vargas', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 6 días', null, 0),
  ('ci2-f12-c0r', 'ci2-f12', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 5 días', 'ci2-f12-c0', 1),
  ('ci2-f12-c1', 'ci2-f12', 'Luis Mendoza', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 5 días', null, 2),
  ('ci2-f12-c1r', 'ci2-f12', 'Álvarez Velasquez, Rocío', 'Docente', 'Buena pregunta. Revisa la diapositiva 8 y el ejemplo del video; lo retomamos en clase.', 'Hace 4 días', 'ci2-f12-c1', 3),
  ('ci2-f12-c2', 'ci2-f12', 'Isabel Aldara', 'Estudiante', 'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.', 'Hace 4 días', null, 4),
  ('ci2-f12-c2r', 'ci2-f12', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hace 3 días', 'ci2-f12-c2', 5),
  ('ci2-f13-c0', 'ci2-f13', 'Jorge Castillo', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 1 día', null, 0),
  ('ci2-f13-c0r', 'ci2-f13', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hoy', 'ci2-f13-c0', 1),
  ('ci2-f13-c1', 'ci2-f13', 'Isabel Aldara', 'Estudiante', 'Yo lo resolví con el ejemplo de la clase; si quieren lo comparto.', 'Hace 1 día', null, 2),
  ('ci2-f13-c1r', 'ci2-f13', 'Álvarez Velasquez, Rocío', 'Docente', 'Correcto. Compártelo con el grupo y lo comentamos en la asesoría.', 'Hoy', 'ci2-f13-c1', 3)
on conflict (id) do update set autor = excluded.autor, rol = excluded.rol, texto = excluded.texto, cuando_demo = excluded.cuando_demo, parent_id = excluded.parent_id, orden = excluded.orden;

insert into public.announcements (id, course_id, titulo, texto, hace_dias, semana, dia, nuevo, orden) values
  ('gti-a5', 'gti', 'Recordatorio: Práctica calificada 2', 'Esta semana se rinde la práctica calificada 2. Revisen el material hasta la semana 13 y lleguen 10 minutos antes. Pueden consultar sus dudas en el foro de la semana.', 1, null, null, true, 0),
  ('gti-a4', 'gti', 'Cambio en el horario de asesoría', 'Esta semana la asesoría con García Flores, Mateo se realizará por Zoom. El enlace y el código de acceso están en la pestaña Zoom del curso.', 3, null, null, true, 1),
  ('gti-a3', 'gti', 'Resultados del examen parcial', 'Ya están publicadas las notas del examen parcial. Quienes deseen revisar su evaluación pueden solicitar una cita durante la asesoría.', null, 10, 2, false, 2),
  ('gti-a2', 'gti', 'Material complementario disponible', 'Se agregó lectura complementaria a las semanas 4 a 6. No es obligatoria, pero ayuda a profundizar los temas de las prácticas.', null, 5, 1, false, 3),
  ('gti-a1', 'gti', 'Bienvenida al curso', 'Les doy la bienvenida al ciclo. En el sílabo encontrarán la sumilla, el sistema de evaluación y el cronograma. Cualquier duda, escríbanme por el foro general.', null, 1, 0, false, 4),
  ('ihm-a5', 'ihm', 'Recordatorio: Práctica calificada 2', 'Esta semana se rinde la práctica calificada 2. Revisen el material hasta la semana 13 y lleguen 10 minutos antes. Pueden consultar sus dudas en el foro de la semana.', 1, null, null, true, 0),
  ('ihm-a4', 'ihm', 'Cambio en el horario de asesoría', 'Esta semana la asesoría con Salazar Ruiz, Kevin se realizará por Zoom. El enlace y el código de acceso están en la pestaña Zoom del curso.', 3, null, null, true, 1),
  ('ihm-a3', 'ihm', 'Resultados del examen parcial', 'Ya están publicadas las notas del examen parcial. Quienes deseen revisar su evaluación pueden solicitar una cita durante la asesoría.', null, 10, 2, false, 2),
  ('ihm-a2', 'ihm', 'Material complementario disponible', 'Se agregó lectura complementaria a las semanas 4 a 6. No es obligatoria, pero ayuda a profundizar los temas de las prácticas.', null, 5, 1, false, 3),
  ('ihm-a1', 'ihm', 'Bienvenida al curso', 'Les doy la bienvenida al ciclo. En el sílabo encontrarán la sumilla, el sistema de evaluación y el cronograma. Cualquier duda, escríbanme por el foro general.', null, 1, 0, false, 4),
  ('dwi-a5', 'dwi', 'Recordatorio: Práctica calificada 2', 'Esta semana se rinde la práctica calificada 2. Revisen el material hasta la semana 13 y lleguen 10 minutos antes. Pueden consultar sus dudas en el foro de la semana.', 1, null, null, true, 0),
  ('dwi-a4', 'dwi', 'Cambio en el horario de asesoría', 'Esta semana la asesoría con Minaya Castillo, Juan se realizará por Zoom. El enlace y el código de acceso están en la pestaña Zoom del curso.', 3, null, null, true, 1),
  ('dwi-a3', 'dwi', 'Resultados del examen parcial', 'Ya están publicadas las notas del examen parcial. Quienes deseen revisar su evaluación pueden solicitar una cita durante la asesoría.', null, 10, 2, false, 2),
  ('dwi-a2', 'dwi', 'Material complementario disponible', 'Se agregó lectura complementaria a las semanas 4 a 6. No es obligatoria, pero ayuda a profundizar los temas de las prácticas.', null, 5, 1, false, 3),
  ('dwi-a1', 'dwi', 'Bienvenida al curso', 'Les doy la bienvenida al ciclo. En el sílabo encontrarán la sumilla, el sistema de evaluación y el cronograma. Cualquier duda, escríbanme por el foro general.', null, 1, 0, false, 4),
  ('ci2-a5', 'ci2', 'Recordatorio: Práctica calificada 2', 'Esta semana se rinde la práctica calificada 2. Revisen el material hasta la semana 13 y lleguen 10 minutos antes. Pueden consultar sus dudas en el foro de la semana.', 1, null, null, true, 0),
  ('ci2-a4', 'ci2', 'Cambio en el horario de asesoría', 'Esta semana la asesoría con Álvarez Velasquez, Rocío se realizará por Zoom. El enlace y el código de acceso están en la pestaña Zoom del curso.', 3, null, null, true, 1),
  ('ci2-a3', 'ci2', 'Resultados del examen parcial', 'Ya están publicadas las notas del examen parcial. Quienes deseen revisar su evaluación pueden solicitar una cita durante la asesoría.', null, 10, 2, false, 2),
  ('ci2-a2', 'ci2', 'Material complementario disponible', 'Se agregó lectura complementaria a las semanas 4 a 6. No es obligatoria, pero ayuda a profundizar los temas de las prácticas.', null, 5, 1, false, 3),
  ('ci2-a1', 'ci2', 'Bienvenida al curso', 'Les doy la bienvenida al ciclo. En el sílabo encontrarán la sumilla, el sistema de evaluación y el cronograma. Cualquier duda, escríbanme por el foro general.', null, 1, 0, false, 4)
on conflict (id) do update set titulo = excluded.titulo, texto = excluded.texto, hace_dias = excluded.hace_dias, semana = excluded.semana, dia = excluded.dia, nuevo = excluded.nuevo, orden = excluded.orden;

insert into public.evaluation_grades (user_id, course_id, evaluation_id, nota) values
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-ta1', 18),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-pc1', 16),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-ep', 17),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-ta2', 13),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-ta1', 16),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-pc1', 18),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-ep', 11),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-ta2', 15),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-ta1', 12),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-pc1', 14),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-ep', 15),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-ta2', 11),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-ta1', 14),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-pc1', 12),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-ep', 13),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-ta2', 17),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-ta1', 17),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-pc1', 15),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-ep', 16),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-ta2', 12),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-ta1', 15),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-pc1', 17),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-ep', 10),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-ta2', 14),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-ta1', 11),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-pc1', 13),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-ep', 14),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-ta2', 10),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-ta1', 13),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-pc1', 11),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-ep', 12),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-ta2', 16),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-ta1', 19),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-pc1', 17),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-ep', 18),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-ta2', 14),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-ta1', 17),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-pc1', 19),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-ep', 12),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-ta2', 16),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-ta1', 13),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-pc1', 15),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-ep', 16),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-ta2', 12),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-ta1', 15),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-pc1', 13),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-ep', 14),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-ta2', 18)
on conflict (user_id, evaluation_id) do update set nota = excluded.nota;

insert into public.task_submissions (user_id, course_id, task_id, archivo, nota, entregada_en) values
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-t2', 'Entrega_2.pdf', 18, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-t4', 'Entrega_4.pdf', 16, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-t6', 'Entrega_6.pdf', 12, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-t8', 'Entrega_8.pdf', 13, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-t10', 'Entrega_10.pdf', 18, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000001', 'gti', 'gti-t12', 'Entrega_12.pdf', 14, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-t2', 'Entrega_2.pdf', 16, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-t4', 'Entrega_4.pdf', 18, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-t6', 'Entrega_6.pdf', 15, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-t8', 'Entrega_8.pdf', 17, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-t10', 'Entrega_10.pdf', 14, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ihm', 'ihm-t12', 'Entrega_12.pdf', 18, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-t2', 'Entrega_2.pdf', 14, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-t4', 'Entrega_4.pdf', 18, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-t6', 'Entrega_6.pdf', 15, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-t8', 'Entrega_8.pdf', 15, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-t10', 'Entrega_10.pdf', 15, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000001', 'dwi', 'dwi-t12', 'Entrega_12.pdf', 12, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-t2', 'Entrega_2.pdf', 17, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-t4', 'Entrega_4.pdf', 16, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-t6', 'Entrega_6.pdf', 12, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-t8', 'Entrega_8.pdf', 15, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-t10', 'Entrega_10.pdf', 15, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000001', 'ci2', 'ci2-t12', 'Entrega_12.pdf', 18, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-t2', 'Entrega_2.pdf', 17, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-t4', 'Entrega_4.pdf', 15, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-t6', 'Entrega_6.pdf', 11, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-t8', 'Entrega_8.pdf', 12, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-t10', 'Entrega_10.pdf', 17, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000002', 'gti', 'gti-t12', 'Entrega_12.pdf', 13, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-t2', 'Entrega_2.pdf', 15, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-t4', 'Entrega_4.pdf', 17, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-t6', 'Entrega_6.pdf', 14, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-t8', 'Entrega_8.pdf', 16, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-t10', 'Entrega_10.pdf', 13, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ihm', 'ihm-t12', 'Entrega_12.pdf', 17, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-t2', 'Entrega_2.pdf', 13, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-t4', 'Entrega_4.pdf', 17, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-t6', 'Entrega_6.pdf', 14, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-t8', 'Entrega_8.pdf', 14, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-t10', 'Entrega_10.pdf', 14, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000002', 'dwi', 'dwi-t12', 'Entrega_12.pdf', 11, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-t2', 'Entrega_2.pdf', 16, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-t4', 'Entrega_4.pdf', 15, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-t6', 'Entrega_6.pdf', 11, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-t8', 'Entrega_8.pdf', 14, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-t10', 'Entrega_10.pdf', 14, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000002', 'ci2', 'ci2-t12', 'Entrega_12.pdf', 17, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-t2', 'Entrega_2.pdf', 19, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-t4', 'Entrega_4.pdf', 17, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-t6', 'Entrega_6.pdf', 13, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-t8', 'Entrega_8.pdf', 14, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-t10', 'Entrega_10.pdf', 19, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000003', 'gti', 'gti-t12', 'Entrega_12.pdf', 15, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-t2', 'Entrega_2.pdf', 17, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-t4', 'Entrega_4.pdf', 19, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-t6', 'Entrega_6.pdf', 16, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-t8', 'Entrega_8.pdf', 18, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-t10', 'Entrega_10.pdf', 15, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ihm', 'ihm-t12', 'Entrega_12.pdf', 19, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-t2', 'Entrega_2.pdf', 15, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-t4', 'Entrega_4.pdf', 19, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-t6', 'Entrega_6.pdf', 16, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-t8', 'Entrega_8.pdf', 16, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-t10', 'Entrega_10.pdf', 16, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000003', 'dwi', 'dwi-t12', 'Entrega_12.pdf', 13, now() - interval '7 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-t2', 'Entrega_2.pdf', 18, now() - interval '77 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-t4', 'Entrega_4.pdf', 17, now() - interval '63 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-t6', 'Entrega_6.pdf', 13, now() - interval '49 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-t8', 'Entrega_8.pdf', 16, now() - interval '35 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-t10', 'Entrega_10.pdf', 16, now() - interval '21 days'),
  ('a1000000-0000-4000-8000-000000000003', 'ci2', 'ci2-t12', 'Entrega_12.pdf', 19, now() - interval '7 days')
on conflict (user_id, task_id) do nothing;

-- Nuevo curso del ciclo: Herramientas de Prototipado (se trabaja con Figma). Lunes y miércoles, en laboratorio.
insert into public.course_details (course_id, codigo, horas, sumilla, logro, metodologia, proyecto, temas, bib_base, bib_comp, zoom_sesiones, zoom_meeting_id, zoom_passcode, zoom_url) values
  ('hpr', 'ISIS-3512', 3, 'El curso desarrolla las competencias para convertir una idea en un prototipo interactivo con Figma. Aborda la exploración de ideas, los wireframes, los componentes y el auto layout, las variables y los sistemas de diseño, los prototipos de alta fidelidad con interacciones y animaciones, la colaboración en equipo y el traspaso a desarrollo.', 'Al finalizar el curso, el estudiante diseña y prueba un prototipo interactivo de alta fidelidad en Figma, apoyado en un sistema de diseño propio, y lo entrega listo para su implementación.', 'Talleres prácticos en laboratorio: cada sesión combina una demostración guiada en Figma y un reto aplicado. El avance se revisa cada semana en el archivo compartido del equipo y el prototipo final se prueba con usuarios.', 'Prototipo en Figma', array['Introducción al prototipado y a Figma', 'La interfaz de Figma: frames, capas y herramientas', 'Wireframes de baja fidelidad', 'Retícula, espaciado y jerarquía visual', 'Tipografía, color y estilos', 'Componentes y variantes', 'Auto layout y diseño responsivo', 'Prototipado de flujos e interacciones', 'Variables y modos (tema claro y oscuro)', 'Sistemas de diseño', 'Animaciones y microinteracciones con Smart Animate', 'Prototipos con contenido y datos reales', 'Accesibilidad en el diseño: contraste y tamaños', 'Pruebas de usabilidad con el prototipo', 'Colaboración, comentarios y traspaso a desarrollo (Dev Mode)', 'Presentación de prototipos'], array['Frost, B. (2016). Atomic Design. Brad Frost.', 'Saffer, D. (2013). Microinteractions: Designing with Details. O’Reilly.'], array['Figma (2024). Figma Learn: guía oficial de diseño y prototipado. figma.com/resources/learn-design.', 'W3C (2023). Web Content Accessibility Guidelines (WCAG) 2.2.'], '[{"dow":4,"inicio":"17:00","fin":"18:00","tipo":"Asesoría"}]'::jsonb, '8412093356', '457120', 'https://utpvirtual.zoom.us/j/8412093356')
on conflict (course_id) do update set codigo = excluded.codigo, horas = excluded.horas, sumilla = excluded.sumilla, logro = excluded.logro,
  metodologia = excluded.metodologia, proyecto = excluded.proyecto, temas = excluded.temas, bib_base = excluded.bib_base, bib_comp = excluded.bib_comp,
  zoom_sesiones = excluded.zoom_sesiones, zoom_meeting_id = excluded.zoom_meeting_id, zoom_passcode = excluded.zoom_passcode, zoom_url = excluded.zoom_url;

insert into public.course_materials (id, course_id, semana, orden, tipo, titulo, detalle) values
  ('hpr-s1-pres', 'hpr', 1, 0, 'Presentación', 'Presentación — Introducción al prototipado y a Figma', '25 diapositivas'),
  ('hpr-s1-lect', 'hpr', 1, 1, 'Lectura', 'Lectura de la semana 1', '13 páginas'),
  ('hpr-s1-vid', 'hpr', 1, 2, 'Video', 'Video — Introducción al prototipado y a Figma', '12 min'),
  ('hpr-s2-pres', 'hpr', 2, 0, 'Presentación', 'Presentación — La interfaz de Figma: frames, capas y herramientas', '23 diapositivas'),
  ('hpr-s2-lect', 'hpr', 2, 1, 'Lectura', 'Lectura de la semana 2', '18 páginas'),
  ('hpr-s2-vid', 'hpr', 2, 2, 'Video', 'Video — La interfaz de Figma: frames, capas y herramientas', '15 min'),
  ('hpr-s3-pres', 'hpr', 3, 0, 'Presentación', 'Presentación — Wireframes de baja fidelidad', '21 diapositivas'),
  ('hpr-s3-lect', 'hpr', 3, 1, 'Lectura', 'Lectura de la semana 3', '12 páginas'),
  ('hpr-s3-vid', 'hpr', 3, 2, 'Video', 'Video — Wireframes de baja fidelidad', '18 min'),
  ('hpr-s4-pres', 'hpr', 4, 0, 'Presentación', 'Presentación — Retícula, espaciado y jerarquía visual', '19 diapositivas'),
  ('hpr-s4-lect', 'hpr', 4, 1, 'Lectura', 'Lectura de la semana 4', '17 páginas'),
  ('hpr-s4-vid', 'hpr', 4, 2, 'Video', 'Video — Retícula, espaciado y jerarquía visual', '9 min'),
  ('hpr-s5-pres', 'hpr', 5, 0, 'Presentación', 'Presentación — Tipografía, color y estilos', '26 diapositivas'),
  ('hpr-s5-lect', 'hpr', 5, 1, 'Lectura', 'Lectura de la semana 5', '11 páginas'),
  ('hpr-s5-vid', 'hpr', 5, 2, 'Video', 'Video — Tipografía, color y estilos', '12 min'),
  ('hpr-s6-pres', 'hpr', 6, 0, 'Presentación', 'Presentación — Componentes y variantes', '24 diapositivas'),
  ('hpr-s6-lect', 'hpr', 6, 1, 'Lectura', 'Lectura de la semana 6', '16 páginas'),
  ('hpr-s6-vid', 'hpr', 6, 2, 'Video', 'Video — Componentes y variantes', '15 min'),
  ('hpr-s7-pres', 'hpr', 7, 0, 'Presentación', 'Presentación — Auto layout y diseño responsivo', '22 diapositivas'),
  ('hpr-s7-lect', 'hpr', 7, 1, 'Lectura', 'Lectura de la semana 7', '10 páginas'),
  ('hpr-s7-vid', 'hpr', 7, 2, 'Video', 'Video — Auto layout y diseño responsivo', '18 min'),
  ('hpr-s8-pres', 'hpr', 8, 0, 'Presentación', 'Presentación — Prototipado de flujos e interacciones', '20 diapositivas'),
  ('hpr-s8-lect', 'hpr', 8, 1, 'Lectura', 'Lectura de la semana 8', '15 páginas'),
  ('hpr-s8-vid', 'hpr', 8, 2, 'Video', 'Video — Prototipado de flujos e interacciones', '9 min'),
  ('hpr-s9-guia', 'hpr', 9, 0, 'Lectura', 'Guía de repaso — Examen parcial', '12 páginas'),
  ('hpr-s9-pres', 'hpr', 9, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas'),
  ('hpr-s10-pres', 'hpr', 10, 0, 'Presentación', 'Presentación — Variables y modos (tema claro y oscuro)', '25 diapositivas'),
  ('hpr-s10-lect', 'hpr', 10, 1, 'Lectura', 'Lectura de la semana 10', '14 páginas'),
  ('hpr-s10-vid', 'hpr', 10, 2, 'Video', 'Video — Variables y modos (tema claro y oscuro)', '15 min'),
  ('hpr-s11-pres', 'hpr', 11, 0, 'Presentación', 'Presentación — Sistemas de diseño', '23 diapositivas'),
  ('hpr-s11-lect', 'hpr', 11, 1, 'Lectura', 'Lectura de la semana 11', '8 páginas'),
  ('hpr-s11-vid', 'hpr', 11, 2, 'Video', 'Video — Sistemas de diseño', '18 min'),
  ('hpr-s12-pres', 'hpr', 12, 0, 'Presentación', 'Presentación — Animaciones y microinteracciones con Smart Animate', '21 diapositivas'),
  ('hpr-s12-lect', 'hpr', 12, 1, 'Lectura', 'Lectura de la semana 12', '13 páginas'),
  ('hpr-s12-vid', 'hpr', 12, 2, 'Video', 'Video — Animaciones y microinteracciones con Smart Animate', '9 min'),
  ('hpr-s13-pres', 'hpr', 13, 0, 'Presentación', 'Presentación — Prototipos con contenido y datos reales', '19 diapositivas'),
  ('hpr-s13-lect', 'hpr', 13, 1, 'Lectura', 'Lectura de la semana 13', '18 páginas'),
  ('hpr-s13-vid', 'hpr', 13, 2, 'Video', 'Video — Prototipos con contenido y datos reales', '12 min'),
  ('hpr-s14-pres', 'hpr', 14, 0, 'Presentación', 'Presentación — Accesibilidad en el diseño: contraste y tamaños', '26 diapositivas'),
  ('hpr-s14-lect', 'hpr', 14, 1, 'Lectura', 'Lectura de la semana 14', '12 páginas'),
  ('hpr-s14-vid', 'hpr', 14, 2, 'Video', 'Video — Accesibilidad en el diseño: contraste y tamaños', '15 min'),
  ('hpr-s15-pres', 'hpr', 15, 0, 'Presentación', 'Presentación — Pruebas de usabilidad con el prototipo', '24 diapositivas'),
  ('hpr-s15-lect', 'hpr', 15, 1, 'Lectura', 'Lectura de la semana 15', '17 páginas'),
  ('hpr-s15-vid', 'hpr', 15, 2, 'Video', 'Video — Pruebas de usabilidad con el prototipo', '18 min'),
  ('hpr-s16-pres', 'hpr', 16, 0, 'Presentación', 'Presentación — Colaboración, comentarios y traspaso a desarrollo (Dev Mode)', '22 diapositivas'),
  ('hpr-s16-lect', 'hpr', 16, 1, 'Lectura', 'Lectura de la semana 16', '11 páginas'),
  ('hpr-s16-vid', 'hpr', 16, 2, 'Video', 'Video — Colaboración, comentarios y traspaso a desarrollo (Dev Mode)', '9 min'),
  ('hpr-s17-pres', 'hpr', 17, 0, 'Presentación', 'Presentación — Presentación de prototipos', '20 diapositivas'),
  ('hpr-s17-lect', 'hpr', 17, 1, 'Lectura', 'Lectura de la semana 17', '16 páginas'),
  ('hpr-s17-vid', 'hpr', 17, 2, 'Video', 'Video — Presentación de prototipos', '12 min'),
  ('hpr-s18-guia', 'hpr', 18, 0, 'Lectura', 'Guía de repaso — Examen final', '12 páginas'),
  ('hpr-s18-pres', 'hpr', 18, 1, 'Presentación', 'Resumen de unidades evaluadas', '18 diapositivas')
on conflict (id) do update set semana = excluded.semana, orden = excluded.orden, tipo = excluded.tipo, titulo = excluded.titulo, detalle = excluded.detalle;

insert into public.course_evaluations (id, course_id, clave, orden, nombre, semana, peso) values
  ('hpr-ta1', 'hpr', 'ta1', 0, 'Tarea académica 1', 3, 5),
  ('hpr-pc1', 'hpr', 'pc1', 1, 'Práctica calificada 1', 5, 10),
  ('hpr-ep', 'hpr', 'ep', 2, 'Examen parcial', 9, 20),
  ('hpr-ta2', 'hpr', 'ta2', 3, 'Tarea académica 2', 11, 5),
  ('hpr-pc2', 'hpr', 'pc2', 4, 'Práctica calificada 2', 13, 15),
  ('hpr-pf', 'hpr', 'pf', 5, 'Prototipo final en Figma', 16, 15),
  ('hpr-ef', 'hpr', 'ef', 6, 'Examen final', 18, 30)
on conflict (id) do update set clave = excluded.clave, orden = excluded.orden, nombre = excluded.nombre, semana = excluded.semana, peso = excluded.peso;

insert into public.course_tasks (id, course_id, titulo, semana) values
  ('hpr-t2', 'hpr', 'Actividad 1: Exploración de la interfaz de Figma', 2),
  ('hpr-t4', 'hpr', 'Actividad 2: Wireframes de baja fidelidad', 4),
  ('hpr-t6', 'hpr', 'Actividad 3: Estilos de color y tipografía', 6),
  ('hpr-t8', 'hpr', 'Actividad 4: Biblioteca de componentes', 8),
  ('hpr-t10', 'hpr', 'Actividad 5: Auto layout y pantallas responsivas', 10),
  ('hpr-t12', 'hpr', 'Actividad 6: Variables y tema oscuro', 12),
  ('hpr-t13', 'hpr', 'Actividad 7: Prototipo con interacciones', 13),
  ('hpr-t14', 'hpr', 'Actividad 8: Animaciones con Smart Animate', 14),
  ('hpr-t15', 'hpr', 'Actividad 9: Pruebas de usabilidad del prototipo', 15)
on conflict (id) do update set titulo = excluded.titulo, semana = excluded.semana;

insert into public.course_threads (id, course_id, semana, titulo, tipo, descripcion) values
  ('hpr-general', 'hpr', null, 'Foro general del curso', 'no_calificado', 'Espacio para dudas generales del curso, coordinación entre compañeros y avisos no urgentes.'),
  ('hpr-f1', 'hpr', 1, 'Foro de Consultas - Semana 1', 'no_calificado', 'Comparte aquí tus dudas sobre «Introducción al prototipado y a Figma». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f2', 'hpr', 2, 'Foro de Consultas - Semana 2', 'no_calificado', 'Comparte aquí tus dudas sobre «La interfaz de Figma: frames, capas y herramientas». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f3', 'hpr', 3, 'Foro calificado - Semana 3', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Wireframes de baja fidelidad». Se califica la calidad del análisis, no la extensión.'),
  ('hpr-f4', 'hpr', 4, 'Foro de Consultas - Semana 4', 'no_calificado', 'Comparte aquí tus dudas sobre «Retícula, espaciado y jerarquía visual». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f5', 'hpr', 5, 'Foro de Consultas - Semana 5', 'no_calificado', 'Comparte aquí tus dudas sobre «Tipografía, color y estilos». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f6', 'hpr', 6, 'Foro de Consultas - Semana 6', 'no_calificado', 'Comparte aquí tus dudas sobre «Componentes y variantes». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f7', 'hpr', 7, 'Foro calificado - Semana 7', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Auto layout y diseño responsivo». Se califica la calidad del análisis, no la extensión.'),
  ('hpr-f8', 'hpr', 8, 'Foro de Consultas - Semana 8', 'no_calificado', 'Comparte aquí tus dudas sobre «Prototipado de flujos e interacciones». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f9', 'hpr', 9, 'Foro de Consultas - Semana 9', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen parcial». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f10', 'hpr', 10, 'Foro de Consultas - Semana 10', 'no_calificado', 'Comparte aquí tus dudas sobre «Variables y modos (tema claro y oscuro)». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f11', 'hpr', 11, 'Foro calificado - Semana 11', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Sistemas de diseño». Se califica la calidad del análisis, no la extensión.'),
  ('hpr-f12', 'hpr', 12, 'Foro de Consultas - Semana 12', 'no_calificado', 'Comparte aquí tus dudas sobre «Animaciones y microinteracciones con Smart Animate». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f13', 'hpr', 13, 'Foro de Consultas - Semana 13', 'no_calificado', 'Comparte aquí tus dudas sobre «Prototipos con contenido y datos reales». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f14', 'hpr', 14, 'Foro de Consultas - Semana 14', 'no_calificado', 'Comparte aquí tus dudas sobre «Accesibilidad en el diseño: contraste y tamaños». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f15', 'hpr', 15, 'Foro calificado - Semana 15', 'calificado', 'Participa con un aporte propio y comenta el de un compañero sobre «Pruebas de usabilidad con el prototipo». Se califica la calidad del análisis, no la extensión.'),
  ('hpr-f16', 'hpr', 16, 'Foro de Consultas - Semana 16', 'no_calificado', 'Comparte aquí tus dudas sobre «Colaboración, comentarios y traspaso a desarrollo (Dev Mode)». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f17', 'hpr', 17, 'Foro de Consultas - Semana 17', 'no_calificado', 'Comparte aquí tus dudas sobre «Presentación de prototipos». El docente y tus compañeros responderán durante la semana.'),
  ('hpr-f18', 'hpr', 18, 'Foro de Consultas - Semana 18', 'no_calificado', 'Comparte aquí tus dudas sobre «Examen final». El docente y tus compañeros responderán durante la semana.')
on conflict (id) do update set semana = excluded.semana, titulo = excluded.titulo, tipo = excluded.tipo, descripcion = excluded.descripcion;

insert into public.forum_posts (id, thread_id, autor, rol, texto, cuando_demo, parent_id, orden) values
  ('hpr-g1', 'hpr-general', 'Mateo Soto', 'Estudiante', '¿Dónde dejo el enlace de mi archivo de Figma para que lo revisen?', 'Hace 2 meses', null, 0),
  ('hpr-g1r', 'hpr-general', 'Rivas Montoya, Daniela', 'Docente', 'En cada entrega, pega el enlace con permiso de comentar. Revisa que no sea de solo vista.', 'Hace 2 meses', 'hpr-g1', 1),
  ('hpr-f1-c0', 'hpr-f1', 'Diego Fernández', 'Estudiante', '¿Podemos usar plugins en la entrega de esta semana o solo las herramientas base de Figma?', 'Hace 100 días', null, 0),
  ('hpr-f1-c0r', 'hpr-f1', 'Rivas Montoya, Daniela', 'Docente', 'Pueden usar los plugins que vimos en clase. Cítenlos en la descripción de la entrega.', 'Hace 99 días', 'hpr-f1-c0', 1),
  ('hpr-f2-c0', 'hpr-f2', 'Valeria Quispe', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 93 días', null, 0),
  ('hpr-f2-c0r', 'hpr-f2', 'Rivas Montoya, Daniela', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 92 días', 'hpr-f2-c0', 1),
  ('hpr-f3-c0', 'hpr-f3', 'Andrés Huamán', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 86 días', null, 0),
  ('hpr-f3-c0r', 'hpr-f3', 'Rivas Montoya, Daniela', 'Docente', 'Buena pregunta. El alcance está en la guía de la semana; lo aclaro también en la próxima sesión.', 'Hace 85 días', 'hpr-f3-c0', 1),
  ('hpr-f4-c0', 'hpr-f4', 'Camila Rojas', 'Estudiante', 'Me ayudó mucho la demostración, pero no me quedó claro cómo se arma la variante del componente.', 'Hace 79 días', null, 0),
  ('hpr-f4-c0r', 'hpr-f4', 'Rivas Montoya, Daniela', 'Docente', 'Revisa el video de la semana: allí está el paso a paso. Lo retomamos en clase con un ejemplo.', 'Hace 78 días', 'hpr-f4-c0', 1),
  ('hpr-f5-c0', 'hpr-f5', 'Jorge Castillo', 'Estudiante', '¿Podemos usar plugins en la entrega de esta semana o solo las herramientas base de Figma?', 'Hace 72 días', null, 0),
  ('hpr-f5-c0r', 'hpr-f5', 'Rivas Montoya, Daniela', 'Docente', 'Pueden usar los plugins que vimos en clase. Cítenlos en la descripción de la entrega.', 'Hace 71 días', 'hpr-f5-c0', 1),
  ('hpr-f6-c0', 'hpr-f6', 'Sofía Vargas', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 65 días', null, 0),
  ('hpr-f6-c0r', 'hpr-f6', 'Rivas Montoya, Daniela', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 64 días', 'hpr-f6-c0', 1),
  ('hpr-f7-c0', 'hpr-f7', 'Mateo Soto', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 58 días', null, 0),
  ('hpr-f7-c0r', 'hpr-f7', 'Rivas Montoya, Daniela', 'Docente', 'Buena pregunta. El alcance está en la guía de la semana; lo aclaro también en la próxima sesión.', 'Hace 57 días', 'hpr-f7-c0', 1),
  ('hpr-f8-c0', 'hpr-f8', 'Isabel Aldara', 'Estudiante', 'Me ayudó mucho la demostración, pero no me quedó claro cómo se arma la variante del componente.', 'Hace 51 días', null, 0),
  ('hpr-f8-c0r', 'hpr-f8', 'Rivas Montoya, Daniela', 'Docente', 'Revisa el video de la semana: allí está el paso a paso. Lo retomamos en clase con un ejemplo.', 'Hace 50 días', 'hpr-f8-c0', 1),
  ('hpr-f10-c0', 'hpr-f10', 'Valeria Quispe', 'Estudiante', 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 37 días', null, 0),
  ('hpr-f10-c0r', 'hpr-f10', 'Rivas Montoya, Daniela', 'Docente', 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 36 días', 'hpr-f10-c0', 1),
  ('hpr-f11-c0', 'hpr-f11', 'Andrés Huamán', 'Estudiante', 'Profesor, ¿podría aclarar el alcance de este punto para la práctica?', 'Hace 30 días', null, 0),
  ('hpr-f11-c0r', 'hpr-f11', 'Rivas Montoya, Daniela', 'Docente', 'Buena pregunta. El alcance está en la guía de la semana; lo aclaro también en la próxima sesión.', 'Hace 29 días', 'hpr-f11-c0', 1),
  ('hpr-f12-c0', 'hpr-f12', 'Camila Rojas', 'Estudiante', 'Me ayudó mucho la demostración, pero no me quedó claro cómo se arma la variante del componente.', 'Hace 23 días', null, 0),
  ('hpr-f12-c0r', 'hpr-f12', 'Rivas Montoya, Daniela', 'Docente', 'Revisa el video de la semana: allí está el paso a paso. Lo retomamos en clase con un ejemplo.', 'Hace 22 días', 'hpr-f12-c0', 1)
on conflict (id) do update set texto = excluded.texto, cuando_demo = excluded.cuando_demo;

insert into public.announcements (id, course_id, titulo, texto, hace_dias, semana, dia, nuevo, orden) values
  ('hpr-a5', 'hpr', 'Recordatorio: Práctica calificada 2', 'Esta semana se rinde la práctica calificada 2. Revisen el material hasta la semana 13 y lleguen 10 minutos antes. Pueden consultar sus dudas en el foro de la semana.', 1, null, null, true, 0),
  ('hpr-a4', 'hpr', 'Cambio en el horario de asesoría', 'Esta semana la asesoría con Rivas Montoya, Daniela se realizará por Zoom. El enlace y el código de acceso están en la pestaña Zoom del curso.', 3, null, null, true, 1),
  ('hpr-a3', 'hpr', 'Resultados del examen parcial', 'Ya están publicadas las notas del examen parcial. Quienes deseen revisar su evaluación pueden solicitar una cita durante la asesoría.', null, 10, 2, false, 2),
  ('hpr-a2', 'hpr', 'Material complementario disponible', 'Se agregó lectura complementaria a las semanas 4 a 6. No es obligatoria, pero ayuda a profundizar los temas de los talleres.', null, 5, 1, false, 3),
  ('hpr-a1', 'hpr', 'Bienvenida al curso', 'Les doy la bienvenida al ciclo. Para las sesiones necesitan una cuenta gratuita de Figma. En el sílabo encontrarán la sumilla, el sistema de evaluación y el cronograma.', null, 1, 0, false, 4)
on conflict (id) do update set titulo = excluded.titulo, texto = excluded.texto, hace_dias = excluded.hace_dias, semana = excluded.semana, dia = excluded.dia, nuevo = excluded.nuevo, orden = excluded.orden;

-- ════════════════════════════════════════════════════════════════════════════
-- Notas, entregas y foros hasta la semana actual
-- ════════════════════════════════════════════════════════════════════════════

-- Completa lo que ya habría pasado hasta la semana actual del ciclo: notas publicadas, tareas entregadas y comentarios
-- en los foros recientes. Se calcula con la semana de hoy; al volver a ejecutar el seed se actualiza sin duplicar datos.
do $$
declare v_week int;
begin
  select semana_actual into v_week from public.terms where id = '2026-2';

  -- Notas: toda evaluación anterior a la semana actual queda calificada (11 a 18, estable por alumno y evaluación).
  insert into public.evaluation_grades (user_id, course_id, evaluation_id, nota)
  select p.id, e.course_id, e.id, 11 + (abs(hashtext(p.id::text || e.id)) % 8)
  from public.profiles p
  join public.enrollments en on en.user_id = p.id and en.term_id = '2026-2'
  join public.course_evaluations e on e.course_id = en.course_id
  where e.semana < v_week
  on conflict (user_id, evaluation_id) do nothing;

  -- Tareas: se entregaron todas hasta dos semanas antes; las dos más recientes quedan pendientes.
  insert into public.task_submissions (user_id, course_id, task_id, archivo, nota, entregada_en)
  select p.id, t.course_id, t.id, 'Entrega_' || t.semana || '.pdf', 12 + (abs(hashtext(p.id::text || t.id)) % 7),
         now() - make_interval(days => greatest(1, (v_week - t.semana) * 7 - 2))
  from public.profiles p
  join public.enrollments en on en.user_id = p.id and en.term_id = '2026-2'
  join public.course_tasks t on t.course_id = en.course_id
  where t.semana <= v_week - 2
  on conflict (user_id, task_id) do nothing;

  -- Foros de las últimas tres semanas: un comentario de un compañero y la respuesta del docente.
  insert into public.forum_posts (id, thread_id, autor, rol, texto, cuando_demo, parent_id, orden)
  select c.id || '-f' || w.n || '-c0', c.id || '-f' || w.n,
         (array['Diego Fernández', 'Valeria Quispe', 'Andrés Huamán', 'Camila Rojas'])[1 + (abs(hashtext(c.id || w.n)) % 4)],
         'Estudiante', w.texto, w.cuando, null, 0
  from public.courses c
  cross join (values
    (v_week - 2, 'Profesor, ¿la práctica incluye lo visto en la última sesión o solo las lecturas?', 'Hace 6 días'),
    (v_week - 1, 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 2 días'),
    (v_week,     'Coincido con lo que comentan, sería bueno repasarlo antes del examen final.', 'Hoy')
  ) as w(n, texto, cuando)
  where exists (select 1 from public.course_threads th where th.id = c.id || '-f' || w.n)
  on conflict (id) do nothing;

  insert into public.forum_posts (id, thread_id, autor, rol, texto, cuando_demo, parent_id, orden)
  select c.id || '-f' || w.n || '-c0r', c.id || '-f' || w.n, c.docente, 'Docente', w.respuesta, w.cuando,
         c.id || '-f' || w.n || '-c0', 1
  from public.courses c
  cross join (values
    (v_week - 2, 'Incluye ambas cosas. Revisa la diapositiva 10 y el ejemplo del video; lo retomamos en clase.', 'Hace 5 días'),
    (v_week - 1, 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 1 día'),
    (v_week,     'Buena idea. Lo repasamos en la asesoría de esta semana.', 'Hoy')
  ) as w(n, respuesta, cuando)
  where exists (select 1 from public.course_threads th where th.id = c.id || '-f' || w.n)
  on conflict (id) do nothing;
end $$;

-- El anuncio más reciente de cada curso recuerda el trabajo final de la semana.
update public.announcements a
set titulo = 'Recordatorio: ' || d.proyecto,
    texto  = 'Esta semana se entrega el trabajo final del curso (' || lower(d.proyecto) || '). Revisen la rúbrica del sílabo y consulten sus dudas en el foro de la semana.'
from public.course_details d
where d.course_id = a.course_id and a.id = a.course_id || '-a5';

-- ════════════════════════════════════════════════════════════════════════════
-- Anuncios del campus (fechas relativas a hoy)
-- ════════════════════════════════════════════════════════════════════════════

-- Las fechas son relativas a hoy (hora de Lima): al volver a ejecutar este archivo se renuevan
-- y las asistencias ya confirmadas se conservan. Ejecutar después de 0006_anuncios_campus.sql.

with hoy as (select (now() at time zone 'America/Lima')::date as d)
insert into public.campus_announcements
  (id, categoria, titulo, resumen, descripcion, lugar, sede, fecha, hora_inicio, hora_fin, cupos, destacado)
select v.id, v.categoria, v.titulo, v.resumen, v.descripcion, v.lugar, v.sede, hoy.d + v.dias, v.ini::time, v.fin::time, v.cupos, v.destacado
from hoy, (values
  ('campana-medica', 'salud', 'Campaña médica',
   'Chequeo gratuito de peso, talla, presión y vista.',
   'Bienestar Universitario organiza una jornada de salud para todos los alumnos. Podrás medir tu peso, talla y presión arterial, y hacerte un control visual con atención de profesionales del tópico. No necesitas inscripción previa, solo lleva tu carné o DNI.',
   'Tópico · Pabellón A', 'Lima Centro', 2, '09:00', '16:00', null::int, true),
  ('hackaton-lectura', 'cultura', 'Hackatón de Lectura',
   'Un día entero leyendo y compartiendo en equipo.',
   'Forma un equipo de hasta cuatro personas y participa en retos de lectura rápida, reseñas colaborativas y un concurso de recomendaciones. Habrá premios para los tres mejores equipos y certificado de participación. Los cupos son limitados.',
   'Biblioteca', 'Lima Centro', 7, '10:00', '17:00', 60, true),
  ('taller-estres', 'salud', 'Taller de manejo del estrés',
   'Técnicas de respiración y organización para época de exámenes.',
   'Sesión virtual guiada por el equipo de psicología con ejercicios prácticos para manejar la ansiedad y planificar tu estudio. Se envía el enlace de Zoom por correo al confirmar tu asistencia.',
   'Zoom', 'Virtual', 4, '16:00', '17:30', 40, false),
  ('charla-ia', 'academico', 'Charla: IA en la ingeniería',
   'Casos reales de inteligencia artificial en proyectos de software.',
   'Egresados y docentes presentan cómo se usa la inteligencia artificial en proyectos reales, con una ronda de preguntas al final. Ideal para alumnos de los últimos ciclos que preparan su proyecto integrador.',
   'Auditorio A-101', 'Lima Centro', 5, '18:00', '19:30', 120, false),
  ('feria-empleabilidad', 'empleabilidad', 'Feria de empleabilidad',
   'Conversa con empresas que buscan practicantes.',
   'Más de quince empresas del sector tecnología, banca y consultoría recibirán tu CV y harán entrevistas rápidas. Lleva tu CV impreso y viste formal. Habrá una sala de orientación para revisar tu perfil.',
   'Explanada principal', 'Lima Centro', 10, '11:00', '15:00', null, false),
  ('torneo-futsal', 'deporte', 'Torneo interfacultades de futsal',
   'Inscribe a tu equipo y juega por la copa del ciclo.',
   'Equipos de cinco jugadores por facultad. Las inscripciones se confirman en el módulo de Bienestar. Se requiere llevar zapatillas deportivas y el carné vigente.',
   'Losa deportiva', 'Lima Norte', 12, '15:00', '19:00', 80, false)
) as v(id, categoria, titulo, resumen, descripcion, lugar, sede, dias, ini, fin, cupos, destacado)
on conflict (id) do update set
  categoria = excluded.categoria, titulo = excluded.titulo, resumen = excluded.resumen, descripcion = excluded.descripcion,
  lugar = excluded.lugar, sede = excluded.sede, fecha = excluded.fecha, hora_inicio = excluded.hora_inicio,
  hora_fin = excluded.hora_fin, cupos = excluded.cupos, destacado = excluded.destacado;

-- ════════════════════════════════════════════════════════════════════════════
-- Notificaciones de ejemplo (horas relativas a ahora)
-- ════════════════════════════════════════════════════════════════════════════

insert into public.notifications (user_id, tipo, titulo, cuerpo, ruta, clave, created_at)
select p.id, v.tipo, v.titulo, v.cuerpo, v.ruta, v.clave, now() - v.hace
from public.profiles p
cross join (values
  ('tarea',   'Tarea por vencer',          'Actividad 9 de Interacción Hombre Máquina vence este domingo.',              '/cursos/ihm',      'demo-tarea',   interval '35 minutes'),
  ('nota',    'Nota publicada',            'Ya puedes ver tu nota de la Práctica calificada 2 en Interacción Hombre Máquina.', '/cursos/ihm',      'demo-nota',    interval '3 hours'),
  ('anuncio', 'Nueva actividad en el campus', 'Hackatón de Lectura en la Biblioteca. Quedan pocos cupos.',               '/anuncios/hackaton-lectura', 'demo-anuncio', interval '1 day 2 hours'),
  ('sistema', 'Recordatorio de pago',      'Tu cuota de diciembre vence en 7 días.',                                      '/pagos',           'demo-pago',    interval '2 days'),
  ('sistema', 'Bienvenido a UTP+ Service', 'Aquí verás avisos de tus reservas, tareas, notas y actividades del campus.', '/inicio',          'demo-bienvenida', interval '4 days')
) as v(tipo, titulo, cuerpo, ruta, clave, hace)
on conflict (user_id, clave) where clave is not null do update set
  tipo = excluded.tipo, titulo = excluded.titulo, cuerpo = excluded.cuerpo, ruta = excluded.ruta, created_at = excluded.created_at;

-- ════════════════════════════════════════════════════════════════════════════
-- Trámites: 26 trámites y solicitudes de ejemplo
-- ════════════════════════════════════════════════════════════════════════════

-- Los costos y plazos son ilustrativos, no tarifas ni políticas oficiales de la UTP.

with m as (
  select '{"key":"motivo","label":"Motivo de la solicitud","type":"select","required":true,"options":["Trámites académicos","Postulación laboral","Beca o financiamiento","Uso personal"]}'::jsonb as motivo,
         '{"key":"motivo","label":"Motivo","type":"select","required":true,"options":["Salud","Trabajo","Económico","Fuerza mayor","Otro"]}'::jsonb as motivo_causa,
         '{"key":"curso","label":"Curso","type":"curso","required":true}'::jsonb as curso
)
insert into public.procedure_types (id, categoria, titulo, descripcion, icono, costo, plazo, modalidad, campos, orden)
select v.id, v.categoria, v.titulo, v.descripcion, v.icono, v.costo, v.plazo, v.modalidad, v.campos, v.orden
from m, lateral (values
  -- ───── Trámites autogestionables ─────
  (1,  'cambio-campus-carrera', 'autogestionable', 'Cambio de Campus y Carrera', 'Solicita trasladarte de sede o de carrera.', 'swap_horiz', 0, '10 a 15 días hábiles', 'Digital',
       '[{"key":"tipo","label":"Qué quieres cambiar","type":"select","required":true,"options":["Cambio de campus","Cambio de carrera","Ambos"]},{"key":"destino","label":"Campus o carrera de destino","type":"text","required":true},{"key":"motivo","label":"Motivo","type":"textarea","required":true}]'::jsonb),
  (2,  'carta-presentacion', 'autogestionable', 'Carta de Presentación para prácticas, empleo o internado', 'Documento que te presenta ante una empresa o institución.', 'mail', 0, '2 a 3 días hábiles', 'Digital · PDF',
       '[{"key":"finalidad","label":"Finalidad","type":"select","required":true,"options":["Prácticas","Empleo","Internado"]},{"key":"empresa","label":"Empresa o institución","type":"text","required":true}]'::jsonb),
  (3,  'certificado-estudios', 'autogestionable', 'Certificado de Estudios', 'Documento oficial de tu trayectoria académica.', 'description', 30, '3 a 5 días hábiles', 'Digital · PDF',
       ('[{"key":"tipo","label":"Tipo de certificado","type":"select","required":true,"options":["General","Por ciclos aprobados","De egresado"]},' || (select motivo::text from m) || ']')::jsonb),
  (4,  'constancia-adeudo', 'autogestionable', 'Constancia de Adeudo / no Adeudo', 'Comprobante de tu situación de pagos con la universidad.', 'receipt_long', 0, '1 a 2 días hábiles', 'Digital · PDF',
       ('[{"key":"tipo","label":"Tipo de constancia","type":"select","required":true,"options":["Adeudo","No adeudo"]},' || (select motivo::text from m) || ']')::jsonb),
  (5,  'constancia-estudios', 'autogestionable', 'Constancia de Estudios', 'Acredita que eres alumno de la universidad.', 'workspace_premium', 15, '2 a 3 días hábiles', 'Digital · PDF',
       ('[' || (select motivo::text from m) || ']')::jsonb),
  (6,  'constancia-ingreso', 'autogestionable', 'Constancia de Ingreso', 'Acredita tu ingreso y el periodo en que empezaste.', 'login', 15, '2 a 3 días hábiles', 'Digital · PDF',
       ('[' || (select motivo::text from m) || ']')::jsonb),
  (7,  'constancia-matricula', 'autogestionable', 'Constancia de Matrícula', 'Comprobante de inscripción vigente.', 'verified', 15, '2 a 3 días hábiles', 'Digital · PDF',
       ('[' || (select motivo::text from m) || ']')::jsonb),
  (8,  'constancia-tercio-superior', 'autogestionable', 'Constancia de Pertenencia al Tercio/Quinto/Décimo superior', 'Acredita tu ubicación en el cuadro de méritos.', 'military_tech', 20, '3 a 5 días hábiles', 'Digital · PDF',
       ('[{"key":"nivel","label":"Nivel","type":"select","required":true,"options":["Tercio superior","Quinto superior","Décimo superior"]},' || (select motivo::text from m) || ']')::jsonb),
  (9,  'constancia-promedio-periodo', 'autogestionable', 'Constancia de promedio ponderado (periodo)', 'Tu promedio ponderado de un periodo lectivo.', 'calculate', 15, '2 a 3 días hábiles', 'Digital · PDF',
       ('[{"key":"periodo","label":"Periodo","type":"select","required":true,"options":["2026-2","2026-1","2025-2","2025-1"]},' || (select motivo::text from m) || ']')::jsonb),
  (10, 'constancia-promedio-acumulado', 'autogestionable', 'Constancia de promedio ponderado acumulado', 'Tu promedio ponderado de toda la carrera hasta hoy.', 'functions', 15, '2 a 3 días hábiles', 'Digital · PDF',
       ('[' || (select motivo::text from m) || ']')::jsonb),
  (11, 'descuento-ciclo-completo', 'autogestionable', 'Descuento de Ciclo Completo 7.5% - Agosto 2026', 'Descuento por pagar todo el ciclo en una sola cuota.', 'sell', 0, '1 a 2 días hábiles', 'Digital',
       '[{"key":"acepta","label":"Acepto pagar el ciclo completo en una sola cuota","type":"check","required":true}]'::jsonb),
  (12, 'emision-carne', 'autogestionable', 'Emisión de Carné Universitario', 'Identificación oficial para estudiantes.', 'badge', 15, '5 a 7 días hábiles', 'Recojo en sede',
       '[{"key":"sede","label":"Sede de recojo","type":"select","required":true,"options":["Lima Centro","Lima Norte"]}]'::jsonb),
  (13, 'examen-rezagados', 'autogestionable', 'Examen de Rezagados', 'Rinde una evaluación a la que no pudiste asistir.', 'event_repeat', 25, '3 días hábiles', 'Digital',
       ('[' || (select curso::text from m) || ',' || (select motivo_causa::text from m) || ']')::jsonb),
  (14, 'rectificacion-nota', 'autogestionable', 'Rectificación de Nota', 'Pide revisar una nota que crees incorrecta.', 'edit_note', 0, '5 a 7 días hábiles', 'Digital',
       ('[' || (select curso::text from m) || ',{"key":"evaluacion","label":"Evaluación","type":"text","required":true},{"key":"comentario","label":"Comentario","type":"textarea","required":true}]')::jsonb),
  (15, 'registro-fotografia', 'autogestionable', 'Registro de Fotografía', 'Registra la foto de tu carné y tu perfil.', 'photo_camera', 0, '1 día hábil', 'Digital',
       '[{"key":"acepta","label":"Declaro que mi fotografía es reciente y de frente","type":"check","required":true}]'::jsonb),
  (16, 'retiro-curso', 'autogestionable', 'Retiro de Curso - Agosto 2026', 'Retírate de un curso dentro del plazo permitido.', 'remove_circle', 0, '3 a 5 días hábiles', 'Digital',
       ('[' || (select curso::text from m) || ',' || (select motivo_causa::text from m) || ']')::jsonb),
  (17, 'retiro-periodo', 'autogestionable', 'Retiro de periodo lectivo - Agosto 2026', 'Retírate de todo el periodo lectivo.', 'event_busy', 0, '5 a 7 días hábiles', 'Digital',
       ('[' || (select motivo_causa::text from m) || ',{"key":"comentario","label":"Comentario","type":"textarea","required":false}]')::jsonb),
  (18, 'cita-psicologica', 'autogestionable', 'Solicitud de Cita Psicológica', 'Atención del equipo de psicología de Bienestar.', 'psychology', 0, 'Te contactan en 24 horas', 'Presencial o virtual',
       '[{"key":"modalidad","label":"Modalidad","type":"select","required":true,"options":["Presencial","Virtual"]},{"key":"horario","label":"Horario preferido","type":"select","required":true,"options":["Mañana","Tarde","Noche"]},{"key":"comentario","label":"¿Quieres contarnos algo?","type":"textarea","required":false}]'::jsonb),
  -- ───── Solicitudes SAE en línea ─────
  (19, 'ajuste-razonable', 'sae', 'Ajuste razonable - Discapacidad', 'Adaptaciones para que estudies en igualdad de condiciones.', 'accessible', 0, '5 a 10 días hábiles', 'Digital',
       '[{"key":"tipo","label":"Tipo de ajuste","type":"select","required":true,"options":["Evaluaciones","Acceso físico","Material accesible","Apoyo tecnológico","Otro"]},{"key":"descripcion","label":"Cuéntanos qué necesitas","type":"textarea","required":true}]'::jsonb),
  (20, 'nombre-social', 'sae', 'Cambio de Nombre Social', 'Usa tu nombre social en los sistemas de la universidad.', 'person', 0, '5 a 7 días hábiles', 'Digital',
       '[{"key":"nombre","label":"Nombre social","type":"text","required":true}]'::jsonb),
  (21, 'certificados-ingles', 'sae', 'Certificados y constancias de Inglés', 'Documentos de tu nivel de inglés.', 'translate', 20, '3 a 5 días hábiles', 'Digital · PDF',
       '[{"key":"documento","label":"Documento","type":"select","required":true,"options":["Certificado de inglés","Constancia de nivel"]},{"key":"nivel","label":"Nivel","type":"select","required":true,"options":["Básico","Intermedio","Avanzado"]}]'::jsonb),
  (22, 'constancias-silabos', 'sae', 'Constancias y Sílabos', 'Sílabos y constancias de cursos que ya llevaste.', 'menu_book', 10, '3 a 5 días hábiles', 'Digital · PDF',
       '[{"key":"documento","label":"Documento","type":"select","required":true,"options":["Sílabo","Constancia"]},{"key":"curso","label":"Curso y periodo","type":"text","required":true}]'::jsonb),
  (23, 'convalidaciones', 'sae', 'Convalidaciones', 'Reconoce cursos que llevaste en otra institución.', 'compare_arrows', 50, '15 a 20 días hábiles', 'Digital',
       '[{"key":"institucion","label":"Institución de origen","type":"text","required":true},{"key":"cursos","label":"Cursos a convalidar","type":"textarea","required":true}]'::jsonb),
  (24, 'duplicado-carne', 'sae', 'Duplicado de Carné Universitario', 'Nuevo carné si perdiste o se dañó el tuyo.', 'badge', 20, '5 a 7 días hábiles', 'Recojo en sede',
       '[{"key":"motivo","label":"Motivo","type":"select","required":true,"options":["Pérdida","Robo","Deterioro"]},{"key":"sede","label":"Sede de recojo","type":"select","required":true,"options":["Lima Centro","Lima Norte"]}]'::jsonb),
  (25, 'segunda-carrera', 'sae', 'Postulación a Segunda Carrera', 'Postula a otra carrera mientras estudias o al egresar.', 'school', 0, '10 a 15 días hábiles', 'Digital',
       '[{"key":"carrera","label":"Carrera a la que postulas","type":"text","required":true},{"key":"motivo","label":"Motivo","type":"textarea","required":false}]'::jsonb),
  (26, 'reembolso-factura-subvencion', 'sae', 'Reembolso, Emisión Factura Electrónica y Subvención de pagos por Empresas', 'Gestiones de pagos: reembolsos, facturas y pagos de empresas.', 'receipt', 0, '5 a 10 días hábiles', 'Digital',
       '[{"key":"tipo","label":"Qué necesitas","type":"select","required":true,"options":["Reembolso","Factura electrónica","Subvención de pagos por empresa"]},{"key":"detalle","label":"Detalle","type":"textarea","required":true}]'::jsonb)
) as v(orden, id, categoria, titulo, descripcion, icono, costo, plazo, modalidad, campos)
on conflict (id) do update set
  categoria = excluded.categoria, titulo = excluded.titulo, descripcion = excluded.descripcion, icono = excluded.icono,
  costo = excluded.costo, plazo = excluded.plazo, modalidad = excluded.modalidad, campos = excluded.campos, orden = excluded.orden;

-- ───────────────────────── Solicitudes de ejemplo ─────────────────────────
do $$
declare
  r record;
  p public.procedures%rowtype;
begin
  for r in
    select * from (values
      ('U22265137', 'SOL-2026-0148', 'certificado-estudios', 'en_revision', '{"tipo":"General","motivo":"Trámites académicos"}', interval '2 days'),
      ('U22265137', 'SOL-2026-0129', 'constancia-matricula',  'aprobado',    '{"motivo":"Beca o financiamiento"}',               interval '7 days'),
      ('U22265137', 'SOL-2026-0117', 'retiro-curso',          'rechazado',   '{"curso":"dwi","motivo":"Trabajo"}',               interval '20 days'),
      ('U22209574', 'SOL-2026-0141', 'constancia-estudios',   'aprobado',    '{"motivo":"Postulación laboral"}',                 interval '9 days'),
      ('U22693560', 'SOL-2026-0143', 'carta-presentacion',    'en_revision', '{"finalidad":"Prácticas","empresa":"Interbank"}',  interval '1 day')
    ) as t(codigo_alumno, codigo, tipo_id, estado, detalle, hace)
  loop
    insert into public.procedures (codigo, user_id, tipo_id, estado, detalle, created_at, actualizado_en)
    select r.codigo, pr.id, r.tipo_id, r.estado, r.detalle::jsonb, now() - r.hace, now() - r.hace
    from public.profiles pr where pr.codigo = r.codigo_alumno
    on conflict (codigo) do nothing
    returning * into p;

    if p.id is not null then
      insert into public.procedure_events (procedure_id, estado, nota, created_at) values
        (p.id, 'en_revision', 'Solicitud recibida. Está en revisión.', now() - r.hace);
      if r.estado = 'aprobado' then
        insert into public.procedure_events (procedure_id, estado, nota, created_at) values
          (p.id, 'aprobado', 'Aprobada. El documento fue enviado a tu correo institucional.', now() - r.hace + interval '2 days');
        update public.procedures set actualizado_en = now() - r.hace + interval '2 days' where id = p.id;
      elsif r.estado = 'rechazado' then
        insert into public.procedure_events (procedure_id, estado, nota, created_at) values
          (p.id, 'rechazado', 'Rechazada: la solicitud está fuera del plazo de retiros.', now() - r.hace + interval '3 days');
        update public.procedures set actualizado_en = now() - r.hace + interval '3 days' where id = p.id;
      end if;
    end if;
    p := null;
  end loop;

  -- Los avisos que crea el disparador al insertar no corresponden a algo que el alumno acabe de hacer.
  delete from public.notifications
  where ruta in ('/tramites/solicitud/SOL-2026-0148', '/tramites/solicitud/SOL-2026-0129', '/tramites/solicitud/SOL-2026-0117',
                 '/tramites/solicitud/SOL-2026-0141', '/tramites/solicitud/SOL-2026-0143')
    and clave is null and created_at > now() - interval '1 minute';
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Empleabilidad: ofertas laborales
-- ════════════════════════════════════════════════════════════════════════════

-- Repetible: renueva las fechas del catálogo sin borrar ni duplicar postulaciones.
begin;
insert into public.employment_programs (id, titulo, descripcion, ciclos, frecuencia, requisitos, icono, orden)
values
  ('primer-empleo', 'Primer empleo', 'Te entrenamos para enfrentarte a tus primeros procesos de selección.', 'Ciclos 1 a 5', '2 veces por semestre', '{}', 'work', 1),
  ('ruta-laboral', 'Ruta laboral', 'Aprende herramientas para tus objetivos laborales con un curso disponible las 24 horas.', 'Todos los ciclos', 'Anual · Disponible 24/7', '{}', 'route', 2),
  ('generacion-top', 'Generación top', 'Recibe acompañamiento y mentorías de profesionales líderes del mercado.', 'Ciclo 7 en adelante', '1 vez por semana', array['Tercio superior'], 'workspace_premium', 3),
  ('impulsa', 'Impulsa', 'Fortalece tu perfil profesional y prepárate para tu siguiente oportunidad con mentorías.', 'Ciclos 9 y 10', '1 vez por semana', array['Tercio superior'], 'rocket_launch', 4),
  ('egresa-con-potencial', 'Egresa con potencial', 'Prepárate para dar el paso de la universidad al mundo laboral con acompañamiento profesional.', 'Último ciclo', '1 vez por semana', '{}', 'school', 5)
on conflict (id) do update set titulo = excluded.titulo, descripcion = excluded.descripcion,
  ciclos = excluded.ciclos, frecuencia = excluded.frecuencia, requisitos = excluded.requisitos, icono = excluded.icono, orden = excluded.orden;

insert into public.job_offers (id, empresa, puesto, tipo, ciudad, ubicacion, area, nivel_academico, carreras,
  descripcion, funciones, requisitos, beneficios, experiencia, publicado_en, cierra_en)
values
  ('coco-crepe-atencion', 'Coco Crêpe', 'Atención al cliente', 'full_time', 'Lima', 'Lima, Lima · Perú',
   'Atención al cliente, Call Center y Telemarketing', 'Universitario en curso · Ciclos iniciales', '{}',
   'Forma parte de un equipo de atención y preparación de productos en tienda.',
   array['Brindar atención personalizada, cordial y eficiente.', 'Preparar productos siguiendo las recetas y estándares de la marca.', 'Apoyar en caja y mantener el orden y la higiene del módulo.'],
   array['Disponibilidad para trabajar en horarios rotativos.', 'Iniciativa, rapidez, actitud de servicio y trabajo en equipo.', 'Experiencia en atención al cliente o cafeterías deseable.'],
   array['Remuneración acorde al mercado.', 'Beneficios de ley según el régimen laboral.', 'Capacitaciones continuas y descuentos corporativos.'],
   'Primer empleo', now() - interval '2 days', now() + interval '45 days'),
  ('poderosa-practicas', 'Mina Poderosa', 'Convocatoria de prácticas', 'practica', 'Trujillo', 'Trujillo, La Libertad · Perú',
   'Minería, Petróleo y Gas', 'Universitario en curso · Ciclos avanzados',
   array['Administración de Empresas', 'Contabilidad', 'Derecho', 'Ingeniería Ambiental', 'Ingeniería Civil', 'Ingeniería Industrial', 'Ingeniería de Sistemas', 'Psicología'],
   'Desarrolla tus habilidades con acompañamiento en un equipo multidisciplinario.',
   array['Apoyar en los proyectos del área asignada.', 'Preparar reportes y organizar información.', 'Participar en actividades de aprendizaje con tu equipo.'],
   array['Estudiar una de las carreras indicadas.', 'Disponibilidad para realizar prácticas en Trujillo.', 'Responsabilidad y disposición para aprender.'],
   array['Subvención económica de prácticas.', 'Seguro según convenio.', 'Acompañamiento y aprendizaje con profesionales.'],
   'No requiere experiencia previa', now() - interval '1 day', now() + interval '30 days'),
  ('nexo-sistemas', 'Nexo Digital', 'Practicante de desarrollo web', 'practica', 'Lima', 'Lima · Perú · Modalidad híbrida',
   'Tecnología y Sistemas', 'Universitario en curso · Ciclos avanzados', array['Ingeniería de Sistemas', 'Ingeniería de Software'],
   'Aprende a construir aplicaciones web trabajando con un equipo de desarrollo.',
   array['Apoyar en el desarrollo de interfaces web.', 'Documentar y verificar funcionalidades.', 'Participar en revisiones de código con tu equipo.'],
   array['Conocimientos básicos de HTML, CSS y JavaScript.', 'Interés en React y TypeScript.', 'Trabajo en equipo y comunicación.'],
   array['Horario compatible con tus estudios.', 'Mentoría técnica.', 'Subvención económica de prácticas.'],
   'No requiere experiencia previa', now(), now() + interval '60 days')
on conflict (id) do update set empresa = excluded.empresa, puesto = excluded.puesto, tipo = excluded.tipo,
  ciudad = excluded.ciudad, ubicacion = excluded.ubicacion, area = excluded.area, nivel_academico = excluded.nivel_academico,
  carreras = excluded.carreras, descripcion = excluded.descripcion, funciones = excluded.funciones,
  requisitos = excluded.requisitos, beneficios = excluded.beneficios, experiencia = excluded.experiencia,
  publicado_en = excluded.publicado_en, cierra_en = excluded.cierra_en;
commit;

-- ════════════════════════════════════════════════════════════════════════════
-- Empleabilidad: detalle de los programas
-- ════════════════════════════════════════════════════════════════════════════

-- Detalles de los cinco programas según Project 3 de MagicPath.
begin;
insert into public.employment_programs (id, titulo, lema, descripcion, ciclos, formato, frecuencia, beneficios, requisitos, nota, url_oficial, icono, orden)
values
  ('primer-empleo', 'Primer Empleo', 'Tu primer paso profesional', 'Prepárate para tus primeros procesos de selección y conoce oportunidades para comenzar tu experiencia laboral.', 'Ciclos 1 al 5', '2 horas académicas', '2 veces por semestre', array['Aprende a elaborar tu CV.', 'Practica evaluaciones online y videoentrevistas.', 'Conoce ofertas y canales de postulación.']::text[], array['Matrícula vigente de pregrado.', 'Estar entre el 1.er y 5.º ciclo.']::text[], 'Se realiza dos veces por semestre. Consulta el taller y las fechas de tu campus.', 'https://empleabilidad.utp.edu.pe/alumnos/primer-empleo', 'work', 1),
  ('ruta-laboral', 'Ruta Laboral', 'Construye tu camino laboral', 'Fortalece tu perfil profesional con herramientas prácticas para alcanzar tus objetivos laborales, a tu ritmo en UTP+Class.', 'Ciclos 1 al 8', 'Virtual · disponible 24/7', 'Anual · Disponible 24/7', array['Reconoce tus competencias laborales.', 'Prepara presentaciones de impacto.', 'Desarrolla tu marca personal y estrategias de búsqueda.']::text[], array['Ser estudiante del 1.er al 8.º ciclo.', 'Contar con acceso a UTP+Class.']::text[], 'El curso está disponible durante todo el año en UTP+Class.', 'https://empleabilidad.utp.edu.pe/alumnos/ruta-laboral-virtual', 'route', 2),
  ('generacion-top', 'Generación Top', 'Potencia tu talento', 'Desarrolla tu potencial profesional con orientación de especialistas y formación para destacar en el mercado laboral.', 'Desde el 7.º ciclo', 'Más de 30 horas formativas', 'Según convocatoria', array['Asesoría de CV y perfil de LinkedIn.', 'Simulaciones de entrevistas y workshops.', 'Formación en competencias y certificado UTP.']::text[], array['Desde el 7.º ciclo y alto rendimiento académico.', 'Promedio mínimo de 17 y, como mínimo, tercio superior.', 'Revisar condición de Medalla de Oro en la convocatoria.', 'Inglés y Excel intermedios; conocimientos de Power BI.', 'Cumplir el proceso de selección.']::text[], 'Consulta los requisitos completos y las fechas de la convocatoria en la página oficial.', 'https://empleabilidadutp.my.canva.site/generaciontop', 'workspace_premium', 3),
  ('impulsa', 'Impulsa', 'Acelera tu desarrollo', 'Entrena tus competencias, participa en retos empresariales y recibe mentoría de profesionales líderes del mercado.', 'Ciclos 9 y 10', 'Híbrido · gratuito', 'Según convocatoria', array['Workshops de liderazgo, comunicación e innovación.', 'Retos empresariales y mentoring.', 'Asesoría de empleabilidad y certificado UTP.']::text[], array['Cursar 9.º ciclo en adelante.', 'Promedio acumulado mínimo de 17.', 'Inglés y Excel a nivel intermedio.', 'Conocimientos de Power BI.']::text[], 'La admisión incluye evaluaciones y dinámica grupal. Consulta las fechas de la próxima convocatoria.', 'https://empleabilidad.utp.edu.pe/alumnos/impulsa', 'rocket_launch', 4),
  ('egresa-con-potencial', 'Egresa con Potencial', 'Prepárate para tu siguiente etapa', 'Recibe acompañamiento de un asesor especializado en tu carrera para avanzar hacia tus objetivos de empleabilidad.', 'Ciclos 9 y 10', 'En UTP+Class', 'Según convocatoria', array['Asesoría para elaborar un CV de impacto.', 'Simulaciones de entrevistas laborales.', 'Marca personal en LinkedIn y oportunidades afines.']::text[], array['Ser estudiante de 9.º o 10.º ciclo, de cualquier modalidad.', 'No pertenecer a Generación Top ni a Impulsa.']::text[], 'El acompañamiento del programa se desarrolla a través de UTP+Class.', 'https://empleabilidad.utp.edu.pe/alumnos/egresa-con-potencial', 'school', 5)
on conflict (id) do update set titulo = excluded.titulo, lema = excluded.lema, descripcion = excluded.descripcion,
  ciclos = excluded.ciclos, formato = excluded.formato, frecuencia = excluded.frecuencia,
  beneficios = excluded.beneficios, requisitos = excluded.requisitos, nota = excluded.nota,
  url_oficial = excluded.url_oficial, icono = excluded.icono, orden = excluded.orden;
commit;

-- ════════════════════════════════════════════════════════════════════════════
-- Talleres culturales y deportivos
-- ════════════════════════════════════════════════════════════════════════════

-- Contenido ilustrativo basado en el flujo de MagicPath. No crea inscripciones ni restricciones.
-- Usa un período vigente/futuro ya existente en terms. No modifica sus fechas ni el ciclo académico.
-- Repetible: conserva grupos administrados e inscripciones existentes.
begin;

insert into public.campuses (id, nombre) values ('ate', 'Ate') on conflict (id) do nothing;

insert into public.workshops (id, categoria, titulo, descripcion, terminos, version_terminos, declaracion, orden)
values
  ('ia-prompts', 'cultural', 'REG TALLER DE IA PROMPTS',
   'Explora formas de expresión y creación con inteligencia artificial. Aprende a elaborar y mejorar instrucciones para desarrollar tus ideas.',
   'Cuatro faltas consecutivas en un mismo taller pueden ocasionar la baja de la inscripción y una restricción para talleres culturales y deportivos durante este y el siguiente período académico. Las justificaciones deben presentarse desde la tercera falta. La aplicación de estas medidas corresponde a la gestión académica.',
   'talleres-2026-v1', 'Al inscribirme, declaro que me encuentro en buen estado de salud para participar en el taller.', 1),
  ('teatro', 'cultural', 'TALLER DE TEATRO',
   'Desarrolla tu creatividad, expresión corporal y confianza a través de ejercicios de actuación y trabajo en equipo.',
   'Cuatro faltas consecutivas en un mismo taller pueden ocasionar la baja de la inscripción y una restricción para talleres culturales y deportivos durante este y el siguiente período académico. Las justificaciones deben presentarse desde la tercera falta. La aplicación de estas medidas corresponde a la gestión académica.',
   'talleres-2026-v1', 'Al inscribirme, declaro que me encuentro en buen estado de salud para participar en el taller.', 2),
  ('voley-femenino', 'deportivo', 'REG TALLER VOLEY FEMENINO',
   'Fortalece tus habilidades de vóley, coordinación y trabajo en equipo con prácticas guiadas.',
   'Cuatro faltas consecutivas en un mismo taller pueden ocasionar la baja de la inscripción y una restricción para talleres culturales y deportivos durante este y el siguiente período académico. Las justificaciones deben presentarse desde la tercera falta. La aplicación de estas medidas corresponde a la gestión académica.',
   'talleres-2026-v1', 'Al inscribirme, declaro que me encuentro en buen estado de salud para participar en el taller.', 3),
  ('wushu', 'deportivo', 'MOD TALLER DE WUSHU',
   'Entrena tu coordinación, concentración y disciplina mediante sesiones guiadas de wushu.',
   'Cuatro faltas consecutivas en un mismo taller pueden ocasionar la baja de la inscripción y una restricción para talleres culturales y deportivos durante este y el siguiente período académico. Las justificaciones deben presentarse desde la tercera falta. La aplicación de estas medidas corresponde a la gestión académica.',
   'talleres-2026-v1', 'Al inscribirme, declaro que me encuentro en buen estado de salud para participar en el taller.', 4)
on conflict (id) do nothing;

do $$
declare
  v_term public.terms%rowtype;
  v_today date := (now() at time zone 'America/Lima')::date;
  v_inicio date;
  v_fin date;
  v_cierre timestamptz;
  v_grupos_nuevos text[];
begin
  select * into v_term from public.terms where fin >= v_today
    order by (inicio > v_today), inicio, id limit 1;
  if not found then
    raise notice 'No hay un período vigente o futuro en terms. Se cargaron los talleres; configura un período y vuelve a ejecutar este seed para crear grupos.';
    return;
  end if;
  v_inicio := greatest(v_term.inicio, least(v_today + 7, v_term.fin));
  v_fin := least(v_term.fin, v_inicio + 83);
  v_cierre := least(now() + interval '14 days', ((v_fin + 1)::timestamp at time zone 'America/Lima'));

  with nuevos as (
  insert into public.workshop_groups (id, workshop_id, term_id, campus_id, docente, modalidad, lugar,
    inicio, fin, inscripcion_abre, inscripcion_cierra, capacidad)
  select 'ia-prompts-ate-' || v_term.id, 'ia-prompts', v_term.id, 'ate', 'Garamendi Sarniento, Elliot Leo',
    'presencial', 'Ate B0401', v_inicio, v_fin, now() - interval '1 day', v_cierre, 7
  union all
  select 'teatro-centro-' || v_term.id, 'teatro', v_term.id, c.id, 'Docente por confirmar',
    'presencial', 'Aula de expresión artística', v_inicio, v_fin, now() - interval '1 day', v_cierre, 20
    from public.campuses c where c.id = 'lima-centro'
  union all
  select 'voley-manana-' || v_term.id, 'voley-femenino', v_term.id, c.id, 'Docente por confirmar',
    'presencial', 'Losa deportiva', v_inicio, v_fin, now() - interval '1 day', v_cierre, 18
    from public.campuses c where c.id = 'lima-norte'
  union all
  select 'voley-tarde-' || v_term.id, 'voley-femenino', v_term.id, c.id, 'Docente por confirmar',
    'presencial', 'Losa deportiva', v_inicio, v_fin, now() - interval '1 day', v_cierre, 18
    from public.campuses c where c.id = 'lima-norte'
  union all
  select 'wushu-virtual-' || v_term.id, 'wushu', v_term.id, c.id, 'Docente por confirmar',
    'virtual', 'Aula virtual · acceso indicado por el docente', v_inicio, v_fin, now() - interval '1 day', v_cierre, 25
    from public.campuses c where c.id = 'lima-centro'
  on conflict (id) do nothing
  returning id
  ) select coalesce(array_agg(id), '{}'::text[]) into v_grupos_nuevos from nuevos;

  insert into public.workshop_schedule_slots (grupo_id, dia, inicio, fin)
  select g.id, s.dia, s.inicio::time, s.fin::time from public.workshop_groups g
  join (values
    ('ia-prompts-ate-', 1, '08:00', '09:30'), ('ia-prompts-ate-', 5, '08:00', '09:30'),
    ('teatro-centro-', 2, '15:00', '16:30'), ('teatro-centro-', 4, '15:00', '16:30'),
    ('voley-manana-', 1, '09:00', '10:30'), ('voley-manana-', 3, '09:00', '10:30'),
    ('voley-tarde-', 2, '17:00', '18:30'), ('voley-tarde-', 4, '17:00', '18:30'),
    ('wushu-virtual-', 3, '16:30', '18:00')
  ) as s(prefix, dia, inicio, fin) on g.id = s.prefix || v_term.id
  -- Los horarios existentes se administran fuera del seed: incluso una eliminación deliberada se conserva.
  where g.id = any(v_grupos_nuevos)
  on conflict (grupo_id, dia, inicio, fin) do nothing;
end $$;
commit;


-- ════════════════════════════════════════════════════════════════════════════
-- Reserva de equipos: laptops, computadoras y tablets
-- ════════════════════════════════════════════════════════════════════════════

insert into public.equipment (id, tipo, nombre, descripcion, campus_id, ubicacion, procesador, ram, almacenamiento, sistema, software, orden) values
  ('dell-5420',    'laptop',      'Laptop Dell Latitude 5420',    'Equipo portátil para uso académico dentro del campus.',            'lima-centro', 'Pabellón A · Lab A301',      'Intel Core i5', '16 GB', '512 GB SSD', 'Windows 11', '{Microsoft 365,Visual Studio Code,Navegador}', 1),
  ('lenovo-e14',   'laptop',      'Laptop Lenovo ThinkPad E14',   'Equipo portátil para uso académico dentro del campus.',            'lima-centro', 'Biblioteca · Piso 2',        'Intel Core i5', '16 GB', '512 GB SSD', 'Windows 11', '{Microsoft 365,Visual Studio Code,Navegador}', 2),
  ('hp-probook',   'laptop',      'Laptop HP ProBook 450',        'Equipo portátil para trabajos y exposiciones dentro del campus.',  'lima-centro', 'Pabellón C · Lab C102',      'Intel Core i5', '8 GB',  '256 GB SSD', 'Windows 11', '{Microsoft 365,Navegador}', 3),
  ('hp-elitedesk', 'computadora', 'Computadora HP EliteDesk',     'Computadora de escritorio para uso académico dentro del campus.',  'lima-centro', 'Pabellón B · Lab B205',      'Intel Core i7', '16 GB', '512 GB SSD', 'Windows 11', '{Microsoft 365,Visual Studio Code,Navegador}', 4),
  ('imac-diseno',  'computadora', 'iMac 24" · Estación de diseño', 'Computadora para diseño y prototipado, con las herramientas del curso.', 'lima-centro', 'Pabellón C · Lab de Diseño C-204', 'Apple M3',   '16 GB', '512 GB SSD', 'macOS',      '{Figma,Adobe Creative Cloud,Navegador}', 5),
  ('dell-optiplex','computadora', 'Computadora Dell OptiPlex 7010', 'Computadora de escritorio para laboratorios y prácticas.',        'lima-centro', 'Pabellón B · Lab B207',      'Intel Core i5', '16 GB', '512 GB SSD', 'Windows 11', '{Microsoft 365,Visual Studio Code,Navegador}', 6),
  ('lenovo-v15',   'laptop',      'Laptop Lenovo V15',            'Equipo portátil para uso académico dentro del campus.',            'lima-norte',  'Edificio Principal · Lab N101', 'Intel Core i5', '8 GB',  '256 GB SSD', 'Windows 11', '{Microsoft 365,Navegador}', 7),
  ('hp-prodesk',   'computadora', 'Computadora HP ProDesk',       'Computadora de escritorio para uso académico dentro del campus.',  'lima-norte',  'Edificio Principal · Lab N201', 'Intel Core i5', '16 GB', '512 GB SSD', 'Windows 11', '{Microsoft 365,Visual Studio Code,Navegador}', 8),
  ('ipad-a16',     'tablet',      'iPad (A16) 11"',                'Tablet para lectura, apuntes y prototipos dentro del campus.',     'lima-centro', 'Biblioteca · Mostrador de préstamos', 'Apple A16', '6 GB',  '128 GB', 'iPadOS 18', '{Figma,Microsoft 365,Navegador}', 9),
  ('ipad-pro-13',  'tablet',      'iPad Pro 13" (M4)',             'Tablet de alto rendimiento para diseño y prototipado.',            'lima-centro', 'Pabellón C · Lab de Diseño C-204', 'Apple M4', '8 GB',  '256 GB', 'iPadOS 18', '{Figma,Adobe Creative Cloud,Navegador}', 10),
  ('galaxy-tab-s9','tablet',      'Samsung Galaxy Tab S9 FE',      'Tablet Android con lápiz para apuntes y lectura dentro del campus.', 'lima-centro', 'Biblioteca · Mostrador de préstamos', 'Exynos 1380', '6 GB', '128 GB', 'Android 14', '{Microsoft 365,Figma,Navegador}', 11),
  ('galaxy-tab-a9','tablet',      'Samsung Galaxy Tab A9+',        'Tablet Android para lectura y consulta dentro del campus.',        'lima-norte',  'Edificio Principal · Biblioteca', 'Snapdragon 695', '4 GB', '64 GB', 'Android 14', '{Microsoft 365,Navegador}', 12)
on conflict (id) do update set
  tipo = excluded.tipo, nombre = excluded.nombre, descripcion = excluded.descripcion, campus_id = excluded.campus_id,
  ubicacion = excluded.ubicacion, procesador = excluded.procesador, ram = excluded.ram, almacenamiento = excluded.almacenamiento,
  sistema = excluded.sistema, software = excluded.software, orden = excluded.orden;
