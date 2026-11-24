import { useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import PageLoading from '@/components/ui/PageLoading'
import Presence from '@/components/ui/Presence'
import QrCode from '@/components/ui/QrCode'
import { useToast } from '@/components/ui/Toast'
import { useNow } from '@/hooks/useNow'
import { longDay, parseISO } from '@/lib/date'
import {
  CANCELACION_GRATIS_MIN,
  EquipoError,
  minutosParaInicio,
  situacion,
  useEquipoActions,
  useEquipos,
  useMisReservasEquipos,
} from './equiposData'

const ESTADO = {
  proxima: { label: 'Confirmada', tone: 'virtual' as const, icon: 'check_circle' },
  pasada: { label: 'Finalizada', tone: 'neutral' as const, icon: 'history' },
  cancelada: { label: 'Cancelada', tone: 'neutral' as const, icon: 'event_busy' },
}

/** Detalle de una reserva de equipo: código con QR, datos y cancelación. */
export default function ReservaEquipoPage() {
  const { codigo } = useParams()
  const nueva = (useLocation().state as { nueva?: boolean } | null)?.nueva
  const mis = useMisReservasEquipos()
  const equipos = useEquipos()
  const { cancelar } = useEquipoActions()
  const { show } = useToast()
  const now = useNow(30_000)
  const [confirmar, setConfirmar] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  if (mis.isLoading || equipos.isLoading) return <PageLoading />
  if (mis.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Reserva" back="/equipos/mis" backLabel="Volver a mis reservas" />
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar la reserva</p>
          <button type="button" onClick={() => mis.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  const reserva = mis.data?.find((r) => r.codigo === codigo)
  if (!reserva) return <Navigate to="/equipos/mis" replace />

  const equipo = equipos.data?.find((e) => e.id === reserva.equipoId)
  const sit = situacion(reserva, now)
  const estado = ESTADO[sit]
  const tarde = minutosParaInicio(reserva, now) < CANCELACION_GRATIS_MIN

  const doCancel = async () => {
    setCancelando(true)
    try {
      const libre = await cancelar(reserva.codigo)
      show(libre ? 'Reserva cancelada' : 'Reserva cancelada con penalidad', 'event_busy')
    } catch (e) {
      show(e instanceof EquipoError ? e.message : 'No pudimos cancelar la reserva', 'error')
    } finally {
      setCancelando(false)
      setConfirmar(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title={equipo?.nombre ?? 'Reserva de equipo'}
        back="/equipos/mis"
        backLabel="Volver a mis reservas"
        subtitle={reserva.codigo}
      />

      <div className="stagger space-y-3 px-5 pt-4">
        {nueva && (
          <section className="flex items-center gap-3 rounded-card bg-success-soft p-3.5">
            <span className="animate-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <Icon name="check" size={22} />
            </span>
            <div>
              <p className="text-sm font-bold text-success">¡Tu reserva está lista!</p>
              <p className="text-xs leading-snug text-success">Muestra tu código para recoger el equipo.</p>
            </div>
          </section>
        )}

        {sit === 'proxima' && (
          <section className="flex flex-col items-center rounded-card bg-card px-5 py-5 text-center shadow-card">
            <QrCode value={`${reserva.codigo}|UTP+`} size={160} label={`Código QR de la reserva ${reserva.codigo}`} />
            <p className="mt-3 text-base font-bold tracking-wide text-ink">{reserva.codigo}</p>
            <p className="text-[0.6875rem] text-ink-muted">Preséntalo al recoger el equipo</p>
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
          <dl className="mt-3 space-y-3">
            <Dato label="Equipo" value={equipo?.nombre ?? '—'} />
            <Dato label="Fecha" value={longDay(parseISO(reserva.fecha))} />
            <Dato label="Horario" value={`${reserva.inicio} – ${reserva.fin}`} />
            <Dato label="Ubicación" value={equipo ? `${equipo.ubicacion} · ${equipo.sede}` : '—'} />
          </dl>
        </section>

        {sit === 'proxima' && (
          <>
            <p className="px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
              Puedes cancelar sin penalidad hasta {CANCELACION_GRATIS_MIN === 60 ? '1 hora' : `${CANCELACION_GRATIS_MIN} minutos`} antes del inicio.
            </p>
            <button
              type="button"
              onClick={() => setConfirmar(true)}
              className="pressable min-h-12 w-full rounded-full bg-card text-sm font-semibold text-primary shadow-card"
            >
              Cancelar reserva
            </button>
          </>
        )}
      </div>

      <Presence show={confirmar}>
        <Modal
          icon="event_busy"
          title="¿Cancelar esta reserva?"
          description={
            tarde
              ? 'Falta menos de 1 hora para el inicio: si cancelas ahora tendrás una penalidad de 7 días sin reservar espacios ni equipos.'
              : 'El equipo quedará libre para otros alumnos. Podrás reservar de nuevo cuando quieras.'
          }
          actionLabel={cancelando ? 'Cancelando…' : 'Sí, cancelar reserva'}
          onAction={doCancel}
          secondaryLabel="Mantener reserva"
          onSecondary={() => setConfirmar(false)}
        />
      </Presence>
    </div>
  )
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6875rem] text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}
