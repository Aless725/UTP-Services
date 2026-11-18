# UTP+ Service

MVP de una aplicación móvil de servicios universitarios para alumnos de la UTP, desarrollado para el proyecto final del curso de **Interacción Hombre-Máquina (IHM)**.

Reúne en un solo lugar la agenda, los cursos, los pagos y otros servicios del menú **Más de UTP+**, con un estilo minimalista inspirado en iOS y pensado primero para iPhone.

> Todos los datos y cuentas son de demostración. No se integran credenciales ni información real de la UTP.

## Problema y propuesta

Los servicios universitarios están repartidos en varios portales, con flujos largos y poco usables en el celular. **UTP+ Service** los concentra en una sola app, con accesibilidad como parte del diseño y una interfaz que se adapta desde un celular hasta equipos plegables y de doble pantalla.

- **Público:** alumnos de pregrado de la UTP.
- **Modalidades de interacción:** interfaz móvil (iPhone) y, en el plan del proyecto, interfaz por voz con un asistente de IA.

## Estado del proyecto

| Área | Estado |
|---|---|
| Onboarding e inicio de sesión (con recuperación de contraseña) | Listo |
| Pantallas principales: Inicio, Calendario, Cursos, Pagos y menú *Más de UTP+* | Listo |
| Mi Perfil y Accesibilidad (texto, daltonismo, contraste, movimiento, modo oscuro) | Listo |
| Grupos de estudio (explorar, crear, unirse, mis grupos) | Listo |
| Detalle del curso (sílabo, contenido, evaluaciones, tareas, foros, notas, anuncios y Zoom) | Listo |
| Animaciones y transiciones suaves | Listo |
| Diseño adaptable: celular, tableta, plegable y doble pantalla | Listo |
| Reserva de espacios (salas, PCs y cubículos, con QR y reglas de negocio) | Listo |
| Biblioteca y Trámites | Pendiente |
| Backend real (Supabase), PWA y asistente por voz con IA | Pendiente |

Por ahora la autenticación y los datos son **simulados en el navegador** (localStorage). La interfaz de los servicios está pensada para sustituirse por Supabase sin cambiar las pantallas.

## Tecnologías

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con tokens de diseño en variables CSS (temas, daltonismo y alto contraste)
- **React Router** y **TanStack Query**
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

### Variables de entorno

Copia `.env.example` a `.env` cuando se conecte el backend:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca subas el archivo `.env` al repositorio.

## Cuentas de demostración

| Usuario | Nombre | Contraseña |
|---|---|---|
| `U22265137` | Isabel | `Utp2026!` |
| `U22209574` | Mateo | `Utp2026!` |
| `U22693560` | Rocío | `Utp2026!` |

Escribe solo el código, sin `@utp.edu.pe`. Si usas **¿Olvidaste tu contraseña?**, en la pantalla *Correo enviado* hay un enlace de demostración que simula abrir el correo.

## Qué incluye

- **Acceso:** onboarding de 3 pasos, inicio de sesión con estados de carga, éxito y error, y recuperación de contraseña. Se puede ir y volver entre el login y el onboarding.
- **Pantallas principales:** agenda del día, calendario mensual con filtros, cursos matriculados con avance de malla y pagos con un pago simulado.
- **Grupos de estudio:** explorar y filtrar grupos, crear uno propio (presencial o virtual), unirse con confirmación y manejo de error sin conexión, descargar el evento al calendario (`.ics`) y compartir la invitación.
- **Reserva de espacios** (menú *Más de UTP+ → Espacios*): buscar y filtrar salas grupales, PCs de biblioteca y cubículos por fecha y sede; elegir horario según la disponibilidad; agregar integrantes por código de alumno; confirmar con las normas; recibir un código `RES-AAAA-NNNN` con **QR real**; y ver, cancelar o descargar al calendario desde *Mis reservas*.
  - Reglas aplicadas: mínimo 3 integrantes en salas, máximo 2 horas, una reserva activa por tipo de espacio, sin dobles reservas, cancelación sin penalidad hasta 1 hora antes (después, 7 días sin reservar) e ingreso con QR hasta 15 minutos después del inicio.
  - Si el horario se ocupa mientras se reserva, se sugieren horarios cercanos.
- **Detalle del curso** (tocar un curso o una clase): sílabo (con descarga), contenido con información del curso, bibliografía y las 18 semanas (foro de consultas y materiales con avance), evaluaciones, tareas con entrega de archivo, foros donde se puede responder, notas con cálculo de lo que falta para aprobar, anuncios y datos de Zoom con la próxima sesión.
- **Perfil:** edición de nombre y DNI, cambio de foto y copiado del código universitario.

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
│  └─ more/        # menú Más de UTP+
├─ hooks/  lib/  types/
docs/               # enunciado del curso y plantillas de usabilidad
supabase/           # migraciones (backend en preparación)
```

## Próximos pasos

1. Biblioteca y Trámites.
2. Backend en Supabase (autenticación, base de datos con RLS y tiempo real), llevando allí las reglas de reserva.
3. PWA instalable.
4. Asistente por voz con IA que ejecute tareas con confirmación del alumno.
5. Despliegue, guion de demo y evidencia de pruebas de usabilidad.

## Documentación

- Enunciado del curso: [`docs/requerimientos.md`](docs/requerimientos.md)
- Plantillas de evaluación de usabilidad: `docs/usabilidad/`
