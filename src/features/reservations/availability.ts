import { diffDays, parseISO, startOfDay, dayCompact, weekdayAbbr } from '@/lib/date'
import { freeCount, nextAvailableDate, type Reservation } from './rules'
import type { Space } from './spacesData'

/** Duración con la que se resume la disponibilidad en las listas. */
export const summaryDuration = (s: Space): 1 | 2 => (s.tipo === 'sala_grupal' ? 2 : 1)

/** "hoy", "mañana" o "el mié 18". */
export function dayWord(fecha: string, now: Date): string {
  const n = diffDays(startOfDay(now), parseISO(fecha))
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  const d = parseISO(fecha)
  return `el ${weekdayAbbr(d)} ${d.getDate()}`
}

export interface Availability {
  ok: boolean
  text: string
  /** Horarios libres en la fecha elegida. */
  free: number
}

/** Resumen de disponibilidad de un espacio para la fecha elegida. */
export function availabilityOf(
  space: Space,
  fecha: string,
  reservations: Reservation[],
  now: Date,
): Availability {
  const dur = summaryDuration(space)
  const free = freeCount(space, fecha, dur, reservations, now)
  if (free >= 2) return { ok: true, free, text: `${free} horarios libres ${dayWord(fecha, now)}` }
  if (free === 1) return { ok: true, free, text: `Disponible ${dayWord(fecha, now)}` }

  const next = nextAvailableDate(space, fecha, dur, reservations, now)
  if (next && next !== fecha) return { ok: true, free: 0, text: `Disponible ${dayWord(next, now)}` }
  return { ok: false, free: 0, text: 'Sin horarios disponibles' }
}

export { dayCompact }
