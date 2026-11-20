import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProfileButton from '@/components/layout/ProfileButton'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { eventsFor, type CalEvent } from '@/features/calendar/calendarData'
import AnnouncementRow from '@/features/announcements/AnnouncementRow'
import { useCampusAnnouncements } from '@/features/announcements/announcementsData'
import { useCourseList } from '@/features/courses/useCourses'
import Skeleton from '@/components/ui/Skeleton'
import { addDays, sameDay, shortWeekday, startOfDay } from '@/lib/date'

interface AgendaDay {
  date: Date
  event: CalEvent
}

/** Próximos 2 días (desde hoy) con clases. */
function useAgenda(): AgendaDay[] {
  return useMemo(() => {
    const out: AgendaDay[] = []
    const today = startOfDay(new Date())
    for (let i = 0; i < 14 && out.length < 2; i++) {
      const date = addDays(today, i)
      const clase = eventsFor(date).find((e) => e.kind === 'clase')
      if (clase) out.push({ date, event: clase })
    }
    return out
  }, [])
}

export default function HomePage() {
  const { session } = useAuth()
  const { show } = useToast()
  const agenda = useAgenda()
  const courses = useCourseList()
  const announcements = useCampusAnnouncements()
  // Los dos próximos anuncios destacados (si no hay destacados, los más próximos).
  const featured = useMemo(() => {
    const all = announcements.data ?? []
    const top = all.filter((x) => x.destacado)
    return (top.length ? top : all).slice(0, 2)
  }, [announcements.data])
  const today = startOfDay(new Date())

  return (
    <div className="pt-[max(env(safe-area-inset-top),20px)]">
      <header className="flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <ProfileButton />
          <span className="text-xs font-semibold text-ink">{session?.codigo}</span>
        </div>
        <button
          type="button"
          onClick={() => show('No tienes mensajes nuevos', 'mail')}
          aria-label="Mensajes"
          className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card"
        >
          <Icon name="mail" size={20} />
        </button>
      </header>

      <h1 className="animate-rise mt-4 px-5 text-title text-ink">Hola, {session?.nombre}</h1>

      <section className="mt-5 px-5" aria-labelledby="agenda">
        <h2 id="agenda" className="text-[0.9375rem] font-bold text-ink">
          Agenda
        </h2>
        <ul className="stagger mt-3 space-y-3">
          {agenda.map(({ date, event: e }) => (
            <li key={e.id + date.toISOString()} className="flex gap-3">
              <div className="w-9 shrink-0 text-center leading-none">
                <p className="text-xl font-extrabold text-ink">{date.getDate()}</p>
                <p className="mt-1 text-[0.625rem] text-ink-muted">
                  {sameDay(date, today) ? 'Hoy' : shortWeekday(date)}
                </p>
              </div>
              <Link
                to={`/cursos/${courses.find((c) => c.nombre === e.title)?.id ?? ''}`}
                className="pressable block flex-1 rounded-card bg-card p-3.5 shadow-card"
              >
                {e.modalidad && <Badge tone={e.modalidad === 'Virtual' ? 'virtual' : 'presencial'}>{e.modalidad}</Badge>}
                <p className="mt-1.5 text-sm font-bold text-ink">{e.title}</p>
                <p className="mt-0.5 text-xs text-ink">
                  {e.start} - {e.end}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-ink-muted">
                  <Icon name="location_on" size={13} />
                  {e.place}
                  {e.place.includes('·') ? '' : ` · ${e.modalidad}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 px-5" aria-labelledby="anuncios">
        <div className="flex items-center justify-between">
          <h2 id="anuncios" className="text-[0.9375rem] font-bold text-ink">
            Anuncios
          </h2>
          <Link to="/anuncios" className="flex min-h-11 items-center text-xs font-semibold text-primary">
            Ver todos
          </Link>
        </div>
        {announcements.isLoading ? (
          <div role="status" aria-label="Cargando anuncios" className="space-y-3">
            <Skeleton className="h-[4.25rem] w-full rounded-card" />
            <Skeleton className="h-[4.25rem] w-full rounded-card" />
          </div>
        ) : announcements.isError ? (
          <button
            type="button"
            onClick={() => announcements.refetch()}
            className="pressable flex min-h-14 w-full items-center gap-3 rounded-card bg-card p-3 text-left shadow-card"
          >
            <Icon name="cloud_off" size={20} className="text-ink-faint" />
            <span className="text-xs text-ink-muted">No pudimos cargar los anuncios. Toca para reintentar.</span>
          </button>
        ) : featured.length === 0 ? (
          <p className="rounded-card bg-card p-3.5 text-xs text-ink-muted shadow-card">No hay anuncios por ahora.</p>
        ) : (
          <ul className="stagger space-y-3">
            {featured.map((x) => (
              <li key={x.id}>
                <AnnouncementRow item={x} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 px-5" aria-labelledby="recursos">
        <h2 id="recursos" className="text-[0.9375rem] font-bold text-ink">
          Recursos
        </h2>
        <div className="stagger mt-3 grid grid-cols-2 gap-3">
          <Link
            to="/mas/biblioteca"
            className="pressable flex min-h-14 items-center gap-2 rounded-card bg-card px-3.5 py-3 shadow-card"
          >
            <Icon name="menu_book" size={20} className="text-primary" />
            <span className="text-sm font-bold text-ink">Biblioteca</span>
          </Link>
          <Link
            to="/mas/soporte"
            className="pressable flex min-h-14 items-center gap-2 rounded-card bg-card px-3.5 py-3 shadow-card"
          >
            <Icon name="headset_mic" size={20} className="text-success" />
            <span className="text-sm font-bold text-ink">Soporte</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
