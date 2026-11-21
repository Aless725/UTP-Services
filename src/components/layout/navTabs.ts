export const tabs = [
  { to: '/inicio', label: 'Inicio', icon: 'home' },
  { to: '/calendario', label: 'Calendario', icon: 'calendar_month' },
  { to: '/cursos', label: 'Cursos', icon: 'menu_book' },
  { to: '/pagos', label: 'Pagos', icon: 'credit_card' },
]

/** Secciones que se abren desde "Más de UTP+" o el perfil: la pestaña activa sigue siendo Inicio. */
const INICIO_CHILDREN = ['/perfil', '/grupos', '/mas', '/reservas', '/anuncios', '/soporte', '/notificaciones', '/correo', '/tramites', '/beneficios', '/empleabilidad']

export const activeOf = (to: string, isActive: boolean, pathname: string) =>
  isActive || (to === '/inicio' && INICIO_CHILDREN.some((p) => pathname.startsWith(p)))
