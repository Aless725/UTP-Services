import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'
import { MAX_CUPOS, MIN_CUPOS, type Group, type Modalidad } from './groupsData'

/** Grupos leídos de Supabase (vista groups_view: ya incluye integrantes y si el alumno es miembro). */
interface Snapshot {
  groups: GroupView[]
  loaded: boolean
}

let state: Snapshot = { groups: [], loaded: false }
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
export function resetGroups() {
  commit({ groups: [], loaded: false })
}

interface Row {
  id: string
  curso: string
  tema: string
  modalidad: Modalidad
  fecha: string
  inicio: string
  fin: string
  lugar: string | null
  sede: string | null
  enlace: string | null
  plataforma: string | null
  cupos: number
  periodo: string
  integrantes: number
  es_miembro: boolean
  es_organizador: boolean
}

const hhmm = (t: string) => t.slice(0, 5)

function fromRow(r: Row): GroupView {
  return {
    id: r.id,
    curso: r.curso,
    tema: r.tema,
    modalidad: r.modalidad,
    fecha: r.fecha,
    inicio: hhmm(r.inicio),
    fin: hhmm(r.fin),
    lugar: r.lugar ?? undefined,
    sede: r.sede ?? undefined,
    enlace: r.enlace ?? undefined,
    plataforma: r.plataforma ?? undefined,
    cupos: r.cupos,
    miembros: r.integrantes,
    periodo: r.periodo,
    integrantes: r.integrantes,
    libres: Math.max(0, r.cupos - r.integrantes),
    esOrganizador: r.es_organizador,
    esMiembro: r.es_miembro,
  }
}

/** Vuelve a leer los grupos desde la base de datos. */
export async function refreshGroups(): Promise<void> {
  const { data, error } = await supabase.from('groups_view').select('*').order('fecha').order('inicio')
  if (error) throw error
  commit({ groups: (data as Row[]).map(fromRow), loaded: true })
}

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

export async function createGroup(input: NewGroupInput): Promise<string> {
  const virtual = input.modalidad === 'Virtual'
  const { data: auth } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('groups')
    .insert({
      curso: input.curso,
      tema: input.tema.trim(),
      modalidad: input.modalidad,
      fecha: input.fecha,
      inicio: input.inicio,
      fin: input.fin,
      lugar: virtual ? null : `${input.lugar} · Lima Centro`,
      sede: virtual ? null : 'Lima Centro · Biblioteca',
      enlace: virtual ? input.enlace?.trim() : null,
      plataforma: virtual ? platformOf(input.enlace ?? '') : null,
      cupos: input.cupos,
      organizador: auth.user?.id,
    })
    .select('id')
    .single()
  if (error) throw error
  await refreshGroups()
  return data.id as string
}

/** Une al alumno. Falla sin conexión, con grupo lleno o si ya es miembro. */
export async function joinGroup(id: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new JoinError('offline')
  const current = state.groups.find((g) => g.id === id)
  if (current?.esMiembro) throw new JoinError('already')
  const { error } = await supabase.rpc('unirse_grupo', { p_id: id })
  if (error) throw new JoinError(error.hint === 'full' ? 'full' : 'offline')
  await refreshGroups()
}

/** Lista reactiva de grupos (ordenados por fecha y hora). Se carga al primer uso. */
export function useGroupsLoaded(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot).loaded
}

export function useGroups(_codigo?: string): GroupView[] {
  const snap = useSyncExternalStore(subscribe, getSnapshot)
  useEffect(() => {
    if (!state.loaded) refreshGroups().catch(() => undefined)
  }, [])
  return useMemo(() => snap.groups, [snap])
}
