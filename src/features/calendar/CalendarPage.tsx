import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useCourseList } from '@/features/courses/useCourses'
import { addDays, longDay, monthYear, sameDay, startOfDay } from '@/lib/date'
import { eventsFor, hasHighlights, kindLabel, type CalEvent, type EventKind } from './calendarData'

const FILTERS: { value: 'todo' | EventKind; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'clase', label: 'Clases' },
  { value: 'tutoria', label: 'Tutorías' },
  { value: 'actividad', label: 'Actividades' },
]
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** Celdas del mes (semana inicia lunes), incluyendo días de meses vecinos. */
function buildGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const start = addDays(first, -offset)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const rows = Math.ceil((offset + daysInMonth) / 7)
  return Array.from({ length: rows * 7 }, (_, i) => addDays(start, i))
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const today = useMemo(() => startOfDay(new Date()), [])
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(today)
  const [filter, setFilter] = useState<'todo' | EventKind>('todo')
  const [dir, setDir] = useState<1 | -1>(1)

  const courses = useCourseList()
  const grid = useMemo(() => buildGrid(month), [month])
  const events = useMemo(
    () => eventsFor(selected).filter((e) => filter === 'todo' || e.kind === filter),
    [selected, filter],
  )

  // Las clases abren el detalle de su curso; el resto de actividades aún no tiene detalle.
  const openEvent = (e: CalEvent) => {
    const course = e.kind === 'clase' ? courses.find((c) => c.nombre === e.title) : undefined
    if (course) navigate(`/cursos/${course.id}`)
    else show('El detalle de esta actividad estará disponible pronto', 'info')
  }

  const goMonth = (delta: number) => {
    setDir(delta > 0 ? 1 : -1)
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }
  const goToday = () => {
    setDir(today >= month ? 1 : -1)
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(today)
  }

  return (
    <>
      <PageHeader title="Calendario" />

      <section aria-label="Calendario mensual" className="mx-5 mt-4 rounded-card bg-card p-3.5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">{monthYear(month)}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToday}
              className="pressable mr-1 min-h-11 px-2 text-xs font-bold text-primary"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Mes anterior"
              className="pressable flex h-11 w-9 items-center justify-center"
            >
              <Icon name="chevron_left" size={22} />
            </button>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Mes siguiente"
              className="pressable flex h-11 w-9 items-center justify-center"
            >
              <Icon name="chevron_right" size={22} />
            </button>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-7 text-center text-[0.625rem] font-medium text-ink-muted">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="py-1">
              {d}
            </span>
          ))}
        </div>

        <div
          key={month.toISOString()}
          role="grid"
          className={`grid grid-cols-7 gap-y-0.5 ${dir > 0 ? 'animate-slide-next' : 'animate-slide-prev'}`}
        >
          {grid.map((d) => {
            const inMonth = d.getMonth() === month.getMonth()
            const isToday = sameDay(d, today)
            const isSelected = sameDay(d, selected)
            return (
              <button
                key={d.toISOString()}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-label={longDay(d)}
                onClick={() => setSelected(d)}
                className="pressable relative mx-auto flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs transition-colors duration-200 ${
                    isSelected
                      ? 'scale-100 bg-primary font-bold text-white shadow-card'
                      : isToday
                        ? 'font-bold text-primary ring-1 ring-primary/40'
                        : inMonth
                          ? 'text-ink'
                          : 'text-ink-faint'
                  }`}
                >
                  {d.getDate()}
                </span>
                {hasHighlights(d) && inMonth && (
                  <span
                    className={`absolute bottom-0.5 h-1 w-1 rounded-full ${isSelected ? 'bg-card' : 'bg-primary'}`}
                    style={isSelected ? { bottom: 7 } : undefined}
                  />
                )}
              </button>
            )
          })}
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Filtrar actividades"
        className="no-scrollbar mx-5 mt-4 flex gap-2 overflow-x-auto"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`pressable min-h-9 shrink-0 rounded-full px-4 text-xs font-medium transition-colors ${
              filter === f.value ? 'bg-ink text-surface' : 'bg-card text-ink-muted shadow-card'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="mx-5 mt-5" aria-live="polite">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold text-ink">{longDay(selected)}</h2>
          <span className="text-xs font-medium text-primary">
            {events.length} {events.length === 1 ? 'actividad' : 'actividades'}
          </span>
        </div>

        {events.length === 0 ? (
          <div key={selected.toISOString() + filter} className="animate-rise mt-4 flex flex-col items-center rounded-card bg-card py-10 text-center shadow-card">
            <Icon name="event_available" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">Sin actividades</p>
            <p className="text-xs text-ink-muted">Disfruta tu tiempo libre.</p>
          </div>
        ) : (
          <ul key={selected.toISOString() + filter} className="stagger mt-3 space-y-3">
            {events.map((e) => (
              <EventRow key={e.id} event={e} onOpen={() => openEvent(e)} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function EventRow({ event: e, onOpen }: { event: CalEvent; onOpen: () => void }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-11 shrink-0 text-center leading-tight">
        <p className="text-xs font-bold text-ink">{e.start}</p>
        <p className="text-[0.6875rem] text-ink-muted">{e.end}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="pressable flex min-h-16 flex-1 items-center gap-2 rounded-card bg-card p-3 text-left shadow-card"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ink">{e.title}</p>
          <p className="text-[0.6875rem] text-ink-muted">
            {kindLabel(e.kind)} · {e.place}
          </p>
          <div className="mt-1.5">
            {e.modalidad ? (
              <Badge tone={e.modalidad === 'Virtual' ? 'virtual' : 'presencial'}>{e.modalidad}</Badge>
            ) : (
              <Badge tone="neutral">{e.status ?? ''}</Badge>
            )}
          </div>
        </div>
        <Icon name="chevron_right" size={20} className="text-ink-muted" />
      </button>
    </li>
  )
}
