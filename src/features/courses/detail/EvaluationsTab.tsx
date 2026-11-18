import { useMemo } from 'react'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { dayCompact } from '@/lib/date'
import type { Course } from '../coursesData'
import { evaluationsOf } from './courseContent'

export default function EvaluationsTab({ course }: { course: Course }) {
  const evals = useMemo(() => evaluationsOf(course.id), [course.id])
  const next = evals.find((e) => e.estado !== 'calificada')

  return (
    <div className="space-y-3">
      {next && (
        <section className="flex items-center gap-3 rounded-card bg-primary-soft p-3.5">
          <Icon name="event" size={22} className="shrink-0 text-primary" />
          <p className="text-xs leading-snug text-ink">
            <span className="font-bold">Próxima evaluación:</span> {next.nombre}, {dayCompact(next.fecha).toLowerCase()} (
            semana {next.semana}).
          </p>
        </section>
      )}

      <ul className="stagger space-y-3">
        {evals.map((e) => (
          <li key={e.id} className="rounded-card bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-ink">{e.nombre}</h3>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Semana {e.semana} · {dayCompact(e.fecha)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-fill/5 px-2.5 py-0.5 text-[0.6875rem] font-bold text-ink">
                {e.peso} %
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {e.estado === 'calificada' ? (
                <>
                  <Badge tone="virtual">Calificada</Badge>
                  <span className="text-sm font-extrabold text-ink">
                    {e.nota} <span className="text-xs font-medium text-ink-muted">/ 20</span>
                  </span>
                </>
              ) : e.estado === 'esta_semana' ? (
                <Badge tone="presencial">Esta semana</Badge>
              ) : (
                <Badge tone="neutral">Próxima</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
