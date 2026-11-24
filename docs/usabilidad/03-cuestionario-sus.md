# 3. Cuestionario SUS (System Usability Scale)

**Qué es:** un cuestionario de 10 afirmaciones que mide la usabilidad percibida de un sistema. Da un puntaje de 0 a 100. Es rápido (2 minutos) y se usa mucho, por eso permite comparar con otros productos.

**Cuándo:** al terminar todas las tareas, antes de cualquier comentario del moderador. Una copia por participante.

## Instrucciones para el participante

> Marca qué tan de acuerdo estás con cada afirmación sobre **UTP+ Service**, del **1 (totalmente en desacuerdo)** al **5 (totalmente de acuerdo)**. Responde con lo primero que pienses; no hay respuestas correctas.

| # | Afirmación | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Creo que me gustaría usar esta aplicación con frecuencia. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Encontré la aplicación innecesariamente compleja. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Pensé que la aplicación era fácil de usar. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Creo que necesitaría la ayuda de una persona con conocimientos técnicos para usar la aplicación. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Encontré que las diversas funciones de la aplicación estaban bien integradas. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | Pensé que había demasiada inconsistencia en la aplicación. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | Imagino que la mayoría de las personas aprendería a usar esta aplicación muy rápidamente. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | Encontré la aplicación muy incómoda de usar. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 9 | Me sentí muy seguro(a) usando la aplicación. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 | Necesité aprender muchas cosas antes de poder usar la aplicación. | ☐ | ☐ | ☐ | ☐ | ☐ |

**Pregunta extra (opcional, no entra en el puntaje):** «¿Qué tan útil te pareció el asistente de voz?» (1 = nada útil, 5 = muy útil).

## Cómo calcular el puntaje

1. En las afirmaciones **impares** (1, 3, 5, 7, 9): contribución = respuesta − 1.
2. En las afirmaciones **pares** (2, 4, 6, 8, 10): contribución = 5 − respuesta.
3. Suma las 10 contribuciones (el máximo es 40).
4. Multiplica la suma por **2,5**. El resultado va de 0 a 100.

**Ejemplo:** respuestas 4, 2, 5, 1, 4, 2, 5, 1, 4, 2 → contribuciones 3, 3, 4, 4, 3, 3, 4, 4, 3, 3 = 34 → 34 × 2,5 = **85**.

### En una hoja de cálculo

Con las respuestas del participante en las celdas `B2:K2` (de la afirmación 1 a la 10):

```
=2,5*((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))
```

(En Excel con configuración regional en español, escribe `2,5`; en inglés, `2.5`.)

## Registro de los 5 participantes

| Participante | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | Puntaje SUS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | | | | | | | | | | | |
| P2 | | | | | | | | | | | |
| P3 | | | | | | | | | | | |
| P4 | | | | | | | | | | | |
| P5 | | | | | | | | | | | |
| **Promedio** | | | | | | | | | | | |

> En la tabla, «P1 a P10» son las **afirmaciones** (columnas), no los participantes (filas).

## Cómo interpretar el resultado

| Puntaje SUS | Valoración (referencia) |
|---|---|
| ≥ 85 | Excelente |
| 80,3 – 84,9 | Muy buena (nota A) |
| 68 – 80,2 | Buena; 68 es el promedio de la industria |
| 51 – 67,9 | Aceptable, con margen de mejora |
| < 51 | Mala: hay problemas importantes |

Con una muestra de 5 personas, tómalo como un indicador orientativo, no como una cifra estadística. Compleméntalo con las tareas, los tiempos y los comentarios de las pruebas (`02-pruebas-con-usuarios.md`).

### Qué reportar

- El puntaje de cada participante y el promedio.
- Las afirmaciones con peor resultado (revela dónde está el problema: por ejemplo, pares altos indican complejidad o inconsistencia).
- Qué se cambió en la app a partir de esos resultados.
