import { useCallback, useSyncExternalStore } from 'react'
import { addDays, startOfDay, toISO } from '@/lib/date'
import { SETTINGS } from './rules'
import type { Sede } from './spacesData'

/** Borrador de la reserva en curso. Se conserva si el alumno sale y vuelve. */
export interface Draft {
  sede: Sede
  fecha: string
  duracion: 1 | 2
  inicio: string | null
  motivo: string
  miembros: string[]
}

const KEY = 'utp.reservas.borrador'

/** Fecha inicial: hoy, o mañana si ya no queda ninguna franja de 1 hora por reservar. */
function defaultDate(): string {
  const now = new Date()
  const base = startOfDay(now)
  return toISO(now.getHours() >= SETTINGS.closeHour - 1 ? addDays(base, 1) : base)
}

const fresh = (): Draft => ({
  sede: 'Lima Centro',
  fecha: defaultDate(),
  duracion: 2,
  inicio: null,
  motivo: '',
  miembros: [],
})

function load(): Draft {
  const base = fresh()
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return base
    const d = { ...base, ...(JSON.parse(raw) as Partial<Draft>) }
    // Si el borrador quedó de un día anterior, vuelve a hoy.
    if (d.fecha < base.fecha) return { ...d, fecha: base.fecha, inicio: null }
    return d
  } catch {
    return base
  }
}

let draft: Draft = load()
const listeners = new Set<() => void>()

function commit(next: Draft) {
  draft = next
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useDraft() {
  const value = useSyncExternalStore(subscribe, () => draft)
  const patch = useCallback((p: Partial<Draft>) => commit({ ...draft, ...p }), [])
  /** Limpia el borrador conservando la sede elegida. */
  const reset = useCallback(() => commit({ ...fresh(), sede: draft.sede }), [])
  return { draft: value, patch, reset }
}
