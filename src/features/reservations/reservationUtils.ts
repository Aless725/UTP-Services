import { buildIcs, downloadIcs } from '@/lib/ics'
import { endOf, startOf, type Reservation } from './rules'
import { getSpace, longPlace } from './spacesData'

/** Texto que se codifica en el QR de la reserva. */
export const qrPayload = (r: Reservation) => `UTP-RES|${r.codigo}|${r.spaceId}|${r.fecha}|${r.inicio}`

/** "Biblioteca · Piso 3 · 4 integrantes" */
export function placeLine(r: Reservation): string {
  const s = getSpace(r.spaceId)
  if (!s) return ''
  const base = longPlace(s)
  return s.tipo === 'sala_grupal' ? `${base} · ${r.miembros.length} integrantes` : base
}

export function addReservationToCalendar(r: Reservation): void {
  const s = getSpace(r.spaceId)
  downloadIcs(
    `${r.codigo.toLowerCase()}.ics`,
    buildIcs({
      uid: r.codigo,
      title: `Reserva: ${s?.nombre ?? 'Espacio UTP'}`,
      description: `Código ${r.codigo}. Registra tu ingreso con el QR hasta 15 minutos después del inicio.`,
      location: s ? `${longPlace(s)} · ${s.sede}` : undefined,
      start: startOf(r),
      end: endOf(r),
    }),
  )
}

/** "¡Sala reservada!", "¡PC reservado!", "¡Cubículo reservado!" */
export function reservedTitle(tipo: 'sala_grupal' | 'pc' | 'cubiculo'): string {
  return tipo === 'sala_grupal' ? '¡Sala reservada!' : tipo === 'pc' ? '¡PC reservado!' : '¡Cubículo reservado!'
}
