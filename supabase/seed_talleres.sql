-- UTP+ Service · catálogo inicial de Talleres (0013)
-- Ejecutar después de 0013_talleres.sql y seed.sql.
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
