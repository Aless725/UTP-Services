# 6. Pruebas de funcionamiento

El enunciado pide «evidencia de pruebas de funcionamiento». Este documento reúne lo que ya se verificó de forma automática y los casos que se prueban a mano antes de la demo.

## A. Verificaciones automáticas ya realizadas

Hechas durante el desarrollo (noviembre de 2026) con scripts locales; los resultados se pueden repetir y mostrar en la demo.

| Qué se verificó | Cómo | Resultado |
|---|---|---|
| **Esquema y datos de demostración** | `schema.sql` y `seed.sql` ejecutados **dos veces seguidas** en un Postgres local (PGlite) con las piezas de Supabase simuladas | Sin errores y sin datos duplicados; la semana del ciclo se calcula con la fecha de hoy |
| **Seguridad por filas (RLS)** | Consultas como el alumno `U22265137` | Solo ve su perfil, sus matrículas y sus reservas; no puede escribir directamente en tablas protegidas |
| **Reglas de reserva de equipos** | 25 casos contra las funciones del servidor | Todos pasan (ver detalle abajo) |
| **Asistente de IA** | 104 casos con el modelo simulado sobre el núcleo del agente | Todos pasan (ver detalle abajo) |
| **Acciones del asistente en pantalla** | Recorrido en navegador con el asistente y el servidor simulados | Las 5 acciones nuevas llaman a la función correcta con los datos correctos |
| **Compilación y tipos** | `npx tsc -b --noEmit` y `npm run build` | Sin errores |
| **Diseño adaptable** | Recorrido en 31 pantallas a 393 y 320 px; iPad A16 y Pro 13 en vertical y horizontal; Z Fold con bisagra vertical y horizontal; celular horizontal | Sin desbordes ni errores de consola |
| **Modo sin conexión** | Versión compilada, recargando la página sin red | Abre, mantiene la sesión y muestra los últimos datos guardados |

### Reglas de reserva de equipos (servidor)

Un alumno puede reservar; otro alumno en un horario que se cruza recibe «conflicto»; el horario contiguo sí se permite. Se rechazan: sábados y domingos, más de 4 horas, antes de las 08:00 o después de las 20:00, fechas pasadas, más de 30 días de anticipación, equipos inexistentes y horarios invertidos. Una segunda reserva activa se rechaza. La ocupación se muestra sin datos personales. Un alumno no puede cancelar la reserva de otro ni escribir directo en la tabla. Cancelar con anticipación no tiene penalidad; con menos de 1 hora hay penalidad y bloquea nuevas reservas. También se reserva una tablet de 4 horas y se verifica la actualización de una base ya creada.

### Asistente de IA (modelo simulado)

- **Consultas:** espacios, reservas, anuncios, grupos, cursos, notas, tareas, evaluaciones, datos de curso, trámites, beneficios, equipos, talleres, ofertas, postulaciones y notificaciones.
- **Propuestas** (el modelo nunca escribe; solo propone y la persona confirma): reserva y cancelación de espacios y de equipos, asistencia a actividades, unirse a grupos, cupones, inscripción a talleres, postulación a ofertas, solicitud y cancelación de trámites.
- **Validaciones:** horario ocupado, fin de semana, reserva activa existente, grupo lleno o cerrado, ya inscrito o ya postulado, trámite ya en revisión, campos faltantes o inválidos (opciones, cursos, aceptaciones), JSON inválido, fechas y datos incorrectos.
- **Conversaciones completas:** «reserva una tablet» → lista opciones y pregunta → con el día y la hora busca y deja la propuesta lista para confirmar.
- **Voz:** transcripción con resultados vacíos, sin voz clara, muy larga y errores del modelo.

> Pendiente: guardar estos scripts dentro del repositorio (por ejemplo, en una carpeta `tests/`) para que cualquiera pueda ejecutarlos.

## B. Casos de prueba manuales (antes de la demo)

Completa **Resultado** con ✅ o ❌, la fecha y quién probó. Usa `U22265137` / `Utp2026!`.

| # | Módulo | Caso | Resultado esperado | Resultado |
|---|---|---|---|---|
| F01 | Acceso | Entrar con código y contraseña correctos | Entra al inicio | |
| F02 | Acceso | Contraseña incorrecta | Mensaje de error claro, el código se conserva | |
| F03 | Acceso | Cerrar la app y abrirla de nuevo | Mantiene la sesión | |
| F04 | Cursos | Abrir un curso → Notas | Muestra notas y la calculadora | |
| F05 | Cursos | Tareas pendientes | Lista las tareas por vencer | |
| F06 | Pagos | Tocar una cuota pagada → Descargar comprobante | Descarga un PDF | |
| F07 | Pagos | Historial → Constancia de pagos | Descarga un PDF | |
| F08 | Espacios | Reservar una sala con 3 integrantes | Confirma con código y QR | |
| F09 | Espacios | Reservar con menos de 3 integrantes | Mensaje de la regla | |
| F10 | Espacios | Cancelar con más de 1 hora de anticipación | Cancela sin penalidad | |
| F11 | Equipos | Reservar una laptop, computadora o tablet | Confirma con código y QR | |
| F12 | Equipos | Reservar teniendo otra reserva activa | Mensaje claro; se ofrece cancelar | |
| F13 | Equipos | Elegir un horario que otro alumno acaba de ocupar | Mensaje de conflicto y opción de elegir otro | |
| F14 | Grupos | Unirse a un grupo con cupo | Aparece en «Mis grupos» | |
| F15 | Trámites | Solicitar una constancia | Aparece en Seguimiento «En revisión» | |
| F16 | Trámites | Solicitar el mismo trámite dos veces | Mensaje de solicitud duplicada | |
| F17 | Talleres | Inscribirse en un grupo con vacantes | «Inscripción confirmada» y aparece en Mis talleres | |
| F18 | Empleabilidad | Postular a una oferta | Aparece en Mis postulaciones | |
| F19 | Beneficios | Generar un cupón | Muestra QR y código | |
| F20 | Notificaciones | Hacer una reserva | Llega una notificación con acceso directo | |
| F21 | Asistente (texto) | «¿Qué tareas tengo pendientes?» | Responde con datos reales | |
| F22 | Asistente (texto) | «Reserva una tablet para el lunes a las 3» | Propone y, al confirmar, reserva | |
| F23 | Asistente (voz) | Hablar una consulta | Transcribe, responde y lee la respuesta | |
| F24 | Asistente (voz) | Negar el permiso del micrófono | Mensaje claro y entrada por texto disponible | |
| F25 | Accesibilidad | Texto al 150 % y modo oscuro | Se ve completo y legible | |
| F26 | Sin conexión | Activar modo avión y reabrir la app | Abre y muestra el aviso y los últimos datos | |
| F27 | Dispositivos | Girar el celular; abrir en iPad | Barra lateral en horizontal; dos paneles en iPad | |
