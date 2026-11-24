import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { fechaTaller, grupoAbierto, tallerPath, type GrupoTaller, type Taller } from '../talleresData'
import HorarioTaller from './HorarioTaller'

export default function TallerCard({
  taller,
  grupos,
  search,
  now,
}: {
  taller: Taller
  grupos: GrupoTaller[]
  search: string
  now: Date
}) {
  const primero = grupos[0]
  const vacantes = grupos.filter((g) => grupoAbierto(g, now)).reduce((sum, g) => sum + g.vacantes, 0)
  const params = new URLSearchParams(search)
  params.set('grupo', primero.id)
  const query = params.toString()
  const link = `${tallerPath(taller)}${query ? `?${query}` : ''}`
  return (
    <article className="rounded-card bg-card p-3.5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={taller.categoria === 'cultural' ? 'theater_comedy' : 'sports'} size={20} />
        </span>
        <h2 className="min-w-0 flex-1 text-sm font-bold text-ink">{taller.titulo}</h2>
      </div>
      <p className="mb-2 mt-1.5 text-[0.6875rem] text-ink-muted">Inicia: {fechaTaller(primero.inicio)}</p>
      <HorarioTaller horarios={primero.horarios} compact />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone={primero.modalidad === 'virtual' ? 'virtual' : 'presencial'}>
          {primero.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
        </Badge>
        <span className="text-xs text-ink-muted">{primero.sede}</span>
      </div>
      <p className="mt-1.5 text-xs font-semibold text-ink">
        {grupos.length > 1 ? `${grupos.length} grupos · ` : ''}
        {vacantes > 0 ? `${vacantes} vacantes disponibles` : 'Sin vacantes abiertas'}
      </p>
      <Link
        to={link}
        aria-label={`Ver taller: ${taller.titulo}`}
        className="mt-1 flex min-h-11 items-center justify-between text-xs font-semibold text-primary"
      >
        Ver detalle y horarios
        <Icon name="chevron_right" size={20} />
      </Link>
    </article>
  )
}
