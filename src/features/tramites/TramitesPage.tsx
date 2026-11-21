import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { CATEGORIAS, precio, useSolicitudes, useTramiteTipos, type Categoria, type TramiteTipo } from './tramitesData'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function TramitesPage() {
  const tipos = useTramiteTipos()
  const solicitudes = useSolicitudes()
  const { detailPath } = useShell()
  const [categoria, setCategoria] = useState<Categoria>('autogestionable')
  const [query, setQuery] = useState('')

  const all = useMemo(() => tipos.data ?? [], [tipos.data])
  const q = norm(query.trim())
  // Al buscar se mira en las dos categorías; si no, solo en la elegida.
  const list = useMemo(
    () => (q ? all.filter((t) => norm(t.titulo).includes(q) || norm(t.descripcion).includes(q)) : all.filter((t) => t.categoria === categoria)),
    [all, q, categoria],
  )

  const activos = useMemo(
    () => new Set((solicitudes.data ?? []).filter((s) => s.estado === 'en_revision').map((s) => s.tipoId)),
    [solicitudes.data],
  )
  const enRevision = activos.size
  const total = solicitudes.data?.length ?? 0

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Trámites"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Solicita documentos y consulta el estado de tus solicitudes."
      />

      <div className="mt-4 px-5">
        <Link
          to="/tramites/seguimiento"
          className="pressable flex min-h-16 items-center gap-3 rounded-card bg-card px-3.5 py-3 shadow-card"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon name="pending_actions" size={20} filled />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">Mis solicitudes</span>
            <span className="block text-[0.6875rem] text-ink-muted">
              {solicitudes.isLoading
                ? 'Cargando…'
                : total === 0
                  ? 'Aún no tienes solicitudes'
                  : `${total} ${total === 1 ? 'solicitud' : 'solicitudes'}${enRevision ? ` · ${enRevision} en revisión` : ''}`}
            </span>
          </span>
          <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
        </Link>
      </div>

      <div className="mt-4 space-y-3 px-5">
        <label className="flex min-h-11 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={18} className="text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué trámite necesitas?"
            aria-label="Buscar trámite"
            className="h-11 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        {!q && (
          <SegmentedControl<Categoria>
            label="Categorías de trámites"
            value={categoria}
            onChange={setCategoria}
            options={[
              { value: 'autogestionable', label: CATEGORIAS.autogestionable.corto },
              { value: 'sae', label: CATEGORIAS.sae.corto },
            ]}
          />
        )}
      </div>

      <section aria-labelledby="catalogo" className="mt-5 px-5">
        <h2 id="catalogo" className="mb-2 px-1 text-sm font-bold text-ink">
          {q ? `Resultados (${list.length})` : CATEGORIAS[categoria].label}
        </h2>

        {tipos.isLoading ? (
          <div role="status" aria-label="Cargando" className="space-y-px overflow-hidden rounded-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-none" />
            ))}
          </div>
        ) : tipos.isError ? (
          <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
            <Icon name="cloud_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar los trámites</p>
            <button type="button" onClick={() => tipos.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="search_off" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">No encontramos trámites con «{query.trim()}»</p>
            <p className="mt-0.5 text-xs text-ink-muted">Prueba con otra palabra o pregúntale al asistente.</p>
          </div>
        ) : (
          <ul key={q ? 'busqueda' : categoria} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {list.map((t) => (
              <TramiteRow
                key={t.id}
                t={t}
                activo={activos.has(t.id)}
                seleccionado={detailPath === `/tramites/${t.id}`}
                mostrarCategoria={!!q}
              />
            ))}
          </ul>
        )}
      </section>

      <Link
        to="/soporte"
        className="pressable mx-5 mt-5 flex min-h-14 items-center gap-3 rounded-card bg-card px-3.5 shadow-card"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
          <Icon name="auto_awesome" size={18} filled />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">¿No encuentras tu trámite?</span>
          <span className="block text-[0.6875rem] text-ink-muted">Pregúntale al asistente</span>
        </span>
        <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
      </Link>
    </div>
  )
}

function TramiteRow({
  t,
  activo,
  seleccionado,
  mostrarCategoria,
}: {
  t: TramiteTipo
  activo: boolean
  seleccionado: boolean
  mostrarCategoria: boolean
}) {
  return (
    <li>
      <Link
        to={`/tramites/${t.id}`}
        aria-current={seleccionado ? 'page' : undefined}
        className={`pressable flex min-h-16 items-center gap-3 px-3.5 py-3 ${seleccionado ? 'bg-primary-soft' : ''}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={t.icono} size={20} filled />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-snug text-ink">{t.titulo}</span>
          <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">
            {mostrarCategoria && `${CATEGORIAS[t.categoria].corto} · `}
            {precio(t.costo)} · {t.plazo}
          </span>
        </span>
        {activo ? <Badge tone="neutral">En revisión</Badge> : <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />}
      </Link>
    </li>
  )
}
