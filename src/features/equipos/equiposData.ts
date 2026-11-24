import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { addDays, dayShort, parseISO, startOfDay, toISO } from '@/lib/date'

// ───────────────────────── Reglas (el servidor las valida; aquí solo se reflejan) ─────────────────────────

export const HORA_ABRE = 8
export const HORA_CIERRA = 20
export const MAX_HORAS = 4
export const DIAS_ANTICIPACION = 30
export const CANCELACION_GRATIS_MIN = 60

// ───────────────────────── Tipos ─────────────────────────

export type TipoEquipo = 'laptop' | 'computadora' | 'tablet'

export const TIPOS: Record<TipoEquipo, { label: string; plural: string; icon: string }> = {
  laptop: { label: 'Laptop', plural: 'Laptops', icon: 'laptop_mac' },
  computadora: { label: 'Computadora', plural: 'Computadoras', icon: 'desktop_windows' },
  tablet: { label: 'Tablet', plural: 'Tablets', icon: 'tablet_mac' },
}

export interface Equipo {
  id: string
  tipo: TipoEquipo
  nombre: string
  descripcion: string
  ubicacion: string
  sede: string
  procesador: string
  ram: string
  almacenamiento: string
  sistema: string
  software: string[]
}

export type EstadoReserva = 'confirmada' | 'cancelada'

export interface ReservaEquipo {
  id: string
  codigo: string
  equipoId: string
  /** AAAA-MM-DD (hora de Lima). */
  fecha: string
  inicio: string
  fin: string
  estado: EstadoReserva
  creada: string
  cancelada: string | null
}

export interface Ocupada {
  equipment_id: string
  fecha: string
  inicio: string
  fin: string
}

// ───────────────────────── Lecturas ─────────────────────────

const equiposKey = ['equipos'] as const
const misKey = ['equipos-mis'] as const
const ocupacionKey = (desde: string, hasta: string) => ['equipos-ocupacion', desde, hasta] as const

interface EquipoRow {
  id: string
  tipo: TipoEquipo
  nombre: string
  descripcion: string
  ubicacion: string
  procesador: string
  ram: string
  almacenamiento: string
  sistema: string
  software: string[] | null
  campuses: { nombre: string } | { nombre: string }[] | null
}

/** Catálogo de equipos. Cambia poco: se guarda 10 minutos. */
export function useEquipos() {
  return useQuery({
    queryKey: equiposKey,
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<Equipo[]> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, tipo, nombre, descripcion, ubicacion, procesador, ram, almacenamiento, sistema, software, campuses(nombre)')
        .order('orden')
      if (error) throw error
      return (data as unknown as EquipoRow[]).map((r) => {
        const c = Array.isArray(r.campuses) ? r.campuses[0] : r.campuses
        return { ...r, sede: c?.nombre ?? '', software: r.software ?? [] }
      })
    },
  })
}

/** Franjas ocupadas (de cualquier alumno, sin datos personales) en un rango de fechas. */
export function useOcupacion(desde: string, hasta: string) {
  return useQuery({
    queryKey: ocupacionKey(desde, hasta),
    staleTime: 20_000,
    queryFn: async (): Promise<Ocupada[]> => {
      const { data, error } = await supabase.rpc('equipos_ocupacion', { p_desde: desde, p_hasta: hasta })
      if (error) throw error
      return data as Ocupada[]
    },
  })
}

interface ReservaRow {
  id: string
  codigo: string
  equipment_id: string
  fecha: string
  inicio: string
  fin: string
  estado: EstadoReserva
  creada_en: string
  cancelada_en: string | null
}

/** Reservas de equipos del alumno, de la más próxima a la más lejana. */
export function useMisReservasEquipos() {
  return useQuery({
    queryKey: misKey,
    staleTime: 30_000,
    queryFn: async (): Promise<ReservaEquipo[]> => {
      const { data, error } = await supabase.rpc('mis_reservas_equipos')
      if (error) throw error
      return (data as ReservaRow[]).map((r) => ({
        id: r.id,
        codigo: r.codigo,
        equipoId: r.equipment_id,
        fecha: r.fecha,
        inicio: r.inicio,
        fin: r.fin,
        estado: r.estado,
        creada: r.creada_en,
        cancelada: r.cancelada_en,
      }))
    },
  })
}

// ───────────────────────── Acciones ─────────────────────────

export class EquipoError extends Error {
  constructor(
    public reason: 'conflict' | 'penalty' | 'active_exists' | 'offline' | 'invalid' | 'other',
    message: string,
  ) {
    super(message)
  }
}

/** Reservar y cancelar: el servidor valida horario, duración, conflictos y penalidades. */
export function useEquipoActions() {
  const qc = useQueryClient()

  const refresh = useCallback(
    () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: misKey }),
        qc.invalidateQueries({ queryKey: ['equipos-ocupacion'] }),
        qc.invalidateQueries({ queryKey: ['notificaciones'] }),
      ]),
    [qc],
  )

  const reservar = useCallback(
    async (equipoId: string, fecha: string, inicio: string, fin: string): Promise<string> => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new EquipoError('offline', 'Sin conexión.')
      const { data, error } = await supabase.rpc('reservar_equipo', {
        p_equipo: equipoId,
        p_fecha: fecha,
        p_inicio: inicio,
        p_fin: fin,
      })
      if (error) {
        if (error.code === 'P0001') {
          const reason = ['conflict', 'penalty', 'active_exists'].includes(error.hint ?? '')
            ? (error.hint as 'conflict' | 'penalty' | 'active_exists')
            : 'invalid'
          throw new EquipoError(reason, error.message)
        }
        throw new EquipoError('other', 'No pudimos confirmar tu reserva. Inténtalo de nuevo.')
      }
      await refresh()
      return (data as { codigo: string }).codigo
    },
    [refresh],
  )

  /** Devuelve true si se canceló sin penalidad. */
  const cancelar = useCallback(
    async (codigo: string): Promise<boolean> => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new EquipoError('offline', 'Sin conexión.')
      const { data, error } = await supabase.rpc('cancelar_reserva_equipo', { p_codigo: codigo })
      if (error) {
        throw new EquipoError(
          error.code === 'P0001' ? 'invalid' : 'other',
          error.code === 'P0001' ? error.message : 'No pudimos cancelar la reserva.',
        )
      }
      await refresh()
      return data === true
    },
    [refresh],
  )

  return { reservar, cancelar }
}

// ───────────────────────── Fechas y horarios ─────────────────────────

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const hhmm = (h: number) => `${String(h).padStart(2, '0')}:00`

/** Días que se pueden reservar: de lunes a viernes, desde hoy hasta 30 días después. */
export function diasReservables(hoy: Date): string[] {
  const out: string[] = []
  const base = startOfDay(hoy)
  for (let i = 0; i <= DIAS_ANTICIPACION; i++) {
    const d = addDays(base, i)
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(toISO(d))
  }
  return out
}

export interface Franja {
  inicio: string
  fin: string
  libre: boolean
  motivo?: 'ocupado' | 'pasado'
}

/** Franjas de un día para una duración (2 o 4 horas), con su disponibilidad. */
export function franjasDelDia(equipoId: string, fecha: string, horas: number, ocupadas: Ocupada[], ahora: Date): Franja[] {
  const hoy = toISO(startOfDay(ahora))
  const minAhora = ahora.getHours() * 60 + ahora.getMinutes()
  const delDia = ocupadas.filter((o) => o.equipment_id === equipoId && o.fecha === fecha)
  const out: Franja[] = []
  for (let h = HORA_ABRE; h + horas <= HORA_CIERRA; h += 2) {
    const inicio = hhmm(h)
    const fin = hhmm(h + horas)
    if (fecha === hoy && toMin(inicio) <= minAhora) {
      out.push({ inicio, fin, libre: false, motivo: 'pasado' })
      continue
    }
    const choca = delDia.some((o) => toMin(o.inicio) < toMin(fin) && toMin(o.fin) > toMin(inicio))
    out.push({ inicio, fin, libre: !choca, motivo: choca ? 'ocupado' : undefined })
  }
  return out
}

/** "Disponible hoy", "Disponible mañana" o el próximo día con horario libre (dentro de la próxima semana). */
export function proximaDisponibilidad(equipoId: string, ocupadas: Ocupada[], ahora: Date): { texto: string; libre: boolean } {
  const base = startOfDay(ahora)
  for (let i = 0; i <= 7; i++) {
    const d = addDays(base, i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const hay = franjasDelDia(equipoId, toISO(d), 2, ocupadas, ahora).some((f) => f.libre)
    if (hay) {
      return { texto: i === 0 ? 'Disponible hoy' : i === 1 ? 'Disponible mañana' : `Disponible el ${dayShort(d).toLowerCase()}`, libre: true }
    }
  }
  return { texto: 'Sin horarios esta semana', libre: false }
}

export type SituacionReserva = 'proxima' | 'pasada' | 'cancelada'

/** Una reserva confirmada que ya terminó se muestra como pasada. */
export function situacion(r: ReservaEquipo, ahora: Date): SituacionReserva {
  if (r.estado === 'cancelada') return 'cancelada'
  const fin = new Date(`${r.fecha}T${r.fin}:00-05:00`)
  return fin.getTime() > ahora.getTime() ? 'proxima' : 'pasada'
}

/** Minutos que faltan para que empiece la reserva (negativo si ya empezó). */
export function minutosParaInicio(r: ReservaEquipo, ahora: Date): number {
  const inicio = new Date(`${r.fecha}T${r.inicio}:00-05:00`)
  return Math.round((inicio.getTime() - ahora.getTime()) / 60_000)
}

export const fechaDeReserva = (iso: string) => parseISO(iso)
