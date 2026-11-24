import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

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
