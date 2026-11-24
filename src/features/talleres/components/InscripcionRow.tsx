import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { CATEGORIAS_TALLER, fechaTaller, type InscripcionTaller } from '../talleresData'

export function EstadoInscripcion({ estado }: { estado: InscripcionTaller['estado'] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${estado === 'inscrita' ? 'bg-success-soft text-success' : 'bg-fill/5 text-ink-muted'}`}
    >
      <Icon name={estado === 'inscrita' ? 'check_circle' : 'info'} size={16} />
      {estado === 'inscrita' ? 'Inscripción confirmada' : 'Baja administrativa'}
    </span>
  )
}

export default function InscripcionRow({ inscripcion: i }: { inscripcion: InscripcionTaller }) {
  const s = i.snapshot
  return (
    <Link to={`/talleres/inscripcion/${i.id}`} className="pressable block rounded-card bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={CATEGORIAS_TALLER[s.categoria].icon} size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-semibold text-primary">{CATEGORIAS_TALLER[s.categoria].label}</p>
          <h2 className="mt-1 text-sm font-bold text-ink">{s.titulo}</h2>
          <p className="mt-1 text-xs text-ink-muted">
            {s.sede} · {s.periodo}
          </p>
        </div>
        <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
      </div>
      <div className="mt-3">
        <EstadoInscripcion estado={i.estado} />
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        {fechaTaller(s.inicio)}–{fechaTaller(s.fin)}
      </p>
      <p className="mt-1 text-[0.6875rem] text-ink-muted">{i.codigo}</p>
    </Link>
  )
}
