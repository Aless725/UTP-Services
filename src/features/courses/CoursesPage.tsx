import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import CountUp from '@/components/ui/CountUp'
import Icon from '@/components/ui/Icon'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { academicInfo, courses, cycle, progress } from './coursesData'

type Tab = 'matriculados' | 'malla'

export default function CoursesPage() {
  const [tab, setTab] = useState<Tab>('matriculados')

  return (
    <>
      <PageHeader title="Cursos" eyebrow={tab === 'malla' ? 'Cada paso cuenta' : undefined} />
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
        {tab === 'matriculados' ? <Enrolled /> : <Curriculum />}
      </div>
    </>
  )
}

function Enrolled() {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? courses.filter((c) => c.nombre.toLowerCase().includes(q) || c.docente.toLowerCase().includes(q))
      : courses
  }, [query])

  const pct = (cycle.semanaActual / cycle.semanasTotal) * 100

  return (
    <div className="mx-5 mt-4">
      <section className="overflow-hidden rounded-card bg-white shadow-card">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="pressable flex min-h-14 w-full items-center justify-between px-3.5 py-3 text-left"
        >
          <span>
            <span className="block text-sm font-bold text-ink">{cycle.nombre}</span>
            <span className="block text-[11px] text-ink-muted">{courses.length} cursos</span>
          </span>
          <span className="text-right">
            <span className="flex items-center justify-end gap-0.5 text-[11px] text-ink-muted">
              {cycle.estado}
              <Icon
                name="expand_more"
                size={16}
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
            </span>
            <span className="block text-[11px] font-bold text-primary">
              Semana {cycle.semanaActual} de {cycle.semanasTotal}
            </span>
          </span>
        </button>
        <div
          className={`grid transition-all duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-black/5 px-3.5 pb-3.5 pt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: expanded ? `${pct}%` : '0%' }}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-muted">
                {cycle.inicio} – {cycle.fin}
              </p>
            </div>
          </div>
        </div>
      </section>

      <label className="mt-3 flex min-h-11 items-center gap-2 rounded-card bg-white px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
        <Icon name="search" size={18} className="text-ink-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar curso o código"
          aria-label="Buscar curso o código"
          className="h-11 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      <h2 className="mt-5 text-sm font-bold text-ink">Mis Cursos</h2>
      {list.length === 0 ? (
        <div className="animate-rise mt-3 rounded-card bg-white py-8 text-center shadow-card">
          <Icon name="search_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">Sin resultados</p>
          <p className="text-xs text-ink-muted">Prueba con otro nombre.</p>
        </div>
      ) : (
        <ul className="stagger mt-3 space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                to="/mas/curso"
                className="pressable flex min-h-16 items-center gap-2 rounded-card bg-white p-3.5 shadow-card"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] text-ink-muted">
                    {c.docente} · {c.creditos} créditos
                  </span>
                  <span className="block text-sm font-bold text-ink">{c.nombre}</span>
                  <span className="block text-[10px] font-semibold text-ink-muted">{c.modalidad}</span>
                </span>
                <Icon name="chevron_right" size={20} className="text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Curriculum() {
  return (
    <div className="mx-5 mt-5">
      <h2 className="text-sm font-bold text-ink">Información académica</h2>
      <dl className="stagger mt-3 rounded-card bg-white px-3.5 py-1 shadow-card">
        {academicInfo.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-xs text-ink-muted">{r.label}</dt>
            <dd className="text-right text-sm font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      {progress.map((g) => (
        <section key={g.title} className="mt-5">
          <h2 className="text-sm font-bold text-ink">{g.title}</h2>
          <div className="mt-3 grid grid-cols-3 divide-x divide-black/5 rounded-card bg-white py-4 shadow-card">
            {g.items.map((s) => (
              <div key={s.label} className="px-3.5">
                <p className="text-2xl font-extrabold tabular-nums text-ink">
                  <CountUp value={s.value} decimals={s.decimals} />
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
