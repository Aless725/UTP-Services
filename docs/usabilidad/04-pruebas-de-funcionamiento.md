# Pruebas de funcionamiento

Aquí se deja lo que ya se probó durante el desarrollo y una lista corta de casos para repasar a mano antes de la demo.

## Lo que ya se probó

Estas pruebas se hicieron en noviembre de 2026 con scripts locales, y se pueden volver a correr:

- **Base de datos:** `schema.sql` y `seed.sql` se ejecutaron dos veces seguidas en un Postgres local, sin errores y sin datos duplicados. Se comprobó que cada alumno solo ve sus propios datos (matrículas, reservas, solicitudes) y que no puede escribir directo en las tablas protegidas.
- **Reservas de equipos:** 25 casos contra las funciones del servidor. Se rechazan los fines de semana, más de 4 horas, fuera de 08:00–20:00, fechas pasadas o a más de 30 días, equipos que no existen, una segunda reserva activa y horarios que se cruzan con otro alumno. Se comprobó que cancelar con anticipación no tiene penalidad, que cancelar con menos de 1 hora sí la tiene y que la penalidad bloquea nuevas reservas.
- **Asistente de IA:** 104 casos con un modelo simulado. Cubren las consultas de cada módulo, las propuestas (reservar o cancelar espacios y equipos, unirse a grupos, inscribirse en talleres, postular a ofertas, solicitar trámites, generar cupones) y los rechazos: horario ocupado, fin de semana, ya inscrito, ya postulado, grupo lleno, campos que faltan. También conversaciones completas, como pedir una tablet, elegir el equipo y el horario y confirmar. El modelo nunca escribe: solo propone y la persona confirma.
- **Acciones del asistente en pantalla:** las cinco acciones nuevas (reserva de equipo, cancelación, inscripción a taller, postulación y solicitud de trámite) llaman a la función correcta con los datos correctos.
- **Pantallas y dispositivos:** 31 pantallas revisadas a 393 y 320 px de ancho, iPad A16 y Pro 13 en vertical y horizontal, Galaxy Z Fold con la bisagra en las dos posiciones y celular en horizontal. Sin desbordes ni errores en consola.
- **Sin conexión:** con la versión compilada y recargando sin red, la app abre, mantiene la sesión y muestra los últimos datos guardados.
- **Código:** `npx tsc -b --noEmit` y `npm run build` sin errores.

Falta guardar esos scripts dentro del repositorio (por ejemplo, en una carpeta `tests/`) para que cualquiera pueda correrlos.

## Casos para repasar antes de la demo

Con la cuenta `U22265137` / `Utp2026!`. Anotar ✓ o ✗, la fecha y quién lo probó.

| Caso | Qué debería pasar | Resultado |
|---|---|---|
| Entrar con código y contraseña correctos | Entra al inicio | |
| Entrar con contraseña incorrecta | Mensaje claro y el código se conserva | |
| Cerrar la app y abrirla otra vez | Mantiene la sesión | |
| Cursos → un curso → Notas | Muestra las notas y la calculadora | |
| Pagos → una cuota pagada → Descargar comprobante | Descarga un PDF | |
| Pagos → Historial → Constancia de pagos | Descarga un PDF | |
| Reservar una sala con 3 integrantes | Confirma con código y QR | |
| Reservar una sala con menos de 3 integrantes | Mensaje con la regla | |
| Reservar un equipo teniendo otra reserva activa | Mensaje claro y se ofrece cancelar | |
| Elegir un horario de equipo que otro alumno acaba de ocupar | Mensaje de conflicto y se puede elegir otro | |
| Solicitar un trámite dos veces | Mensaje de solicitud repetida | |
| Inscribirse en un taller con vacantes | Aparece en Mis talleres | |
| Postular a una oferta | Aparece en Mis postulaciones | |
| Generar un cupón | Muestra QR y código | |
| Hacer una reserva y mirar las notificaciones | Llega el aviso con acceso directo | |
| Asistente por texto: «¿qué tareas tengo pendientes?» | Responde con datos reales | |
| Asistente: «reserva una tablet para el lunes a las 3» | Propone y, al confirmar, reserva | |
| Asistente por voz | Transcribe, responde y lee la respuesta | |
| Negar el permiso del micrófono | Mensaje claro y se puede escribir | |
| Modo avión y reabrir la app | Abre con el aviso y los últimos datos | |
| Girar el celular y abrirla en un iPad | Barra lateral en horizontal y dos paneles en iPad | |
