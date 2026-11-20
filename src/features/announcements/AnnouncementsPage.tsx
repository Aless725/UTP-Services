import { useMemo, useState } from 'react'
import FlowHeader from '@/components/layout/FlowHeader'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { diffDays, parseISO, startOfDay } from '@/lib/date'
import AnnouncementRow from './AnnouncementRow'
import { CATEGORIES, useCampusAnnouncements, type CampusAnnouncement, type Categoria } from './announcementsData'

type Filter = 'todos' | 'asistire' | Categoria

export default function AnnouncementsPage() {
  const { data, isLoading, isError, refetch } = useCampusAnnouncements()
  const [filter, setFilter] = useState<Filter>('todos')

  const items = useMemo(() => data ?? [], [data])
  const mine = items.filter((a) => a.asistire).length
  const categorias = useMemo(
    () => (Object.keys(CATEGORIES) as Categoria[]).filter((c) => items.some((a) => a.categoria === c)),
    [items],
  )

  const list = items.filter((a) =>
    filter === 'todos' ? true : filter === 'asistire' ? a.asistire : a.categoria === filter,
  )

  // "Esta semana" (próximos 7 días) y "Más adelante".
  const today = startOfDay(new Date())
  const soon = list.filter((a) => diffDays(today, parseISO(a.fecha)) <= 7)
  const later = list.filter((a) => diffDays(today, parseISO(a.fecha)) > 7)

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Anuncios"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Campañas, eventos y actividades del campus."
      />

      {isLoading ? (
        <div role="status" aria-label="Cargando" className="mt-4 space-y-3 px-5">
          <Skeleton className="h-9 w-2/3 rounded-full" />
          <Skeleton className="h-14 w-full rounded-card" />
          <Skeleton className="h-14 w-full rounded-card" />
          <Skeleton className="h-14 w-full rounded-card" />
        </div>
      ) : isError ? (
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar los anuncios</p>
          <button type="button" onClick={() => refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Filtrar anuncios" className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
            <Chip active={filter === 'todos'} onClick={() => setFilter('todos')}>{`Todos (${items.length})`}</Chip>
            {mine > 0 && <Chip active={filter === 'asistire'} onClick={() => setFilter('asistire')}>{`Asistiré (${mine})`}</Chip>}
            {categorias.map((c) => (
              <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
                {CATEGORIES[c].label}
              </Chip>
            ))}
          </div>

          {list.length === 0 ? (
            <div key={filter} className="animate-rise mx-5 mt-4 flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
              <Icon name="campaign" size={32} className="text-ink-faint" />
              <p className="mt-2 text-sm font-medium text-ink">
                {filter === 'asistire' ? 'Aún no confirmaste ninguna actividad' : 'No hay anuncios por ahora'}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">Vuelve pronto para ver nuevas actividades.</p>
            </div>
          ) : (
            <div key={filter} className="animate-rise">
              {soon.length > 0 && <Group title="Esta semana" items={soon} />}
              {later.length > 0 && <Group title="Más adelante" items={later} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Group({ title, items }: { title: string; items: CampusAnnouncement[] }) {
  return (
    <section className="mt-5 px-5" aria-label={title}>
      <h2 className="text-[0.9375rem] font-bold text-ink">{title}</h2>
      <ul className="stagger mt-3 space-y-3">
        {items.map((a) => (
          <li key={a.id}>
            <AnnouncementRow item={a} withPlace />
          </li>
        ))}
      </ul>
    </section>
  )
}
