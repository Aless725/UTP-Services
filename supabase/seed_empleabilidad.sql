-- Ejecutar después de 0011_empleabilidad.sql. Contenido ilustrativo, sin envíos a empresas reales.
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
