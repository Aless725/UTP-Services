# 1. Evaluación heurística (Nielsen)

**Objetivo:** encontrar problemas de usabilidad revisando la app con las 10 heurísticas de Jakob Nielsen, antes de probarla con usuarios.

**Quiénes:** 3 o más integrantes del equipo, cada uno por separado. Después se juntan los hallazgos (cada evaluador encuentra solo una parte de los problemas; entre varios se cubre mucho más).

**Qué se evalúa:** celular vertical (iPhone, 393×852) y, si hay tiempo, horizontal, iPad y modo oscuro. Cuenta de prueba: `U22265137` / `Utp2026!`.

## Cómo hacerlo

1. Recorre cada módulo dos veces: la primera para familiarizarte y la segunda para evaluar.
2. Por cada problema, anota **qué pasó, dónde, qué heurística rompe y qué tan grave es**.
3. No discutas soluciones mientras evalúas; primero reúne los problemas.
4. Junta los hallazgos de todos, quita los repetidos y asigna una severidad en común.

### Escala de severidad

| Valor | Significado |
|---|---|
| 0 | No es un problema de usabilidad |
| 1 | Cosmético: se arregla si sobra tiempo |
| 2 | Menor: baja prioridad |
| 3 | Mayor: importante, hay que arreglarlo |
| 4 | Catastrófico: hay que arreglarlo antes de la demo |

## Las 10 heurísticas y qué mirar en UTP+

| # | Heurística | Preguntas para evaluar | Dónde mirar |
|---|---|---|---|
| H1 | **Visibilidad del estado del sistema** | ¿Siempre sé dónde estoy, qué está pasando y si mi acción funcionó? | Esqueletos de carga, avisos de «sin conexión», estados de solicitudes y reservas, insignia de notificaciones, pestaña activa de la barra (aro del «+» en los módulos de Más) |
| H2 | **Coincidencia entre el sistema y el mundo real** | ¿El lenguaje es el del alumno y sin tecnicismos? | Textos de trámites, reservas, talleres, mensajes de error y del asistente |
| H3 | **Control y libertad del usuario** | ¿Puedo deshacer, cancelar o volver atrás fácilmente? | Botón circular de regreso, cancelar reservas y solicitudes, «Cambiar» en las tarjetas del asistente, cerrar hojas y diálogos |
| H4 | **Consistencia y estándares** | ¿Las pantallas se comportan igual y respetan lo que ya conozco? | Encabezados, filtros con chips, listas agrupadas, botones fijos abajo, íconos |
| H5 | **Prevención de errores** | ¿La app evita que me equivoque antes de que ocurra? | Horarios ocupados deshabilitados, reglas de reservas (3 integrantes, 2 o 4 horas), confirmación antes de cancelar o generar cupones, el asistente que no ejecuta sin confirmar |
| H6 | **Reconocer antes que recordar** | ¿Tengo a la vista lo que necesito, sin tener que acordarme? | Códigos y QR de reservas, resumen antes de confirmar, atajos del asistente, historial |
| H7 | **Flexibilidad y eficiencia de uso** | ¿Hay atajos para quien ya sabe usarla? | Asistente por texto y voz, búsquedas, filtros, descargas de comprobantes, calendario |
| H8 | **Diseño estético y minimalista** | ¿Hay información que sobra o distrae? | Densidad de pantallas, secciones plegadas, jerarquía de títulos |
| H9 | **Ayudar a reconocer y corregir errores** | ¿Los mensajes explican qué pasó y cómo solucionarlo? | Reserva que se ocupa mientras reservas, penalidades, errores de red, voz sin audio, formularios con campos faltantes |
| H10 | **Ayuda y documentación** | ¿Encuentro ayuda cuando la necesito? | Asistente de Soporte, textos de apoyo, pantallas vacías con la siguiente acción |

## Qué ya incluye la app (punto de partida)

Sirve para no reportar como problema lo que ya está resuelto y para verificar si de verdad funciona como se espera.

- **H1:** esqueletos de carga, aviso de sin conexión, estados con color e ícono, insignia de notificaciones, QR y código en las reservas.
- **H3:** botón de regreso en todas las pantallas secundarias, cancelación de reservas, solicitudes y reservas de equipos con aviso de penalidad, «Cambiar» en cada propuesta del asistente.
- **H4:** sistema de diseño único (tokens de color, tipografía y componentes) y un solo patrón para listas, filtros y botones.
- **H5:** el servidor valida todas las reglas; los horarios ocupados no se pueden elegir; el asistente propone y la persona confirma.
- **H9:** mensajes de regla en español claro; si una reserva se ocupa mientras se hacía, se sugieren horarios cercanos.
- **H7:** asistente de IA por texto y voz que ejecuta acciones de varios módulos.
- **Accesibilidad:** ver `05-checklist-accesibilidad.md`.

## Límites conocidos (no los cuentes como hallazgo nuevo)

- Los datos son de demostración y la recuperación de contraseña es simulada.
- Calendario, pagos y foto de perfil se guardan solo en el dispositivo.
- Los cupones, referidos, opiniones y trivia no se guardan en el servidor.
- Un foro cerrado se valida en pantalla, no en el servidor.
- Biblioteca todavía no está construida.

## Tabla de hallazgos (copia y completa)

| ID | Módulo / pantalla | Qué pasó (descripción) | Heurística | Severidad (0–4) | Evaluador | Evidencia (captura) | Recomendación | Estado |
|---|---|---|---|---|---|---|---|---|
| E-01 | | | H? | | | | | Pendiente |
| E-02 | | | | | | | | |
| E-03 | | | | | | | | |

## Resumen para el informe

| Heurística | N.º de hallazgos | Severidad máxima | Principal problema |
|---|---|---|---|
| H1 Visibilidad del estado | | | |
| H2 Mundo real | | | |
| H3 Control y libertad | | | |
| H4 Consistencia | | | |
| H5 Prevención de errores | | | |
| H6 Reconocer antes que recordar | | | |
| H7 Flexibilidad y eficiencia | | | |
| H8 Diseño minimalista | | | |
| H9 Recuperación de errores | | | |
| H10 Ayuda | | | |
| **Total** | | | |
