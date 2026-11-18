import { useMemo, useState } from 'react'
import Icon from '@/components/ui/Icon'
import { dayCompactYear } from '@/lib/date'
import type { Course } from '../coursesData'
import { announcementsOf } from './courseContent'
import type { CourseStateApi } from './useCourseState'

export default function AnnouncementsTab({ course, state }: { course: Course; state: CourseStateApi }) {
  const items = useMemo(() => announcementsOf(course.id, course.docente), [course.id, course.docente])
  const [open, setOpen] = useState<string | null>(null)
  const isNew = (id: string, nuevo: boolean) => nuevo && !state.leidos.includes(id)
  const unread = items.filter((a) => isNew(a.id, a.nuevo)).length

  const toggle = (id: string) => {
    setOpen((o) => (o === id ? null : id))
    state.markRead(id)
  }

  return (
    <div>
      <p className="px-1 text-xs text-ink-muted" aria-live="polite">
        {unread > 0 ? `${unread} sin leer` : 'Estás al día con los anuncios'}
      </p>
      <ul className="stagger mt-2 space-y-3">
        {items.map((a) => {
          const expanded = open === a.id
          const fresh = isNew(a.id, a.nuevo)
          return (
            <li key={a.id} className="overflow-hidden rounded-card bg-card shadow-card">
              <button
                type="button"
                onClick={() => toggle(a.id)}
                aria-expanded={expanded}
                className="pressable flex min-h-16 w-full items-start gap-3 p-4 text-left"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    fresh ? 'bg-primary-soft text-primary' : 'bg-fill/5 text-ink-muted'
                  }`}
                >
                  <Icon name="campaign" size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`text-sm ${fresh ? 'font-extrabold' : 'font-bold'} text-ink`}>{a.titulo}</span>
                    {fresh && <span aria-label="Nuevo" className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">
                    {course.docente} · {dayCompactYear(a.fecha)}
                  </span>
                  {expanded ? (
                    <span className="animate-rise mt-2 block text-sm leading-snug text-ink">{a.texto}</span>
                  ) : (
                    <span className="mt-1 line-clamp-1 block text-xs text-ink-muted">{a.texto}</span>
                  )}
                </span>
                <Icon
                  name="expand_more"
                  size={20}
                  className={`mt-1 shrink-0 text-ink-muted transition-transform duration-300 ease-smooth ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
