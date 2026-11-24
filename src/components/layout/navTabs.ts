import { moreItems } from '@/features/more/items'

export const tabs = [
  { to: '/inicio', label: 'Inicio', icon: 'home' },
  { to: '/calendario', label: 'Calendario', icon: 'calendar_month' },
  { to: '/cursos', label: 'Cursos', icon: 'menu_book' },
  { to: '/pagos', label: 'Pagos', icon: 'credit_card' },
]

/** Pantallas que se abren desde el inicio (perfil, avisos, correo, asistente): la pestaña activa sigue siendo Inicio. */
const INICIO_CHILDREN = ['/perfil', '/anuncios', '/soporte', '/notificaciones', '/correo']

/** ¿Estamos en un módulo de "Más de UTP+" (Trámites, Talleres, Empleabilidad, Grupos, Espacios, Beneficios…)? */
export const isMoreRoute = (pathname: string) =>
  pathname.startsWith('/mas') || moreItems.some((i) => i.to && pathname.startsWith(i.to))

export const activeOf = (to: string, isActive: boolean, pathname: string) =>
  isActive || (to === '/inicio' && INICIO_CHILDREN.some((p) => pathname.startsWith(p)))

/** Clases del botón "+" cuando estamos dentro de uno de sus módulos: un aro que lo marca como seleccionado. */
export const MORE_ACTIVE_RING = 'ring-2 ring-primary/35 ring-offset-2 ring-offset-card'
