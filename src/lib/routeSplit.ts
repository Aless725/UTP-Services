/**
 * Reparte la URL entre el panel maestro (lista) y el de detalle cuando la app
 * se muestra a dos paneles. La URL sigue siendo la única fuente de verdad.
 */

export interface MasterLocation {
  pathname: string
  search: string
}

const APP_PATH = /^\/(inicio|calendario|cursos|pagos|grupos|perfil|mas|reservas|anuncios|soporte)(\/|$)/
const DETAIL_PATH = [
  /^\/cursos\/[^/]+/,
  /^\/grupos\/[^/]+/,
  /^\/anuncios\/[^/]+/,
  /^\/perfil\/accesibilidad\/?$/,
  /^\/mas\/[^/]+\/?$/,
  /^\/reservas\/(espacio|confirmada)\//,
]

/** ¿Es una pantalla de la app (con sesión), no del acceso ni del onboarding? */
export const isAppPath = (p: string) => APP_PATH.test(p)

/** ¿Es una pantalla que en dos paneles se abre en el panel derecho? */
export const isDetailPath = (p: string) => DETAIL_PATH.some((re) => re.test(p))

/** Panel izquierdo que corresponde a un detalle. */
export function masterFor(detail: string, last: MasterLocation | null): MasterLocation {
  if (/^\/grupos/.test(detail)) {
    // Conserva la pestaña (Explorar / Mis grupos) si la lista ya estaba abierta.
    return { pathname: '/grupos', search: last?.pathname === '/grupos' ? last.search : '' }
  }
  if (/^\/anuncios/.test(detail)) return { pathname: '/anuncios', search: '' }
  if (/^\/perfil/.test(detail)) return { pathname: '/perfil', search: '' }
  if (/^\/cursos/.test(detail)) return { pathname: '/cursos', search: '' }
  if (/^\/reservas/.test(detail)) {
    // Los pasos se abren junto a la pantalla de reservas desde donde se empezó.
    const keep = last && /^\/reservas/.test(last.pathname) && !isDetailPath(last.pathname)
    return keep ? last : { pathname: '/reservas', search: '' }
  }
  // Opciones de "Más de UTP+": se abren junto a la pantalla desde donde se invocó el menú.
  if (last && !isDetailPath(last.pathname) && isAppPath(last.pathname)) return last
  return { pathname: '/inicio', search: '' }
}

/** Pantalla complementaria del panel derecho cuando no hay un detalle abierto. */
export function companionFor(master: string): 'calendario' | 'cursos' | null {
  if (master === '/inicio' || master === '/cursos') return 'calendario'
  if (master === '/calendario') return 'cursos'
  return null
}
