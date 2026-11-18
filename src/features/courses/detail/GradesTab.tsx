import { useMemo, useState } from 'react'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import type { Course } from '../coursesData'
import { PASS_GRADE, evaluationsOf, summarize } from './courseContent'
import { useRaw } from './useCourseRaw'


const f = (n: number) => n.toFixed(2)
const GOALS = [PASS_GRADE, 14, 16, 18]

/** Convierte lo escrito en una nota válida (0 a 20) o null si está vacío o es inválido. */
function parseGrade(raw: string): number | null {
  const n = Number(raw.replace(',', '.'))
  return raw.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 20 ? n : null
}

export default function GradesTab(_props: { course: Course }) {
  const raw = useRaw()
  const evals = useMemo(() => evaluationsOf(raw), [raw])
  const sum = useMemo(() => summarize(evals), [evals])

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
      </section>

      <Calculator evals={evals} acumulado={sum.acumulado} />

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

/** Simula las notas que faltan y calcula qué se necesita para llegar a la meta. */
function Calculator({ evals, acumulado }: { evals: ReturnType<typeof evaluationsOf>; acumulado: number }) {
  const pending = evals.filter((e) => e.nota === undefined)
  const [goal, setGoal] = useState<number>(PASS_GRADE)
  const [values, setValues] = useState<Record<string, string>>({})

  if (pending.length === 0) return null

  const filled = pending.filter((e) => parseGrade(values[e.id] ?? '') !== null)
  const simulated = filled.reduce((s, e) => s + (parseGrade(values[e.id] as string) as number) * (e.peso / 100), 0)
  const base = acumulado + simulated
  const rest = pending.filter((e) => !filled.includes(e)).reduce((s, e) => s + e.peso, 0)
  const needed = rest > 0 ? (goal - base) / (rest / 100) : null

  let result: { ok: boolean; icon: string; title: string; detail?: string }
  if (needed === null) {
    result =
      base >= goal
        ? { ok: true, icon: 'verified', title: `Tu nota final sería ${f(base)}`, detail: `Alcanzas tu meta de ${goal}.` }
        : { ok: false, icon: 'warning', title: `Tu nota final sería ${f(base)}`, detail: `No llegas a ${goal}.` }
  } else if (needed <= 0) {
    result = { ok: true, icon: 'verified', title: 'Meta asegurada', detail: `Con lo que ingresaste ya llegas a ${goal}.` }
  } else if (needed > 20) {
    result = { ok: false, icon: 'warning', title: 'Esa meta ya no es posible', detail: `Ni con 20 en lo que falta llegarías a ${goal}.` }
  } else {
    result = {
      ok: true,
      icon: 'trending_up',
      title: `Necesitas ${f(needed)} de promedio`,
      detail: `En lo que falta (${rest} % del curso) para llegar a ${goal}.`,
    }
  }

  return (
    <section aria-labelledby="calc" className="rounded-card bg-card p-4 shadow-card">
      <h2 id="calc" className="flex items-center gap-2 text-sm font-bold text-ink">
        <Icon name="calculate" size={18} className="text-primary" />
        Calculadora de notas
      </h2>
      <p className="mt-0.5 text-xs text-ink-muted">Simula tus próximas notas y mira si llegas a tu meta.</p>

      <p className="mt-3 text-xs font-semibold text-ink-muted" id="meta">
        Mi meta
      </p>
      <div role="tablist" aria-labelledby="meta" className="mt-1.5 flex gap-2">
        {GOALS.map((g) => (
          <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>
            {g === PASS_GRADE ? `Aprobar (${g})` : String(g)}
          </Chip>
        ))}
      </div>

      <ul className="mt-3 divide-y divide-fill/5">
        {pending.map((e) => {
          const raw = values[e.id] ?? ''
          const invalid = raw.trim() !== '' && parseGrade(raw) === null
          return (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <label htmlFor={`n-${e.id}`} className="min-w-0 text-sm text-ink">
                <span className="block truncate">{e.nombre}</span>
                <span className="text-[0.6875rem] text-ink-muted">{e.peso} % del curso</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id={`n-${e.id}`}
                  value={raw}
                  onChange={(ev) => setValues((v) => ({ ...v, [e.id]: ev.target.value.slice(0, 5) }))}
                  inputMode="decimal"
                  placeholder="—"
                  aria-invalid={invalid ? true : undefined}
                  aria-describedby={invalid ? `err-${e.id}` : undefined}
                  className={`h-11 w-16 rounded-lg bg-surface text-center text-sm font-bold text-ink outline-none ring-1 focus:ring-2 focus:ring-primary ${
                    invalid ? 'ring-primary' : 'ring-transparent'
                  }`}
                />
                <span className="text-xs text-ink-muted">/ 20</span>
              </div>
              {invalid && (
                <span id={`err-${e.id}`} role="alert" className="sr-only">
                  Ingresa una nota entre 0 y 20
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div
        role="status"
        aria-live="polite"
        className={`mt-3 flex items-start gap-2.5 rounded-xl p-3 ${
          result.ok ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'
        }`}
      >
        <Icon name={result.icon} size={20} className="mt-px shrink-0" />
        <div>
          <p className="text-sm font-bold">{result.title}</p>
          {result.detail && <p className="mt-0.5 text-xs leading-snug">{result.detail}</p>}
        </div>
      </div>

      {Object.values(values).some((v) => v.trim() !== '') && (
        <button
          type="button"
          onClick={() => setValues({})}
          className="mx-auto mt-1 flex min-h-11 items-center px-4 text-xs font-semibold text-ink-muted"
        >
          Limpiar notas simuladas
        </button>
      )}
    </section>
  )
}
