-- UTP+ Service · seed de trámites y solicitudes de ejemplo (0010)
-- Los costos y plazos son ilustrativos, no tarifas ni políticas oficiales de la UTP.
-- Se puede repetir: actualiza el catálogo y no duplica las solicitudes de ejemplo.
-- Ejecutar después de 0010_tramites.sql y de seed.sql.

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
