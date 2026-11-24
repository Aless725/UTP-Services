# Backend de UTP+ Service (Supabase)

El backend es un proyecto de **Supabase**: Postgres con RLS, Auth y funciones SQL. El frontend solo usa la llave pública (`anon`/*publishable*); la seguridad la dan las políticas RLS y las funciones del servidor.

## Puesta en marcha

1. Crea un proyecto en [supabase.com](https://supabase.com) y desactiva **Confirm email** en *Authentication → Sign In / Providers → Email* (las cuentas de demostración usan correos ficticios).
2. En el **SQL Editor** ejecuta **dos archivos**, en este orden. Los dos se pueden repetir cuando quieras, sin duplicar datos:

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | `supabase/schema.sql` | **Todo el esquema**: tablas, restricciones, RLS, funciones (reglas de negocio), vistas, disparadores y permisos. Sirve para crear la base desde cero y también para actualizar una que ya tenía versiones anteriores. |
| 2 | `supabase/seed.sql` | **Datos de demostración**: reglas, sedes, espacios, las 3 cuentas demo, grupos, el ciclo 2026-2 con sus 5 cursos y su contenido, notas y entregas, anuncios, notificaciones, trámites, empleabilidad y talleres. |

El ciclo de demostración dura del lunes 17 de agosto al **viernes 18 de diciembre de 2026** (18 semanas). La semana actual, las tareas, las evaluaciones, las actividades y las notificaciones salen de la fecha de hoy; si pasa mucho tiempo, vuelve a ejecutar `seed.sql` para renovar las fechas. Los cursos son Gestión del Servicio TI, Interacción Hombre Máquina, Desarrollo Web Integrado, Curso Integrador II y **Herramientas de Prototipado** (con Figma).

3. Copia `.env.example` a `.env` con la URL del proyecto y la llave pública:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Vite lee el `.env` al arrancar: reinicia `npm run dev` si lo cambias. Nunca uses la llave `service_role` en el frontend ni la subas al repositorio.

Los archivos del repositorio no se aplican solos a la base remota: hay que ejecutarlos en el SQL Editor de tu proyecto de Supabase.

## Cuentas de demostración

El alumno escribe solo su código; la app arma el correo interno `<codigo en minúsculas>@utp.edu.pe`.

| Código | Nombre | Contraseña |
|---|---|---|
| `U22265137` | Isabel | `Utp2026!` |
| `U22209574` | Mateo | `Utp2026!` |
| `U22693560` | Rocío | `Utp2026!` |

## Modelo de datos

**Alumnos y catálogos**

| Tabla | Para qué sirve |
|---|---|
| `profiles` | Perfil del alumno (código, nombre, DNI, carrera, plan, sede). Se enlaza con `auth.users`. |
| `students` | Directorio de alumnos para agregar integrantes por código. |
| `campuses`, `spaces` | Sedes y espacios reservables (salas, PCs y cubículos). |
| `settings` | Reglas de negocio parametrizables (mínimo de integrantes, horas, penalidad…). |
| `terms`, `courses`, `enrollments` | Ciclo académico, catálogo de cursos y qué alumno lleva cada curso. |
| `progress_stats` | Avance de malla curricular por alumno. |

**Reservas y grupos**

| Tabla | Para qué sirve |
|---|---|
| `reservations`, `reservation_members` | Reservas y sus integrantes. Una restricción de exclusión (`btree_gist`) impide dobles reservas. |
| `penalties` | Penalidades por cancelar con menos de 1 hora de anticipación. |
| `groups`, `group_members` | Grupos de estudio y sus integrantes. |

**Anuncios del campus**

| Tabla | Para qué sirve |
|---|---|
| `campus_announcements` | Campañas, eventos y actividades (salud, cultura, académico, deporte, empleabilidad) con fecha, lugar y cupos opcionales. |
| `announcement_rsvps` | Quién confirmó asistencia. Cada alumno solo ve la suya. |
| `campus_announcements_view` | Vista con el total de asistentes y si el alumno ya confirmó, sin exponer nombres. |

**Trámites**

| Tabla | Para qué sirve |
|---|---|
| `procedure_types` | Catálogo de 26 trámites en dos categorías (autogestionables y SAE en línea), con costo, plazo, modalidad y los **campos de su formulario** (`campos`, en JSON). La pantalla de solicitud se arma sola a partir de ellos. |
| `procedures` | Solicitudes de cada alumno (código `SOL-AAAA-NNNN`, estado y datos enviados). Solo se crean y cancelan con funciones. |
| `procedure_events` | Historial de cada solicitud (recibida, en revisión, aprobada…). |

**Notificaciones**

| Tabla | Para qué sirve |
|---|---|
| `notifications` | Avisos de cada alumno (reserva, tarea, nota, anuncio, grupo, sistema) con la pantalla a la que llevan y si ya se leyeron. El alumno solo puede marcarlas como leídas; el contenido lo escribe el servidor. |

Se crean solas con disparadores cuando el alumno confirma o cancela una reserva, otra persona lo agrega a una reserva, confirma su asistencia a una actividad, se une a un grupo, postula a una oferta o se inscribe en un taller. `seed.sql` agrega avisos de ejemplo y conserva cuáles ya fueron leídas al volver a ejecutarse.

**Empleabilidad**

| Tabla | Para qué sirve |
|---|---|
| `employment_programs` | Programas con detalle, lema, descripción, ciclos, formato, frecuencia, beneficios, requisitos, nota y enlace oficial. Solo se consultan los activos. |
| `job_offers` | Ofertas, carreras, funciones, requisitos, beneficios, fechas y estado (`publicada`, `cerrada`, `archivada`). RLS solo muestra ofertas publicadas y vigentes. |
| `job_applications` | Postulaciones privadas a ofertas y programas, con código `POS-AAAA-NNNNNN`, contacto, estado y copia del nombre y entidad al enviar. Cada registro tiene exactamente uno de `oferta_id` o `programa_id`, con unicidad por alumno y destino. Los programas añaden código de alumno, campus, ciclo y aceptación de requisitos. |

Se escribe exclusivamente mediante `postular_oferta` o `postular_programa`; el cliente no puede insertar, editar estados ni borrar registros. El nombre y correo son datos de contacto y no modifican `profiles`. Ambas funciones obtienen la identidad de `auth.uid()`, validan contacto y disponibilidad, bloquean el destino y devuelven el mismo registro si se reintenta un envío ya aceptado. El registro y su notificación se crean en una transacción. Los campos `puesto_snapshot` y `empresa_snapshot` conservan el puesto y empresa para ofertas, o el título del programa y «Programa de empleabilidad · UTP» para programas, aunque el destino cierre o cambie. Un destino con postulaciones no puede eliminarse: se cierra, archiva o desactiva.

`postular_programa` exige correo `@utp.edu.pe`, campus de 2 a 120 caracteres, ciclo entero del 1 al 12 y aceptación explícita. El código de alumno lo obtiene de `profiles`; no acepta un código ni un propietario suministrado por el cliente. La pertenencia al tercio, promedios, idiomas y admisión son requisitos sujetos a revisión posterior; no se inventa una validación académica con datos que no existen. El estado inicial compartido `enviada` se muestra como «Pendiente de revisión» para programas. Se conservan las políticas RLS y notificaciones de las ofertas.

Los estados son `enviada`, `en_revision`, `seleccionada` y `no_seleccionada`. Los cambios administrativos de estado actualizan la fecha y generan un aviso con enlace al registro. Se realizan desde el SQL Editor con privilegios administrativos; no hay panel de empleadores ni envío de correos o solicitudes a empresas reales.

En el frontend, los hooks se concentran en `src/features/empleabilidad/empleabilidadData.ts`. El catálogo se recupera en páginas de 100 filas con orden estable y se filtra localmente por texto (sin distinguir tildes), tipo y ciudad. La URL conserva la búsqueda entre listado, detalle y formulario, incluidos los dos paneles y los enlaces directos. Las consultas personales incluyen el código del alumno en su clave; la caché existente se limpia al cerrar sesión y permite leer los datos consultados sin conexión. El envío requiere internet y no tiene reintentos automáticos.

**Reserva de equipos**

| Tabla | Para qué sirve |
|---|---|
| `equipment` | Catálogo de laptops, computadoras y tablets (`laptop`, `computadora` o `tablet`): tipo, sede, ubicación, especificaciones y programas instalados. Solo lectura para el alumno. |
| `equipment_reservations` | Reservas con código `EQ-AAAA-NNNN`, equipo, horario y estado (`confirmada` o `cancelada`). Una restricción de exclusión (`btree_gist`) impide dos reservas que se crucen en el mismo equipo. Solo se crean y cancelan con funciones. |

`reservar_equipo(equipo, fecha, inicio, fin)` valida en el servidor: sesión, equipo activo, penalidad vigente, horario válido, máximo 4 horas, hasta 30 días por adelantado, solo de lunes a viernes de 08:00 a 20:00, que no haya pasado, una reserva activa por alumno y conflictos (`hint`: `auth`, `unavailable`, `penalty`, `invalid`, `duration`, `closed`, `past`, `active_exists`, `conflict`). `cancelar_reserva_equipo(codigo)` devuelve `true` si fue sin penalidad; con menos de 1 hora de anticipación registra la misma penalidad de 7 días de las reservas de espacios. `equipos_ocupacion(desde, hasta)` devuelve solo las franjas ocupadas, sin datos de quién reservó, y `mis_reservas_equipos()` las reservas del alumno con hora de Lima. Un disparador avisa en el centro de notificaciones.

**Talleres**

| Tabla | Para qué sirve |
|---|---|
| `workshops` | Catálogo cultural y deportivo, descripción, términos versionados y declaración que acepta el alumno. |
| `workshop_groups` | Grupos ofertados por taller y período (`terms`), con sede (`campuses`), docente, modalidad, lugar, fechas, capacidad, ventana de inscripción y estado. |
| `workshop_schedule_slots` | Horarios semanales por grupo; días ISO del 1 al 7 y horas de inicio y fin. |
| `workshop_enrollments` | Inscripciones privadas con código, grupo, estado (`inscrita` o `baja`), aceptaciones, versión de términos, fechas y un `snapshot` del taller, grupo y horario aceptados. |
| `workshop_restrictions` | Restricciones administrativas de un alumno para un período académico; se comprueban al inscribirse. |

`listar_talleres()` devuelve un catálogo JSON con los grupos y sus horarios, incluyendo capacidad y vacantes agregadas. La disponibilidad se calcula con las inscripciones que ocupan cupo; la respuesta no incluye la identidad de otros inscritos. Los catálogos publicados son de lectura para usuarios autenticados; las inscripciones y restricciones solo las consulta su dueño mediante RLS. El cliente no puede escribir directamente sobre esas tablas ni administrar bajas, cupos o restricciones.

`inscribir_taller(grupo_id, version_terminos, acepta_terminos, acepta_declaracion)` obtiene la identidad de `auth.uid()` y valida la versión de términos, ambas aceptaciones, la ventana de inscripción y las restricciones del período. La función bloquea el grupo con `FOR UPDATE`, verifica el cupo e inserta inscripción y notificación en la misma transacción. La unicidad por alumno y grupo evita duplicados y los reintentos devuelven la inscripción activa ya aceptada, incluso después del cierre o de agotarse las vacantes. Una inscripción dada de baja no se trata como un comprobante activo. El `snapshot` mantiene legible el comprobante aunque el catálogo cambie o el taller se archive. La confirmación y los avisos son internos: no hay envío de correo electrónico.

Las restricciones y bajas se administran con privilegios de backend. La regla de inasistencias indicada en los términos requiere registros administrativos verificables de sesiones, faltas y justificaciones; esta versión no genera sanciones automáticas por el paso del tiempo. Las restricciones que ya estén registradas sí se aplican durante la inscripción y se refieren a períodos de `terms`, sin asumir una duración fija en días.

En `src/features/talleres/`, los catálogos y detalles comparten hooks de TanStack Query y la lista personal usa claves asociadas a la cuenta. La URL conserva búsqueda, filtros y grupo seleccionado al abrir detalles en uno o dos paneles. Tras el envío se actualizan el comprobante, **Mis talleres**, la disponibilidad y las notificaciones. La caché existente permite consultar datos guardados sin conexión y se limpia al salir de la cuenta; las inscripciones requieren conexión y no se reenvían automáticamente. Una sesión expirada permite renovar el acceso y volver a un destino interno validado, donde el alumno confirma nuevamente.

Para validar cambios del servidor se pueden ejecutar comprobaciones SQL temporales en una transacción terminada con `ROLLBACK`: privacidad entre dos alumnos, aceptación y versión de términos, restricciones, inscripción fuera de plazo, último cupo, reintentos, conservación del comprobante y notificaciones. La concurrencia del último cupo se verifica con dos sesiones y transacciones independientes. Estas comprobaciones no requieren conservar archivos de pruebas SQL en el repositorio.

**Asistente**

| Tabla | Para qué sirve |
|---|---|
| `agent_logs` | Mensaje, respuesta, herramientas usadas, latencia y errores de cada consulta al asistente. Sirve de evidencia y para limitar el uso por alumno. |

**Contenido de los cursos**

| Tabla | Para qué sirve |
|---|---|
| `course_details` | Sílabo, bibliografía, temas y datos de Zoom por curso. |
| `course_materials`, `course_evaluations`, `course_tasks` | Materiales por semana, evaluaciones con peso y tareas. |
| `course_threads`, `forum_posts` | Foros y sus comentarios con respuestas anidadas, compartidos entre alumnos. |
| `announcements` | Anuncios del docente. Sus fechas son relativas para que la demo siempre esté vigente. |
| `material_progress`, `task_submissions`, `evaluation_grades`, `announcement_reads` | Estado de cada alumno: materiales vistos, entregas, notas y anuncios leídos. |

## Seguridad (RLS)

- **RLS está activo en todas las tablas**, y el rol `anon` no tiene acceso a nada.
- Los **catálogos** (espacios, cursos, contenido, foros) son de solo lectura para usuarios autenticados.
- Los datos **del alumno** (perfil, reservas, penalidades, matrícula, notas, entregas) solo los ve su dueño. El perfil es de solo lectura: son datos institucionales y ni siquiera el propio alumno puede modificarlos desde la app.
- Las **reservas** no se insertan ni se modifican directamente: pasan por funciones que validan las reglas en el servidor.
- Un alumno no puede escribirse su propia nota: la política de `task_submissions` exige `nota is null` al entregar.
- Quien comenta en un foro no elige el autor: lo fija la función `publicar_comentario` desde el directorio de alumnos.

## Funciones (RPC)

| Función | Qué hace |
|---|---|
| `crear_reserva(...)` | Valida penalidad, ventana de 14 días, horario, una reserva activa por tipo, integrantes y conflictos. Devuelve el código `RES-AAAA-NNNN`. |
| `cancelar_reserva(id)` | Cancela; si faltan menos de 60 min aplica 7 días de penalidad. Devuelve si fue sin penalidad. |
| `mis_reservas()` | Reservas del alumno (como organizador o integrante) con fecha y hora de Lima. |
| `ocupacion(fecha)` y `ocupacion_rango(desde, hasta)` | Franjas ocupadas por cualquiera, sin datos personales. |
| `unirse_grupo(id)` | Une al alumno validando los cupos. |
| `publicar_comentario(foro, texto, respuesta_a)` | Publica un comentario o respuesta (2 a 1000 caracteres). |
| `solicitar_tramite(tipo, datos)` | Valida cada campo del trámite (obligatorios, opciones permitidas, que el curso esté en tu matrícula, largos) y que no tengas ya una solicitud igual en revisión. Crea la solicitud, su primer evento y un aviso. |
| `cancelar_tramite(codigo)` | Cancela una solicitud propia que siga en revisión. |
| `postular_oferta(oferta_id, nombre_contacto, correo_contacto)` | Valida sesión, oferta y contacto; registra una postulación privada con aviso. Devuelve el registro anterior si ya se había enviado. |
| `postular_programa(programa_id, nombre_contacto, correo_contacto, campus, ciclo, acepta_requisitos)` | Valida sesión, programa activo, contacto institucional y campos; obtiene el código desde el perfil y registra la postulación en el mismo historial con aviso, sin duplicados. |
| `reservar_equipo(equipo, fecha, inicio, fin)` | Reserva una laptop, computadora o tablet validando horario, duración, penalidad, reserva activa y conflictos. |
| `cancelar_reserva_equipo(codigo)` | Cancela una reserva propia; devuelve si fue sin penalidad. |
| `equipos_ocupacion(desde, hasta)` · `mis_reservas_equipos()` | Franjas ocupadas (sin datos personales) y reservas del alumno. |
| `listar_talleres()` | Devuelve talleres y grupos publicados con horarios y vacantes agregadas, sin exponer quién está inscrito. |
| `inscribir_taller(grupo_id, version_terminos, acepta_terminos, acepta_declaracion)` | Valida sesión, grupo, plazo, restricciones, términos y cupo. Registra inscripción y aviso en una transacción; recupera la inscripción activa si se reintenta. |
| `asistir_anuncio(id, asistir)` | Confirma o cancela la asistencia a una actividad validando que no haya terminado y que queden cupos. |

Los errores de regla se devuelven con `errcode = 'P0001'` y un `hint` (`penalty`, `conflict`, `members`, `full`…) que la app traduce a mensajes claros.

## Asistente UTP+ (función `agent`)

El asistente de **Soporte** usa Gemini desde una función de Supabase (`supabase/functions/agent/`). El modelo solo **lee** datos y **propone** acciones: la app muestra una tarjeta con *Confirmar / Cambiar* y, al confirmar, llama a las mismas funciones validadas de siempre (`crear_reserva`, `cancelar_reserva`, `unirse_grupo`, `asistir_anuncio`). El modelo nunca escribe en la base.

**Dónde va la llave de Gemini:** como *secreto* de la función, nunca en `.env` ni en el repositorio.

1. Crea la llave en [Google AI Studio](https://aistudio.google.com).
2. En Supabase: *Edge Functions → Secrets* y agrega `GEMINI_API_KEY`. Opcional: `GEMINI_MODEL` (por defecto `gemini-3.5-flash-lite`, el más barato y con más cupo gratuito: 15 solicitudes por minuto y 500 por día). Si lo defines, cámbialo o bórralo cuando quieras volver al valor por defecto.
3. Asegúrate de haber ejecutado `schema.sql` (incluye la tabla `agent_logs` del registro de conversaciones).
4. Despliega la función (necesitas un token personal de *Account → Access Tokens*):

```bash
npx supabase login
npx supabase functions deploy agent --project-ref <ref-del-proyecto> --use-api
```

| Herramienta | Tipo | Qué hace |
|---|---|---|
| `buscar_espacios` | Lectura | Espacios con horarios libres para una fecha, aplicando las reglas (sábados, ventana de 14 días, horas pasadas). |
| `mis_reservas` | Lectura | Reservas próximas del alumno. |
| `listar_anuncios`, `buscar_grupos` | Lectura | Actividades del campus y grupos de estudio con cupos. |
| `mis_cursos`, `mis_notas`, `tareas_pendientes`, `proximas_evaluaciones` | Lectura | Vida de estudiante: cursos del ciclo, notas con lo que falta para aprobar (11), tareas sin entregar por vencimiento y próximas evaluaciones. |
| `proponer_reserva`, `proponer_cancelacion`, `proponer_asistencia`, `proponer_unirse_grupo` | Propuesta | Validan y devuelven una acción para que el alumno la confirme; no ejecutan nada. |

**Voz:** el navegador graba con el micrófono (hasta 30 s) y convierte el audio a WAV mono de 16 kHz. La función lo transcribe con el mismo modelo, muestra al alumno lo que entendió y sigue el flujo normal. La respuesta se lee en voz alta con la síntesis de voz del navegador (se puede silenciar). El micrófono exige HTTPS o localhost. Cada mensaje cuenta como 2 solicitudes al modelo (3 si es de voz) para el cupo gratuito.

**Seguridad:** las consultas usan el JWT del alumno (nunca `service_role`), así RLS limita lo que el modelo ve. La función valida el tamaño de la entrada, limita a 12 consultas por minuto por alumno, corta el razonamiento a 6 pasos y registra cada consulta en `agent_logs`.

## Reglas de negocio vigentes

Se leen de la tabla `settings` y se aplican en el servidor: mínimo 3 integrantes en salas, máximo 2 horas por reserva, horario de 08:00 a 20:00, ventana de 14 días, una reserva activa por tipo de espacio, salas cerradas los sábados, cancelación gratuita hasta 1 hora antes y 7 días de penalidad si no.

## Qué sigue local o simulado

- La **foto de perfil** se guarda en el dispositivo (pendiente: Supabase Storage).
- El **calendario** y los **pagos** siguen con datos locales.
- La **recuperación de contraseña** es simulada: los correos de demostración no existen.
- Que un foro esté cerrado se valida en la pantalla, no en el servidor.
- Las fechas de los anuncios del campus se renuevan al volver a ejecutar `seed.sql`.
- La ocupación "de otros alumnos" que se ve en los horarios es ruido determinista de la demo; el servidor solo bloquea conflictos reales.
