import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import {
  NOTIF_META,
  dayGroup,
  timeAgo,
  useMarkRead,
  useNotifications,
  type AppNotification,
} from './notificationsData'

type Filter = 'todas' | 'sin_leer'
const GROUPS = ['Hoy', 'Ayer', 'Anteriores'] as const

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkRead()
  const navigate = useNavigate()
  const { show } = useToast()
  const [filter, setFilter] = useState<Filter>('todas')

  const all = useMemo(() => data ?? [], [data])
  const unread = all.filter((n) => !n.leida)
  const list = filter === 'sin_leer' ? unread : all

  const open = (n: AppNotification) => {
    if (!n.leida) markRead([n.id]).catch(() => undefined)
    if (n.ruta) navigate(n.ruta)
  }

  const markAll = () =>
    markRead(unread.map((n) => n.id))
      .then(() => show('Todo al día', 'done_all'))
      .catch(() => show('No pudimos marcarlas. Inténtalo de nuevo.', 'error'))

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Notificaciones"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle={unread.length ? `${unread.length} sin leer` : 'Estás al día.'}
        right={
          unread.length > 0 ? (
            <button
              type="button"
              onClick={markAll}
              className="pressable flex min-h-11 items-center gap-1 px-1 text-xs font-semibold text-primary"
            >
              <Icon name="done_all" size={18} />
              Marcar todas
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div role="status" aria-label="Cargando" className="mt-4 space-y-3 px-5">
          <Skeleton className="h-9 w-1/2 rounded-full" />
          <Skeleton className="h-[4.5rem] w-full rounded-card" />
          <Skeleton className="h-[4.5rem] w-full rounded-card" />
          <Skeleton className="h-[4.5rem] w-full rounded-card" />
        </div>
      ) : isError ? (
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar tus notificaciones</p>
          <button type="button" onClick={() => refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Filtrar notificaciones" className="mt-4 flex gap-2 px-5">
            <Chip active={filter === 'todas'} onClick={() => setFilter('todas')}>{`Todas (${all.length})`}</Chip>
            <Chip active={filter === 'sin_leer'} onClick={() => setFilter('sin_leer')}>{`Sin leer (${unread.length})`}</Chip>
          </div>

          {list.length === 0 ? (
            <div key={filter} className="animate-rise mx-5 mt-4 flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
              <Icon name="notifications_off" size={32} className="text-ink-faint" />
              <p className="mt-2 text-sm font-medium text-ink">
                {filter === 'sin_leer' ? 'No tienes notificaciones sin leer' : 'Aún no tienes notificaciones'}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">Aquí verás avisos de tus reservas, tareas, notas y actividades.</p>
            </div>
          ) : (
            <div key={filter} className="animate-rise">
              {GROUPS.map((g) => {
                const items = list.filter((n) => dayGroup(n.creada) === g)
                if (!items.length) return null
                return (
                  <section key={g} className="mt-5 px-5" aria-label={g}>
                    <h2 className="text-[0.9375rem] font-bold text-ink">{g}</h2>
                    <ul className="stagger mt-3 space-y-3">
                      {items.map((n) => (
                        <li key={n.id}>
                          <Row n={n} onOpen={() => open(n)} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Row({ n, onOpen }: { n: AppNotification; onOpen: () => void }) {
  const meta = NOTIF_META[n.tipo]
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${n.leida ? '' : 'Sin leer. '}${n.titulo}. ${n.cuerpo}`}
      className="pressable flex w-full items-start gap-3 rounded-card bg-card p-3 text-left shadow-card"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
        <Icon name={meta.icon} size={20} filled />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={`text-sm text-ink ${n.leida ? 'font-semibold' : 'font-bold'}`}>{n.titulo}</span>
          {!n.leida && <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-ink-muted">{n.cuerpo}</span>
        <span className="mt-1 block text-[0.625rem] text-ink-faint">{timeAgo(n.creada)}</span>
      </span>
    </button>
  )
}
