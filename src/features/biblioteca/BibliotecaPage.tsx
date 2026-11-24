import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import BottomSheet from '@/components/ui/BottomSheet'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useNow } from '@/hooks/useNow'
import { useCourseList } from '@/features/courses/useCourses'
import {
  IDIOMAS,
  TEMAS,
  coincide,
  hayCopiaLibre,
  metaDe,
  situacionLibro,
  useDisponibilidad,
  useLibros,
  useMisReservasLibros,
  type Idioma,
  type Libro,
  type Tema,
} from './bibliotecaData'

type Vista = 'mis' | 'todos' | string
type Formato = 'todos' | 'pdf' | 'epub' | 'fisico'

/** Libros por página: la lista no crece sin fin. */
const POR_PAGINA = 6

export default function BibliotecaPage() {
  const libros = useLibros()
  const cursos = useCourseList()
  const disp = useDisponibilidad()
  const reservas = useMisReservasLibros()
  const now = useNow(60_000)
  const listaRef = useRef<HTMLElement>(null)
  const { detailPath } = useShell()
  const [vista, setVista] = useState<Vista | null>(null)
  const [texto, setTexto] = useState('')
  const [idioma, setIdioma] = useState<Idioma | 'todos'>('todos')
  const [formato, setFormato] = useState<Formato>('todos')
  const [tema, setTema] = useState<Tema | 'todos'>('todos')
  const [filtros, setFiltros] = useState(false)
  const [pag, setPag] = useState({ clave: '', n: 0 })

  const all = useMemo(() => libros.data ?? [], [libros.data])
  const misIds = useMemo(() => new Set(cursos.map((c) => c.id)), [cursos])
  const paraMi = useMemo(() => all.filter((l) => l.cursos.some((c) => misIds.has(c))), [all, misIds])
  // Si el alumno tiene libros recomendados, esa es la vista inicial.
  const actual: Vista = vista ?? (paraMi.length > 0 ? 'mis' : 'todos')

  const base = actual === 'mis' ? paraMi : actual === 'todos' ? all : all.filter((l) => l.cursos.includes(actual))
  const list = base.filter(
    (l) =>
      coincide(l, texto) &&
      (idioma === 'todos' || l.idioma === idioma) &&
      (formato === 'todos' || (formato === 'fisico' ? hayCopiaLibre(disp.data ?? [], l.id) : l.enlaces.some((e) => e.tipo === formato))) &&
      (tema === 'todos' || l.tema === tema),
  )
  const clave = `${actual}|${idioma}|${formato}|${tema}|${texto}`
  const paginas = Math.max(1, Math.ceil(list.length / POR_PAGINA))
  const pagina = Math.min(pag.clave === clave ? pag.n : 0, paginas - 1)
  const visibles = list.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)
  const irA = (n: number) => {
    setPag({ clave, n })
    listaRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
  const porRecoger = (reservas.data ?? []).filter((r) => situacionLibro(r, now) === 'vigente').length
  const activos = (idioma !== 'todos' ? 1 : 0) + (formato !== 'todos' ? 1 : 0) + (tema !== 'todos' ? 1 : 0)
  const limpiar = () => {
    setIdioma('todos')
    setFormato('todos')
    setTema('todos')
    setTexto('')
  }
  const cursoDe = (id: string) => cursos.find((c) => c.id === id)
  const recomendadoPara = (l: Libro) => l.cursos.filter((c) => misIds.has(c)).map((c) => c.toUpperCase())

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Biblioteca"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Descarga libros gratuitos o reserva una copia impresa en tu sede."
      />

      <div className="mt-4 px-5">
        <Link to="/biblioteca/mis" className="pressable flex min-h-16 items-center gap-3 rounded-card bg-card px-3.5 py-3 shadow-card">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon name="bookmark_added" size={20} filled />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">Mis reservas de libros</span>
            <span className="block text-[0.6875rem] text-ink-muted">
              {reservas.isLoading
                ? 'Cargando…'
                : porRecoger > 0
                  ? `${porRecoger} ${porRecoger === 1 ? 'libro por recoger' : 'libros por recoger'}`
                  : 'Reserva copias impresas y recógelas en la sede'}
            </span>
          </span>
          <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
        </Link>
      </div>

      <div className="mt-3 flex gap-2 px-5">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={18} className="text-ink-muted" />
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Título, autor o tema"
            aria-label="Buscar libros"
            className="h-11 min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        <button
          type="button"
          onClick={() => setFiltros(true)}
          aria-label={activos ? `Filtros, ${activos} activos` : 'Filtros'}
          className="pressable relative flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-card text-ink shadow-card"
        >
          <Icon name="tune" size={20} />
          {activos > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-white">
              {activos}
            </span>
          )}
        </button>
      </div>

      <div role="tablist" aria-label="Libros por curso" className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {paraMi.length > 0 && (
          <Chip active={actual === 'mis'} onClick={() => setVista('mis')}>{`Para mis cursos (${paraMi.length})`}</Chip>
        )}
        <Chip active={actual === 'todos'} onClick={() => setVista('todos')}>{`Todos (${all.length})`}</Chip>
        {cursos
          .filter((c) => all.some((l) => l.cursos.includes(c.id)))
          .map((c) => (
            <Chip key={c.id} active={actual === c.id} onClick={() => setVista(c.id)}>
              {c.id.toUpperCase()}
            </Chip>
          ))}
      </div>

      {(actual !== 'mis' && actual !== 'todos') && (
        <p className="mt-2 px-6 text-[0.6875rem] text-ink-muted">Recomendados para {cursoDe(actual)?.nombre ?? actual.toUpperCase()}</p>
      )}
      {actual === 'mis' && <p className="mt-2 px-6 text-[0.6875rem] text-ink-muted">Libros sugeridos según los cursos en los que estás matriculado.</p>}

      {activos > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 px-5">
          {idioma !== 'todos' && <Quitar texto={IDIOMAS[idioma]} onClick={() => setIdioma('todos')} />}
          {formato !== 'todos' && <Quitar texto={formato === 'fisico' ? 'Impreso en sede' : formato.toUpperCase()} onClick={() => setFormato('todos')} />}
          {tema !== 'todos' && <Quitar texto={TEMAS[tema].label} onClick={() => setTema('todos')} />}
        </div>
      )}

      <section ref={listaRef} aria-label="Libros" className="mt-4 scroll-mt-4 px-5">
        {libros.isLoading ? (
          <div role="status" aria-label="Cargando" className="space-y-px overflow-hidden rounded-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[5.25rem] w-full rounded-none" />
            ))}
          </div>
        ) : libros.isError ? (
          <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
            <Icon name="cloud_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar la biblioteca</p>
            <button type="button" onClick={() => libros.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="search_off" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">No encontramos libros con esos filtros</p>
            <p className="mt-0.5 text-xs text-ink-muted">Prueba con otra palabra o quita algún filtro.</p>
            <button type="button" onClick={limpiar} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <p className="mb-2 px-1 text-[0.6875rem] text-ink-muted">
              {list.length > POR_PAGINA
                ? `Mostrando ${pagina * POR_PAGINA + 1}–${pagina * POR_PAGINA + visibles.length} de ${list.length} libros`
                : `${list.length} ${list.length === 1 ? 'libro' : 'libros'}`}
            </p>
            <ul key={`${clave}|${pagina}`} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
              {visibles.map((l) => (
                <LibroRow
                  key={l.id}
                  libro={l}
                  seleccionado={detailPath === `/biblioteca/${l.id}`}
                  para={recomendadoPara(l)}
                  impreso={hayCopiaLibre(disp.data ?? [], l.id)}
                />
              ))}
            </ul>
            {paginas > 1 && (
              <nav aria-label="Páginas" className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={pagina === 0}
                  onClick={() => irA(pagina - 1)}
                  className="pressable flex min-h-11 items-center gap-1 rounded-full bg-card px-4 text-xs font-semibold text-ink shadow-card disabled:opacity-40"
                >
                  <Icon name="chevron_left" size={18} />
                  Anterior
                </button>
                <span className="text-xs font-medium text-ink-muted">
                  Página {pagina + 1} de {paginas}
                </span>
                <button
                  type="button"
                  disabled={pagina >= paginas - 1}
                  onClick={() => irA(pagina + 1)}
                  className="pressable flex min-h-11 items-center gap-1 rounded-full bg-card px-4 text-xs font-semibold text-ink shadow-card disabled:opacity-40"
                >
                  Siguiente
                  <Icon name="chevron_right" size={18} />
                </button>
              </nav>
            )}
          </>
        )}
        <p className="mt-4 px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
          Libros de acceso libre de las listas de Free Programming Books (EbookFoundation). Cada botón abre el sitio de la fuente.
        </p>
      </section>

      <BottomSheet open={filtros} onClose={() => setFiltros(false)} title="Filtros">
        <div className="space-y-4 pb-1">
          <Grupo titulo="Idioma">
            <Opcion activa={idioma === 'todos'} onClick={() => setIdioma('todos')}>Todos</Opcion>
            {(Object.keys(IDIOMAS) as Idioma[]).map((i) => (
              <Opcion key={i} activa={idioma === i} onClick={() => setIdioma(i)}>{IDIOMAS[i]}</Opcion>
            ))}
          </Grupo>
          <Grupo titulo="Formato">
            {(['todos', 'pdf', 'epub', 'fisico'] as Formato[]).map((f) => (
              <Opcion key={f} activa={formato === f} onClick={() => setFormato(f)}>{f === 'todos' ? 'Todos' : f === 'fisico' ? 'Impreso en sede' : f.toUpperCase()}</Opcion>
            ))}
          </Grupo>
          <Grupo titulo="Tema">
            <Opcion activa={tema === 'todos'} onClick={() => setTema('todos')}>Todos</Opcion>
            {(Object.keys(TEMAS) as Tema[]).map((t) => (
              <Opcion key={t} activa={tema === t} onClick={() => setTema(t)}>{TEMAS[t].label}</Opcion>
            ))}
          </Grupo>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIdioma('todos')
                setFormato('todos')
                setTema('todos')
              }}
              className="pressable min-h-11 rounded-full bg-surface text-sm font-semibold text-ink"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setFiltros(false)}
              className="pressable min-h-11 rounded-full bg-primary text-sm font-semibold text-white"
            >
              Ver {list.length} {list.length === 1 ? 'libro' : 'libros'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

function LibroRow({ libro, seleccionado, para, impreso }: { libro: Libro; seleccionado: boolean; para: string[]; impreso: boolean }) {
  return (
    <li>
      <Link
        to={`/biblioteca/${libro.id}`}
        aria-current={seleccionado ? 'page' : undefined}
        className={`pressable flex min-h-[5.25rem] items-center gap-3 px-3.5 py-3 ${seleccionado ? 'bg-primary-soft' : ''}`}
      >
        <Portada tema={libro.tema} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-snug text-ink">{libro.titulo}</span>
          <span className="block truncate text-[0.6875rem] text-ink-muted">{libro.autor}</span>
          <span className="block text-[0.6875rem] text-ink-muted">{metaDe(libro)}{impreso ? ' · Impreso en sede' : ''}</span>
          {para.length > 0 && <span className="mt-0.5 block text-[0.6875rem] font-semibold text-primary">Recomendado para {para.join(', ')}</span>}
        </span>
        <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
      </Link>
    </li>
  )
}

/** Portada de reemplazo: un ícono del tema sobre un fondo suave. */
export function Portada({ tema, grande }: { tema: Tema; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary ${grande ? 'h-28 w-20' : 'h-14 w-10'}`}
    >
      <Icon name={TEMAS[tema].icon} size={grande ? 34 : 22} filled />
    </span>
  )
}

function Quitar({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Quitar filtro ${texto}`}
      className="pressable flex min-h-9 items-center gap-1 rounded-full bg-primary-soft px-3 text-xs font-semibold text-primary"
    >
      {texto}
      <Icon name="close" size={14} />
    </button>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div role="radiogroup" aria-label={titulo}>
      <p className="mb-2 text-xs font-bold text-ink">{titulo}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activa}
      onClick={onClick}
      className={`pressable min-h-9 rounded-full px-3.5 text-xs font-medium ${activa ? 'bg-ink text-surface' : 'bg-surface text-ink-muted'}`}
    >
      {children}
    </button>
  )
}
