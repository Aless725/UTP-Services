# Accesibilidad

Resumen de lo que la app ya hace por la accesibilidad y de lo que falta comprobar a mano. La referencia es WCAG 2.2 nivel AA.

## Lo que ya está hecho

- **Letra:** el tamaño se puede ajustar del 85 % al 150 % desde Perfil → Accesibilidad y toda la interfaz se adapta. También hay una opción de texto en negrita.
- **Colores:** hay tres modos para daltonismo (protanopia, deuteranopia y tritanopia), un modo de alto contraste y modo oscuro. Los estados no dependen solo del color: llevan texto e ícono (por ejemplo «Pagado», «Pendiente», «Ocupado»).
- **Movimiento:** se puede reducir desde la app y también se respeta la opción del sistema. Las animaciones usan solo opacidad y desplazamiento.
- **Botones y toques:** los botones y filtros miden al menos 44 px de alto y tienen foco visible al navegar con teclado.
- **Lectores de pantalla:** los íconos que informan tienen etiqueta, los decorativos están ocultos, cada pantalla tiene un título principal y los avisos (sin conexión, confirmaciones, errores) están marcados para que se anuncien.
- **Voz:** nunca es la única forma de hacer algo. Todo lo que hace el asistente también se hace tocando, y siempre se puede escribir.
- **Formularios:** cada campo tiene su etiqueta y, si hay un error, el mensaje dice qué pasó y se conservan los datos.
- **Orientación y pantallas:** funciona en vertical y horizontal, en celular, iPad y plegables, sin barra de desplazamiento horizontal.
- **Idioma:** la página declara que está en español.

## Lo que hay que comprobar

Marcar cada punto cuando se pruebe, con la fecha y quién lo hizo.

- [ ] Contraste de los textos (principal, secundario y rojo de marca) con Chrome DevTools o WebAIM Contrast Checker. Debe ser de al menos 4,5 a 1.
- [ ] Letra al 150 %: recorrer Cursos, Pagos y Reservar equipo y revisar que nada se corte.
- [ ] Modo daltonismo y alto contraste: revisar una lista con estados.
- [ ] Modo oscuro: recorrer las pantallas principales.
- [ ] Reducir movimiento: confirmar que no quedan animaciones bruscas.
- [ ] Teclado en escritorio: Tab y Shift+Tab por las pantallas, abrir «Más de UTP+» y cerrar con Esc.
- [ ] VoiceOver en iPhone (Ajustes → Accesibilidad): recorrer Inicio, Reservar equipo, Trámites y el asistente, y ver si anuncia bien los botones y los avisos. Es lo único que todavía no se probó con un lector real.
- [ ] Girar el celular y abrir la app en un iPad.

## Resultado

Puntos comprobados: __ de 8. Problemas encontrados (pasarlos a la tabla de la evaluación heurística): ______________________
