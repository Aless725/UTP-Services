# Evaluación de usabilidad de UTP+ Service

Esta carpeta reúne todo lo necesario para dejar **evidencia de pruebas de funcionamiento y de evaluación de usabilidad**, que el enunciado del curso pide como parte del MVP (`docs/requerimientos.md`, sección 3).

> Los resultados salen de aplicar estas guías con personas reales. Los archivos traen las plantillas y los guiones listos; completa los resultados con lo que observes.

## Qué hay y para qué sirve

| Archivo | Para qué sirve | Cuándo usarlo |
|---|---|---|
| [`01-evaluacion-heuristica.md`](01-evaluacion-heuristica.md) | Revisión experta con las 10 heurísticas de Nielsen, con qué mirar en cada pantalla de la app y una tabla de hallazgos | Primero, entre los integrantes del equipo (1 a 2 horas) |
| [`02-pruebas-con-usuarios.md`](02-pruebas-con-usuarios.md) | Guion del moderador, 9 tareas con criterio de éxito, preguntas y hoja de registro | Con 5 alumnos (30 a 40 minutos cada uno) |
| [`03-cuestionario-sus.md`](03-cuestionario-sus.md) | Cuestionario SUS (escala de usabilidad) con la forma de calcular el puntaje | Al final de cada prueba |
| [`04-plantilla-de-resultados.md`](04-plantilla-de-resultados.md) | Informe para presentar métricas, hallazgos y mejoras hechas | Al terminar, para el PPT y la demo |
| [`05-checklist-accesibilidad.md`](05-checklist-accesibilidad.md) | Lista de verificación de accesibilidad (WCAG 2.2 AA) con lo que la app ya cumple y lo que falta comprobar | Antes de las pruebas con usuarios |
| [`06-pruebas-de-funcionamiento.md`](06-pruebas-de-funcionamiento.md) | Casos de prueba por módulo, con lo que ya se verificó de forma automática y lo que se prueba a mano | Antes de la demo |

## Orden recomendado

1. **Preparar el entorno:** versión desplegada (`https://utp-services.vercel.app`) con los datos de demostración al día (`supabase/seed.sql`) y las 3 cuentas de prueba.
2. **Evaluación heurística** (equipo) y **checklist de accesibilidad**: se corrigen los problemas graves antes de involucrar a usuarios.
3. **Pruebas con 5 usuarios** + **SUS**. Con 5 personas se detecta cerca del 85 % de los problemas de usabilidad (Nielsen y Landauer); no hace falta una muestra grande.
4. **Resumen de resultados** en la plantilla, con los cambios que se hicieron a partir de lo observado (antes y después).
5. Llevar las capturas, las tablas y el SUS al PPT.

## Qué guardar como evidencia

- Fotos o capturas de las pruebas (con permiso; sin rostros si el participante lo pide).
- Las hojas de registro y los cuestionarios SUS completados.
- Las tablas de hallazgos con su severidad y su estado (corregido o pendiente).
- Capturas «antes y después» de los cambios hechos por las pruebas.

## Datos y privacidad

La app solo usa cuentas y datos de demostración. No pidas ni anotes datos personales reales de los participantes: usa un código (P1 a P5) en todos los registros.
