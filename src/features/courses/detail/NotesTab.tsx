import { useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { dayCompact } from '@/lib/date'
import GradeCalculator from './GradeCalculator'
import { PASS_GRADE, evaluationsOf, summarize, type Evaluation } from './courseContent'
import { useRaw } from './useCourseRaw'

type Filter = 'todas' | 'calificadas' | 'sin_calificar'

const one = (n: number) => n.toFixed(1)

/** Mensaje corto y claro sobre cómo vas en el curso. */
function statusOf(acumulado: number, necesario: number | null): { tone: 'ok' | 'warn' | 'info'; text: string } {
  if (necesario === null) {
    return acumulado >= PASS_GRADE
      ? { tone: 'ok', text: 'Curso aprobado' }
      : { tone: 'warn', text: 'No alcanzaste la nota mínima' }
  }
  if (necesario <= 0) return { tone: 'ok', text: 'Ya aprobaste el curso' }
  if (necesario > 20) return { tone: 'warn', text: 'Aprobar ya no es posible' }
  return { tone: 'info', text: `Necesitas ${one(necesario)} de promedio en lo que falta` }
}

/** Notas del curso: una sola vista con tu nota acumulada, filtros y el detalle por evaluación. */
export default function NotesTab() {
  const raw = useRaw()
  const evals = useMemo(() => evaluationsOf(raw), [raw])
  const sum = useMemo(() => summarize(evals), [evals])
  const [filter, setFilter] = useState<Filter>('todas')
  const [calc, setCalc] = useState(false)

  const graded = evals.filter((e) => e.nota !== undefined)
  const pending = evals.filter((e) => e.nota === undefined)
  const list = filter === 'calificadas' ? graded : filter === 'sin_calificar' ? pending : evals
  const status = statusOf(sum.acumulado, sum.necesario)

  return (
    <div className="space-y-3">
      <section aria-label="Resumen de notas" className="rounded-card bg-card p-4 shadow-card">
        <p className="text-[0.6875rem] text-ink-muted">Nota acumulada</p>
        <div className="mt-0.5 flex items-end justify-between gap-3">
          <p className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tabular-nums leading-none text-ink">{sum.acumulado.toFixed(2)}</span>
            <span className="text-sm text-ink-muted">de 20</span>
          </p>
          {sum.parcial !== null && (
            <p className="text-right">
              <span className={`block text-xl font-extrabold leading-none tabular-nums ${sum.parcial < PASS_GRADE ? 'text-primary' : 'text-ink'}`}>
                {one(sum.parcial)}
              </span>
              <span className="mt-0.5 block text-[0.625rem] text-ink-muted">promedio de lo calificado</span>
            </p>
          )}
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={20}
          aria-valuenow={Number(sum.acumulado.toFixed(2))}
          aria-label="Nota acumulada sobre 20"
          className="relative mt-3 h-1.5 rounded-full bg-fill/10"
        >
          <div className="h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${Math.min(1, sum.acumulado / 20)})`, width: '100%' }} />
          <span
            aria-hidden="true"
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-ink"
            style={{ left: `${(PASS_GRADE / 20) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[0.625rem] text-ink-muted" style={{ marginLeft: `calc(${(PASS_GRADE / 20) * 100}% - 0.5rem)` }}>
          {PASS_GRADE}
        </p>
        <p
          className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
            status.tone === 'ok' ? 'text-success' : status.tone === 'warn' ? 'text-primary' : 'text-ink'
          }`}
        >
          <Icon name={status.tone === 'ok' ? 'check_circle' : status.tone === 'warn' ? 'warning' : 'trending_up'} size={16} />
          {status.text}
        </p>
      </section>

      <div role="tablist" aria-label="Filtrar evaluaciones" className="flex gap-2">
        <Chip active={filter === 'todas'} onClick={() => setFilter('todas')}>{`Todas (${evals.length})`}</Chip>
        <Chip active={filter === 'calificadas'} onClick={() => setFilter('calificadas')}>{`Calificadas (${graded.length})`}</Chip>
        <Chip active={filter === 'sin_calificar'} onClick={() => setFilter('sin_calificar')}>{`Sin calificar (${pending.length})`}</Chip>
      </div>

      {list.length === 0 ? (
        <div key={filter} className="animate-rise flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
          <Icon name="fact_check" size={32} className="text-ink-faint" />
          <p className="mt-2 text-sm font-medium text-ink">
            {filter === 'calificadas' ? 'Aún no tienes notas publicadas' : 'No te falta ninguna evaluación'}
          </p>
        </div>
      ) : (
        <ul key={filter} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {list.map((e) => (
            <EvalRow key={e.id} e={e} />
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <section className="overflow-hidden rounded-card bg-card shadow-card">
          <button
            type="button"
            onClick={() => setCalc((o) => !o)}
            aria-expanded={calc}
            aria-controls="calculadora"
            className="pressable flex min-h-14 w-full items-center gap-3 px-3.5 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Icon name="calculate" size={18} />
            </span>
            <span className="flex-1 text-sm font-bold text-ink">¿Cuánto necesito para aprobar?</span>
            <Icon
              name="expand_more"
              size={20}
              className={`text-ink-muted transition-transform duration-300 ease-smooth ${calc ? 'rotate-180' : ''}`}
            />
          </button>
          {calc && (
            <div id="calculadora" className="animate-rise border-t border-fill/5 px-3.5 pb-3.5 pt-3">
              <GradeCalculator evals={evals} acumulado={sum.acumulado} />
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function EvalRow({ e }: { e: Evaluation }) {
  const graded = e.nota !== undefined
  return (
    <li className="flex min-h-[3.75rem] items-center gap-3 px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{e.nombre}</p>
        <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
          {graded ? `Semana ${e.semana}` : e.estado === 'esta_semana' ? 'Esta semana' : dayCompact(e.fecha)} · {e.peso} %
        </p>
      </div>
      {graded ? (
        <span className={`text-xl font-extrabold tabular-nums ${(e.nota as number) < PASS_GRADE ? 'text-primary' : 'text-ink'}`}>
          {e.nota}
        </span>
      ) : e.estado === 'esta_semana' ? (
        <Badge tone="presencial">Esta semana</Badge>
      ) : (
        <Badge tone="neutral">Pendiente</Badge>
      )}
    </li>
  )
}
