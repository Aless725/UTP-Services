import { useMemo, useState } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import { diffDays, parseISO, startOfDay, toISO, dayCompactYear } from '@/lib/date'
import type { Course } from '../coursesData'
import { announcementsOf, type Announcement } from './courseContent'
import { useRaw } from './useCourseRaw'

import type { CourseStateApi } from './useCourseState'

/** "Hoy", "Ayer", "Hace 3 días", "Hace 2 semanas" o la fecha si es antigua. */
function ago(d: Date): string {
  const n = diffDays(d, startOfDay(new Date()))
  if (n <= 0) return 'Hoy'
  if (n === 1) return 'Ayer'
  if (n < 7) return `Hace ${n} días`
  if (n < 30) return `Hace ${Math.floor(n / 7)} ${Math.floor(n / 7) === 1 ? 'semana' : 'semanas'}`
  return dayCompactYear(parseISO(toISO(d)))
}

/**
 * Lista limpia: solo título, antigüedad y un punto si es nuevo.
 * El texto completo se lee al tocar, en una hoja, para no saturar la pantalla.
 */
export default function AnnouncementsTab({ course, state }: { course: Course; state: CourseStateApi }) {
  const raw = useRaw()
  const items = useMemo(() => announcementsOf(raw), [raw])
  const [openId, setOpenId] = useState<string | null>(null)
  const [last, setLast] = useState<Announcement | null>(null)
  const current = items.find((a) => a.id === openId) ?? null
  if (current && current !== last) setLast(current)
  const shown = current ?? last

  const isNew = (a: Announcement) => a.nuevo && !state.leidos.includes(a.id)
  const unread = items.filter(isNew)

  const open = (a: Announcement) => {
    setOpenId(a.id)
    state.markRead(a.id)
  }

  return (
    <div>
      <div className="flex min-h-9 items-center justify-between px-1">
        <p className="text-xs text-ink-muted" aria-live="polite">
          {unread.length > 0 ? `${unread.length} sin leer` : 'Estás al día'}
        </p>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={() => unread.forEach((a) => state.markRead(a.id))}
            className="flex min-h-9 items-center text-xs font-semibold text-primary"
          >
            Marcar como leídos
          </button>
        )}
      </div>

      <ul className="stagger mt-1 overflow-hidden rounded-card bg-card shadow-card">
        {items.map((a, i) => {
          const fresh = isNew(a)
          return (
            <li key={a.id} className={i > 0 ? 'border-t border-fill/5' : ''}>
              <button
                type="button"
                onClick={() => open(a)}
                className="pressable flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left active:bg-surface"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${fresh ? 'bg-primary' : 'bg-transparent'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${fresh ? 'font-extrabold' : 'font-medium'} text-ink`}>
                    {a.titulo}
                    {fresh && <span className="sr-only"> (nuevo)</span>}
                  </span>
                  <span className="block text-[0.6875rem] text-ink-muted">{ago(a.fecha)}</span>
                </span>
                <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
              </button>
            </li>
          )
        })}
      </ul>

      <BottomSheet open={!!current} onClose={() => setOpenId(null)} title={shown?.titulo ?? 'Anuncio'}>
        {shown && (
          <div className="pb-2">
            <p className="text-xs text-ink-muted">
              {course.docente} · {ago(shown.fecha)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{shown.texto}</p>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
