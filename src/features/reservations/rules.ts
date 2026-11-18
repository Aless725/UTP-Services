import { addDays, diffDays, parseISO, startOfDay, toISO } from '@/lib/date'
import { getSpace, type Space, type SpaceType } from './spacesData'

/** Reglas de negocio (parametrizables; en el backend vivirán en la tabla `settings`). */
export const SETTINGS = {
  minMembers: 3,
  maxHours: 2,
  openHour: 8,
  closeHour: 20,
  checkinGraceMin: 15,
  freeCancelMinutes: 60,
  penaltyDays: 7,
  bookingWindowDays: 14,
} as const

export type ReservationStatus = 'confirmada' | 'cancelada' | 'completada' | 'no_show'

export interface Reservation {
  id: string
  /** Código visible: RES-2026-0871 */
  codigo: string
  spaceId: string
  /** Código del alumno que reservó. */
  userId: string
  /** yyyy-mm-dd */
  fecha: string
  inicio: string
  fin: string
  motivo: string
  /** Códigos de alumno (incluye al organizador en salas grupales). */
  miembros: string[]
  estado: ReservationStatus
  creadaEn: string
  canceladaEn?: string
}

export type SlotState = 'libre' | 'ocupado' | 'pasado'
export interface Slot {
  inicio: string
  fin: string
  estado: SlotState
}

// ───────── Utilidades de hora ─────────
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
export const fromMin = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** Date local para una fecha ISO y una hora "HH:MM". */
export function at(fecha: string, hhmm: string): Date {
  const d = parseISO(fecha)
  d.setHours(0, toMin(hhmm), 0, 0)
  return d
}

const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes()

// ───────── Calendario de atención ─────────

/** Las salas grupales no se habilitan los sábados. */
export function isOpenDay(tipo: SpaceType, d: Date): boolean {
  return !(tipo === 'sala_grupal' && d.getDay() === 6)
}

export const MAX_BOOKING_DATE = (today: Date) => addDays(startOfDay(today), SETTINGS.bookingWindowDays)

export function isWithinWindow(d: Date, today: Date): boolean {
  const n = diffDays(today, d)
  return n >= 0 && n <= SETTINGS.bookingWindowDays
}

// ───────── Ocupación ─────────

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 100
}

const BUSY_RATE: Record<SpaceType, number> = { sala_grupal: 30, pc: 38, cubiculo: 30 }

/** Ocupación "de otros alumnos", determinista para que la demo sea estable. */
export function externalBusy(space: Space, fecha: string, hour: number): boolean {
  return hash(`${space.id}|${fecha}|${hour}`) < BUSY_RATE[space.tipo]
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd
}

/** ¿Hay una reserva vigente o actividad externa que choque con el intervalo? (equivale a la restricción de exclusión). */
export function isOccupied(
  space: Space,
  fecha: string,
  startMin: number,
  endMin: number,
  reservations: Reservation[],
): boolean {
  for (let h = Math.floor(startMin / 60); h < Math.ceil(endMin / 60); h++) {
    if (externalBusy(space, fecha, h)) return true
  }
  return reservations.some(
    (r) =>
      r.spaceId === space.id &&
      r.estado === 'confirmada' &&
      r.fecha === fecha &&
      overlaps(startMin, endMin, toMin(r.inicio), toMin(r.fin)),
  )
}

/** Franjas del día para una duración dada (1 o 2 horas). */
export function buildSlots(
  space: Space,
  fecha: string,
  duracionH: number,
  reservations: Reservation[],
  now: Date,
): Slot[] {
  const day = parseISO(fecha)
  const today = startOfDay(now)
  if (!isOpenDay(space.tipo, day) || !isWithinWindow(day, today)) return []

  const isToday = diffDays(today, day) === 0
  const nowMin = minutesOf(now)
  const slots: Slot[] = []
  for (let start = SETTINGS.openHour * 60; start + duracionH * 60 <= SETTINGS.closeHour * 60; start += duracionH * 60) {
    const end = start + duracionH * 60
    const estado: SlotState =
      isToday && start <= nowMin ? 'pasado' : isOccupied(space, fecha, start, end, reservations) ? 'ocupado' : 'libre'
    slots.push({ inicio: fromMin(start), fin: fromMin(end), estado })
  }
  return slots
}

export const freeCount = (
  space: Space,
  fecha: string,
  duracionH: number,
  reservations: Reservation[],
  now: Date,
) => buildSlots(space, fecha, duracionH, reservations, now).filter((s) => s.estado === 'libre').length

/** Primer día (desde `fromISO`, inclusive) con al menos un horario libre. */
export function nextAvailableDate(
  space: Space,
  fromISO: string,
  duracionH: number,
  reservations: Reservation[],
  now: Date,
): string | null {
  const start = parseISO(fromISO)
  for (let i = 0; i <= SETTINGS.bookingWindowDays; i++) {
    const d = toISO(addDays(start, i))
    if (freeCount(space, d, duracionH, reservations, now) > 0) return d
  }
  return null
}

/** Espacios libres en este momento (franja de 1 h que contiene la hora actual). */
export function availableNow(spaces: Space[], reservations: Reservation[], now: Date): number {
  const h = now.getHours()
  if (h < SETTINGS.openHour || h >= SETTINGS.closeHour) return 0
  const fecha = toISO(now)
  return spaces.filter(
    (s) => isOpenDay(s.tipo, now) && !isOccupied(s, fecha, h * 60, (h + 1) * 60, reservations),
  ).length
}

export const isOpenNow = (now: Date) => now.getHours() >= SETTINGS.openHour && now.getHours() < SETTINGS.closeHour

// ───────── Estado y cancelación ─────────

export const startOf = (r: Reservation) => at(r.fecha, r.inicio)
export const endOf = (r: Reservation) => at(r.fecha, r.fin)

export type ViewState = 'proxima' | 'pasada' | 'cancelada'
export function viewStateOf(r: Reservation, now: Date): ViewState {
  if (r.estado === 'cancelada') return 'cancelada'
  if (r.estado !== 'confirmada' || endOf(r).getTime() <= now.getTime()) return 'pasada'
  return 'proxima'
}

/** Cancelación sin penalidad hasta 1 hora antes del inicio. */
export function cancelsWithoutPenalty(r: Reservation, now: Date): boolean {
  return startOf(r).getTime() - now.getTime() >= SETTINGS.freeCancelMinutes * 60000
}

/** Se puede mostrar el QR desde 30 min antes hasta 15 min después del inicio… o siempre mientras esté vigente. */
export function checkinDeadline(r: Reservation): Date {
  return new Date(startOf(r).getTime() + SETTINGS.checkinGraceMin * 60000)
}

// ───────── Validación al reservar ─────────

export type ReservationErrorReason =
  | 'penalty'
  | 'active_exists'
  | 'conflict'
  | 'closed'
  | 'past'
  | 'members'
  | 'duration'
  | 'invalid'

export class ReservationError extends Error {
  constructor(
    public reason: ReservationErrorReason,
    message: string,
  ) {
    super(message)
  }
}

export interface ReservationInput {
  fecha: string
  inicio: string
  fin: string
  miembros: string[]
}

/** Valida todas las reglas. Lanza ReservationError con un mensaje claro para el alumno. */
export function assertCanReserve(
  space: Space,
  input: ReservationInput,
  userId: string,
  reservations: Reservation[],
  penaltyUntil: Date | null,
  now: Date,
): void {
  if (penaltyUntil && penaltyUntil.getTime() > now.getTime()) {
    throw new ReservationError('penalty', 'Tienes una penalidad activa y no puedes reservar por ahora.')
  }

  const start = toMin(input.inicio)
  const end = toMin(input.fin)
  if (!(end > start)) throw new ReservationError('invalid', 'El horario elegido no es válido.')
  if ((end - start) / 60 > SETTINGS.maxHours) {
    throw new ReservationError('duration', `Cada reserva dura como máximo ${SETTINGS.maxHours} horas.`)
  }

  const day = parseISO(input.fecha)
  const today = startOfDay(now)
  if (!isWithinWindow(day, today)) {
    throw new ReservationError('invalid', `Solo puedes reservar hasta ${SETTINGS.bookingWindowDays} días por adelantado.`)
  }
  if (!isOpenDay(space.tipo, day)) {
    throw new ReservationError('closed', 'Ese día este tipo de espacio no está habilitado.')
  }
  if (start < SETTINGS.openHour * 60 || end > SETTINGS.closeHour * 60) {
    throw new ReservationError('closed', 'El horario está fuera de la atención de la biblioteca.')
  }
  if (at(input.fecha, input.inicio).getTime() <= now.getTime()) {
    throw new ReservationError('past', 'Ese horario ya pasó. Elige uno posterior.')
  }

  const hasActive = reservations.some(
    (r) =>
      r.userId === userId &&
      r.estado === 'confirmada' &&
      endOf(r).getTime() > now.getTime() &&
      getSpace(r.spaceId)?.tipo === space.tipo,
  )
  if (hasActive) {
    throw new ReservationError(
      'active_exists',
      `Ya tienes una reserva activa de ${labelOfType(space.tipo)}. Cancélala o espera a que termine.`,
    )
  }

  if (space.tipo === 'sala_grupal') {
    const unique = new Set(input.miembros)
    if (unique.size < SETTINGS.minMembers) {
      throw new ReservationError('members', `La sala requiere mínimo ${SETTINGS.minMembers} integrantes.`)
    }
    if (unique.size > space.capMax) {
      throw new ReservationError('members', `Esta sala admite hasta ${space.capMax} personas.`)
    }
    if (!unique.has(userId)) {
      throw new ReservationError('members', 'El organizador debe estar incluido en la lista.')
    }
  }

  if (isOccupied(space, input.fecha, start, end, reservations)) {
    throw new ReservationError('conflict', 'Ese horario se ocupó mientras reservabas.')
  }
}

export function labelOfType(t: SpaceType): string {
  return t === 'sala_grupal' ? 'sala grupal' : t === 'pc' ? 'PC' : 'cubículo'
}

/** Horarios alternativos cercanos cuando hay conflicto. */
export function suggestAlternatives(
  space: Space,
  fecha: string,
  duracionH: number,
  reservations: Reservation[],
  now: Date,
  max = 3,
): { fecha: string; inicio: string; fin: string }[] {
  const out: { fecha: string; inicio: string; fin: string }[] = []
  const start = parseISO(fecha)
  for (let i = 0; i <= SETTINGS.bookingWindowDays && out.length < max; i++) {
    const d = toISO(addDays(start, i))
    for (const s of buildSlots(space, d, duracionH, reservations, now)) {
      if (s.estado === 'libre') out.push({ fecha: d, inicio: s.inicio, fin: s.fin })
      if (out.length >= max) break
    }
  }
  return out
}
