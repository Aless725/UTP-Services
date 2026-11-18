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
| Animaciones y transiciones suaves | Listo |
| Diseño adaptable: celular, tableta, plegable y doble pantalla | Listo |
| Reserva de espacios | En diseño |
| Biblioteca y Trámites | Pendiente |
| Backend real (Supabase), PWA y asistente por voz con IA | Pendiente |

Por ahora la autenticación y los datos son **simulados en el navegador** (localStorage). La interfaz de los servicios está pensada para sustituirse por Supabase sin cambiar las pantallas.

## Tecnologías

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con tokens de diseño en variables CSS (temas, daltonismo y alto contraste)
- **React Router** y **TanStack Query**
- **Google Material Symbols** (íconos) y tipografía **Inter**

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
│  ├─ calendar/    ├─ courses/     ├─ payments/
│  ├─ groups/      ├─ profile/     ├─ accessibility/
│  └─ more/        # menú Más de UTP+
├─ hooks/  lib/  types/
docs/               # enunciado del curso y plantillas de usabilidad
supabase/           # migraciones (backend en preparación)
```

## Próximos pasos

1. Reserva de espacios de punta a punta.
2. Biblioteca y Trámites.
3. Backend en Supabase (autenticación, base de datos con RLS y tiempo real).
4. PWA instalable.
5. Asistente por voz con IA que ejecute tareas con confirmación del alumno.
6. Despliegue, guion de demo y evidencia de pruebas de usabilidad.

## Documentación

- Enunciado del curso: [`docs/requerimientos.md`](docs/requerimientos.md)
- Plantillas de evaluación de usabilidad: `docs/usabilidad/`
