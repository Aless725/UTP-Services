import { useMemo, useSyncExternalStore } from 'react'
import { MAX_CUPOS, MIN_CUPOS, PERIODO, seedGroups, type Group, type Modalidad } from './groupsData'

/** Estado persistido: grupos creados por alumnos y a cuáles se unió cada código. */
interface Persisted {
  created: Group[]
  joined: Record<string, string[]>
}

const KEY = 'utp.grupos'

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Persisted
      return { created: p.created ?? [], joined: p.joined ?? {} }
    }
  } catch {
    /* sin almacenamiento */
  }
  return { created: [], joined: {} }
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

export interface GroupView extends Group {
  integrantes: number
  libres: number
  esOrganizador: boolean
  esMiembro: boolean
}

export interface NewGroupInput {
  curso: string
  tema: string
  modalidad: Modalidad
  fecha: string
  inicio: string
  fin: string
  lugar?: string
  enlace?: string
  cupos: number
}

export class JoinError extends Error {
  constructor(public reason: 'offline' | 'full' | 'already') {
    super(reason)
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Valida el formulario de creación. Devuelve un mensaje o null. */
export function validateNewGroup(i: NewGroupInput, now = new Date()): string | null {
  if (!i.curso) return 'Elige un curso.'
  if (i.tema.trim().length < 3) return 'Escribe el nombre u objetivo del grupo.'
  if (!i.fecha) return 'Elige una fecha.'
  if (!i.inicio || !i.fin) return 'Indica la hora de inicio y fin.'
  if (i.fin <= i.inicio) return 'La hora de fin debe ser posterior al inicio.'
  const start = new Date(`${i.fecha}T${i.inicio}:00`)
  if (start.getTime() < now.getTime()) return 'La sesión debe ser en el futuro.'
  if (i.modalidad === 'Virtual') {
    if (!/^https?:\/\/\S+\.\S+/i.test(i.enlace?.trim() ?? '')) return 'Ingresa un enlace válido (https://…).'
  } else if (!i.lugar) {
    return 'Elige una sala.'
  }
  if (i.cupos < MIN_CUPOS || i.cupos > MAX_CUPOS) return `Los cupos van de ${MIN_CUPOS} a ${MAX_CUPOS}.`
  return null
}

function platformOf(url: string): string {
  if (/zoom/i.test(url)) return 'Zoom'
  if (/meet\.google/i.test(url)) return 'Google Meet'
  if (/teams/i.test(url)) return 'Microsoft Teams'
  return 'Enlace de la sesión'
}

export function createGroup(input: NewGroupInput, codigo: string): string {
  const id = `g-${Date.now().toString(36)}`
  const virtual = input.modalidad === 'Virtual'
  const group: Group = {
    id,
    curso: input.curso,
    tema: input.tema.trim(),
    modalidad: input.modalidad,
    fecha: input.fecha,
    inicio: input.inicio,
    fin: input.fin,
    lugar: virtual ? undefined : `${input.lugar} · Lima Centro`,
    sede: virtual ? undefined : 'Lima Centro · Biblioteca',
    enlace: virtual ? input.enlace?.trim() : undefined,
    plataforma: virtual ? platformOf(input.enlace ?? '') : undefined,
    cupos: input.cupos,
    miembros: 1,
    organizador: codigo,
    periodo: PERIODO,
  }
  commit({ ...state, created: [group, ...state.created] })
  return id
}

/** Une al alumno. Falla sin conexión, con grupo lleno o si ya es miembro. */
export async function joinGroup(id: string, codigo: string): Promise<void> {
  await wait(1500)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new JoinError('offline')
  const all = [...state.created, ...seedGroups()]
  const g = all.find((x) => x.id === id)
  if (!g) throw new JoinError('full')
  const current = viewOf(g, codigo, state)
  if (current.esMiembro) throw new JoinError('already')
  if (current.libres <= 0) throw new JoinError('full')
  commit({ ...state, joined: { ...state.joined, [codigo]: [...(state.joined[codigo] ?? []), id] } })
}

function viewOf(g: Group, codigo: string, s: Persisted): GroupView {
  const extra = Object.values(s.joined).filter((ids) => ids.includes(g.id)).length
  const integrantes = g.miembros + extra
  return {
    ...g,
    integrantes,
    libres: Math.max(0, g.cupos - integrantes),
    esOrganizador: g.organizador === codigo,
    esMiembro: g.organizador === codigo || !!s.joined[codigo]?.includes(g.id),
  }
}

/** Lista reactiva de grupos (ordenados por fecha y hora) para el alumno dado. */
export function useGroups(codigo: string): GroupView[] {
  const snap = useSyncExternalStore(subscribe, getSnapshot)
  return useMemo(
    () =>
      [...snap.created, ...seedGroups()]
        .map((g) => viewOf(g, codigo, snap))
        .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio)),
    [snap, codigo],
  )
}
