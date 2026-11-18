import { useMemo } from 'react'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useNow } from '@/hooks/useNow'
import { dayCompact, parseISO, relativeDay, startOfDay } from '@/lib/date'
import { buildIcs, downloadIcs } from '@/lib/ics'
import type { Course } from '../coursesData'
import { recordingsOf, upcomingZoom, zoomInfo, type ZoomSession } from './courseContent'
import { useRaw } from './useCourseRaw'


const at = (s: ZoomSession, hhmm: string) => new Date(`${s.fecha}T${hhmm}:00`)

export default function ZoomTab({ course }: { course: Course }) {
  const { show } = useToast()
  const now = useNow(30000)
  const raw = useRaw()
  const info = useMemo(() => zoomInfo(raw), [raw])
  const sessions = useMemo(() => upcomingZoom(raw, now), [raw, now])
  const recs = useMemo(() => recordingsOf(raw), [raw])
  const next = sessions[0]

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      show(`${label} copiado`, 'content_copy')
    } catch {
      show('No se pudo copiar', 'error')
    }
  }

  const live = next && at(next, next.inicio).getTime() - now.getTime() <= 15 * 60000

  return (
    <div className="stagger space-y-3">
      <section aria-label="Próxima sesión" className="rounded-card bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Próxima sesión</h2>
          {next && (
            <span className="text-xs font-semibold text-primary">
              {relativeDay(parseISO(next.fecha), startOfDay(now))}
            </span>
          )}
        </div>

        {next ? (
          <>
            <p className="mt-2 text-base font-extrabold text-ink">
              {next.tipo} · {dayCompact(parseISO(next.fecha))}
            </p>
            <p className="text-sm text-ink-muted">
              {next.inicio} – {next.fin} · {course.docente}
            </p>
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
            >
              <Icon name="videocam" size={18} />
              {live ? 'Unirme ahora' : 'Unirme a la reunión'}
            </a>
            <button
              type="button"
              onClick={() => {
                downloadIcs(
                  `zoom-${course.id}.ics`,
                  buildIcs({
                    uid: `zoom-${course.id}-${next.fecha}`,
                    title: `${next.tipo}: ${course.nombre}`,
                    description: `Zoom ${info.meetingIdSpaced} · Código ${info.passcode}\n${info.url}`,
                    location: info.url,
                    start: at(next, next.inicio),
                    end: at(next, next.fin),
                  }),
                )
                show('Evento descargado', 'event_available')
              }}
              className="mx-auto mt-1 flex min-h-11 items-center px-4 text-sm font-semibold text-ink"
            >
              Añadir a mi calendario
            </button>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">No hay sesiones programadas por ahora.</p>
        )}
      </section>

      <section aria-label="Datos de la reunión" className="rounded-card bg-card px-4 shadow-card">
        <dl className="divide-y divide-fill/5">
          <Row label="ID de reunión" value={info.meetingIdSpaced} onCopy={() => copy('ID de reunión', info.meetingId)} />
          <Row label="Código de acceso" value={info.passcode} onCopy={() => copy('Código de acceso', info.passcode)} />
          <Row label="Enlace" value={info.url.replace('https://', '')} onCopy={() => copy('Enlace', info.url)} />
        </dl>
      </section>

      {sessions.length > 1 && (
        <section aria-labelledby="horario" className="rounded-card bg-card p-4 shadow-card">
          <h2 id="horario" className="text-sm font-bold text-ink">
            Horario de sesiones
          </h2>
          <ul className="mt-2 divide-y divide-fill/5">
            {sessions.map((s) => (
              <li key={s.fecha + s.inicio} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink">
                  {dayCompact(parseISO(s.fecha))}
                  <span className="block text-[0.6875rem] text-ink-muted">{s.tipo}</span>
                </span>
                <span className="text-xs font-semibold text-ink-muted">
                  {s.inicio} – {s.fin}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="grab" className="rounded-card bg-card p-4 shadow-card">
        <h2 id="grab" className="text-sm font-bold text-ink">
          Grabaciones
        </h2>
        <ul className="mt-2 divide-y divide-fill/5">
          {recs.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => show('Las grabaciones se publican desde el aula virtual', 'info')}
                className="pressable flex min-h-14 w-full items-center gap-3 py-2 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon name="play_arrow" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-ink">{r.titulo}</span>
                  <span className="block text-[0.6875rem] text-ink-muted">{r.duracion}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <dt className="text-[0.6875rem] text-ink-muted">{label}</dt>
        <dd className="truncate text-sm font-semibold text-ink">{value}</dd>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copiar ${label.toLowerCase()}`}
        className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fill/5 text-ink-muted"
      >
        <Icon name="content_copy" size={18} />
      </button>
    </div>
  )
}
