import { useMemo } from 'react'
import Icon from '@/components/ui/Icon'
import type { Course } from '../coursesData'
import { PASS_GRADE, evaluationsOf, summarize } from './courseContent'

const f = (n: number) => n.toFixed(2)

export default function GradesTab({ course }: { course: Course }) {
  const evals = useMemo(() => evaluationsOf(course.id), [course.id])
  const sum = useMemo(() => summarize(evals), [evals])

  // Mensaje según lo que falta para llegar a la nota mínima aprobatoria.
  let mensaje: { icon: string; text: string; ok: boolean }
  if (sum.necesario === null) {
    mensaje = { icon: 'flag', text: 'Todas tus evaluaciones están calificadas.', ok: sum.acumulado >= PASS_GRADE }
  } else if (sum.necesario <= 0) {
    mensaje = { icon: 'verified', text: 'Ya aseguraste la nota mínima aprobatoria.', ok: true }
  } else if (sum.necesario > 20) {
    mensaje = { icon: 'warning', text: 'Con las evaluaciones restantes ya no alcanzas la nota mínima.', ok: false }
  } else {
    mensaje = {
      icon: 'trending_up',
      text: `Necesitas un promedio de ${f(sum.necesario)} en lo que falta para aprobar con ${PASS_GRADE}.`,
      ok: true,
    }
  }

  return (
    <div className="space-y-3">
      <section aria-label="Resumen de notas" className="rounded-card bg-card p-4 shadow-card">
        <div className="grid grid-cols-2 divide-x divide-fill/5">
          <div className="pr-3">
            <p className="text-3xl font-extrabold tabular-nums text-ink">{f(sum.acumulado)}</p>
            <p className="mt-0.5 text-[0.6875rem] leading-tight text-ink-muted">Acumulado sobre 20</p>
          </div>
          <div className="pl-4">
            <p className="text-3xl font-extrabold tabular-nums text-ink">{sum.parcial === null ? '—' : f(sum.parcial)}</p>
            <p className="mt-0.5 text-[0.6875rem] leading-tight text-ink-muted">Promedio de lo calificado</p>
          </div>
        </div>
        <p
          className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs leading-snug ${
            mensaje.ok ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'
          }`}
        >
          <Icon name={mensaje.icon} size={16} className="mt-px shrink-0" />
          {mensaje.text}
        </p>
        <p className="mt-2 text-[0.6875rem] text-ink-muted">
          Calificado: {sum.pesoCalificado} % del curso · Nota mínima aprobatoria: {PASS_GRADE}
        </p>
      </section>

      <section aria-label="Detalle de notas" className="overflow-hidden rounded-card bg-card shadow-card">
        <table className="w-full text-left">
          <caption className="sr-only">Notas por evaluación</caption>
          <thead>
            <tr className="border-b border-fill/5 text-[0.6875rem] text-ink-muted">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Evaluación
              </th>
              <th scope="col" className="px-2 py-2.5 text-right font-medium">
                Peso
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Nota
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fill/5">
            {evals.map((e) => (
              <tr key={e.id}>
                <th scope="row" className="px-4 py-3 text-xs font-medium text-ink">
                  {e.nombre}
                  <span className="block text-[0.6875rem] font-normal text-ink-muted">Semana {e.semana}</span>
                </th>
                <td className="px-2 py-3 text-right text-xs text-ink-muted">{e.peso} %</td>
                <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-ink">
                  {e.nota !== undefined ? e.nota : <span className="font-medium text-ink-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
