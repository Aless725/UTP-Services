export interface MoreItem {
  slug: string
  /** Ruta propia si el flujo ya está construido. */
  to?: string
  label: string
  icon: string
}

/** Opciones del menú "Más de UTP+". */
export const moreItems: MoreItem[] = [
  { slug: 'tramites', label: 'Trámites', icon: 'description', to: '/tramites' },
  { slug: 'talleres', label: 'Talleres', icon: 'event_note', to: '/talleres' },
  { slug: 'biblioteca', label: 'Biblioteca', icon: 'menu_book', to: '/biblioteca' },
  { slug: 'reserva-de-equipos', label: 'Reserva de equipos', icon: 'event_available', to: '/equipos' },
  { slug: 'empleabilidad', label: 'Empleabilidad', icon: 'work', to: '/empleabilidad' },
  { slug: 'grupos', label: 'Grupos', icon: 'group', to: '/grupos' },
  { slug: 'espacios', label: 'Espacios', icon: 'location_on', to: '/reservas' },
  { slug: 'beneficios', label: 'Beneficios', icon: 'sell', to: '/beneficios' },
]

export const extraSections: Record<string, string> = {
  soporte: 'Soporte',
  anuncios: 'Anuncios',
  historial: 'Historial y constancias',
  curso: 'Detalle del curso',
}

export const sectionTitle = (slug: string) =>
  moreItems.find((i) => i.slug === slug)?.label ?? extraSections[slug] ?? 'Sección'
