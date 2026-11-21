import { useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import {
  forumTitle,
  pad2,
  rangeLabel,
  weeksOf,
  type Material,
  type MaterialKind,
} from './courseContent'
import { useRaw } from './useCourseRaw'
import type { CourseStateApi } from './useCourseState'

const KIND_ICON: Record<MaterialKind, string> = {
  Presentación: 'slideshow',
  Lectura: 'menu_book',
  Video: 'play_circle',
}

interface ContentTabProps {
  state: CourseStateApi
  /** Abre el foro de consultas de una semana (pestaña Foros). */
  onOpenForum: (week: number) => void
}

export default function ContentTab({ state, onOpenForum }: ContentTabProps) {
  const raw = useRaw()
  const meta = raw.meta
  const CURRENT_WEEK = raw.term.semanaActual
  const TOTAL_WEEKS = raw.term.semanasTotal
  const weeks = useMemo(() => weeksOf(raw), [raw])
  const [open, setOpen] = useState<Set<number>>(new Set([CURRENT_WEEK]))
  const [openContent, setOpenContent] = useState<Set<number>>(new Set([CURRENT_WEEK]))
  // La información del curso queda plegada: se abre solo si hace falta.
  const [infoOpen, setInfoOpen] = useState(false)

  const total = weeks.reduce((s, w) => s + w.materiales.length, 0)
  const seen = weeks.reduce((s, w) => s + w.materiales.filter((m) => state.done.includes(m.id)).length, 0)
  const pct = total ? seen / total : 0

  const toggle = (set: Set<number>, n: number, apply: (s: Set<number>) => void) => {
    const next = new Set(set)
    if (next.has(n)) next.delete(n)
    else next.add(n)
    apply(next)
  }

  return (
    <div className="space-y-3">
      <section aria-labelledby="info" className="overflow-hidden rounded-card bg-card shadow-card">
        <button
          type="button"
          onClick={() => setInfoOpen((o) => !o)}
          aria-expanded={infoOpen}
          aria-controls="info-curso"
          className="pressable flex min-h-14 w-full items-center gap-3 px-4 text-left"
        >
          <h2 id="info" className="flex-1 text-sm font-bold text-ink">
            Información del curso
          </h2>
          <span className="text-xs text-ink-muted">{TOTAL_WEEKS} semanas</span>
          <Icon
            name="expand_more"
            size={20}
            className={`text-ink-muted transition-transform duration-300 ease-smooth ${infoOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {infoOpen && (
          <div id="info-curso" className="animate-rise border-t border-fill/5 px-4 pb-4">
            <Block title="Bibliografía base" items={meta.bibBase} />
            <Block title="Bibliografía" items={meta.bibComp} />
          </div>
        )}
      </section>

      <section aria-label="Tu avance" className="rounded-card bg-card p-4 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold text-ink">Tu avance</h2>
          <span className="text-xs font-semibold text-primary">
            {seen} de {total} materiales
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct * 100)}
          aria-label="Avance de materiales vistos"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-fill/10"
        >
          <div
            className="h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-smooth"
            style={{ transform: `scaleX(${pct})` }}
          />
        </div>
      </section>

      <h2 className="px-1 pt-1 text-sm font-bold text-ink">Contenido</h2>
      <ul className="space-y-3">
        {weeks.map((w) => {
          const isOpen = open.has(w.n)
          const done = w.materiales.filter((m) => state.done.includes(m.id)).length
          const contentOpen = openContent.has(w.n)
          return (
            <li key={w.n} className="overflow-hidden rounded-card bg-card shadow-card">
              <button
                type="button"
                onClick={() => toggle(open, w.n, setOpen)}
                aria-expanded={isOpen}
                aria-controls={`semana-${w.n}`}
                className="pressable flex min-h-16 w-full items-center gap-3 p-4 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">Semana {pad2(w.n)}</span>
                    {w.actual && <Badge tone="presencial">Actual</Badge>}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink">{w.tema}</span>
                  <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">{rangeLabel(w.inicio, w.fin)}</span>
                </span>
                <span
                  className={`text-xs font-semibold ${done === w.materiales.length ? 'text-success' : 'text-ink-muted'}`}
                >
                  {done}/{w.materiales.length}
                </span>
                <Icon
                  name="expand_more"
                  size={20}
                  className={`shrink-0 text-ink-muted transition-transform duration-300 ease-smooth ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div id={`semana-${w.n}`} className="animate-rise border-t border-fill/5 px-2 pb-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenForum(w.n)}
                    className="pressable flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left active:bg-surface"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-soft text-info">
                      <Icon name="forum" size={18} />
                    </span>
                    <span className="flex-1 text-sm text-ink">{forumTitle(w.n)}</span>
                    <Icon name="chevron_right" size={20} className="text-ink-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggle(openContent, w.n, setOpenContent)}
                    aria-expanded={contentOpen}
                    className="pressable flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left active:bg-surface"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon name="folder_open" size={18} />
                    </span>
                    <span className="flex-1 text-sm text-ink">Contenido</span>
                    <Icon
                      name="expand_more"
                      size={20}
                      className={`text-ink-muted transition-transform duration-300 ease-smooth ${contentOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {contentOpen && (
                    <ul className="animate-rise ml-6 border-l border-fill/10 pl-3">
                      {w.materiales.map((m) => (
                        <MaterialRow key={m.id} m={m} done={state.done.includes(m.id)} onToggle={() => state.toggleDone(m.id)} />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <h3 className="text-xs font-bold text-ink">{title}</h3>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs leading-snug text-ink-muted">
            <Icon name="auto_stories" size={14} className="mt-px shrink-0 text-primary" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MaterialRow({ m, done, onToggle }: { m: Material; done: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={`${m.title}, ${m.detail}. ${done ? 'Visto' : 'Marcar como visto'}`}
        className="pressable flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left active:bg-surface"
      >
        <Icon name={KIND_ICON[m.kind]} size={18} className="shrink-0 text-ink-muted" />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-xs ${done ? 'text-ink-muted' : 'font-medium text-ink'}`}>{m.title}</span>
          <span className="block text-[0.6875rem] text-ink-muted">
            {m.kind} · {m.detail}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
            done ? 'border-success bg-success text-white' : 'border-ink-faint text-transparent'
          }`}
        >
          <Icon name="check" size={14} />
        </span>
      </button>
    </li>
  )
}
