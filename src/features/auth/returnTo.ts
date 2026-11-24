const APP_DESTINATION = /^\/(?:inicio|calendario|cursos|pagos|grupos|perfil|mas|reservas|anuncios|soporte|notificaciones|correo|tramites|beneficios|empleabilidad|talleres|equipos)(?:\/[A-Za-z0-9_-]+)*\/?$/
const UNSAFE_CHARACTER = /[\\\u0000-\u001f\u007f]/

/** Conserva destinos de la app, nunca URLs externas, rutas de acceso ni segmentos codificados. */
export function safeReturnTo(input: unknown): string {
  if (typeof input !== 'string' || input.length > 2048 || input.trim() !== input || UNSAFE_CHARACTER.test(input)) {
    return '/inicio'
  }
  const pathname = input.split(/[?#]/, 1)[0]
  if (!APP_DESTINATION.test(pathname)) return '/inicio'
  try {
    // Se admiten filtros codificados en la búsqueda; los caracteres de control y barras inversas no.
    if (UNSAFE_CHARACTER.test(decodeURIComponent(input))) return '/inicio'
  } catch {
    return '/inicio'
  }
  return input
}
