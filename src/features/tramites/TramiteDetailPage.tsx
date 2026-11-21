import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import { precio, useSolicitudes, useTramiteTipos } from './tramitesData'

export default function TramiteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tipos = useTramiteTipos()
  const solicitudes = useSolicitudes()

  if (tipos.isLoading) return <PageLoading />
  if (tipos.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Trámite" back="/tramites" backLabel="Volver a trámites" />
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar este trámite</p>
          <button type="button" onClick={() => tipos.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  const t = tipos.data?.find((x) => x.id === id)
  if (!t) return <Navigate to="/tramites" replace />

  const activa = solicitudes.data?.find((s) => s.tipoId === t.id && s.estado === 'en_revision')

  const datos = [
    { icon: 'schedule', label: 'Tiempo de entrega', value: t.plazo },
    { icon: 'payments', label: 'Costo', value: precio(t.costo) },
    { icon: 'folder_open', label: 'Modalidad', value: t.modalidad },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title={t.titulo} back="/tramites" backLabel="Volver a trámites" subtitle={t.descripcion} />

      <div className="stagger flex-1 space-y-3 px-5 pt-4">
        {activa && (
          <Link
            to={`/tramites/solicitud/${activa.codigo}`}
            className="pressable flex min-h-14 items-center gap-3 rounded-card bg-primary-soft px-3.5"
          >
            <Icon name="hourglass_top" size={20} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">Ya tienes una solicitud en revisión</span>
              <span className="block text-[0.6875rem] text-ink-muted">{activa.codigo} · Ver seguimiento</span>
            </span>
            <Icon name="chevron_right" size={18} className="shrink-0 text-primary" />
          </Link>
        )}

        <dl className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {datos.map((d) => (
            <div key={d.label} className="flex items-start gap-3 px-4 py-3">
              <Icon name={d.icon} size={20} className="mt-0.5 shrink-0 text-ink-muted" />
              <div className="min-w-0">
                <dt className="text-[0.6875rem] text-ink-muted">{d.label}</dt>
                <dd className="text-sm font-bold text-ink">{d.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <p className="px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
          Costos y plazos de ejemplo para este diseño: no representan tarifas ni políticas oficiales de la UTP.
        </p>
      </div>

      <StickyCta>
        {activa ? (
          <Button full onClick={() => navigate(`/tramites/solicitud/${activa.codigo}`)}>
            Ver mi solicitud
          </Button>
        ) : (
          <Button full onClick={() => navigate(`/tramites/${t.id}/solicitar`)}>
            Solicitar
          </Button>
        )}
      </StickyCta>
    </div>
  )
}
