import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { addDays, startOfDay, toISO } from '@/lib/date'

export type Tema = 'web' | 'programacion' | 'datos' | 'ingenieria' | 'gestion' | 'diseno' | 'sistemas' | 'ia' | 'otros'
export type Idioma = 'es' | 'en'
export type TipoEnlace = 'pdf' | 'epub' | 'web'

export const TEMAS: Record<Tema, { label: string; icon: string }> = {
  web: { label: 'Desarrollo web', icon: 'language' },
  programacion: { label: 'Programación', icon: 'code' },
  datos: { label: 'Bases de datos', icon: 'database' },
  ingenieria: { label: 'Ingeniería de software', icon: 'account_tree' },
  gestion: { label: 'Gestión de TI', icon: 'settings_suggest' },
  diseno: { label: 'Producto y diseño', icon: 'draw' },
  sistemas: { label: 'Sistemas', icon: 'memory' },
  ia: { label: 'Inteligencia artificial', icon: 'psychology' },
  otros: { label: 'Otros', icon: 'menu_book' },
}

export const IDIOMAS: Record<Idioma, string> = { es: 'Español', en: 'Inglés' }

export const ENLACE: Record<TipoEnlace, { label: string; icon: string }> = {
  pdf: { label: 'PDF', icon: 'picture_as_pdf' },
  epub: { label: 'EPUB', icon: 'auto_stories' },
  web: { label: 'Leer en línea', icon: 'open_in_new' },
}

export interface Enlace {
  tipo: TipoEnlace
  url: string
}

export interface Libro {
  id: string
  titulo: string
  autor: string
  anio: number | null
  idioma: Idioma
  tema: Tema
  descripcion: string
  /** Ids de los cursos para los que se recomienda. */
  cursos: string[]
  enlaces: Enlace[]
  licencia: string | null
}

/** Catálogo de libros gratuitos (Supabase). Cambia poco: se guarda 30 minutos. */
export function useLibros() {
  return useQuery({
    queryKey: ['biblioteca'],
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<Libro[]> => {
      const { data, error } = await supabase
        .from('library_books')
        .select('id, titulo, autor, anio, idioma, tema, descripcion, cursos, enlaces, licencia')
        .order('orden')
      if (error) throw error
      return (data ?? []).map((r) => ({ ...r, cursos: r.cursos ?? [], enlaces: (r.enlaces ?? []) as Enlace[] })) as Libro[]
    },
  })
}

/** Formatos disponibles de un libro, en el orden PDF, EPUB y lectura en línea. */
export function formatosDe(l: Libro): TipoEnlace[] {
  return (['pdf', 'epub', 'web'] as TipoEnlace[]).filter((t) => l.enlaces.some((e) => e.tipo === t))
}

/** "Español · PDF · EPUB" */
export function metaDe(l: Libro): string {
  const f = formatosDe(l).map((t) => (t === 'web' ? 'En línea' : ENLACE[t].label))
  return [IDIOMAS[l.idioma], ...f].join(' · ')
}

/** Enlace principal para descargar: PDF, luego EPUB y, si no hay, lectura en línea. */
export function principalDe(l: Libro): Enlace | undefined {
  return l.enlaces.find((e) => e.tipo === 'pdf') ?? l.enlaces.find((e) => e.tipo === 'epub') ?? l.enlaces[0]
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function coincide(l: Libro, texto: string): boolean {
  const q = norm(texto.trim())
  if (!q) return true
  return norm(`${l.titulo} ${l.autor} ${l.descripcion} ${TEMAS[l.tema].label}`).includes(q)
}

// ───────────────────────── Reserva presencial en sedes ─────────────────────────

/** Reglas que valida el servidor y que aquí solo se reflejan. */
export const MAX_RESERVAS_LIBROS = 2
export const DIAS_RECOJO = 3
export const HORA_ULTIMO_RECOJO = 19

export interface Disponibilidad {
  libroId: string
  campusId: string
  sede: string
  copias: number
  libres: number
}

const dispKey = ['biblioteca-disponibilidad'] as const
const misLibrosKey = ['biblioteca-mis'] as const

interface DispRow {
  libro_id: string
  campus_id: string
  sede: string
  copias: number
  libres: number
}

/** Copias impresas por sede y cuántas siguen libres. */
export function useDisponibilidad() {
  return useQuery({
    queryKey: dispKey,
    staleTime: 20_000,
    queryFn: async (): Promise<Disponibilidad[]> => {
      const { data, error } = await supabase.rpc('libros_disponibilidad')
      if (error) throw error
      return (data as DispRow[]).map((r) => ({ libroId: r.libro_id, campusId: r.campus_id, sede: r.sede, copias: r.copias, libres: r.libres }))
    },
  })
}

/** Sedes con copia impresa de un libro (libres primero). */
export const sedesDe = (disp: Disponibilidad[], libroId: string) =>
  disp.filter((d) => d.libroId === libroId).sort((a, b) => Number(b.libres > 0) - Number(a.libres > 0))

export const hayCopiaLibre = (disp: Disponibilidad[], libroId: string) => disp.some((d) => d.libroId === libroId && d.libres > 0)

export interface ReservaLibro {
  id: string
  codigo: string
  libroId: string
  campusId: string
  sede: string
  /** AAAA-MM-DD. */
  recojo: string
  estado: 'reservada' | 'cancelada'
}

interface ReservaLibroRow {
  id: string
  codigo: string
  libro_id: string
  campus_id: string
  sede: string
  recojo: string
  estado: 'reservada' | 'cancelada'
}

export function useMisReservasLibros() {
  return useQuery({
    queryKey: misLibrosKey,
    staleTime: 30_000,
    queryFn: async (): Promise<ReservaLibro[]> => {
      const { data, error } = await supabase.rpc('mis_reservas_libros')
      if (error) throw error
      return (data as ReservaLibroRow[]).map((r) => ({
        id: r.id,
        codigo: r.codigo,
        libroId: r.libro_id,
        campusId: r.campus_id,
        sede: r.sede,
        recojo: r.recojo,
        estado: r.estado,
      }))
    },
  })
}

export type SituacionLibro = 'vigente' | 'vencida' | 'cancelada'

/** Una reserva no recogida vence al terminar el día de recojo. */
export function situacionLibro(r: ReservaLibro, ahora: Date): SituacionLibro {
  if (r.estado === 'cancelada') return 'cancelada'
  return r.recojo >= toISO(startOfDay(ahora)) ? 'vigente' : 'vencida'
}

/** Días para recoger: desde hoy (si aún hay tiempo) hasta 3 días después, sin domingos. */
export function diasDeRecojo(ahora: Date): string[] {
  const base = startOfDay(ahora)
  const out: string[] = []
  for (let i = 0; i <= DIAS_RECOJO; i++) {
    const d = addDays(base, i)
    if (d.getDay() === 0) continue
    if (i === 0 && ahora.getHours() >= HORA_ULTIMO_RECOJO) continue
    out.push(toISO(d))
  }
  return out
}

export class LibroError extends Error {
  constructor(
    public reason: 'full' | 'penalty' | 'active_exists' | 'duplicate' | 'offline' | 'invalid' | 'other',
    message: string,
  ) {
    super(message)
  }
}

/** Reservar y cancelar: el servidor valida copias, fechas y límites. */
export function useLibroActions() {
  const qc = useQueryClient()
  const refresh = useCallback(
    () =>
      Promise.all([
        // refetch (y no solo invalidar): la pantalla de la reserva se abre enseguida y necesita la lista al día.
        qc.refetchQueries({ queryKey: misLibrosKey }),
        qc.refetchQueries({ queryKey: dispKey }),
        qc.invalidateQueries({ queryKey: ['notificaciones'] }),
      ]),
    [qc],
  )

  const reservar = useCallback(
    async (libroId: string, campusId: string, recojo: string): Promise<string> => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new LibroError('offline', 'Sin conexión.')
      const { data, error } = await supabase.rpc('reservar_libro', { p_libro: libroId, p_sede: campusId, p_recojo: recojo })
      if (error) {
        if (error.code === 'P0001') {
          const reason = ['full', 'penalty', 'active_exists', 'duplicate'].includes(error.hint ?? '')
            ? (error.hint as 'full' | 'penalty' | 'active_exists' | 'duplicate')
            : 'invalid'
          if (reason === 'full') await refresh()
          throw new LibroError(reason, error.message)
        }
        throw new LibroError('other', 'No pudimos confirmar tu reserva. Inténtalo de nuevo.')
      }
      await refresh()
      return (data as { codigo: string }).codigo
    },
    [refresh],
  )

  const cancelar = useCallback(
    async (codigo: string): Promise<void> => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new LibroError('offline', 'Sin conexión.')
      const { error } = await supabase.rpc('cancelar_reserva_libro', { p_codigo: codigo })
      if (error) {
        throw new LibroError(
          error.code === 'P0001' ? 'invalid' : 'other',
          error.code === 'P0001' ? error.message : 'No pudimos cancelar la reserva.',
        )
      }
      await refresh()
    },
    [refresh],
  )

  return { reservar, cancelar }
}
