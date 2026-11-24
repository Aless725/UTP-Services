# 5. Checklist de accesibilidad (WCAG 2.2 AA)

**Objetivo:** comprobar que UTP+ cumple los criterios básicos de accesibilidad y de diseño inclusivo que pide el enunciado del curso.

**Cómo usarlo:** la columna «En la app» dice lo que el equipo ya implementó en el código. La columna «Verificado» es para marcar lo que **tú comprobaste en la práctica** (con fecha y quién lo hizo). Lo implementado no sustituye la verificación.

Leyenda: ✅ implementado · ⚠️ parcial · ⬜ pendiente de comprobar.

## Percepción

| Criterio | Cómo comprobarlo | En la app | Verificado |
|---|---|---|---|
| **Contraste de texto** ≥ 4,5:1 (1.4.3) | Chrome DevTools → Inspeccionar → contraste, o la herramienta WebAIM Contrast Checker, con los colores de texto principal, secundario y rojo de marca | ✅ Colores definidos con tokens y modo de **alto contraste** | ⬜ |
| **Texto ajustable** hasta 200 % sin perder contenido (1.4.4, 1.4.10) | Perfil → Accesibilidad → tamaño de texto al máximo (150 %) y revisar que nada se corte; también el zoom del navegador | ✅ Tamaño de 85 % a 150 % que escala toda la interfaz; probado a 320 px de ancho | ⬜ |
| **No depender solo del color** (1.4.1) | Activar los modos de daltonismo (protanopia, deuteranopia, tritanopia) y revisar estados (pagado/pendiente, disponible/ocupado) | ✅ Los estados llevan texto e ícono además del color; hay 3 modos de daltonismo | ⬜ |
| **Modo oscuro** legible | Activar el modo oscuro y recorrer las pantallas | ✅ Tema oscuro con los mismos tokens | ⬜ |
| **Imágenes y íconos con alternativa** (1.1.1) | Revisar que los íconos que informan tengan etiqueta (`aria-label`) y los decorativos estén ocultos | ✅ Íconos con etiqueta si informan; los decorativos con `aria-hidden`; las fotos de Beneficios con texto alternativo | ⬜ |
| **Orientación** (1.3.4) | Girar el celular y el iPad | ✅ Funciona en vertical y horizontal (barra lateral en horizontal) | ⬜ |
| **Sin parpadeos ni movimiento molesto** (2.3.1, 2.3.3) | Activar «Reducir movimiento» en la app y en el sistema | ✅ Opción propia y respeto de `prefers-reduced-motion`; solo se animan `transform` y `opacity` | ⬜ |

## Operación

| Criterio | Cómo comprobarlo | En la app | Verificado |
|---|---|---|---|
| **Tamaño del área táctil** ≥ 44 px (2.5.8 y buena práctica de Apple) | Probar con el dedo los botones pequeños: «+», filtros, enlaces dentro del texto | ✅ Botones y filtros de 44 px o más; se corrigieron los enlaces del asistente | ⬜ |
| **Teclado** (2.1.1) | En escritorio con Tab, Shift+Tab, Enter y Esc recorrer pantallas, hojas y diálogos | ⚠️ Foco visible y cierre con Esc en hojas y diálogos; falta recorrer todo | ⬜ |
| **Foco visible** (2.4.7) | Navegar con Tab y ver el contorno | ✅ Contorno de foco con el color de marca en todos los botones y enlaces | ⬜ |
| **Orden del foco y de lectura** (1.3.2, 2.4.3) | Tab en orden lógico; los diálogos atrapan el foco | ⚠️ Los diálogos enfocan su botón principal; falta comprobar el orden en todas las pantallas | ⬜ |
| **Alternativa a los gestos complejos** (2.5.1) | Verificar que todo se pueda hacer con toques simples | ✅ Los gestos (arrastrar una hoja, deslizar el onboarding) tienen botón equivalente | ⬜ |
| **La voz no es el único canal** | Hacer con toques todo lo que hace el asistente | ✅ Cada acción del asistente existe como pantalla táctil; siempre se puede escribir | ⬜ |
| **Tiempo suficiente** (2.2.1) | Revisar que no haya acciones con límite de tiempo | ✅ No hay temporizadores que expulsen al usuario; la voz graba hasta 30 s y tiene alternativa de texto | ⬜ |

## Comprensión

| Criterio | Cómo comprobarlo | En la app | Verificado |
|---|---|---|---|
| **Idioma declarado** (3.1.1) | Revisar el atributo `lang` del documento | ✅ `lang="es"` | ⬜ |
| **Etiquetas en los campos** (3.3.2) | Revisar que cada campo tenga etiqueta visible | ✅ Formularios con etiqueta y ejemplo | ⬜ |
| **Errores identificados y con sugerencia** (3.3.1, 3.3.3) | Provocar errores: campos vacíos, horario ocupado, sin conexión | ✅ Mensajes en español claro y los datos se conservan | ⬜ |
| **Prevención de errores en acciones importantes** (3.3.4) | Cancelar una reserva o enviar una solicitud | ✅ Confirmación antes de cancelar y propuesta con botón antes de que el asistente ejecute | ⬜ |
| **Navegación consistente** (3.2.3, 3.2.4) | Comparar encabezados, filtros y botones entre módulos | ✅ Mismos componentes y posiciones en todos los módulos | ⬜ |

## Robustez y lectores de pantalla

| Criterio | Cómo comprobarlo | En la app | Verificado |
|---|---|---|---|
| **Roles y estados** (4.1.2) | Activar **VoiceOver** (iPhone: Ajustes → Accesibilidad → VoiceOver) y recorrer Inicio, Reservar equipo, Trámites y el asistente | ⚠️ Pestañas, filtros, listas y diálogos con `role` y `aria-*`; falta probarlo con VoiceOver real | ⬜ |
| **Mensajes de estado anunciados** (4.1.3) | Con VoiceOver, ver si anuncia avisos de «sin conexión», confirmaciones y errores | ✅ Avisos con `role="status"` / `role="alert"` | ⬜ |
| **Encabezados y regiones** (1.3.1, 2.4.6) | Rotor de VoiceOver → Encabezados | ✅ Un `h1` por pantalla y secciones con título | ⬜ |
| **Zoom del navegador y reflujo** (1.4.10) | Zoom al 200 % en escritorio | ✅ Diseño adaptable sin barra de desplazamiento horizontal | ⬜ |

## Pruebas rápidas recomendadas (15 minutos)

1. **Texto al 150 %** y recorrer Cursos, Pagos y Reservar equipo.
2. **Modo daltonismo + alto contraste** y ver una lista con estados.
3. **VoiceOver** en el asistente: enviar un mensaje y confirmar una propuesta.
4. **Teclado** en escritorio: abrir «Más de UTP+», navegar con Tab y cerrar con Esc.
5. **Reducir movimiento** activado: confirmar que no hay animaciones bruscas.

## Resultado

- Criterios verificados: __ de __.
- Problemas encontrados (pásalos a la tabla de hallazgos de `04-plantilla-de-resultados.md`): ____________________
