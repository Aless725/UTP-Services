import { useId } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import { useNow } from '@/hooks/useNow'
import TallerCard from './components/TallerCard'
import TalleresState, { TalleresQuery } from './components/TalleresState'
import { categoriaDeRuta, CATEGORIAS_TALLER, normalizarBusquedaTaller, useTalleres } from './talleresData'

export default function CatalogoTalleresPage() {
  const { categoria } = useParams()
  const tipo = categoriaDeRuta(categoria)
  const catalogo = useTalleres()
  const [params] = useSearchParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const id = useId()
  const now = useNow()
  const q = (params.get('q') ?? '').slice(0, 120)
  const sede = (params.get('sede') ?? '').slice(0, 80)
  const modalidad = params.get('modalidad') ?? ''
  const periodo = (params.get('periodo') ?? '').slice(0, 80)
  const items = catalogo.data?.filter((t) => t.categoria === tipo) ?? []
  const todosGrupos = items.flatMap((t) => t.grupos)
  const sedes = [...new Set(todosGrupos.map((g) => g.sede))].sort()
  const periodos = [...new Map(todosGrupos.map((g) => [g.term_id, g.periodo])).entries()]
  const busqueda = normalizarBusquedaTaller(q)
  const visibles = items
    .map((t) => ({
      taller: t,
      grupos: t.grupos.filter(
        (g) =>
          (!sede || g.sede === sede) &&
          (!modalidad || g.modalidad === modalidad) &&
          (!periodo || g.term_id === periodo) &&
          (!busqueda ||
            normalizarBusquedaTaller(`${t.titulo} ${t.descripcion} ${g.docente} ${g.sede}`).includes(busqueda)),
      ),
    }))
    .filter((t) => t.grupos.length > 0)
  const cambiar = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    next.delete('grupo')
    if (value) next.set(key, value)
    else next.delete(key)
    navigate({ pathname: `/talleres/${categoria}`, search: next.toString() }, { replace: true })
  }
  const limpiar = () => navigate(`/talleres/${categoria}`, { replace: true })
  const filtrado = !!(q || sede || modalidad || periodo)
  if (!tipo)
    return (
      <div className="px-5 pt-5">
        <TalleresState
          title="No encontramos esta categoría"
          description="Explora los talleres culturales y deportivos disponibles."
          action="Ver talleres"
          to="/talleres"
        />
      </div>
    )
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader title={CATEGORIAS_TALLER[tipo].label} back="/talleres" backLabel="Volver a talleres" />
      <div className="space-y-4 px-5 pt-4">
        <label className="flex min-h-11 items-center gap-2 rounded-card bg-card px-3 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={20} className="shrink-0 text-ink-muted" />
          <input
            type="search"
            maxLength={120}
            value={q}
            onChange={(e) => cambiar('q', e.target.value)}
            aria-label="Buscar talleres"
            placeholder="Taller, docente o sede…"
            className="h-11 min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-sede`} className="mb-1 block text-xs font-semibold text-ink-muted">
              Sede
            </label>
            <select
              id={`${id}-sede`}
              value={sede}
              onChange={(e) => cambiar('sede', e.target.value)}
              className="min-h-11 w-full rounded-lg bg-card px-2 text-xs text-ink focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas las sedes</option>
              {sede && !sedes.includes(sede) && <option value={sede}>{sede}</option>}
              {sedes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-modalidad`} className="mb-1 block text-xs font-semibold text-ink-muted">
              Modalidad
            </label>
            <select
              id={`${id}-modalidad`}
              value={modalidad}
              onChange={(e) => cambiar('modalidad', e.target.value)}
              className="min-h-11 w-full rounded-lg bg-card px-2 text-xs text-ink focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              {modalidad && !['presencial', 'virtual'].includes(modalidad) && (
                <option value={modalidad}>Otra modalidad</option>
              )}
            </select>
          </div>
        </div>
        {periodos.length > 1 && (
          <div>
            <label htmlFor={`${id}-periodo`} className="mb-1 block text-xs font-semibold text-ink-muted">
              Período académico
            </label>
            <select
              id={`${id}-periodo`}
              value={periodo}
              onChange={(e) => cambiar('periodo', e.target.value)}
              className="min-h-11 w-full rounded-lg bg-card px-2 text-xs text-ink focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los períodos</option>
              {periodos.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
        {filtrado && (
          <button
            type="button"
            onClick={limpiar}
            className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary"
          >
            <Icon name="filter_alt_off" size={18} />
            Quitar filtros
          </button>
        )}
        <TalleresQuery query={catalogo}>
          {visibles.length === 0 ? (
            <TalleresState
              title={filtrado ? 'No encontramos talleres para esta búsqueda' : 'Aún no hay talleres disponibles'}
              icon="search_off"
              description={
                filtrado
                  ? 'Prueba con otro término o quita los filtros.'
                  : 'Vuelve más adelante para consultar nuevas convocatorias.'
              }
              action={filtrado ? 'Ver todos los talleres' : undefined}
              onAction={limpiar}
            />
          ) : (
            <section aria-label="Talleres disponibles" className="space-y-3">
              <p role="status" className="text-xs text-ink-muted">
                {visibles.length} {visibles.length === 1 ? 'taller disponible' : 'talleres disponibles'}
              </p>
              {visibles.map(({ taller, grupos }) => (
                <TallerCard key={taller.id} taller={taller} grupos={grupos} search={search} now={now} />
              ))}
            </section>
          )}
        </TalleresQuery>
      </div>
    </div>
  )
}
