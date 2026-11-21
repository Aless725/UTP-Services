import { useState } from 'react'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { PASS_GRADE, type Evaluation } from './courseContent'

const f = (n: number) => n.toFixed(2)
const GOALS = [PASS_GRADE, 14, 16, 18]

/** Convierte lo escrito en una nota válida (0 a 20) o null si está vacío o es inválido. */
function parseGrade(raw: string): number | null {
  const n = Number(raw.replace(',', '.'))
  return raw.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 20 ? n : null
}

/** Simula las notas que faltan y calcula qué se necesita para llegar a la meta. */
export default function GradeCalculator({ evals, acumulado }: { evals: Evaluation[]; acumulado: number }) {
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
    <div>
      <p className="text-xs text-ink-muted">Simula tus próximas notas y mira si llegas a tu meta.</p>

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
    </div>
  )
}
