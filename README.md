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
| Empleabilidad: detalle y postulación a programas, bolsa de trabajo, búsqueda y filtros, seguimiento unificado | Listo |
| Talleres culturales y deportivos: catálogo, grupos y horarios, inscripción y Mis talleres | Listo |
| Asistente de Soporte con IA por **texto y voz natural** (Gemini): consulta espacios, cursos, notas, tareas, trámites y cupones, y propone reservas, grupos, asistencias, cupones y cancelaciones con confirmación | Listo |
| Backend en Supabase con RLS y reglas en el servidor | Listo |
| App instalable en la pantalla de inicio (manifiesto e íconos) y diseño adaptable (celular vertical y horizontal, iPad, plegables y doble pantalla) | Listo |
| Beneficios+: cupones por categoría (Prime, Gastronomía, Moda y estilo, Entretenimiento, Educación e idiomas), Refiere y gana, Opina, Ponte al día y Trivia | Listo |
| Pagos: detalle de cada cuota, historial de pagos y constancias en PDF | Listo |
| Biblioteca | Pendiente (a cargo de otro integrante del equipo) |
| Reserva de equipos | Pendiente (a cargo de otro integrante del equipo) |
| Modo sin conexión (abre sin internet y muestra los últimos datos guardados) | Listo |
| Actualización automática de la PWA (aviso de nueva versión) | Pendiente |

La autenticación, el perfil, los grupos, las reservas, los cursos (incluido su contenido y el avance de cada alumno), los anuncios, las notificaciones, los trámites, la empleabilidad y los talleres usan **Supabase** (Auth + Postgres con RLS). Siguen locales el calendario, los pagos y la foto de perfil, y la recuperación de contraseña es simulada porque los correos de demostración no existen. El detalle está en [`docs/backend.md`](docs/backend.md).

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
2. En el **SQL Editor** ejecuta, en este orden, dos archivos: `supabase/schema.sql` (todo el esquema) y `supabase/seed.sql` (datos de demostración: las 3 cuentas, el ciclo hasta el 18 de diciembre y sus 5 cursos, trámites, empleabilidad y talleres). Se pueden repetir sin duplicar datos y renuevan las fechas relativas a hoy. Tenerlos en el repositorio no modifica la base remota. La guía completa está en [`docs/backend.md`](docs/backend.md).
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
- **Empleabilidad** (menú *Más de UTP+ → Empleabilidad*): cinco programas (Primer Empleo, Ruta Laboral, Generación Top, Impulsa y Egresa con Potencial) con descripción, beneficios, requisitos, enlaces oficiales y formulario de postulación. El formulario precarga nombre, código de la cuenta, correo institucional y campus; solicita ciclo y confirmación de requisitos. Incluye bolsa de trabajo con búsqueda por puesto, empresa y requisitos, filtros por tipo y ciudad, detalle de ofertas y postulación con nombre y correo de contacto. La confirmación se conserva al recargar y **Mis postulaciones** reúne ofertas y programas con su tipo y estado. El servidor evita duplicados por alumno y destino, comprueba disponibilidad y genera notificaciones; cada alumno solo consulta sus propios registros. Son registros de demostración: no se envían solicitudes a empresas ni a la universidad. Los requisitos académicos de programas quedan sujetos a revisión, no se deducen del ciclo declarado. Los datos ya consultados se pueden leer sin conexión; postular requiere internet.
- **Talleres** (menú *Más de UTP+ → Talleres*): catálogos culturales y deportivos con búsqueda y filtros, detalle con docente, sede, modalidad, fechas, grupos y horarios semanales. El alumno elige un grupo, revisa los términos y acepta la declaración antes de inscribirse. El servidor comprueba la ventana de inscripción, restricciones y vacantes, y registra el cupo y la notificación en una transacción; un reintento recupera la misma inscripción. **Mis talleres** reúne los registros de la cuenta y su comprobante se puede abrir o recargar mediante enlace directo, aunque el taller se archive. Las vacantes se muestran como cifras agregadas sin identificar a otros alumnos. Los datos ya consultados están disponibles sin conexión; inscribirse requiere internet. La confirmación se realiza dentro de la app, sin envío de correo. Si la sesión expira, se puede iniciar sesión y regresar al detalle para confirmar nuevamente.
- **Reserva de espacios** (menú *Más de UTP+ → Espacios*): buscar y filtrar salas grupales, PCs de biblioteca y cubículos por fecha y sede; elegir horario según la disponibilidad; agregar integrantes por código de alumno; confirmar con las normas; recibir un código `RES-AAAA-NNNN` con **QR real**; y ver, cancelar o descargar al calendario desde *Mis reservas*.
  - Reglas aplicadas: mínimo 3 integrantes en salas, máximo 2 horas, una reserva activa por tipo de espacio, sin dobles reservas, cancelación sin penalidad hasta 1 hora antes (después, 7 días sin reservar) e ingreso con QR hasta 15 minutos después del inicio.
  - Si el horario se ocupa mientras se reserva, se sugieren horarios cercanos.
- **Cursos:** el ciclo de demostración (2026-2) termina el viernes 18 de diciembre e incluye 5 cursos, entre ellos Herramientas de Prototipado (con Figma); la semana actual se calcula con la fecha de hoy. Lista agrupada con la semana del ciclo, el promedio de cada curso y las tareas pendientes, y avance de malla con la información académica plegada. Dentro de un curso hay tres secciones a la vista (**Resumen**, **Notas** y **Tareas**) y un botón **⋯** con Contenido, Foros, Anuncios, Zoom y Sílabo. El resumen muestra la semana, el promedio, lo que viene (tareas y evaluaciones) y atajos para repasar (reservar una sala, crear un grupo del curso o preguntarle al asistente). Notas reúne tu nota acumulada, los filtros Todas, Calificadas y Sin calificar, y una calculadora plegada de cuánto necesitas para aprobar.
- **Anuncios del campus:** desde *Inicio → Anuncios* o *Ver todos*. Lista con filtros por categoría, detalle con fecha, lugar y cupos, confirmación de asistencia (el servidor valida cupos y fecha), descarga al calendario y enlace para compartir.
- **Beneficios+** (menú *Más de UTP+ → Beneficios*): destacados, catálogo con búsqueda y categorías, detalle con condiciones, cómo usarlo y dónde, y cupón con **QR real** (uno por beneficio, guardado en el dispositivo). Incluye *Refiere y gana* (código personal para ganar S/ 50), *Opina*, *Ponte al día* y una *Trivia*; *Actualízate* y *Capacítate* figuran como «Pronto». Los convenios y montos son de demostración.
- **Pagos:** al tocar una cuota se ve su detalle (fecha, N.º de operación y desglose) y se descarga su comprobante; *Historial y constancias* lista los pagos y descarga la constancia de pagos y la de no adeudo. Los PDF son de demostración.
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

La app se adapta sola al dispositivo y a su orientación. Formatos compatibles:

| Formato | Medidas de referencia (CSS px) | Comportamiento |
|---|---|---|
| **Celular vertical** (iPhone, Android) | 320 a 639 de ancho; probado en 393×852 (iPhone 15 Pro) | Un panel a pantalla completa, con la barra de navegación flotante abajo. |
| **Celular horizontal** | por ejemplo 852×393 | Sin marco. La navegación pasa a una barra vertical a la izquierda; con 760 px o más de ancho, lista y detalle en dos paneles. |
| **iPad 10.9"** (A16) | 820×1180 vertical y 1180×820 horizontal | Pantalla completa con dos paneles (lista y detalle). |
| **iPad 13"** | 1032×1376 vertical y 1376×1032 horizontal | Igual, con paneles más anchos y texto un 10 % más grande. |
| **Tableta o plegable abierto** | 640 px o más de ancho | Dos paneles: lista a la izquierda y detalle a la derecha. |
| **Plegable o doble pantalla con bisagra vertical** (por ejemplo Galaxy Z Fold desplegado en vertical) | 744×860 | Dos paneles alineados a cada pantalla, con la bisagra vacía (CSS Viewport Segments). |
| **Plegable o doble pantalla con bisagra horizontal** (Z Fold girado) | 860×744 | Pantallas una sobre otra, alineadas a cada segmento, con la navegación en barra vertical. |
| **Escritorio** (pantalla grande con mouse) | 1024 px o más | Vista previa dentro de un marco, con un selector de **Celular / Doble pantalla / Tableta**. |

Un iPad (táctil) nunca se trata como escritorio: usa la app a pantalla completa. Las animaciones usan solo `transform` y `opacity`, con una misma curva en toda la app. Sin internet, la app abre con lo último que consultaste y muestra un aviso de **sin conexión**.

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
│  ├─ empleabilidad/  # programas, ofertas, postulación y seguimiento
│  ├─ talleres/   # catálogos, grupos y horarios, inscripción y Mis talleres
│  ├─ support/     # asistente de IA (chat, voz y confirmación de acciones)
│  └─ more/        # menú Más de UTP+
├─ hooks/  lib/  types/
public/             # manifiesto e íconos de la app instalable
docs/               # guía del backend, enunciado del curso y plantillas de usabilidad
supabase/           # schema.sql (esquema), seed.sql (datos de demostración) y la función `agent` (asistente)
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

1. **Biblioteca** (catálogo, préstamos y biblioteca virtual) y **Reserva de equipos**: los desarrolla otro integrante del equipo y se integrarán después.
2. Conversar en tiempo real con la API Live de Gemini y la actualización automática de la PWA.
3. Guardar los cupones y referidos en Supabase.
4. Tiempo real en la disponibilidad, y calendario, pagos y foto de perfil en Supabase.
5. Guion de demo y evidencia de pruebas de usabilidad.

## Documentación

- Backend (modelo de datos, seguridad y funciones): [`docs/backend.md`](docs/backend.md)
- Enunciado del curso: [`docs/requerimientos.md`](docs/requerimientos.md)
- Plantillas de evaluación de usabilidad: `docs/usabilidad/`
