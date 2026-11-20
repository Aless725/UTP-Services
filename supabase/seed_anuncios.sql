-- UTP+ Service · seed de anuncios del campus (0006)
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
