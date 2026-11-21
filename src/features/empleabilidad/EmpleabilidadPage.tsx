import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'

const SECCIONES = [
  {
    to: 'ofertas',
    titulo: 'Bolsa de trabajo',
    descripcion: 'Encuentra oportunidades para dar tu siguiente paso.',
    icon: 'work',
  },
  {
    to: 'programas',
    titulo: 'Programas de empleabilidad',
    descripcion: 'Prepárate y fortalece tu perfil profesional.',
    icon: 'school',
  },
]

export default function EmpleabilidadPage() {
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Empleabilidad"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Tu siguiente oportunidad empieza aquí."
      />
      <div className="stagger space-y-3 px-5 pt-5">
        {SECCIONES.map((s) => (
          <Link
            key={s.to}
            to={`/empleabilidad/${s.to}`}
            className="pressable flex min-h-20 items-center gap-3 rounded-card bg-card p-4 shadow-card"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name={s.icon} size={24} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">{s.titulo}</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{s.descripcion}</span>
            </span>
            <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
          </Link>
        ))}
        <section className="pt-4" aria-labelledby="mis-postulaciones-title">
          <h2 id="mis-postulaciones-title" className="mb-2 px-1 text-base font-bold text-ink">
            Mis postulaciones
          </h2>
          <Link
            to="/empleabilidad/postulaciones"
            className="pressable flex min-h-16 items-center gap-3 rounded-card bg-card p-4 shadow-card"
          >
            <Icon name="assignment_turned_in" size={23} className="text-primary" />
            <span className="flex-1 text-sm font-semibold text-ink">Revisa tus postulaciones</span>
            <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
          </Link>
        </section>
        <p className="px-1 pt-3 text-xs leading-relaxed text-ink-muted">
          Contenido de demostración. Las ofertas y los programas son ilustrativos; las postulaciones no se envían a
          empresas reales.
        </p>
      </div>
    </div>
  )
}
