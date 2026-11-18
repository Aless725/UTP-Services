import type { ReactNode } from 'react'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { downloadText } from '@/lib/download'
import type { Course } from '../coursesData'
import { evaluationsOf, syllabusText, unitsOf } from './courseContent'
import { useRaw } from './useCourseRaw'


export default function SyllabusTab({ course }: { course: Course }) {
  const { show } = useToast()
  const raw = useRaw()
  const meta = raw.meta
  const evals = evaluationsOf(raw)

  const rows: [string, string][] = [
    ['Código', meta.codigo],
    ['Créditos', String(course.creditos)],
    ['Periodo', raw.term.nombre.replace('Ciclo ', '')],
    ['Modalidad', course.modalidad],
    ['Horas por semana', `${meta.horas} h`],
    ['Docente', course.docente],
  ]

  return (
    <div className="stagger space-y-3">
      <Section title="Datos generales">
        <dl className="divide-y divide-fill/5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-xs text-ink-muted">{k}</dt>
              <dd className="text-right text-sm font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Sumilla">
        <p className="text-sm leading-relaxed text-ink-muted">{meta.sumilla}</p>
      </Section>

      <Section title="Logro del curso">
        <p className="text-sm leading-relaxed text-ink-muted">{meta.logro}</p>
      </Section>

      <Section title="Unidades de aprendizaje">
        <ol className="space-y-4">
          {unitsOf(raw).map((u) => (
            <li key={u.nombre}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-bold text-ink">{u.nombre}</h3>
                <span className="text-xs text-ink-muted">{u.semanas}</span>
              </div>
              <ul className="mt-1.5 space-y-1">
                {u.temas.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs leading-snug text-ink-muted">
                    <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Metodología">
        <p className="text-sm leading-relaxed text-ink-muted">{meta.metodologia}</p>
      </Section>

      <Section title="Sistema de evaluación">
        <ul className="divide-y divide-fill/5">
          {evals.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-ink">
                {e.nombre} <span className="text-xs text-ink-muted">· semana {e.semana}</span>
              </span>
              <span className="font-bold text-ink">{e.peso} %</span>
            </li>
          ))}
          <li className="flex items-center justify-between pt-2.5 text-sm font-bold text-ink">
            <span>Total</span>
            <span>{evals.reduce((s, e) => s + e.peso, 0)} %</span>
          </li>
        </ul>
      </Section>

      <button
        type="button"
        onClick={() => {
          downloadText(`silabo-${course.id}.txt`, syllabusText(course, raw))
          show('Sílabo descargado', 'download')
        }}
        className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
      >
        <Icon name="download" size={18} />
        Descargar sílabo
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card bg-card p-4 shadow-card">
      <h2 className="mb-2 text-sm font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}
