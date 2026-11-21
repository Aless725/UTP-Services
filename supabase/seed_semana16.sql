-- UTP+ Service · datos de ejemplo para la semana 16 de 18
-- Pone el ciclo en la semana 16 y completa lo que ya habría pasado hasta entonces: notas publicadas,
-- tareas entregadas y comentarios en los foros recientes. Se puede repetir sin duplicar datos.
-- Ejecutar después de seed.sql y seed_contenido.sql.

update public.terms set semana_actual = 16 where id = '2026-2';

-- Notas: toda evaluación anterior a la semana 16 queda calificada (11 a 18, estable por alumno y evaluación).
insert into public.evaluation_grades (user_id, course_id, evaluation_id, nota)
select p.id, e.course_id, e.id, 11 + (abs(hashtext(p.id::text || e.id)) % 8)
from public.profiles p
join public.enrollments en on en.user_id = p.id and en.term_id = '2026-2'
join public.course_evaluations e on e.course_id = en.course_id
where e.semana < 16
on conflict (user_id, evaluation_id) do nothing;

-- Tareas: se entregaron todas hasta la semana 14. La de la semana 15 queda pendiente (una por curso).
insert into public.task_submissions (user_id, course_id, task_id, archivo, nota, entregada_en)
select p.id, t.course_id, t.id, 'Entrega_' || t.semana || '.pdf', 12 + (abs(hashtext(p.id::text || t.id)) % 7),
       now() - make_interval(days => (16 - t.semana) * 7 - 2)
from public.profiles p
join public.enrollments en on en.user_id = p.id and en.term_id = '2026-2'
join public.course_tasks t on t.course_id = en.course_id
where t.semana <= 14
on conflict (user_id, task_id) do nothing;

-- Foros de las semanas 14 a 16: un comentario de un compañero y la respuesta del docente.
insert into public.forum_posts (id, thread_id, autor, rol, texto, cuando_demo, parent_id, orden)
select c.id || '-f' || w.n || '-c0', c.id || '-f' || w.n,
       (array['Diego Fernández', 'Valeria Quispe', 'Andrés Huamán', 'Camila Rojas'])[1 + (abs(hashtext(c.id || w.n)) % 4)],
       'Estudiante', w.texto, w.cuando, null, 0
from public.courses c
cross join (values
  (14, 'Profesor, ¿la práctica incluye lo visto en la última sesión o solo las lecturas?', 'Hace 6 días'),
  (15, 'Tengo una duda sobre cómo se calificará la entrega de esta semana.', 'Hace 2 días'),
  (16, 'Coincido con lo que comentan, sería bueno repasarlo antes del examen final.', 'Hoy')
) as w(n, texto, cuando)
on conflict (id) do nothing;

insert into public.forum_posts (id, thread_id, autor, rol, texto, cuando_demo, parent_id, orden)
select c.id || '-f' || w.n || '-c0r', c.id || '-f' || w.n, c.docente, 'Docente', w.respuesta, w.cuando,
       c.id || '-f' || w.n || '-c0', 1
from public.courses c
cross join (values
  (14, 'Incluye ambas cosas. Revisa la diapositiva 10 y el ejemplo del video; lo retomamos en clase.', 'Hace 5 días'),
  (15, 'Se calificará con la rúbrica publicada en el sílabo. Cualquier duda, escríbeme.', 'Hace 1 día'),
  (16, 'Buena idea. Lo repasamos en la asesoría de esta semana.', 'Hoy')
) as w(n, respuesta, cuando)
on conflict (id) do nothing;

-- El anuncio más reciente ahora recuerda el trabajo final de la semana, no la práctica de la semana 13.
update public.announcements a
set titulo = 'Recordatorio: ' || d.proyecto,
    texto  = 'Esta semana se entrega el trabajo final del curso (' || lower(d.proyecto) || '). Revisen la rúbrica del sílabo y consulten sus dudas en el foro de la semana.'
from public.course_details d
where d.course_id = a.course_id and a.id = a.course_id || '-a5';
