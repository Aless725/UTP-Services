import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Badge from '@/components/ui/Badge'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import { useToast } from '@/components/ui/Toast'
import { useCourseList } from '@/features/courses/useCourses'
import { dayShort, parseISO } from '@/lib/date'
import { Portada } from './BibliotecaPage'
import {
  ENLACE,
  IDIOMAS,
  MAX_RESERVAS_LIBROS,
  TEMAS,
  LibroError,
  diasDeRecojo,
  principalDe,
  sedesDe,
  useDisponibilidad,
  useLibroActions,
  useLibros,
  type Enlace,
} from './bibliotecaData'

/** Detalle de un libro: breve descripción, para qué cursos se recomienda y botones de descarga. */
export default function LibroDetailPage() {
  const { id } = useParams()
  const libros = useLibros()
  const cursos = useCourseList()
  const disp = useDisponibilidad()
  const { reservar } = useLibroActions()
  const navigate = useNavigate()
  const { show } = useToast()
  const [hoja, setHoja] = useState(false)
  const [sedeElegida, setSedeElegida] = useState<string | null>(null)
  const [diaElegido, setDiaElegido] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [fallo, setFallo] = useState<string | null>(null)

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
  const sedes = sedesDe(disp.data ?? [], libro.id)
  const conCopia = sedes.filter((s) => s.libres > 0)
  const sedeSel = conCopia.find((s) => s.campusId === sedeElegida) ?? conCopia[0]
  const dias = diasDeRecojo(new Date())
  const diaSel = dias.includes(diaElegido ?? '') ? (diaElegido as string) : dias[0]

  const confirmarReserva = async () => {
    if (!sedeSel || !diaSel) return
    setEnviando(true)
    setFallo(null)
    try {
      const codigo = await reservar(libro.id, sedeSel.campusId, diaSel)
      setHoja(false)
      navigate(`/biblioteca/reserva/${codigo}`, { state: { nueva: true } })
    } catch (e) {
      const msg = e instanceof LibroError ? e.message : 'No pudimos confirmar tu reserva.'
      setFallo(msg)
      show(msg, 'error')
    } finally {
      setEnviando(false)
    }
  }

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

        <section aria-labelledby="sedes" className="rounded-card bg-card p-4 shadow-card">
          <h3 id="sedes" className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Icon name="location_on" size={18} className="text-primary" />
            Copia impresa en sede
          </h3>
          {disp.isLoading ? (
            <p role="status" className="mt-2 text-xs text-ink-muted">Consultando disponibilidad…</p>
          ) : disp.isError ? (
            <div role="alert" className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-ink-muted">No pudimos consultar las sedes.</p>
              <button type="button" onClick={() => disp.refetch()} className="pressable min-h-11 shrink-0 text-xs font-semibold text-primary">
                Reintentar
              </button>
            </div>
          ) : sedes.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">Este libro solo está disponible en versión digital.</p>
          ) : (
            <>
              <ul className="mt-2 divide-y divide-fill/5">
                {sedes.map((s) => (
                  <li key={s.campusId} className="flex min-h-11 items-center gap-2 py-1.5">
                    <Icon name="apartment" size={18} className="shrink-0 text-ink-muted" />
                    <span className="min-w-0 flex-1 text-sm font-medium text-ink">{s.sede}</span>
                    <Badge tone={s.libres > 0 ? 'virtual' : 'neutral'}>
                      {s.libres > 0 ? `${s.libres} ${s.libres === 1 ? 'libre' : 'libres'}` : 'Agotado'}
                    </Badge>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={conCopia.length === 0}
                onClick={() => {
                  setFallo(null)
                  setHoja(true)
                }}
                className="pressable mt-3 min-h-12 w-full rounded-full bg-primary-soft text-sm font-semibold text-primary disabled:opacity-50"
              >
                {conCopia.length === 0 ? 'Sin copias libres por ahora' : 'Reservar para recoger'}
              </button>
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-faint">
                Recógelo en la sede hasta 3 días después. Puedes tener {MAX_RESERVAS_LIBROS} libros reservados a la vez.{' '}
                <Link to="/biblioteca/mis" className="font-semibold text-primary">
                  Mis reservas
                </Link>
              </p>
            </>
          )}
        </section>

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

      <BottomSheet open={hoja} onClose={() => setHoja(false)} title="Reservar para recoger">
        <div className="space-y-4 pb-1">
          <div role="radiogroup" aria-label="Sede">
            <p className="mb-2 text-xs font-bold text-ink">Sede</p>
            <div className="flex flex-wrap gap-2">
              {conCopia.map((s) => (
                <button
                  key={s.campusId}
                  type="button"
                  role="radio"
                  aria-checked={sedeSel?.campusId === s.campusId}
                  onClick={() => setSedeElegida(s.campusId)}
                  className={`pressable min-h-11 rounded-full px-4 text-xs font-medium ${sedeSel?.campusId === s.campusId ? 'bg-ink text-surface' : 'bg-surface text-ink-muted'}`}
                >
                  {s.sede}
                </button>
              ))}
            </div>
          </div>
          <div role="radiogroup" aria-label="Día de recojo">
            <p className="mb-2 text-xs font-bold text-ink">Día de recojo</p>
            {dias.length === 0 ? (
              <p className="text-xs text-ink-muted">Hoy ya cerró la atención. Vuelve mañana para reservar.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dias.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={diaSel === d}
                    onClick={() => setDiaElegido(d)}
                    className={`pressable min-h-11 rounded-full px-4 text-xs font-medium ${diaSel === d ? 'bg-ink text-surface' : 'bg-surface text-ink-muted'}`}
                  >
                    {dayShort(parseISO(d))}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[0.6875rem] leading-relaxed text-ink-faint">
            Atención de 08:00 a 20:00. La copia se guarda hasta el cierre del día que elijas y puedes cancelar sin penalidad.
          </p>
          {fallo && (
            <p role="alert" className="rounded-xl bg-primary-soft px-3 py-2 text-xs font-medium text-primary">
              {fallo}
            </p>
          )}
          <button
            type="button"
            disabled={enviando || !sedeSel || !diaSel}
            onClick={confirmarReserva}
            className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-50"
          >
            {enviando ? 'Reservando…' : 'Confirmar reserva'}
          </button>
        </div>
      </BottomSheet>

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
