# 2. Pruebas de usabilidad con usuarios

**Objetivo:** comprobar si alumnos reales pueden completar las tareas principales de UTP+ sin ayuda, y encontrar dónde se confunden.

**Participantes:** 5 alumnos de pregrado de la UTP (de distintos ciclos y carreras). Evita a quienes participaron en el desarrollo. Si puedes, incluye a alguien que use letra grande o modo oscuro.

**Duración:** 30 a 40 minutos por persona.

**Equipo:** un **moderador** (guía y hace las preguntas) y un **observador** (anota sin intervenir).

**Dispositivo:** el celular del participante o un iPhone del equipo, con la app abierta en `https://utp-services.vercel.app`. Si es posible, graba la pantalla (con permiso).

## Antes de empezar

- [ ] Ejecutaste `supabase/seed.sql` para tener las fechas al día.
- [ ] Cerraste sesión y la app está en el inicio de sesión.
- [ ] Revisaste que tengan conexión y que el volumen del celular esté activado (para la voz).
- [ ] Tienes una hoja de registro por participante (abajo) y el cuestionario SUS impreso o en pantalla.
- [ ] **Entre participantes:** cancela las reservas y solicitudes creadas, o vuelve a ejecutar `seed.sql` para reiniciar los datos de ejemplo. Cada persona debe empezar con la misma situación.

## Guion del moderador

### 1. Bienvenida (3 min)

> «Gracias por ayudarnos. Estamos probando una aplicación para alumnos de la UTP, **no a ti**. No hay respuestas correctas o incorrectas: si algo te confunde, es un problema de la app y justo eso queremos descubrir. Te pediré que pienses en voz alta mientras haces unas tareas. No te voy a ayudar durante las tareas, pero puedo repetirlas. Puedes parar cuando quieras. Los datos son de prueba y solo anotaremos un código (P1, P2…), no tu nombre. ¿Estás de acuerdo en participar y en que anotemos lo que hagas?»

- [ ] El participante dio su consentimiento verbal (o firmado).

### 2. Preguntas iniciales (3 min)

1. ¿Qué servicios de la universidad usas más desde el celular?
2. ¿Has usado antes asistentes de voz (Siri, Google, Alexa)? ¿Para qué?
3. ¿Qué tan cómodo te sientes con aplicaciones nuevas? (1 a 5)

### 3. Tareas (20 a 25 min)

Entrega **una tarea a la vez**, leída en voz alta (sin decir qué botón tocar). Inicia el cronómetro cuando el participante empieza y detenlo cuando termina o se rinde (máximo 3 minutos por tarea; si pasa, se marca como «no completó»).

| # | Escenario para el participante | Módulo | Éxito si… | Meta |
|---|---|---|---|---|
| T1 | «Entra a la app con tu código y averigua cuánto debes pagar este mes y cuándo vence.» | Acceso, Pagos | Dice el monto pendiente y la fecha de vencimiento | 1 min |
| T2 | «Quieres saber qué nota necesitas en el examen final de *Interacción Hombre Máquina* para aprobar.» | Cursos → Notas | Encuentra la calculadora o el promedio necesario | 1,5 min |
| T3 | «Reserva una sala de estudio para mañana a las 3 de la tarde con tus compañeros.» | Espacios | Llega a la confirmación con su código y QR | 3 min |
| T4 | «Usa el asistente y **por voz** pídele reservar una tablet para el lunes por la tarde.» | Soporte (voz), Equipos | El asistente propone la reserva y la persona la confirma | 3 min |
| T5 | «Necesitas una constancia de estudios. Solicítala y revisa en qué estado quedó.» | Trámites | Envía la solicitud y ve su estado | 2,5 min |
| T6 | «Quieres inscribirte en un taller deportivo o cultural.» | Talleres | Termina la inscripción y ve «Inscripción confirmada» | 3 min |
| T7 | «Obtén el cupón de descuento para el cine y muéstralo como lo harías en la boletería.» | Beneficios+ | Genera el cupón y muestra el QR | 2 min |
| T8 | «La letra se te hace pequeña y quieres verla más grande, con modo oscuro.» | Perfil → Accesibilidad | Cambia el tamaño y activa el modo oscuro | 2 min |
| T9 | «Descarga el comprobante de la cuota que ya pagaste en octubre.» | Pagos → detalle de cuota | Descarga el comprobante | 2 min |

**Si hay poco tiempo:** T1, T3, T4, T5 y T8 son las más importantes (cubren acceso, reglas de negocio, voz con IA, formularios y accesibilidad).

### 4. Preguntas después de cada tarea (1 min)

**SEQ (Single Ease Question):** «En una escala del 1 (muy difícil) al 7 (muy fácil), ¿qué tan fácil fue esta tarea?»

### 5. Cierre (5 min)

1. ¿Qué fue lo que más te gustó?
2. ¿Qué fue lo más confuso o lo que cambiarías primero?
3. ¿Usarías esta app en tu día a día? ¿Por qué?
4. Sobre el asistente de voz: ¿te entendió bien? ¿Confiarías en él para hacer trámites?
5. Entrega el cuestionario **SUS** (`03-cuestionario-sus.md`).

> Agradece y, si ofreciste algo (un incentivo, constancia, etc.), cúmplelo.

## Hoja de registro por participante

**Participante:** P__  **Fecha:** ____  **Modalidad usada:** ☐ iPhone ☐ Android ☐ otro: ______

**Perfil:** carrera ________ · ciclo ____ · comodidad con apps nuevas (1–5): ____ · usa asistentes de voz: ☐ sí ☐ no

| Tarea | ¿Completó? (sí / con ayuda / no) | Tiempo (s) | Errores (toques equivocados, retrocesos) | SEQ (1–7) | Observaciones y frases textuales |
|---|---|---|---|---|---|
| T1 | | | | | |
| T2 | | | | | |
| T3 | | | | | |
| T4 | | | | | |
| T5 | | | | | |
| T6 | | | | | |
| T7 | | | | | |
| T8 | | | | | |
| T9 | | | | | |

**Lo que más le gustó:** ______________________________

**Lo más confuso:** ______________________________

**SUS (puntaje 0–100):** ____ (ver `03-cuestionario-sus.md`)

## Cómo registrar los problemas

Por cada problema que observes, anota el momento (tarea y tiempo), qué hizo la persona, qué esperaba y qué pasó. Súbelo a la tabla de hallazgos de `04-plantilla-de-resultados.md` con una severidad (escala de `01-evaluacion-heuristica.md`).

## Métricas que se calculan

| Métrica | Cómo se calcula |
|---|---|
| **Tasa de éxito** por tarea | Participantes que completaron sin ayuda ÷ 5 (se puede contar «con ayuda» como medio éxito) |
| **Tiempo en tarea** | Promedio (y mediana) de los que completaron |
| **Errores por tarea** | Promedio de toques equivocados y retrocesos |
| **SEQ** por tarea | Promedio de las respuestas de 1 a 7 (≥ 5,5 se considera bueno) |
| **SUS** global | Ver `03-cuestionario-sus.md` (≥ 68 es el promedio de la industria) |

## Consejos para el moderador

- No expliques la interfaz ni des pistas; si se traba, pregunta «¿qué esperabas que pasara?».
- Deja los silencios: suelen ser los momentos de duda más útiles.
- Para la tarea de voz, prueba en un lugar tranquilo y comprueba que el navegador tenga permiso de micrófono; si la persona prefiere escribir, anótalo (la voz es un canal alternativo y siempre se puede escribir).
- Si el participante comete un error de la app (no suyo), dilo al terminar para que no se culpe.
