import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import CountUp from '@/components/ui/CountUp'
import Icon from '@/components/ui/Icon'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Skeleton from '@/components/ui/Skeleton'
import { PASS_GRADE } from './detail/courseContent'
import { useCourses, type CoursesData } from './useCourses'

type Tab = 'matriculados' | 'malla'

export default function CoursesPage() {
  const [tab, setTab] = useState<Tab>('matriculados')
  const { data, isLoading, isError, refetch } = useCourses()

  return (
    <>
      <PageHeader title="Cursos" />
      <div className="mx-5 mt-4">
        <SegmentedControl<Tab>
          label="Secciones de cursos"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'matriculados', label: 'Matriculados' },
            { value: 'malla', label: 'Avance de malla curricular' },
          ]}
        />
      </div>
      <div key={tab} className="animate-page-in">
        {isLoading ? (
          <div role="status" aria-label="Cargando" className="mx-5 mt-4 space-y-3">
            <Skeleton className="h-16 w-full rounded-card" />
            <Skeleton className="h-60 w-full rounded-card" />
          </div>
        ) : isError || !data ? (
          <div role="alert" className="mx-5 mt-4 rounded-card bg-card p-5 text-center shadow-card">
            <Icon name="cloud_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar tus cursos</p>
            <button type="button" onClick={() => refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : tab === 'matriculados' ? (
          <Enrolled data={data} />
        ) : (
          <Curriculum data={data} />
        )}
      </div>
    </>
  )
}

function Enrolled({ data }: { data: CoursesData }) {
  const { courses, cycle, summary } = data
  const [expanded, setExpanded] = useState(false)
  const pct = Math.min(1, cycle.semanaActual / cycle.semanasTotal)
  const left = cycle.semanasTotal - cycle.semanaActual

  return (
    <div className="mx-5 mt-4 space-y-5">
      <section className="overflow-hidden rounded-card bg-card shadow-card">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="pressable flex min-h-14 w-full items-center justify-between gap-3 px-3.5 pt-3 text-left"
        >
          <span>
            <span className="block text-sm font-bold text-ink">{cycle.nombre}</span>
            <span className="block text-[0.6875rem] text-ink-muted">{courses.length} cursos</span>
          </span>
          <span className="flex items-center gap-0.5 text-sm font-bold text-primary">
            Semana {cycle.semanaActual} de {cycle.semanasTotal}
            <Icon
              name="expand_more"
              size={18}
              className={`text-ink-muted transition-transform duration-300 ease-smooth ${expanded ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
        <div className="px-3.5 pb-3.5 pt-2.5">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={cycle.semanasTotal}
            aria-valuenow={cycle.semanaActual}
            aria-label="Avance del ciclo"
            className="h-1.5 overflow-hidden rounded-full bg-fill/10"
          >
            <div className="h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${pct})` }} />
          </div>
          <div className={`grid transition-all duration-300 ease-smooth ${expanded ? 'mt-2.5 grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <p className="text-[0.6875rem] text-ink-muted">
                {cycle.inicio} – {cycle.fin} · {cycle.estado}
              </p>
              <p className="mt-0.5 text-[0.6875rem] font-semibold text-ink">
                {left > 0 ? `Faltan ${left} ${left === 1 ? 'semana' : 'semanas'} para terminar` : 'Última semana del ciclo'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="mis-cursos">
        <h2 id="mis-cursos" className="mb-2 px-1 text-sm font-bold text-ink">
          Mis cursos
        </h2>
        <ul className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {courses.map((c) => {
            const s = summary[c.id]
            const low = s?.nota !== null && s?.nota !== undefined && s.nota < PASS_GRADE
            return (
              <li key={c.id}>
                <Link to={`/cursos/${c.id}`} className="pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">{c.nombre}</span>
                    <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-muted">
                      {c.docente} · {c.creditos} créditos
                    </span>
                    {s && s.pendientes > 0 && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-semibold text-primary">
                        <Icon name="assignment" size={12} />
                        {s.pendientes} {s.pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}
                      </span>
                    )}
                  </span>
                  {s?.nota !== null && s?.nota !== undefined && (
                    <span className="text-right">
                      <span className={`block text-lg font-extrabold leading-none tabular-nums ${low ? 'text-primary' : 'text-ink'}`}>
                        {s.nota.toFixed(1)}
                      </span>
                      <span className="mt-1 block text-[0.625rem] text-ink-muted">promedio</span>
                    </span>
                  )}
                  <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function Curriculum({ data }: { data: CoursesData }) {
  const { academicInfo, progress } = data
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="mx-5 mt-4 space-y-5">
      <section className="overflow-hidden rounded-card bg-card shadow-card">
        <button
          type="button"
          onClick={() => setInfoOpen((o) => !o)}
          aria-expanded={infoOpen}
          className="pressable flex min-h-14 w-full items-center justify-between gap-3 px-3.5 text-left"
        >
          <span className="text-sm font-bold text-ink">Información académica</span>
          <Icon
            name="expand_more"
            size={20}
            className={`text-ink-muted transition-transform duration-300 ease-smooth ${infoOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`grid transition-all duration-300 ease-smooth ${infoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <dl className="overflow-hidden px-3.5">
            <div className="divide-y divide-fill/5 border-t border-fill/5">
              {academicInfo.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-xs text-ink-muted">{r.label}</dt>
                  <dd className="text-right text-sm font-medium text-ink">{r.value}</dd>
                </div>
              ))}
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="avance">
        <h2 id="avance" className="mb-2 px-1 text-sm font-bold text-ink">
          Tu avance
        </h2>
        <div className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {progress.map((g) => (
            <div key={g.title} className="px-3.5 py-3.5">
              <h3 className="text-xs font-semibold text-ink-muted">{g.title}</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {g.items.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold tabular-nums text-ink">
                      <CountUp value={s.value} decimals={s.decimals} />
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] leading-tight text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
