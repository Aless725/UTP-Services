import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { useNow } from '@/hooks/useNow'
import { humanDay, parseISO, startOfDay } from '@/lib/date'
import { availabilityOf } from './availability'
import DateSedeSheet from './DateSedeSheet'
import { useDraft } from './draftStore'
import { useReservationData } from './reservationsStore'
import SpaceRow from './SpaceRow'
import { SPACES, TYPE_INFO, typeFromSlug, type Space, type SpaceType } from './spacesData'

interface FilterDef {
  id: string
  label: string
  test: (s: Space) => boolean
}

const FILTERS: Record<SpaceType, FilterDef[]> = {
  sala_grupal: [
    { id: 'todas', label: 'Todas', test: () => true },
    { id: 'tv', label: 'Con TV', test: (s) => s.equip.includes('tv') },
    { id: '8', label: '8+ personas', test: (s) => s.capMax >= 8 },
  ],
  pc: [
    { id: 'todas', label: 'Todas', test: () => true },
    { id: 'impresion', label: 'Con impresión', test: (s) => s.equip.includes('impresion') },
    { id: 'escaner', label: 'Con escáner', test: (s) => s.equip.includes('escaner') },
  ],
  cubiculo: [
    { id: 'todas', label: 'Todas', test: () => true },
    { id: 'pizarra', label: 'Con pizarra', test: (s) => s.equip.includes('pizarra') },
  ],
}

const PLURAL: Record<SpaceType, string> = { sala_grupal: 'salas', pc: 'PCs', cubiculo: 'cubículos' }

export default function SpaceListPage() {
  const { tipo: slug } = useParams()
  const tipo = typeFromSlug(slug)
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const now = useNow(60000)
  const { draft } = useDraft()
  const { all } = useReservationData(codigo)
  const [filter, setFilter] = useState('todas')
  const [sheet, setSheet] = useState(false)

  const rows = useMemo(() => {
    if (!tipo) return []
    const def = FILTERS[tipo].find((f) => f.id === filter) ?? FILTERS[tipo][0]
    return SPACES.filter((s) => s.tipo === tipo && s.sede === draft.sede && def.test(s))
      .map((s) => ({ space: s, availability: availabilityOf(s, draft.fecha, all, now) }))
      .sort((a, b) => Number(b.availability.ok) - Number(a.availability.ok))
  }, [tipo, filter, draft.sede, draft.fecha, all, now])

  if (!tipo) return <Navigate to="/reservas" replace />

  const info = TYPE_INFO[tipo]
  const available = rows.filter((r) => r.availability.ok).length

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title={info.titulo} back="/reservas" backLabel="Volver a reserva de espacios" />

      <div className="px-5">
        <section
          aria-label="Fecha y sede"
          className="mt-4 flex items-center gap-3 rounded-card bg-card p-3.5 shadow-card"
        >
          <Icon name="calendar_today" size={22} className="text-ink" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] text-ink-muted">Fecha y sede</p>
            <p className="text-sm font-bold leading-snug text-ink">
              {humanDay(parseISO(draft.fecha), startOfDay(now))} · {draft.sede}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSheet(true)}
            className="pressable flex min-h-11 items-center px-1 text-sm font-semibold text-primary"
          >
            Cambiar
          </button>
        </section>

        <div role="tablist" aria-label="Filtros" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {FILTERS[tipo].map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-ink-muted" aria-live="polite">
          {available} {available === 1 ? info.singular : PLURAL[tipo]} {available === 1 ? 'disponible' : 'disponibles'}
        </p>

        {rows.length === 0 ? (
          <div className="mt-3 rounded-card bg-card p-6 text-center shadow-card">
            <Icon name="search_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No hay espacios con ese filtro</p>
            <p className="text-xs text-ink-muted">Prueba con otra opción o cambia la sede.</p>
          </div>
        ) : (
          <ul key={filter + draft.fecha + draft.sede} className="stagger mt-3 space-y-3">
            {rows.map(({ space, availability }) => (
              <li key={space.id}>
                <SpaceRow space={space} availability={availability} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <DateSedeSheet open={sheet} onClose={() => setSheet(false)} />
    </div>
  )
}
