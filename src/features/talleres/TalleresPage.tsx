import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useNow } from '@/hooks/useNow'
import { DIAS_CORTOS, proximaSesion } from './proximaSesion'
import {
  CATEGORIAS_TALLER,
  grupoAbierto,
  normalizarBusquedaTaller,
  tallerPath,
  useMisTalleres,
  useTalleres,
  type Taller,
} from './talleresData'

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** Portada de Talleres: tu próxima sesión, búsqueda por nombre o día y las categorías. */
export default function TalleresPage() {
  const catalogo = useTalleres()
  const mis = useMisTalleres()
  const now = useNow(60_000)
  const { detailPath } = useShell()
  const [texto, setTexto] = useState('')
  const [dia, setDia] = useState<number | null>(null)

  const todos = useMemo(() => catalogo.data ?? [], [catalogo.data])
  const proxima = useMemo(() => proximaSesion(mis.data ?? [], now), [mis.data, now])
  const inscritos = (mis.data ?? []).filter((i) => i.estado === 'inscrita').length
  const cuantos = (c: Taller['categoria']) => todos.filter((t) => t.categoria === c).length

  const q = normalizarBusquedaTaller(texto)
  const buscando = q !== '' || dia !== null
  const resultados = useMemo(() => {
    if (!buscando) return []
    return todos
      .map((t) => ({
        taller: t,
        grupos: t.grupos.filter(
          (g) =>
            (dia === null || g.horarios.some((h) => h.dia === dia)) &&
            (!q || normalizarBusquedaTaller(`${t.titulo} ${t.descripcion} ${g.docente} ${g.sede}`).includes(q)),
        ),
      }))
      .filter((r) => r.grupos.length > 0)
  }, [todos, q, dia, buscando])
  const limpiar = () => {
    setTexto('')
    setDia(null)
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Talleres"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Un espacio para tus intereses y tu vida universitaria."
      />

      <div className="stagger space-y-4 px-5 pt-4">
        {/* Tu próxima sesión */}
        {mis.isLoading ? (
          <Skeleton className="h-[5.5rem] w-full rounded-card" />
        ) : mis.isError ? (
          <div role="alert" className="flex items-center justify-between gap-2 rounded-card bg-card p-3.5 shadow-card">
            <p className="text-xs text-ink-muted">No pudimos cargar tus talleres.</p>
            <button type="button" onClick={() => mis.refetch()} className="pressable min-h-11 shrink-0 px-2 text-xs font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : proxima ? (
          <Link
            to={`/talleres/inscripcion/${proxima.inscripcion.id}`}
            className="pressable block rounded-card bg-card p-4 shadow-card"
          >
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-primary">
              <Icon name="event_upcoming" size={16} filled />
              Tu próxima sesión
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft leading-none text-primary">
                <span className="text-[0.625rem] font-semibold uppercase">{proxima.cuando.split(' ')[0]}</span>
                <span className="mt-0.5 text-base font-extrabold">{proxima.cuando.split(' ')[1] ?? proxima.inicio.getDate()}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{proxima.inscripcion.snapshot.titulo}</span>
                <span className="block text-xs text-ink-muted">
                  {proxima.cuando} · {proxima.horario}
                </span>
                <span className="block truncate text-[0.6875rem] text-ink-faint">
                  {proxima.inscripcion.snapshot.sede}
                  {proxima.inscripcion.snapshot.lugar ? ` · ${proxima.inscripcion.snapshot.lugar}` : ''}
                </span>
              </span>
              <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-card bg-card p-4 shadow-card">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name="event_available" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">{inscritos > 0 ? 'Sin sesiones próximas' : 'Aún no tienes talleres'}</p>
              <p className="text-xs leading-relaxed text-ink-muted">
                {inscritos > 0 ? 'Tus talleres no tienen sesiones en los próximos días.' : 'Elige uno abajo y aparecerá aquí tu próxima sesión.'}
              </p>
            </div>
          </div>
        )}

        {/* Búsqueda por nombre y por día */}
        <div className="space-y-3">
          <label className="flex min-h-11 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
            <Icon name="search" size={18} className="shrink-0 text-ink-muted" />
            <input
              type="search"
              maxLength={120}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-label="Buscar talleres"
              placeholder="Buscar taller, docente o sede"
              className="h-11 min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
            />
          </label>
          <div role="group" aria-label="Filtrar por día" className="flex items-center justify-between gap-1">
            {DIAS_CORTOS.map((d) => (
              <button
                key={d.n}
                type="button"
                aria-pressed={dia === d.n}
                aria-label={d.largo}
                onClick={() => setDia(dia === d.n ? null : d.n)}
                className={`pressable flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  dia === d.n ? 'bg-ink text-surface' : 'bg-card text-ink-muted shadow-card'
                }`}
              >
                {d.corto}
              </button>
            ))}
          </div>
        </div>

        {buscando ? (
          <section aria-label="Resultados">
            {catalogo.isLoading ? (
              <Skeleton className="h-32 w-full rounded-card" />
            ) : catalogo.isError ? (
              <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
                <Icon name="cloud_off" size={28} className="text-ink-faint" />
                <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar los talleres</p>
                <button type="button" onClick={() => catalogo.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
                  Reintentar
                </button>
              </div>
            ) : resultados.length === 0 ? (
              <div className="flex flex-col items-center rounded-card bg-card px-6 py-8 text-center shadow-card">
                <Icon name="search_off" size={30} className="text-ink-faint" />
                <p className="mt-2 text-sm font-medium text-ink">No encontramos talleres</p>
                <p className="mt-0.5 text-xs text-ink-muted">Prueba con otra palabra u otro día.</p>
                <button type="button" onClick={limpiar} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
                  Quitar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between px-1">
                  <p role="status" className="text-[0.6875rem] text-ink-muted">
                    {plural(resultados.length, 'taller', 'talleres')}
                    {dia !== null ? ` · ${DIAS_CORTOS.find((d) => d.n === dia)?.largo}` : ''}
                  </p>
                  <button type="button" onClick={limpiar} className="pressable min-h-11 text-[0.6875rem] font-semibold text-primary">
                    Quitar filtros
                  </button>
                </div>
                <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
                  {resultados.map(({ taller, grupos }) => {
                    const vacantes = grupos.filter((g) => grupoAbierto(g, now)).reduce((n, g) => n + g.vacantes, 0)
                    const a = `${tallerPath(taller)}?grupo=${grupos[0].id}`
                    return (
                      <li key={taller.id}>
                        <Link
                          to={a}
                          aria-current={detailPath === tallerPath(taller) ? 'page' : undefined}
                          className="pressable flex min-h-[4.25rem] items-center gap-3 px-3.5 py-3"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                            <Icon name={CATEGORIAS_TALLER[taller.categoria].icon} size={20} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 text-sm font-bold leading-snug text-ink">{taller.titulo}</span>
                            <span className="block truncate text-[0.6875rem] text-ink-muted">
                              {grupos[0].sede} · {grupos[0].modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                            </span>
                          </span>
                          <Badge tone={vacantes > 0 ? 'virtual' : 'neutral'}>
                            {vacantes > 0 ? plural(vacantes, 'vacante', 'vacantes') : 'Sin vacantes'}
                          </Badge>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </section>
        ) : (
          <section aria-label="Explorar talleres">
            <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
              {Object.values(CATEGORIAS_TALLER).map((c) => (
                <li key={c.ruta}>
                  <Fila
                    to={`/talleres/${c.ruta}`}
                    icon={c.icon}
                    titulo={c.label}
                    texto={c.descripcion}
                    cuenta={catalogo.isLoading ? undefined : String(cuantos(c.ruta === 'culturales' ? 'cultural' : 'deportivo'))}
                  />
                </li>
              ))}
              <li>
                <Fila
                  to="/talleres/mis"
                  icon="event_available"
                  titulo="Mis talleres"
                  texto="Tus inscripciones, horarios y detalles."
                  cuenta={mis.isLoading ? undefined : String(inscritos)}
                />
              </li>
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function Fila({ to, icon, titulo, texto, cuenta }: { to: string; icon: string; titulo: string; texto: string; cuenta?: string }) {
  return (
    <Link to={to} className="pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon name={icon} size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{titulo}</span>
        <span className="block text-xs leading-snug text-ink-muted">{texto}</span>
      </span>
      {cuenta !== undefined && <span className="shrink-0 text-xs font-semibold text-ink-muted">{cuenta}</span>}
      <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
    </Link>
  )
}
