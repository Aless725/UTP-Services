import { Link, Navigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import { useCourseList } from '@/features/courses/useCourses'
import { Portada } from './BibliotecaPage'
import { ENLACE, IDIOMAS, TEMAS, principalDe, useLibros, type Enlace } from './bibliotecaData'

/** Detalle de un libro: breve descripción, para qué cursos se recomienda y botones de descarga. */
export default function LibroDetailPage() {
  const { id } = useParams()
  const libros = useLibros()
  const cursos = useCourseList()

  if (libros.isLoading) return <PageLoading />
  if (libros.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Libro" back="/biblioteca" backLabel="Volver a la biblioteca" />
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar el libro</p>
          <button type="button" onClick={() => libros.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  const libro = libros.data?.find((l) => l.id === id)
  if (!libro) return <Navigate to="/biblioteca" replace />

  const principal = principalDe(libro)
  const misCursos = cursos.filter((c) => libro.cursos.includes(c.id))
  const orden: Enlace['tipo'][] = ['pdf', 'epub', 'web']
  const enlaces = orden.flatMap((t) => libro.enlaces.filter((e) => e.tipo === t))

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Libro" back="/biblioteca" backLabel="Volver a la biblioteca" />

      <div className="stagger space-y-3 px-5 pt-4">
        <section className="flex gap-4 rounded-card bg-card p-4 shadow-card">
          <Portada tema={libro.tema} grande />
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold leading-tight text-ink">{libro.titulo}</h2>
            <p className="mt-1 text-xs text-ink-muted">
              {libro.autor}
              {libro.anio ? ` · ${libro.anio}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="virtual">{IDIOMAS[libro.idioma]}</Badge>
              <Badge tone="neutral">{TEMAS[libro.tema].label}</Badge>
            </div>
          </div>
        </section>

        <section aria-labelledby="descripcion" className="rounded-card bg-card p-4 shadow-card">
          <h3 id="descripcion" className="text-sm font-bold text-ink">
            De qué trata
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{libro.descripcion}</p>
        </section>

        {misCursos.length > 0 && (
          <section aria-labelledby="cursos" className="rounded-card bg-card p-4 shadow-card">
            <h3 id="cursos" className="text-sm font-bold text-ink">
              Recomendado para tus cursos
            </h3>
            <ul className="mt-2 divide-y divide-fill/5">
              {misCursos.map((c) => (
                <li key={c.id}>
                  <Link to={`/cursos/${c.id}`} className="pressable flex min-h-11 items-center gap-2 text-sm font-medium text-ink">
                    <Icon name="school" size={18} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">{c.nombre}</span>
                    <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="descargas" className="rounded-card bg-card p-4 shadow-card">
          <h3 id="descargas" className="text-sm font-bold text-ink">
            Descargar
          </h3>
          <ul className="mt-3 space-y-2">
            {enlaces.map((e) => (
              <li key={e.url}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable flex min-h-12 items-center gap-3 rounded-xl bg-surface px-3.5 text-sm font-semibold text-ink"
                >
                  <Icon name={ENLACE[e.tipo].icon} size={20} className="shrink-0 text-primary" />
                  <span className="flex-1">{e.tipo === 'web' ? 'Leer en línea' : `Descargar ${ENLACE[e.tipo].label}`}</span>
                  <Icon name="open_in_new" size={16} className="shrink-0 text-ink-faint" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.6875rem] leading-relaxed text-ink-faint">
            El archivo se abre desde el sitio de la fuente, que puede tardar según el tamaño.
            {libro.licencia ? ` Licencia: ${libro.licencia}.` : ''}
          </p>
        </section>

        <p className="px-1 pb-4 text-[0.6875rem] leading-relaxed text-ink-faint">
          Libro de acceso libre de las listas de{' '}
          <a
            href="https://github.com/EbookFoundation/free-programming-books"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary"
          >
            Free Programming Books
          </a>{' '}
          (EbookFoundation).
        </p>
      </div>

      {principal && (
        <StickyCta>
          <a
            href={principal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
          >
            <Icon name={principal.tipo === 'web' ? 'open_in_new' : 'download'} size={18} />
            {principal.tipo === 'web' ? 'Leer en línea' : `Descargar ${ENLACE[principal.tipo].label}`}
          </a>
        </StickyCta>
      )}
    </div>
  )
}
