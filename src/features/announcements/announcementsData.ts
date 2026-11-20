import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { parseISO, startOfDay, toISO } from '@/lib/date'
import { buildIcs, downloadIcs } from '@/lib/ics'

export type Categoria = 'salud' | 'cultura' | 'academico' | 'deporte' | 'empleabilidad'

/** Aspecto de cada categoría: ícono y color (solo los tonos del sistema de diseño). */
export const CATEGORIES: Record<Categoria, { label: string; icon: string; tone: string }> = {
  salud: { label: 'Salud', icon: 'favorite', tone: 'bg-primary-soft text-primary' },
  cultura: { label: 'Cultura', icon: 'auto_stories', tone: 'bg-success-soft text-success' },
  academico: { label: 'Académico', icon: 'school', tone: 'bg-fill/5 text-ink' },
  deporte: { label: 'Deporte', icon: 'sports_soccer', tone: 'bg-success-soft text-success' },
  empleabilidad: { label: 'Empleabilidad', icon: 'work', tone: 'bg-primary-soft text-primary' },
}

export interface CampusAnnouncement {
  id: string
  categoria: Categoria
  titulo: string
  resumen: string
  descripcion: string
  lugar: string
  sede: string
  /** yyyy-mm-dd */
  fecha: string
  inicio: string
  fin: string
  /** null = entrada libre */
  cupos: number | null
  destacado: boolean
  asistentes: number
  asistire: boolean
}

interface Row {
  id: string
  categoria: Categoria
  titulo: string
  resumen: string
  descripcion: string
  lugar: string
  sede: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  cupos: number | null
  destacado: boolean
  asistentes: number
  asistire: boolean
}

const hhmm = (t: string) => t.slice(0, 5)

const fromRow = (r: Row): CampusAnnouncement => ({
  id: r.id,
  categoria: r.categoria,
  titulo: r.titulo,
  resumen: r.resumen,
  descripcion: r.descripcion,
  lugar: r.lugar,
  sede: r.sede,
  fecha: r.fecha,
  inicio: hhmm(r.hora_inicio),
  fin: hhmm(r.hora_fin),
  cupos: r.cupos,
  destacado: r.destacado,
  asistentes: r.asistentes,
  asistire: r.asistire,
})

const listKey = ['anuncios-campus'] as const
const itemKey = (id: string) => ['anuncio-campus', id] as const

/** Actividades de hoy en adelante, de la más próxima a la más lejana. */
export function useCampusAnnouncements() {
  return useQuery({
    queryKey: listKey,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campus_announcements_view')
        .select('*')
        .gte('fecha', toISO(startOfDay(new Date())))
        .order('fecha')
        .order('hora_inicio')
      if (error) throw error
      return (data as Row[]).map(fromRow)
    },
  })
}

/** Una actividad por id (también las que ya pasaron, por si se abre un enlace antiguo). */
export function useCampusAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: itemKey(id ?? ''),
    enabled: !!id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('campus_announcements_view').select('*').eq('id', id!).maybeSingle()
      if (error) throw error
      return data ? fromRow(data as Row) : null
    },
  })
}

export class AttendanceError extends Error {
  constructor(public reason: 'full' | 'past' | 'other') {
    super(reason)
  }
}

/** Confirma o cancela la asistencia; el servidor valida cupos y fecha. */
export function useAttendance() {
  const qc = useQueryClient()
  return async (id: string, asistir: boolean) => {
    const { error } = await supabase.rpc('asistir_anuncio', { p_id: id, p_asistir: asistir })
    await Promise.all([qc.invalidateQueries({ queryKey: listKey }), qc.invalidateQueries({ queryKey: itemKey(id) })])
    if (error) throw new AttendanceError(error.hint === 'full' ? 'full' : error.hint === 'past' ? 'past' : 'other')
  }
}

export const isPast = (a: Pick<CampusAnnouncement, 'fecha' | 'fin'>, now = new Date()) =>
  new Date(`${a.fecha}T${a.fin}:00`).getTime() < now.getTime()

export const cuposLibres = (a: CampusAnnouncement) => (a.cupos === null ? null : Math.max(0, a.cupos - a.asistentes))

const at = (fecha: string, hhmmStr: string) => {
  const d = parseISO(fecha)
  const [h, m] = hhmmStr.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function addAnnouncementToCalendar(a: CampusAnnouncement): void {
  downloadIcs(
    `${a.id}.ics`,
    buildIcs({
      uid: `anuncio-${a.id}`,
      title: a.titulo,
      description: a.resumen,
      location: `${a.lugar} · ${a.sede}`,
      start: at(a.fecha, a.inicio),
      end: at(a.fecha, a.fin),
    }),
  )
}

/** Comparte el enlace (hoja nativa o portapapeles). */
export async function shareAnnouncement(a: CampusAnnouncement): Promise<'shared' | 'copied' | 'error'> {
  const url = `${window.location.origin}/anuncios/${a.id}`
  const text = `${a.titulo} · ${a.sede}`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'UTP+ Anuncios', text, url })
      return 'shared'
    }
    await navigator.clipboard.writeText(`${text} ${url}`)
    return 'copied'
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
    return 'error'
  }
}
