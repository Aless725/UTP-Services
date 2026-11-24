# Pruebas con usuarios

La idea es ver si alumnos de verdad pueden hacer las tareas principales de la app sin ayuda, y dónde se confunden. Se prueba con 5 alumnos de la UTP que no hayan participado en el desarrollo. Cada prueba dura entre 30 y 40 minutos y se hace con dos personas: un moderador que guía y un observador que anota.

Se usa un celular con la app abierta en `https://utp-services.vercel.app` y, si el alumno lo permite, se graba la pantalla.

## Antes de empezar

- Ejecutar `supabase/seed.sql` para que las fechas estén al día.
- Cerrar sesión para empezar desde el inicio de sesión.
- Tener buena conexión y el volumen del celular activado (para la voz).
- Entre un alumno y otro, cancelar las reservas y solicitudes que se hayan creado, o volver a ejecutar el seed. Todos deben empezar igual.

## Qué se le dice al alumno

> Gracias por ayudarnos. Estamos probando la aplicación, no a ti. Si algo te confunde, es culpa de la app y justo eso queremos saber. Te voy a pedir que hagas unas tareas y que vayas diciendo en voz alta lo que piensas. No te voy a ayudar mientras las haces. Los datos son de prueba y solo anotamos un código, no tu nombre. Puedes parar cuando quieras. ¿Estás de acuerdo en que anotemos lo que hagas?

## Preguntas antes de las tareas

1. ¿Qué servicios de la universidad usas más desde el celular?
2. ¿Has usado asistentes de voz como Siri o Google? ¿Para qué?
3. Del 1 al 5, ¿qué tan cómodo te sientes con aplicaciones nuevas?

## Tareas

Se lee una a la vez, sin decir qué botón tocar. Se mide el tiempo hasta que termina o se rinde (máximo 3 minutos). Después de cada una se le pregunta: «Del 1 (muy difícil) al 7 (muy fácil), ¿qué tan fácil fue?».

| N.º | Qué se le pide | Módulo | Se cumple cuando |
|---|---|---|---|
| 1 | «Entra con tu código y averigua cuánto debes pagar este mes y cuándo vence» | Acceso y Pagos | Dice el monto y la fecha |
| 2 | «Quieres saber qué nota necesitas en el final de Interacción Hombre Máquina para aprobar» | Cursos → Notas | Encuentra la calculadora o el promedio necesario |
| 3 | «Reserva una sala de estudio para mañana a las 3 de la tarde con tus compañeros» | Espacios | Llega a la confirmación con código y QR |
| 4 | «Usa el asistente y pídele por voz una tablet para el lunes en la tarde» | Soporte y Equipos | El asistente propone la reserva y la confirma |
| 5 | «Necesitas una constancia de estudios. Pídela y revisa cómo quedó» | Trámites | Envía la solicitud y ve su estado |
| 6 | «Quieres inscribirte en un taller» | Talleres | Termina la inscripción |
| 7 | «Consigue el cupón de descuento para el cine y muéstralo como en la boletería» | Beneficios+ | Genera el cupón y muestra el QR |
| 8 | «La letra se te hace pequeña: ponla más grande y activa el modo oscuro» | Perfil → Accesibilidad | Cambia ambas cosas |

Si hay poco tiempo, las más importantes son la 1, 3, 4, 5 y 8.

## Preguntas al final

1. ¿Qué fue lo que más te gustó?
2. ¿Qué fue lo más confuso o lo primero que cambiarías?
3. ¿Usarías esta app en tu día a día?
4. Sobre el asistente de voz: ¿te entendió? ¿Le confiarías hacer un trámite por ti?

Después se le entrega el cuestionario SUS (más abajo).

## Hoja de registro (una por alumno)

Participante: P__ · Fecha: ____ · Celular: ________ · Carrera y ciclo: ________ · Comodidad con apps (1–5): __ · Usa asistentes de voz: sí / no

| Tarea | ¿La hizo? (sí / con ayuda / no) | Tiempo (segundos) | Errores | Facilidad (1–7) | Qué pasó y qué dijo |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |

Lo que más le gustó: ______________________ · Lo más confuso: ______________________ · SUS: ____

## Cuestionario SUS

Cada alumno marca qué tan de acuerdo está con cada frase, del 1 (nada de acuerdo) al 5 (totalmente de acuerdo):

1. Creo que me gustaría usar esta aplicación con frecuencia.
2. Encontré la aplicación innecesariamente compleja.
3. Pensé que la aplicación era fácil de usar.
4. Creo que necesitaría ayuda de una persona con conocimientos técnicos para usarla.
5. Encontré que las funciones de la aplicación estaban bien integradas.
6. Pensé que había demasiada inconsistencia en la aplicación.
7. Imagino que la mayoría de las personas aprendería a usarla muy rápido.
8. Encontré la aplicación muy incómoda de usar.
9. Me sentí muy seguro(a) usándola.
10. Necesité aprender muchas cosas antes de poder usarla.

**Cómo se calcula.** En las frases impares (1, 3, 5, 7, 9) se resta 1 a la respuesta. En las pares (2, 4, 6, 8, 10) se resta la respuesta a 5. Se suman los diez resultados y el total se multiplica por 2,5. Queda un puntaje de 0 a 100.

Ejemplo: con respuestas 4, 2, 5, 1, 4, 2, 5, 1, 4, 2 los resultados son 3, 3, 4, 4, 3, 3, 4, 4, 3, 3. Suman 34 y 34 × 2,5 = 85.

En una hoja de cálculo, con las diez respuestas en `B2:K2`: `=2,5*((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))`

Para interpretarlo: 68 es el promedio de la industria. Más de 80 es muy bueno y menos de 51 indica problemas serios. Con 5 personas es solo una referencia.

## Resultados

Esto se llena al terminar las pruebas.

| Tarea | Alumnos que la hicieron solos (de 5) | Tiempo promedio (s) | Errores promedio | Facilidad promedio (1–7) |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |

| Alumno | P1 | P2 | P3 | P4 | P5 | Promedio |
|---|---|---|---|---|---|---|
| Puntaje SUS | | | | | | |

**Problemas que salieron** (de más a menos grave, con lo que se hizo para arreglarlos):

| Problema | Gravedad (0–4) | Qué se cambió | Estado |
|---|---|---|---|
| | | | |
| | | | |

Las tareas que menos de 4 de 5 alumnos hagan solos o con facilidad menor a 5,5 son las primeras que hay que mejorar.
