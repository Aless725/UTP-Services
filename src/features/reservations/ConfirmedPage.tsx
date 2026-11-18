import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import QrCode from '@/components/ui/QrCode'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { dayCompactYear, parseISO } from '@/lib/date'
import { useReservationData } from './reservationsStore'
import { addReservationToCalendar, qrPayload, reservedTitle } from './reservationUtils'
import { getSpace, shortPlace } from './spacesData'

export default function ConfirmedPage() {
  const { codigo: code } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()
  const { mine } = useReservationData(session?.codigo ?? '')
  const r = mine.find((x) => x.codigo === code)
  const space = getSpace(r?.spaceId)

  if (!r || !space) return <Navigate to="/reservas" replace />

  const others = r.miembros.length - 1
  const sent =
    space.tipo === 'sala_grupal' && others > 0
      ? `Enviamos la confirmación a tu correo y a ${others === 1 ? 'tu compañero' : `tus ${others} compañeros`}.`
      : 'Enviamos la confirmación a tu correo.'

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Reserva confirmada" back="/reservas" backLabel="Volver a reserva de espacios" />

      <div className="stagger space-y-3 px-5 pt-4">
        <section className="flex flex-col items-center rounded-card bg-card px-5 py-6 text-center shadow-card">
          <span className="animate-pop flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Icon name="check" size={30} />
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-ink">{reservedTitle(space.tipo)}</h2>
          <p className="mt-1.5 max-w-[17rem] text-xs leading-relaxed text-ink-muted">{sent}</p>
        </section>

        <section className="rounded-card bg-card p-4 shadow-card" aria-label="Comprobante de la reserva">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-ink">{r.codigo}</p>
            <Badge tone="virtual">Confirmada</Badge>
          </div>
          <div className="mt-3 flex justify-center">
            <QrCode value={qrPayload(r)} size={200} label={`Código QR de la reserva ${r.codigo}`} />
          </div>
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-muted">
            Escanea este código en el lector {space.tipo === 'sala_grupal' ? 'de la sala' : 'del espacio'} para
            registrar tu ingreso.
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-fill/5 pt-3">
            <div>
              <dt className="text-[0.6875rem] text-ink-muted">Fecha</dt>
              <dd className="text-sm font-bold text-ink">{dayCompactYear(parseISO(r.fecha))}</dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] text-ink-muted">Horario</dt>
              <dd className="text-sm font-bold text-ink">
                {r.inicio} – {r.fin}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[0.6875rem] text-ink-muted">Espacio</dt>
              <dd className="text-sm font-bold text-ink">
                {space.nombre} · {shortPlace(space)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <StickyCta>
        <button
          type="button"
          onClick={() => navigate('/reservas/mis')}
          className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
        >
          Ver mis reservas
        </button>
        <button
          type="button"
          onClick={() => {
            addReservationToCalendar(r)
            show('Evento descargado', 'event_available')
          }}
          className="mx-auto mt-1 flex min-h-11 items-center px-4 text-sm font-semibold text-ink"
        >
          Añadir a mi calendario
        </button>
      </StickyCta>
    </div>
  )
}
