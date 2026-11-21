import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { ESTADOS_POSTULACION, fechaEmpleo, type Postulacion } from '../empleabilidadData'

export function EstadoPostulacion({ estado, programa = false }: { estado: Postulacion['estado']; programa?: boolean }) {
  const meta = ESTADOS_POSTULACION[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.tone}`}>
      <Icon name={meta.icon} size={16} />
      {programa && estado === 'enviada' ? 'Pendiente de revisión' : meta.label}
    </span>
  )
}

export default function PostulacionRow({ postulacion: p }: { postulacion: Postulacion }) {
  return (
    <Link to={`/empleabilidad/postulaciones/${p.id}`} className="pressable block rounded-card bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={p.programa_id ? 'school' : 'work'} size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[0.6875rem] font-semibold text-primary">
            {p.programa_id ? 'Programa de empleabilidad' : 'Oferta laboral'}
          </p>
          <h2 className="text-sm font-bold text-ink">{p.puesto_snapshot}</h2>
          <p className="mt-1 text-xs text-ink-muted">{p.empresa_snapshot}</p>
        </div>
        <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <EstadoPostulacion estado={p.estado} programa={!!p.programa_id} />
        <span className="text-xs text-ink-muted">{fechaEmpleo(p.created_at)}</span>
      </div>
      <p className="mt-2 text-[0.6875rem] text-ink-muted">{p.codigo}</p>
    </Link>
  )
}
