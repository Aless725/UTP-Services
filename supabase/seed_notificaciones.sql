-- UTP+ Service · seed de notificaciones de ejemplo (0008)
-- Se puede repetir: renueva el contenido y los tiempos y conserva cuáles ya fueron leídas.
-- Ejecutar después de 0008_notificaciones.sql y de seed.sql.

insert into public.notifications (user_id, tipo, titulo, cuerpo, ruta, clave, created_at)
select p.id, v.tipo, v.titulo, v.cuerpo, v.ruta, v.clave, now() - v.hace
from public.profiles p
cross join (values
  ('tarea',   'Tarea por vencer',          'Actividad 7 de Interacción Hombre Máquina vence este domingo.',              '/cursos/ihm',      'demo-tarea',   interval '35 minutes'),
  ('nota',    'Nota publicada',            'Ya puedes ver tu nota de la Práctica calificada 1 en Interacción Hombre Máquina.', '/cursos/ihm',      'demo-nota',    interval '3 hours'),
  ('anuncio', 'Nueva actividad en el campus', 'Hackatón de Lectura en la Biblioteca. Quedan pocos cupos.',               '/anuncios/hackaton-lectura', 'demo-anuncio', interval '1 day 2 hours'),
  ('sistema', 'Recordatorio de pago',      'Tu cuota de diciembre vence en 7 días.',                                      '/pagos',           'demo-pago',    interval '2 days'),
  ('sistema', 'Bienvenido a UTP+ Service', 'Aquí verás avisos de tus reservas, tareas, notas y actividades del campus.', '/inicio',          'demo-bienvenida', interval '4 days')
) as v(tipo, titulo, cuerpo, ruta, clave, hace)
on conflict (user_id, clave) where clave is not null do update set
  tipo = excluded.tipo, titulo = excluded.titulo, cuerpo = excluded.cuerpo, ruta = excluded.ruta, created_at = excluded.created_at;
