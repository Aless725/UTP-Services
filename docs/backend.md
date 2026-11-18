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
| 6 | `supabase/seed.sql` | Sedes, espacios, grupos, cuentas demo, cursos, matrícula y avance |
| 7 | `supabase/seed_contenido.sql` | Materiales, evaluaciones, tareas, foros, anuncios, notas y entregas |

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

Los errores de regla se devuelven con `errcode = 'P0001'` y un `hint` (`penalty`, `conflict`, `members`, `full`…) que la app traduce a mensajes claros.

## Reglas de negocio vigentes

Se leen de la tabla `settings` y se aplican en el servidor: mínimo 3 integrantes en salas, máximo 2 horas por reserva, horario de 08:00 a 20:00, ventana de 14 días, una reserva activa por tipo de espacio, salas cerradas los sábados, cancelación gratuita hasta 1 hora antes y 7 días de penalidad si no.

## Qué sigue local o simulado

- La **foto de perfil** se guarda en el dispositivo (pendiente: Supabase Storage).
- El **calendario** y los **pagos** siguen con datos locales.
- La **recuperación de contraseña** es simulada: los correos de demostración no existen.
- Que un foro esté cerrado se valida en la pantalla, no en el servidor.
- La ocupación "de otros alumnos" que se ve en los horarios es ruido determinista de la demo; el servidor solo bloquea conflictos reales.
