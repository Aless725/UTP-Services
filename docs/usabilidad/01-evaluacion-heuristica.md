# Evaluación heurística

Revisamos la app con las 10 heurísticas de Nielsen para encontrar problemas antes de probarla con alumnos. Lo ideal es que la hagan 3 personas del equipo, cada una por su lado, y después junten lo que encontró cada una.

Se revisó en celular (393 × 852) con la cuenta `U22265137` / `Utp2026!`. Si hay tiempo, también en horizontal, iPad y modo oscuro.

## Cómo se hace

Se recorre cada módulo dos veces: la primera para conocerlo y la segunda para anotar problemas. De cada problema se apunta dónde está, qué pasa y qué heurística no cumple, y se le pone una gravedad:

| Gravedad | Significa |
|---|---|
| 0 | No es un problema |
| 1 | Detalle visual, se arregla si sobra tiempo |
| 2 | Menor |
| 3 | Importante, hay que arreglarlo |
| 4 | Grave, hay que arreglarlo antes de la demo |

## Las 10 heurísticas aplicadas a la app

| Heurística | Qué se revisa en UTP+ |
|---|---|
| 1. Visibilidad del estado | Si siempre se sabe dónde se está y si una acción funcionó: pantallas de carga, aviso de sin conexión, estado de reservas y solicitudes, notificaciones, aro del botón «+» dentro de los módulos de Más |
| 2. Lenguaje del usuario | Que los textos de trámites, reservas, talleres y errores se entiendan sin términos técnicos |
| 3. Control y libertad | Poder volver, cancelar o cambiar: botón de regreso, cancelar reservas y solicitudes, botón «Cambiar» en las propuestas del asistente |
| 4. Consistencia | Que filtros, encabezados, botones y listas se vean y funcionen igual en todos los módulos |
| 5. Prevención de errores | Horarios ocupados bloqueados, reglas de reserva, confirmación antes de cancelar, el asistente que no hace nada sin que el alumno confirme |
| 6. Reconocer antes que recordar | Código y QR de las reservas, resumen antes de confirmar, atajos del asistente, historial |
| 7. Flexibilidad y eficiencia | Asistente por texto y voz, búsquedas, filtros, descargas |
| 8. Diseño minimalista | Que no sobre información: pantallas limpias, detalles plegados |
| 9. Ayuda con los errores | Mensajes que expliquen qué pasó y qué hacer: reserva que se ocupa, penalidades, falta de red, voz sin audio |
| 10. Ayuda y documentación | Asistente de Soporte, pantallas vacías que indican el siguiente paso |

## Lo que ya encontramos

Esta es la revisión que hicimos nosotros. Falta que los demás evaluadores la confirmen y agreguen lo suyo.

| N.º | Dónde | Qué pasa | Heurística | Gravedad | Qué hacer |
|---|---|---|---|---|---|
| 1 | Menú Más → Biblioteca | Abre una pantalla de «disponible muy pronto»; el alumno ve una opción que todavía no sirve | 1 y 10 | 2 | Terminar el módulo o marcarlo como «Pronto» en el menú |
| 2 | Beneficios → Opina | Muestra «¡Gracias por opinar!» pero la opinión no se guarda en ningún lado | 1 | 2 | Guardarla en Supabase |
| 3 | Beneficios → Refiere y gana | El contador de referidos y lo ganado es fijo (0 y S/ 0) | 1 | 2 | Calcularlo de datos reales o quitarlo |
| 4 | Sin conexión | Una pantalla que nunca se abrió antes aparece vacía, sin explicar por qué | 1 y 9 | 2 | Mostrar un mensaje «Esta pantalla necesita conexión la primera vez» |
| 5 | Asistente | No puede consultar pagos ni el calendario; responde que no puede, pero sin ofrecer el atajo a esa pantalla | 7 y 10 | 2 | Pasar esos datos a Supabase o agregar un enlace directo en la respuesta |
| 6 | Reserva de equipos | La pantalla ofrece horarios cada 2 horas, mientras el asistente puede reservar a cualquier hora en punto | 4 | 1 | Que la pantalla también ofrezca horarios cada hora |
| 7 | Talleres y Empleabilidad | Los filtros desplegables usan el selector del sistema y se ven distintos al resto de filtros de la app | 4 | 1 | Cambiarlos por chips o por un selector propio |
| 8 | Beneficios | Las fotos son de ejemplo y no son los logos reales de las marcas | 2 | 1 | Reemplazarlas por imágenes reales de los convenios |
| 9 | Cupones | Se guardan solo en el dispositivo: si cambias de celular desaparecen | 6 | 1 | Guardarlos en Supabase |
| 10 | Recuperación de contraseña | Es simulada, no llega ningún correo | 9 | 2 | Aclararlo en la demo; en producción usar el correo real |

## Hallazgos de los otros evaluadores

| N.º | Evaluador | Dónde | Qué pasa | Heurística | Gravedad | Qué hacer |
|---|---|---|---|---|---|---|
| 11 | | | | | | |
| 12 | | | | | | |
| 13 | | | | | | |

## Resumen

Al final contar cuántos problemas hay por gravedad y cuántos quedaron corregidos. Eso va en el PPT.

| Gravedad | Cantidad | Corregidos |
|---|---|---|
| 4 | | |
| 3 | | |
| 2 | | |
| 1 | | |
