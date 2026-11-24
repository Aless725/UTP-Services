import { useId } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import { useNow } from '@/hooks/useNow'
import EmpleabilidadState, { EmpleoQuery } from './components/EmpleabilidadState'
import OfertaCard from './components/OfertaCard'
import { filtrarOfertas, leerFiltros, TIPOS_OFERTA, useMisPostulaciones, useOfertas } from './empleabilidadData'

export default function OfertasPage() {
  const ofertas = useOfertas()
  const postulaciones = useMisPostulaciones()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  const filtros = leerFiltros(params)
  const now = useNow()
  const visibles = filtrarOfertas(ofertas.data ?? [], filtros, now)
  const ciudades = [...new Set((ofertas.data ?? []).map((o) => o.ciudad))].sort()
  if (filtros.ciudad && !ciudades.includes(filtros.ciudad)) ciudades.push(filtros.ciudad)
  const id = useId()

  const cambiar = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    navigate({ pathname: '/empleabilidad/ofertas', search: next.toString() }, { replace: true })
  }
  const limpiar = () => navigate('/empleabilidad/ofertas', { replace: true })
  const filtrado = !!(filtros.q || filtros.tipo || filtros.ciudad)
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Bolsa de trabajo"
        back="/empleabilidad"
        backLabel="Volver a empleabilidad"
        subtitle="Encuentra tu empleo ahora."
      />
      <div className="space-y-4 px-5 pt-4">
        <label className="flex min-h-12 items-center gap-2 rounded-card bg-card px-3 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={20} className="shrink-0 text-ink-muted" />
          <input
            type="search"
            maxLength={120}
            value={filtros.q}
            onChange={(e) => cambiar('q', e.target.value)}
            aria-label="Buscar ofertas por puesto, empresa o requisitos"
            placeholder="Puesto, empresa, requisitos…"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-tipo`} className="mb-1 block text-xs font-semibold text-ink-muted">
              Tipo de empleo
            </label>
            <select
              id={`${id}-tipo`}
              value={filtros.tipo}
              onChange={(e) => cambiar('tipo', e.target.value)}
              className="min-h-11 w-full rounded-lg bg-card px-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPOS_OFERTA).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-ciudad`} className="mb-1 block text-xs font-semibold text-ink-muted">
              Ciudad
            </label>
            <select
              id={`${id}-ciudad`}
              value={filtros.ciudad}
              onChange={(e) => cambiar('ciudad', e.target.value)}
              className="min-h-11 w-full rounded-lg bg-card px-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
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
        <EmpleoQuery query={ofertas}>
          {visibles.length === 0 ? (
            <EmpleabilidadState
              icon="search_off"
              title={filtrado ? 'No encontramos oportunidades' : 'No hay convocatorias abiertas'}
              description={
                filtrado
                  ? 'Prueba con otro término o quita los filtros para ampliar tu búsqueda.'
                  : 'Vuelve más adelante para encontrar nuevas ofertas laborales.'
              }
              action={filtrado ? 'Ver todas las ofertas' : undefined}
              onAction={limpiar}
            />
          ) : (
            <section aria-label="Ofertas disponibles" className="space-y-3">
              <p role="status" className="text-xs text-ink-muted">
                {visibles.length} {visibles.length === 1 ? 'oportunidad disponible' : 'oportunidades disponibles'}
              </p>
              {visibles.map((o) => (
                <OfertaCard
                  key={o.id}
                  oferta={o}
                  search={search}
                  postulada={postulaciones.data?.some((p) => p.oferta_id === o.id)}
                />
              ))}
            </section>
          )}
        </EmpleoQuery>
      </div>
    </div>
  )
}
