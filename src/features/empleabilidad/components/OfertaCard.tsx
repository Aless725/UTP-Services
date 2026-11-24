import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { fechaEmpleo, TIPOS_OFERTA, type Oferta } from '../empleabilidadData'

export default function OfertaCard({
  oferta: o,
  search = '',
  postulada = false,
}: {
  oferta: Oferta
  search?: string
  postulada?: boolean
}) {
  return (
    <article className="rounded-card bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-extrabold text-ink">{o.empresa}</h3>
        <Badge tone="neutral">{TIPOS_OFERTA[o.tipo]}</Badge>
      </div>
      <p className="mt-1 text-sm font-semibold text-ink">{o.puesto}</p>
      <dl className="my-3 grid grid-cols-2 gap-3 border-y border-fill/5 py-3">
        <div className="flex items-start gap-2">
          <Icon name="location_on" size={19} className="mt-1 shrink-0 text-ink-muted" />
          <div>
            <dt className="text-[0.6875rem] text-ink-muted">Lugar</dt>
            <dd className="text-xs font-semibold text-ink">{o.ciudad} · Perú</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="calendar_today" size={19} className="mt-1 shrink-0 text-ink-muted" />
          <div>
            <dt className="text-[0.6875rem] text-ink-muted">Publicado</dt>
            <dd className="text-xs font-semibold text-ink">{fechaEmpleo(o.publicado_en)}</dd>
          </div>
        </div>
      </dl>
      <p className="text-xs text-ink-muted">{o.nivel_academico}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{o.area}</p>
      {o.experiencia && <p className="mt-2 text-xs font-semibold text-primary">{o.experiencia}</p>}
      <Link
        to={`/empleabilidad/ofertas/${o.id}${search}`}
        aria-label={`Ver oferta: ${o.puesto} en ${o.empresa}`}
        className="pressable mt-3 flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-white active:bg-primary-dark"
      >
        {postulada && <Icon name="check_circle" size={18} />}
        {postulada ? 'Ya postulaste · Ver oferta' : 'Ver oferta'}
      </Link>
    </article>
  )
}
