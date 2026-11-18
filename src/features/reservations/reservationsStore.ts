import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'
import { addDays, startOfDay, toISO } from '@/lib/date'
import { ReservationError, SETTINGS, type Reservation, type ReservationErrorReason, type ReservationInput } from './rules'

/**
 * Reservas leídas de Supabase.
 *  - mine: las del alumno (como organizador o integrante), vía mis_reservas().
 *  - occupied: franjas ocupadas por cualquiera, vía ocupacion_rango() (sin datos personales).
 * Las reglas de negocio se validan en el servidor (crear_reserva / cancelar_reserva).
 */
interface Snapshot {
  mine: Reservation[]
  occupied: Reservation[]
  penaltyUntil: string | null
  loaded: boolean
}

const EMPTY: Snapshot = { mine: [], occupied: [], penaltyUntil: null, loaded: false }
let state: Snapshot = EMPTY
const listeners = new Set<() => void>()

function commit(next: Snapshot) {
  state = next
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const getSnapshot = () => state

/** Limpia la caché (cierre de sesión). */
export function resetReservations() {
  commit(EMPTY)
}

interface MineRow {
  id: string
  codigo: string
  space_id: string
  organizador: string
  fecha: string
  inicio: string
  fin: string
  motivo: string
  miembros: string[]
  estado: Reservation['estado']
  creada_en: string
  cancelada_en: string | null
}
interface OccRow {
  id: string
  space_id: string
  fecha: string
  inicio: string
  fin: string
}

/** Recarga reservas, ocupación y penalidad. */
export async function refreshReservations(): Promise<void> {
  const today = startOfDay(new Date())
  const [mineRes, occRes, penRes] = await Promise.all([
    supabase.rpc('mis_reservas'),
    supabase.rpc('ocupacion_rango', {
      p_desde: toISO(today),
      p_hasta: toISO(addDays(today, SETTINGS.bookingWindowDays + 1)),
    }),
    supabase
      .from('penalties')
      .select('hasta')
      .gt('hasta', new Date().toISOString())
      .order('hasta', { ascending: false })
      .limit(1),
  ])
  if (mineRes.error) throw mineRes.error
  if (occRes.error) throw occRes.error

  const mine: Reservation[] = (mineRes.data as MineRow[]).map((r) => ({
    id: r.id,
    codigo: r.codigo,
    spaceId: r.space_id,
    userId: r.organizador,
    fecha: r.fecha,
    inicio: r.inicio,
    fin: r.fin,
    motivo: r.motivo,
    miembros: r.miembros,
    estado: r.estado,
    creadaEn: r.creada_en,
    canceladaEn: r.cancelada_en ?? undefined,
  }))
  const own = new Set(mine.map((r) => r.id))
  const occupied: Reservation[] = (occRes.data as OccRow[])
    .filter((o) => !own.has(o.id))
    .map((o) => ({
      id: o.id,
      codigo: '',
      spaceId: o.space_id,
      userId: '',
      fecha: o.fecha,
      inicio: o.inicio,
      fin: o.fin,
      motivo: '',
      miembros: [],
      estado: 'confirmada',
      creadaEn: '',
    }))
  const hasta = (penRes.data as { hasta: string }[] | null)?.[0]?.hasta ?? null
  commit({ mine, occupied, penaltyUntil: hasta, loaded: true })
}

export interface CreateInput extends ReservationInput {
  spaceId: string
  motivo: string
}

const REASONS: ReservationErrorReason[] = [
  'penalty',
  'active_exists',
  'conflict',
  'closed',
  'past',
  'members',
  'duration',
  'invalid',
]

function toRuleError(err: { message: string; hint?: string | null; code?: string }): Error {
  const hint = err.hint as ReservationErrorReason | null | undefined
  if (err.code === 'P0001' && hint && REASONS.includes(hint)) return new ReservationError(hint, err.message)
  return new ReservationError('invalid', 'No pudimos completar la operación. Inténtalo de nuevo.')
}

/** Crea la reserva en el servidor; si incumple una regla lanza ReservationError con el motivo. */
export async function createReservation(input: CreateInput): Promise<Reservation> {
  const { data, error } = await supabase.rpc('crear_reserva', {
    p_space_id: input.spaceId,
    p_fecha: input.fecha,
    p_inicio: input.inicio,
    p_fin: input.fin,
    p_motivo: input.motivo,
    p_miembros: input.miembros,
  })
  if (error) {
    // Si cambió la ocupación, se refresca para que las alternativas sean correctas.
    await refreshReservations().catch(() => undefined)
    throw toRuleError(error)
  }
  await refreshReservations()
  const codigo = (data as { codigo: string }).codigo
  const created = state.mine.find((r) => r.codigo === codigo)
  if (!created) throw new ReservationError('invalid', 'La reserva se creó pero no pudimos leerla.')
  return created
}

export interface CancelResult {
  penalty: boolean
  until?: Date
}

/** Cancela una reserva. Si falta menos de 1 h para el inicio, el servidor aplica la penalidad. */
export async function cancelReservation(id: string): Promise<CancelResult> {
  const { data, error } = await supabase.rpc('cancelar_reserva', { p_id: id })
  if (error) throw toRuleError(error)
  await refreshReservations()
  const free = data as boolean
  return { penalty: !free, until: !free && state.penaltyUntil ? new Date(state.penaltyUntil) : undefined }
}

/** Datos reactivos: todas las franjas (para disponibilidad), las del alumno y su penalidad. Se cargan al primer uso. */
export function useReservationData(userId: string) {
  const snap = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (!userId) return
    if (!state.loaded) refreshReservations().catch(() => undefined)
    // La ocupación cambia por otros alumnos: se actualiza al volver a la pestaña.
    const onVisible = () => document.visibilityState === 'visible' && refreshReservations().catch(() => undefined)
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [userId])

  return useMemo(() => {
    const until = snap.penaltyUntil ? new Date(snap.penaltyUntil) : null
    return {
      all: [...snap.mine, ...snap.occupied],
      mine: snap.mine,
      penaltyUntil: until && until.getTime() > Date.now() ? until : null,
      loaded: snap.loaded,
    }
  }, [snap])
}
