import { useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { dayCompact } from '@/lib/date'
import type { Course } from '../coursesData'
import { evaluationsOf } from './courseContent'

type Filter = 'todas' | 'calificadas' | 'pendientes'

export default function EvaluationsTab({ course }: { course: Course }) {
  const evals = useMemo(() => evaluationsOf(course.id), [course.id])
  const [filter, setFilter] = useState<Filter>('todas')

  const graded = evals.filter((e) => e.estado === 'calificada')
  const pending = evals.filter((e) => e.estado !== 'calificada')
  const list = filter === 'calificadas' ? graded : filter === 'pendientes' ? pending : evals
  const next = pending[0]

  return (
    <div>
      <div role="tablist" aria-label="Filtrar evaluaciones" className="flex gap-2">
        <Chip active={filter === 'todas'} onClick={() => setFilter('todas')}>{`Todas (${evals.length})`}</Chip>
        <Chip active={filter === 'calificadas'} onClick={() => setFilter('calificadas')}>
          {`Calificadas (${graded.length})`}
        </Chip>
        <Chip active={filter === 'pendientes'} onClick={() => setFilter('pendientes')}>
          {`Sin calificar (${pending.length})`}
        </Chip>
      </div>

      {next && filter !== 'calificadas' && (
        <p className="mt-3 flex items-center gap-2 rounded-card bg-primary-soft p-3 text-xs leading-snug text-ink">
          <Icon name="event" size={18} className="shrink-0 text-primary" />
          <span>
            <span className="font-bold">Próxima:</span> {next.nombre}, {dayCompact(next.fecha).toLowerCase()}
          </span>
        </p>
      )}

      <ul key={filter} className="stagger mt-3 space-y-3" aria-live="polite">
        {list.map((e) => (
          <li key={e.id} className="flex items-center gap-3 rounded-card bg-card p-4 shadow-card">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-ink">{e.nombre}</h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                Semana {e.semana} · {dayCompact(e.fecha)} · {e.peso} %
              </p>
            </div>
            {e.estado === 'calificada' ? (
              <span className="text-right">
                <span className="block text-lg font-extrabold leading-none text-ink">{e.nota}</span>
                <span className="text-[0.625rem] text-ink-muted">de 20</span>
              </span>
            ) : e.estado === 'esta_semana' ? (
              <Badge tone="presencial">Esta semana</Badge>
            ) : (
              <Badge tone="neutral">Próxima</Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
