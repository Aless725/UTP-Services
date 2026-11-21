import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { dayCompact, startOfDay } from '@/lib/date'
import type { Course } from '../coursesData'
import { PASS_GRADE, announcementsOf, evaluationsOf, rangeLabel, summarize, tasksOf, weeksOf } from './courseContent'
import { useRaw } from './useCourseRaw'
import type { CourseStateApi } from './useCourseState'

export type SectionId = 'resumen' | 'contenido' | 'notas' | 'tareas' | 'foros' | 'anuncios' | 'zoom' | 'silabo'

interface SummaryTabProps {
  course: Course
  state: CourseStateApi
  go: (section: SectionId) => void
}

interface Upcoming {
  key: string
  icon: string
  title: string
  when: string
  /** Ya venció (se destaca en rojo). */
  late: boolean
  date: number
  to: SectionId
}

/** Resumen del curso: la semana en la que estás, lo que viene y atajos para repasar. */
export default function SummaryTab({ course, state, go }: SummaryTabProps) {
  const raw = useRaw()
  const { semanaActual, semanasTotal } = raw.term

  const weeks = useMemo(() => weeksOf(raw), [raw])
  const week = weeks.find((w) => w.actual) ?? weeks[0]
  const seen = week.materiales.filter((m) => state.done.includes(m.id)).length

  const evals = useMemo(() => evaluationsOf(raw), [raw])
  const sum = useMemo(() => summarize(evals), [evals])

  const tasks = useMemo(() => tasksOf(raw), [raw])
  const pendingTasks = tasks.filter((t) => !state.entregas[t.id])
  const unread = useMemo(
    () => announcementsOf(raw).filter((a) => a.nuevo && !state.leidos.includes(a.id)),
    [raw, state.leidos],
  )

  // Lo próximo que vence: tareas sin entregar y evaluaciones sin calificar, de la más cercana a la más lejana.
  const upcoming = useMemo<Upcoming[]>(() => {
    const today = startOfDay(new Date()).getTime()
    const items: Upcoming[] = [
      ...pendingTasks.map((t) => ({
        key: t.id,
        icon: 'assignment',
        title: t.titulo,
        when: `${t.vence.getTime() < today ? 'Venció' : 'Vence'} ${dayCompact(t.vence)}`,
        late: t.vence.getTime() < today,
        date: t.vence.getTime(),
        to: 'tareas' as const,
      })),
      ...evals
        .filter((e) => e.nota === undefined)
        .map((e) => ({
          key: e.id,
          icon: 'fact_check',
          title: e.nombre,
          when: `${e.estado === 'esta_semana' ? 'Esta semana' : dayCompact(e.fecha)} · ${e.peso} %`,
          late: false,
          date: e.fecha.getTime(),
          to: 'notas' as const,
        })),
    ]
    return items.sort((a, b) => a.date - b.date).slice(0, 3)
  }, [pendingTasks, evals])

  return (
    <div className="space-y-5">
      <section aria-label="Esta semana" className="rounded-card bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-1 text-[0.6875rem] font-semibold text-primary">
            Semana {semanaActual} de {semanasTotal}
          </p>
          {sum.parcial !== null && (
            <button
              type="button"
              onClick={() => go('notas')}
              aria-label={`Promedio actual ${sum.parcial.toFixed(1)}. Ver notas`}
              className={`pressable flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[0.6875rem] font-bold ${
                sum.parcial < PASS_GRADE ? 'bg-primary-soft text-primary' : 'bg-success-soft text-success'
              }`}
            >
              <Icon name="grade" size={14} filled />
              Promedio {sum.parcial.toFixed(1)}
            </button>
          )}
        </div>
        <h2 className="mt-1 text-lg font-bold leading-snug text-ink">{week.tema}</h2>
        <p className="mt-0.5 text-[0.6875rem] text-ink-muted">{rangeLabel(week.inicio, week.fin)}</p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={semanasTotal}
          aria-valuenow={semanaActual}
          aria-label="Avance del ciclo"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-fill/10"
        >
          <div className="h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${semanaActual / semanasTotal})` }} />
        </div>
        <button
          type="button"
          onClick={() => go('contenido')}
          className="pressable mt-2 flex min-h-11 w-full items-center justify-between text-left"
        >
          <span className="text-xs text-ink-muted">
            {seen} de {week.materiales.length} materiales vistos
          </span>
          <span className="flex items-center text-xs font-semibold text-primary">
            Ver contenido
            <Icon name="chevron_right" size={16} />
          </span>
        </button>
      </section>

      {unread.length > 0 && (
        <button
          type="button"
          onClick={() => go('anuncios')}
          className="pressable flex min-h-14 w-full items-center gap-3 rounded-card bg-primary-soft px-3.5 text-left"
        >
          <Icon name="campaign" size={20} className="shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">
              {unread.length === 1 ? '1 anuncio nuevo' : `${unread.length} anuncios nuevos`}
            </span>
            <span className="block truncate text-[0.6875rem] text-ink-muted">{unread[0].titulo}</span>
          </span>
          <Icon name="chevron_right" size={18} className="shrink-0 text-primary" />
        </button>
      )}

      <section aria-labelledby="viene">
        <h2 id="viene" className="mb-2 px-1 text-sm font-bold text-ink">
          Lo que viene
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-card bg-card p-4 text-center text-xs text-ink-muted shadow-card">
            No tienes tareas ni evaluaciones pendientes.
          </p>
        ) : (
          <ul className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {upcoming.map((u) => (
              <li key={u.key}>
                <button
                  type="button"
                  onClick={() => go(u.to)}
                  className="pressable flex min-h-14 w-full items-center gap-3 px-3.5 py-2.5 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={u.icon} size={18} filled />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{u.title}</span>
                    <span className={`block text-[0.6875rem] ${u.late ? 'font-semibold text-primary' : 'text-ink-muted'}`}>{u.when}</span>
                  </span>
                  <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="repasar">
        <h2 id="repasar" className="mb-2 px-1 text-sm font-bold text-ink">
          ¿Necesitas repasar?
        </h2>
        <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          <Shortcut to="/reservas/lista/salas" icon="meeting_room" title="Reservar una sala de estudio" sub="Salas para 3 a 8 personas" />
          <Shortcut
            to={`/grupos/nuevo?curso=${encodeURIComponent(course.nombre)}`}
            icon="group_add"
            title="Crear un grupo de estudio"
            sub={`Para ${course.nombre}`}
          />
          <Shortcut to="/soporte" icon="auto_awesome" title="Preguntarle al asistente" sub="Resuelve dudas de tus cursos" />
        </ul>
      </section>
    </div>
  )
}

function Shortcut({ to, icon, title, sub }: { to: string; icon: string; title: string; sub: string }) {
  return (
    <li>
      <Link to={to} className="pressable flex min-h-14 items-center gap-3 px-3.5 py-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
          <Icon name={icon} size={18} filled />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{title}</span>
          <span className="block truncate text-[0.6875rem] text-ink-muted">{sub}</span>
        </span>
        <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
      </Link>
    </li>
  )
}
