# UTP+ Service

MVP de una aplicación móvil de servicios universitarios para alumnos de la UTP, desarrollado para el proyecto final del curso de **Interacción Hombre-Máquina (IHM)**.

Reúne en un solo lugar la agenda, los cursos, los pagos y otros servicios del menú **Más de UTP+**, con un estilo minimalista inspirado en iOS y pensado primero para iPhone.

> Todos los datos y cuentas son de demostración. No se integran credenciales ni información real de la UTP.

## Problema y propuesta

Los servicios universitarios están repartidos en varios portales, con flujos largos y poco usables en el celular. **UTP+ Service** los concentra en una sola app, con accesibilidad como parte del diseño y una interfaz que se adapta desde un celular hasta equipos plegables y de doble pantalla.

- **Público:** alumnos de pregrado de la UTP.
- **Modalidades de interacción:** interfaz móvil (iPhone) e **interfaz por voz** con un asistente de IA que consulta datos reales y propone acciones que el alumno confirma.

## Estado del proyecto

| Área | Estado |
|---|---|
| Onboarding e inicio de sesión (con recuperación de contraseña simulada) | Listo |
| Pantallas principales: Inicio, Calendario, Cursos, Pagos y menú *Más de UTP+* | Listo |
| Mi Perfil (datos institucionales de solo lectura) y Accesibilidad (texto, daltonismo, contraste, movimiento, modo oscuro) | Listo |
| Cursos: lista, resumen, notas con calculadora, tareas, contenido, foros, anuncios, Zoom y sílabo | Listo |
| Grupos de estudio (explorar, crear, unirse, mis grupos) | Listo |
| Reserva de espacios (salas, PCs y cubículos, con QR y reglas de negocio en el servidor) | Listo |
| Anuncios del campus (campañas y actividades, con confirmación de asistencia) | Listo |
| Notificaciones (campanita con insignia y avisos automáticos) y pantalla de correo | Listo |
| Trámites: 26 trámites autogestionables y SAE, solicitud, seguimiento y cancelación | Listo |
| Asistente de Soporte con IA por **texto y voz** (Gemini): consulta espacios, cursos, notas y tareas, y propone reservas, grupos y asistencias con confirmación | Listo |
| Backend en Supabase con RLS y reglas en el servidor | Listo |
| App instalable en la pantalla de inicio (manifiesto e íconos) y diseño adaptable (celular vertical y horizontal, tableta, plegable y doble pantalla) | Listo |
| Biblioteca | Pendiente |
| Modo sin conexión (abre sin internet y muestra los últimos datos guardados) | Listo |
| Actualización automática de la PWA (aviso de nueva versión) | Pendiente |

La autenticación, el perfil, los grupos, las reservas, los cursos (incluido su contenido y el avance de cada alumno), los anuncios, las notificaciones y los trámites usan **Supabase** (Auth + Postgres con RLS). Siguen locales el calendario, los pagos y la foto de perfil, y la recuperación de contraseña es simulada porque los correos de demostración no existen. El detalle está en [`docs/backend.md`](docs/backend.md).

## Tecnologías

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con tokens de diseño en variables CSS (temas, daltonismo y alto contraste)
- **React Router** y **TanStack Query**
- **Supabase** (Auth, Postgres con RLS, funciones SQL y una Edge Function) con `@supabase/supabase-js`
- **Gemini** (Google AI Studio) para el asistente, llamado solo desde la Edge Function
- **Vercel** para el despliegue
- **Google Material Symbols** (íconos) y tipografía **Inter**
- **qrcode** para generar los códigos QR de las reservas

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que muestre Vite (normalmente `http://localhost:5173`).

Otros comandos:

```bash
npm run build       # compila para producción
npm run preview     # sirve la compilación
npm run typecheck   # revisa los tipos de TypeScript
```

> Si cambias `tailwind.config.ts`, reinicia `npm run dev`: Tailwind solo lee esa configuración al arrancar.

### Backend (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com) y desactiva **Confirm email** en *Authentication → Sign In / Providers → Email*.
2. En el **SQL Editor** ejecuta, en orden: las migraciones `0001` a `0010` de `supabase/migrations/`, luego los seeds `seed.sql`, `seed_contenido.sql`, `seed_anuncios.sql`, `seed_notificaciones.sql`, `seed_semana16.sql` y `seed_tramites.sql` (espacios, grupos, cursos, contenido, anuncios, notificaciones, trámites y las 3 cuentas de demostración). La guía completa está en [`docs/backend.md`](docs/backend.md).
3. Para el asistente, crea una llave en [Google AI Studio](https://aistudio.google.com), cárgala como secreto `GEMINI_API_KEY` (*Edge Functions → Secrets*) y despliega la función: `npx supabase functions deploy agent --project-ref <ref-del-proyecto> --use-api`. La llave nunca va en el frontend ni en el repositorio.
4. Copia `.env.example` a `.env` y completa la URL del proyecto y la llave pública (*publishable* o *anon*):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca subas el archivo `.env` ni uses la llave `service_role` en el frontend.

## Cuentas de demostración

| Usuario | Nombre | Contraseña |
|---|---|---|
| `U22265137` | Isabel | `Utp2026!` |
| `U22209574` | Mateo | `Utp2026!` |
| `U22693560` | Rocío | `Utp2026!` |

Escribe solo el código, sin `@utp.edu.pe`. Si usas **¿Olvidaste tu contraseña?**, en la pantalla *Correo enviado* hay un enlace de demostración que simula abrir el correo.

## Qué incluye

- **Acceso:** onboarding de 3 pasos, inicio de sesión con estados de carga, éxito y error, y recuperación de contraseña. Desde el login se puede volver a ver la introducción y, en el onboarding, "Saltar" regresa al login (la flecha de regreso aparece desde la segunda pantalla).
- **Pantallas principales:** agenda del día, calendario mensual con filtros, cursos matriculados con avance de malla y pagos con un pago simulado.
- **Grupos de estudio:** explorar y filtrar grupos, crear uno propio (presencial o virtual), unirse con confirmación y manejo de error sin conexión, descargar el evento al calendario (`.ics`) y compartir la invitación.
- **Reserva de espacios** (menú *Más de UTP+ → Espacios*): buscar y filtrar salas grupales, PCs de biblioteca y cubículos por fecha y sede; elegir horario según la disponibilidad; agregar integrantes por código de alumno; confirmar con las normas; recibir un código `RES-AAAA-NNNN` con **QR real**; y ver, cancelar o descargar al calendario desde *Mis reservas*.
  - Reglas aplicadas: mínimo 3 integrantes en salas, máximo 2 horas, una reserva activa por tipo de espacio, sin dobles reservas, cancelación sin penalidad hasta 1 hora antes (después, 7 días sin reservar) e ingreso con QR hasta 15 minutos después del inicio.
  - Si el horario se ocupa mientras se reserva, se sugieren horarios cercanos.
- **Cursos:** lista agrupada con la semana del ciclo, el promedio de cada curso y las tareas pendientes, y avance de malla con la información académica plegada. Dentro de un curso hay tres secciones a la vista (**Resumen**, **Notas** y **Tareas**) y un botón **⋯** con Contenido, Foros, Anuncios, Zoom y Sílabo. El resumen muestra la semana, el promedio, lo que viene (tareas y evaluaciones) y atajos para repasar (reservar una sala, crear un grupo del curso o preguntarle al asistente). Notas reúne tu nota acumulada, los filtros Todas, Calificadas y Sin calificar, y una calculadora plegada de cuánto necesitas para aprobar.
- **Anuncios del campus:** desde *Inicio → Anuncios* o *Ver todos*. Lista con filtros por categoría, detalle con fecha, lugar y cupos, confirmación de asistencia (el servidor valida cupos y fecha), descarga al calendario y enlace para compartir.
- **Trámites** (menú *Más de UTP+ → Trámites*): catálogo de 26 trámites en *Autogestionables* y *SAE en línea*, con búsqueda. Cada uno muestra costo, plazo y modalidad, y su formulario se arma con los campos que define en la base de datos (selecciones, texto, curso de tu matrícula, aceptaciones). El servidor valida los datos y evita solicitudes repetidas en revisión. En **Mis solicitudes** ves el estado y el historial de cada una y puedes cancelarla mientras esté en revisión. Los costos y plazos son de ejemplo.
- **Notificaciones y correo:** en el inicio, la campanita muestra cuántas notificaciones tienes sin leer y abre el centro de notificaciones (agrupadas por día, con filtro de sin leer y acceso directo a cada pantalla). Se crean solas al reservar, unirte a un grupo, confirmar una actividad o enviar una solicitud de trámite. El botón de correo abre una pantalla con tu correo institucional y accesos a Outlook y Microsoft 365, que se abren fuera de la app.
- **Soporte (asistente UTP+):** conversación en lenguaje natural (*«reserva una sala para mañana a las 3»*). El asistente consulta datos reales, pregunta lo que falte y propone la acción con una tarjeta **Confirmar / Cambiar**; solo al confirmar se ejecuta, con las mismas reglas del servidor. También se le puede **hablar**: el micrófono graba (hasta 30 s), el servidor transcribe y la respuesta se lee en voz alta (se activa sola la primera vez que usas la voz y se puede silenciar). Consulta también tus cursos (docente, clases en vivo y tema de la semana), notas (cuánto necesitas para aprobar), tareas pendientes, el estado de tus trámites y los cupones de Beneficios+, y propone generar un cupón o cancelar una solicitud. La voz de respuesta es la de Gemini (con la del navegador como respaldo). Todo lo que hace el asistente también se puede hacer tocando.
- **Perfil:** datos institucionales de solo lectura (nombre, correo, código, DNI, modalidad y campus), cambio de foto y copiado del código universitario.

## Accesibilidad e inclusión

Se abre desde **Mi Perfil → Accesibilidad** y se aplica en toda la app:

- Tamaño de texto de 85 % a 150 % y texto en negrita.
- Modos para daltonismo: protanopia, deuteranopia y tritanopia.
- Alto contraste, reducir transparencia y reducir movimiento (activado por defecto si el sistema lo pide).
- Modo oscuro.
- Áreas táctiles de al menos 44 px, foco visible, etiquetas en los íconos y respeto de `prefers-reduced-motion`.

## Diseño adaptable

| Formato | Comportamiento |
|---|---|
| Celular (menos de 640 px) | Un panel a pantalla completa. |
| Celular en horizontal | Sin marco, con la navegación en una barra vertical a la izquierda y, si el ancho alcanza, lista y detalle en dos paneles. |
| Tableta o plegable abierto | Dos paneles: lista a la izquierda y detalle a la derecha. |
| Doble pantalla | Dos paneles alineados a cada pantalla, con la bisagra vacía (CSS Viewport Segments). |
| Escritorio | Vista previa dentro de un marco, con un selector de **Celular / Doble pantalla / Tableta**. |

Las animaciones usan solo `transform` y `opacity`, con una misma curva en toda la app.

## Estructura del proyecto

```
src/
├─ components/
│  ├─ layout/      # barra inferior, paneles, marco del dispositivo
│  └─ ui/          # botón, chip, hoja inferior, diálogo, interruptor…
├─ features/
│  ├─ onboarding/  ├─ auth/        ├─ home/
│  ├─ calendar/    ├─ courses/     ├─ payments/   # courses/detail: detalle del curso
│  ├─ groups/      ├─ profile/     ├─ accessibility/
│  ├─ reservations/  # reserva de espacios (reglas en rules.ts)
│  ├─ announcements/ ├─ notifications/ ├─ mail/
│  ├─ tramites/    # catálogo, solicitud, seguimiento y detalle
│  ├─ support/     # asistente de IA (chat, voz y confirmación de acciones)
│  └─ more/        # menú Más de UTP+
├─ hooks/  lib/  types/
public/             # manifiesto e íconos de la app instalable
docs/               # guía del backend, enunciado del curso y plantillas de usabilidad
supabase/           # migraciones SQL, seeds de demostración y la función `agent` (asistente)
```

## Despliegue

El frontend se publica en **Vercel** conectado a GitHub (producción: `https://utp-services.vercel.app`; en el iPhone se instala desde Safari con *Compartir → Añadir a pantalla de inicio*), con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` cargadas en el proyecto. Para no gastar el cupo de despliegues del plan gratuito, solo se despliegan automáticamente estas ramas (regla `git.deploymentEnabled` de `vercel.json`):

| Rama | Qué es |
|---|---|
| `main` | Producción. |
| `integracion` | Pruebas: dirección fija con lo último antes de pasar a producción. |
| `preview/*` | Solo cuando se quiere probar una rama aparte en el celular: basta nombrarla así (por ejemplo `preview/mi-prueba`). |

El resto de las ramas (`feat/*`, `fix/*`, `docs/*`…) no se despliegan al subirlas. Flujo de trabajo: rama de la función → `integracion` → `main`.

## Próximos pasos

1. Biblioteca (catálogo, préstamos y biblioteca virtual).
2. Conversar en tiempo real con la API Live de Gemini y la actualización automática de la PWA.
3. Guardar los cupones y referidos en Supabase.
4. Tiempo real en la disponibilidad, y calendario, pagos y foto de perfil en Supabase.
5. Guion de demo y evidencia de pruebas de usabilidad.

## Documentación

- Backend (modelo de datos, seguridad y funciones): [`docs/backend.md`](docs/backend.md)
- Enunciado del curso: [`docs/requerimientos.md`](docs/requerimientos.md)
- Plantillas de evaluación de usabilidad: `docs/usabilidad/`
