import { useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import PageLoading from '@/components/ui/PageLoading'
import Presence from '@/components/ui/Presence'
import { useToast } from '@/components/ui/Toast'
import { useCourseList } from '@/features/courses/useCourses'
import { ESTADOS, TramiteError, fechaHora, useSolicitud, useTramiteActions, useTramiteTipos, valorLegible } from './tramitesData'

/** Detalle de una solicitud: estado, datos enviados e historial. */
export default function SolicitudPage() {
  const { codigo } = useParams()
  const nueva = (useLocation().state as { nueva?: boolean } | null)?.nueva
  const { data, isLoading, isError, refetch } = useSolicitud(codigo)
  const tipos = useTramiteTipos()
  const cursos = useCourseList()
  const { cancelar } = useTramiteActions()
  const { show } = useToast()
  const [confirmar, setConfirmar] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  if (isLoading || tipos.isLoading) return <PageLoading />
  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Solicitud" back="/tramites/seguimiento" backLabel="Volver al seguimiento" />
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar la solicitud</p>
          <button type="button" onClick={() => refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  if (!data) return <Navigate to="/tramites/seguimiento" replace />

  const { solicitud: s, eventos } = data
  const tipo = tipos.data?.find((x) => x.id === s.tipoId)
  const estado = ESTADOS[s.estado]

  const doCancel = async () => {
    setCancelando(true)
    try {
      await cancelar(s.codigo)
      show('Solicitud cancelada', 'event_busy')
    } catch (e) {
      show(e instanceof TramiteError ? e.message : 'No pudimos cancelar la solicitud', 'error')
    } finally {
      setCancelando(false)
      setConfirmar(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title={tipo?.titulo ?? 'Solicitud'}
        back="/tramites/seguimiento"
        backLabel="Volver al seguimiento"
        subtitle={s.codigo}
      />

      <div className="stagger space-y-3 px-5 pt-4">
        {nueva && (
          <section className="flex items-center gap-3 rounded-card bg-success-soft p-3.5">
            <span className="animate-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <Icon name="check" size={22} />
            </span>
            <div>
              <p className="text-sm font-bold text-success">Recibimos tu solicitud</p>
              <p className="text-xs leading-snug text-success">Te avisaremos por correo y aquí cuando haya novedades.</p>
            </div>
          </section>
        )}

        <section aria-label="Estado" className="rounded-card bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Icon name={estado.icon} size={18} className="text-ink-muted" />
              Estado
            </span>
            <Badge tone={estado.tone}>{estado.label}</Badge>
          </div>
          <p className="mt-1.5 text-[0.6875rem] text-ink-muted">Solicitada el {fechaHora(s.creada)}</p>
        </section>

        {tipo && tipo.campos.length > 0 && (
          <section aria-labelledby="datos" className="rounded-card bg-card p-4 shadow-card">
            <h2 id="datos" className="text-sm font-bold text-ink">
              Datos de tu solicitud
            </h2>
            <dl className="mt-3 space-y-3">
              {tipo.campos
                .filter((c) => s.detalle[c.key])
                .map((c) => (
                  <div key={c.key}>
                    <dt className="text-[0.6875rem] text-ink-muted">{c.type === 'check' ? 'Aceptado' : c.label}</dt>
                    <dd className="whitespace-pre-wrap text-sm font-semibold text-ink">
                      {c.type === 'check' ? c.label : valorLegible(c, s.detalle[c.key], cursos)}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        )}

        <section aria-labelledby="historial" className="rounded-card bg-card p-4 shadow-card">
          <h2 id="historial" className="text-sm font-bold text-ink">
            Historial
          </h2>
          <ol className="mt-3">
            {eventos.map((e, i) => (
              <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                {i < eventos.length - 1 && <span aria-hidden="true" className="absolute left-[0.6875rem] top-6 h-[calc(100%-1.25rem)] w-px bg-fill/10" />}
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    i === eventos.length - 1 ? 'bg-primary text-white' : 'bg-fill/10 text-ink-muted'
                  }`}
                >
                  <Icon name={ESTADOS[e.estado].icon} size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{ESTADOS[e.estado].label}</p>
                  <p className="text-xs leading-snug text-ink-muted">{e.nota}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-ink-faint">{fechaHora(e.fecha)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {s.estado === 'en_revision' && (
          <button
            type="button"
            onClick={() => setConfirmar(true)}
            className="pressable min-h-12 w-full rounded-full bg-card text-sm font-semibold text-primary shadow-card"
          >
            Cancelar solicitud
          </button>
        )}
      </div>

      <Presence show={confirmar}>
        <Modal
          icon="event_busy"
          title="¿Cancelar esta solicitud?"
          description="Dejará de tramitarse. Si la necesitas más adelante, tendrás que solicitarla de nuevo."
          actionLabel={cancelando ? 'Cancelando…' : 'Sí, cancelar solicitud'}
          onAction={doCancel}
          secondaryLabel="Mantener solicitud"
          onSecondary={() => setConfirmar(false)}
        />
      </Presence>
    </div>
  )
}
