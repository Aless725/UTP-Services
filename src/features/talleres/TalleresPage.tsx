import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import { CATEGORIAS_TALLER } from './talleresData'

export default function TalleresPage() {
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Talleres"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Un espacio para tus intereses y tu vida universitaria."
      />
      <div className="stagger space-y-3 px-5 pt-4">
        {Object.values(CATEGORIAS_TALLER).map((c) => (
          <Link
            key={c.ruta}
            to={`/talleres/${c.ruta}`}
            className="pressable flex items-center gap-3 rounded-card bg-card p-4 shadow-card"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name={c.icon} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-ink">{c.label}</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{c.descripcion}</p>
            </div>
            <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
          </Link>
        ))}
        <section className="pt-3" aria-labelledby="mis-talleres">
          <h2 id="mis-talleres" className="mb-2 px-1 text-sm font-bold text-ink">
            Tus inscripciones
          </h2>
          <Link
            to="/talleres/mis"
            className="pressable flex min-h-16 items-center gap-3 rounded-card bg-card p-4 shadow-card"
          >
            <Icon name="event_available" size={22} className="text-primary" />
            <span className="flex-1 text-sm font-semibold text-ink">Mis talleres</span>
            <Icon name="chevron_right" size={20} className="text-ink-muted" />
          </Link>
        </section>
      </div>
    </div>
  )
}
