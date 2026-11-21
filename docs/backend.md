# Backend de UTP+ Service (Supabase)

El backend es un proyecto de **Supabase**: Postgres con RLS, Auth y funciones SQL. El frontend solo usa la llave pública (`anon`/*publishable*); la seguridad la dan las políticas RLS y las funciones del servidor.

## Puesta en marcha

1. Crea un proyecto en [supabase.com](https://supabase.com) y desactiva **Confirm email** en *Authentication → Sign In / Providers → Email* (las cuentas de demostración usan correos ficticios).
2. En el **SQL Editor** ejecuta los archivos en este orden. Todos se pueden repetir sin duplicar datos:

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | `supabase/migrations/0001_esquema.sql` | Tablas base, restricción contra dobles reservas y RLS |
| 2 | `supabase/migrations/0002_funciones.sql` | Reglas de reserva y de grupos como funciones |
| 3 | `supabase/migrations/0003_lecturas.sql` | Lecturas que usa la app (mis reservas, ocupación, vista de grupos) |
| 4 | `supabase/migrations/0004_cursos.sql` | Ciclo, cursos, matrícula y avance de malla |
| 5 | `supabase/migrations/0005_contenido_cursos.sql` | Contenido de los cursos y estado del alumno |
| 6 | `supabase/migrations/0006_anuncios_campus.sql` | Anuncios del campus y asistencia a las actividades |
| 7 | `supabase/migrations/0007_agent_logs.sql` | Registro de conversaciones del asistente |
| 8 | `supabase/migrations/0008_notificaciones.sql` | Centro de notificaciones y avisos automáticos |
| 9 | `supabase/seed.sql` | Sedes, espacios, grupos, cuentas demo, cursos, matrícula y avance |
| 10 | `supabase/seed_contenido.sql` | Materiales, evaluaciones, tareas, foros, anuncios de curso, notas y entregas |
| 11 | `supabase/seed_anuncios.sql` | Campañas y actividades del campus, con fechas relativas a hoy |
| 12 | `supabase/seed_notificaciones.sql` | Notificaciones de ejemplo, con horas relativas a ahora |

3. Copia `.env.example` a `.env` con la URL del proyecto y la llave pública:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Vite lee el `.env` al arrancar: reinicia `npm run dev` si lo cambias. Nunca uses la llave `service_role` en el frontend ni la subas al repositorio.

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

**Notificaciones**

| Tabla | Para qué sirve |
|---|---|
| `notifications` | Avisos de cada alumno (reserva, tarea, nota, anuncio, grupo, sistema) con la pantalla a la que llevan y si ya se leyeron. El alumno solo puede marcarlas como leídas; el contenido lo escribe el servidor. |

Se crean solas con disparadores cuando el alumno confirma o cancela una reserva, otra persona lo agrega a una reserva, confirma su asistencia a una actividad o se une a un grupo. `seed_notificaciones.sql` agrega avisos de ejemplo y conserva cuáles ya fueron leídas al volver a ejecutarse.

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
- Los datos **del alumno** (perfil, reservas, penalidades, matrícula, notas, entregas) solo los ve su dueño. Del perfil solo se puede editar nombre y DNI.
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
| `asistir_anuncio(id, asistir)` | Confirma o cancela la asistencia a una actividad validando que no haya terminado y que queden cupos. |

Los errores de regla se devuelven con `errcode = 'P0001'` y un `hint` (`penalty`, `conflict`, `members`, `full`…) que la app traduce a mensajes claros.

## Asistente UTP+ (función `agent`)

El asistente de **Soporte** usa Gemini desde una función de Supabase (`supabase/functions/agent/`). El modelo solo **lee** datos y **propone** acciones: la app muestra una tarjeta con *Confirmar / Cambiar* y, al confirmar, llama a las mismas funciones validadas de siempre (`crear_reserva`, `cancelar_reserva`, `unirse_grupo`, `asistir_anuncio`). El modelo nunca escribe en la base.

**Dónde va la llave de Gemini:** como *secreto* de la función, nunca en `.env` ni en el repositorio.

1. Crea la llave en [Google AI Studio](https://aistudio.google.com).
2. En Supabase: *Edge Functions → Secrets* y agrega `GEMINI_API_KEY`. Opcional: `GEMINI_MODEL` (por defecto `gemini-3.5-flash-lite`, el más barato y con más cupo gratuito: 15 solicitudes por minuto y 500 por día). Si lo defines, cámbialo o bórralo cuando quieras volver al valor por defecto.
3. Ejecuta `0007_agent_logs.sql` en el SQL Editor.
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
- Las fechas de los anuncios del campus se renuevan al volver a ejecutar `seed_anuncios.sql`.
- La ocupación "de otros alumnos" que se ve en los horarios es ruido determinista de la demo; el servidor solo bloquea conflictos reales.
