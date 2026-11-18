import { useMemo, useSyncExternalStore } from 'react'
import { addDays } from '@/lib/date'
import {
  ReservationError,
  SETTINGS,
  assertCanReserve,
  cancelsWithoutPenalty,
  startOf,
  type Reservation,
  type ReservationInput,
} from './rules'
import { getSpace } from './spacesData'

/** Estado persistido (en el backend serán las tablas reservations y penalties). */
interface Persisted {
  reservations: Reservation[]
  /** Código de alumno → fecha ISO hasta la que no puede reservar. */
  penalties: Record<string, string>
  counter: number
}

const KEY = 'utp.reservas'
// El primer código emitido es RES-<año>-0871, igual que en el diseño.
const COUNTER_START = 870

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Persisted
      return {
        reservations: p.reservations ?? [],
        penalties: p.penalties ?? {},
        counter: p.counter ?? COUNTER_START,
      }
    }
  } catch {
    /* sin almacenamiento */
  }
  return { reservations: [], penalties: {}, counter: COUNTER_START }
}

let state: Persisted = load()
const listeners = new Set<() => void>()

function commit(next: Persisted) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const getSnapshot = () => state

export interface CreateInput extends ReservationInput {
  spaceId: string
  motivo: string
}

/** Crea la reserva si cumple todas las reglas; si no, lanza ReservationError. */
export function createReservation(input: CreateInput, userId: string, now = new Date()): Reservation {
  const space = getSpace(input.spaceId)
  if (!space) throw new ReservationError('invalid', 'No encontramos ese espacio.')

  const penaltyRaw = state.penalties[userId]
  assertCanReserve(space, input, userId, state.reservations, penaltyRaw ? new Date(penaltyRaw) : null, now)

  const counter = state.counter + 1
  const reservation: Reservation = {
    id: `r-${now.getTime().toString(36)}-${counter}`,
    codigo: `RES-${now.getFullYear()}-${String(counter).padStart(4, '0')}`,
    spaceId: input.spaceId,
    userId,
    fecha: input.fecha,
    inicio: input.inicio,
    fin: input.fin,
    motivo: input.motivo,
    miembros: space.tipo === 'sala_grupal' ? Array.from(new Set(input.miembros)) : [userId],
    estado: 'confirmada',
    creadaEn: now.toISOString(),
  }
  commit({ ...state, counter, reservations: [reservation, ...state.reservations] })
  return reservation
}

export interface CancelResult {
  penalty: boolean
  until?: Date
}

/** Cancela una reserva. Si falta menos de 1 h para el inicio, aplica 7 días de penalidad. */
export function cancelReservation(id: string, userId: string, now = new Date()): CancelResult {
  const r = state.reservations.find((x) => x.id === id && x.userId === userId)
  if (!r || r.estado !== 'confirmada') throw new ReservationError('invalid', 'Esta reserva ya no se puede cancelar.')
  if (startOf(r).getTime() <= now.getTime()) {
    throw new ReservationError('invalid', 'La reserva ya comenzó y no se puede cancelar.')
  }

  const penalty = !cancelsWithoutPenalty(r, now)
  const until = penalty ? addDays(now, SETTINGS.penaltyDays) : undefined
  commit({
    ...state,
    reservations: state.reservations.map((x) =>
      x.id === id ? { ...x, estado: 'cancelada', canceladaEn: now.toISOString() } : x,
    ),
    penalties: until ? { ...state.penalties, [userId]: until.toISOString() } : state.penalties,
  })
  return { penalty, until }
}

/** Datos reactivos: todas las reservas (para disponibilidad), las del alumno y su penalidad. */
export function useReservationData(userId: string) {
  const snap = useSyncExternalStore(subscribe, getSnapshot)
  return useMemo(() => {
    const mine = snap.reservations
      .filter((r) => r.userId === userId || r.miembros.includes(userId))
      .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio))
    const raw = snap.penalties[userId]
    const until = raw ? new Date(raw) : null
    return {
      all: snap.reservations,
      mine,
      penaltyUntil: until && until.getTime() > Date.now() ? until : null,
    }
  }, [snap, userId])
}
