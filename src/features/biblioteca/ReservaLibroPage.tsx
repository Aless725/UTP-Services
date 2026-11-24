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
import { LibroError, situacionLibro, useLibroActions, useLibros, useMisReservasLibros } from './bibliotecaData'

const ESTADO = {
  vigente: { label: 'Por recoger', tone: 'virtual' as const, icon: 'check_circle' },
  vencida: { label: 'Vencida', tone: 'neutral' as const, icon: 'history' },
  cancelada: { label: 'Cancelada', tone: 'neutral' as const, icon: 'event_busy' },
}

/** Detalle de la reserva de un libro: código con QR, sede, día de recojo y cancelación. */
export default function ReservaLibroPage() {
  const { codigo } = useParams()
  const nueva = (useLocation().state as { nueva?: boolean } | null)?.nueva
  const mis = useMisReservasLibros()
  const libros = useLibros()
  const { cancelar } = useLibroActions()
  const { show } = useToast()
  const now = useNow(60_000)
  const [confirmar, setConfirmar] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  if (mis.isLoading || libros.isLoading) return <PageLoading />
  if (mis.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Reserva" back="/biblioteca/mis" backLabel="Volver a mis reservas" />
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
  if (!reserva) return <Navigate to="/biblioteca/mis" replace />

  const libro = libros.data?.find((l) => l.id === reserva.libroId)
  const sit = situacionLibro(reserva, now)
  const estado = ESTADO[sit]

  const doCancel = async () => {
    setCancelando(true)
    try {
      await cancelar(reserva.codigo)
      show('Reserva cancelada', 'event_busy')
    } catch (e) {
      show(e instanceof LibroError ? e.message : 'No pudimos cancelar la reserva', 'error')
    } finally {
      setCancelando(false)
      setConfirmar(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader title={libro?.titulo ?? 'Reserva de libro'} back="/biblioteca/mis" backLabel="Volver a mis reservas" subtitle={reserva.codigo} />

      <div className="stagger space-y-3 px-5 pt-4">
        {nueva && (
          <section className="flex items-center gap-3 rounded-card bg-success-soft p-3.5">
            <span className="animate-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <Icon name="check" size={22} />
            </span>
            <div>
              <p className="text-sm font-bold text-success">¡Libro reservado!</p>
              <p className="text-xs leading-snug text-success">Recógelo en {reserva.sede} con tu código.</p>
            </div>
          </section>
        )}

        {sit === 'vigente' && (
          <section className="flex flex-col items-center rounded-card bg-card px-5 py-5 text-center shadow-card">
            <QrCode value={`${reserva.codigo}|UTP+`} size={160} label={`Código QR de la reserva ${reserva.codigo}`} />
            <p className="mt-3 text-base font-bold tracking-wide text-ink">{reserva.codigo}</p>
            <p className="text-[0.6875rem] text-ink-muted">Preséntalo en el mostrador de la biblioteca</p>
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
            <Dato label="Libro" value={libro?.titulo ?? '—'} />
            <Dato label="Sede" value={reserva.sede} />
            <Dato label="Recógelo el" value={longDay(parseISO(reserva.recojo))} />
            <Dato label="Horario de atención" value="08:00 – 20:00" />
          </dl>
        </section>

        {sit === 'vigente' && (
          <>
            <p className="px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
              La copia se guarda hasta el cierre del día de recojo. Puedes cancelar cuando quieras, sin penalidad.
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
          description="La copia quedará libre para otros alumnos. No tiene penalidad."
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
