import { useMemo, useState } from 'react'
import FlowHeader from '@/components/layout/FlowHeader'
import Badge from '@/components/ui/Badge'
import BottomSheet from '@/components/ui/BottomSheet'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import Presence from '@/components/ui/Presence'
import QrCode from '@/components/ui/QrCode'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { useNow } from '@/hooks/useNow'
import { dayCompact, dayCompactYear, parseISO, relativeDay, shortDate, startOfDay } from '@/lib/date'
import { ReservationError, SETTINGS, cancelsWithoutPenalty, viewStateOf, type Reservation, type ViewState } from './rules'
import { cancelReservation, useReservationData } from './reservationsStore'
import { placeLine, qrPayload } from './reservationUtils'
import { getSpace } from './spacesData'

const TABS: { id: ViewState; label: string }[] = [
  { id: 'proxima', label: 'Próximas' },
  { id: 'pasada', label: 'Pasadas' },
  { id: 'cancelada', label: 'Canceladas' },
]

const EMPTY: Record<ViewState, { title: string; text: string }> = {
  proxima: { title: 'No tienes reservas próximas', text: 'Reserva una sala, una PC o un cubículo desde Espacios.' },
  pasada: { title: 'Aún no tienes reservas pasadas', text: 'Aquí verás tu historial de uso.' },
  cancelada: { title: 'No has cancelado reservas', text: 'Las reservas que cancelas aparecen aquí.' },
}

export default function MyReservationsPage() {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const now = useNow(30000)
  const { show } = useToast()
  const { mine, penaltyUntil } = useReservationData(codigo)
  const [tab, setTab] = useState<ViewState>('proxima')
  const [qr, setQr] = useState<Reservation | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null)

  const list = useMemo(() => {
    const items = mine.filter((r) => viewStateOf(r, now) === tab)
    // Pasadas y canceladas: las más recientes primero.
    return tab === 'proxima' ? items : [...items].reverse()
  }, [mine, tab, now])

  const doCancel = async () => {
    if (!cancelTarget) return
    try {
      const res = await cancelReservation(cancelTarget.id)
      show(res.penalty ? `Reserva cancelada · penalidad de ${SETTINGS.penaltyDays} días` : 'Reserva cancelada', 'event_busy')
    } catch (e) {
      show(e instanceof ReservationError ? e.message : 'No se pudo cancelar', 'error')
    }
    setCancelTarget(null)
  }

  const penalized = cancelTarget ? !cancelsWithoutPenalty(cancelTarget, now) : false
  const cancelSpace = getSpace(cancelTarget?.spaceId)

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Mis reservas" back="/reservas" backLabel="Volver a reserva de espacios" />

      <div className="px-5 pt-4">
        <div role="tablist" aria-label="Estado de las reservas" className="no-scrollbar flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </div>

        {penaltyUntil && (
          <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-card bg-primary-soft p-3.5">
            <Icon name="block" size={18} className="mt-px shrink-0 text-primary" />
            <p className="text-xs leading-snug text-ink">
              <span className="font-bold">Tienes una penalidad activa</span> hasta el {shortDate(penaltyUntil)}. No
              puedes hacer nuevas reservas hasta entonces.
            </p>
          </div>
        )}

        {list.length === 0 ? (
          <div key={tab} className="animate-rise mt-4 flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="event_available" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">{EMPTY[tab].title}</p>
            <p className="text-xs text-ink-muted">{EMPTY[tab].text}</p>
          </div>
        ) : (
          <ul key={tab} className="stagger mt-3 space-y-3" aria-live="polite">
            {list.map((r) => (
              <li key={r.id}>
                <ReservationCard
                  r={r}
                  state={tab}
                  mine={r.userId === codigo}
                  now={now}
                  onQr={() => setQr(r)}
                  onCancel={() => setCancelTarget(r)}
                />
              </li>
            ))}
          </ul>
        )}

        {tab === 'proxima' && !penaltyUntil && (
          <p className="mt-4 flex items-start gap-2.5 rounded-card bg-primary-soft p-3.5 text-xs leading-snug text-ink">
            <Icon name="info" size={18} className="mt-px shrink-0 text-primary" />
            Cancela con al menos {SETTINGS.freeCancelMinutes === 60 ? '1 hora' : `${SETTINGS.freeCancelMinutes} min`} de
            anticipación para evitar una penalidad de {SETTINGS.penaltyDays} días.
          </p>
        )}
      </div>

      <BottomSheet open={!!qr} onClose={() => setQr(null)} title="Código QR de tu reserva">
        {qr && (
          <div className="flex flex-col items-center pb-2 text-center">
            <p className="text-sm font-extrabold text-ink">{qr.codigo}</p>
            <div className="mt-3">
              <QrCode value={qrPayload(qr)} size={220} label={`Código QR de la reserva ${qr.codigo}`} />
            </div>
            <p className="mt-3 max-w-[17rem] text-xs leading-relaxed text-ink-muted">
              Escanéalo en el lector para registrar tu ingreso hasta {SETTINGS.checkinGraceMin} min después del inicio.
            </p>
          </div>
        )}
      </BottomSheet>

      <Presence show={!!cancelTarget}>
        <Modal
          icon={penalized ? 'warning' : 'event_busy'}
          title="¿Cancelar esta reserva?"
          description={
            penalized
              ? `Falta menos de ${SETTINGS.freeCancelMinutes === 60 ? '1 hora' : `${SETTINGS.freeCancelMinutes} min`} para el inicio: se aplicará una penalidad de ${SETTINGS.penaltyDays} días sin reservar.`
              : 'Estás a tiempo: puedes cancelarla sin penalidad.'
          }
          actionLabel="Sí, cancelar reserva"
          onAction={doCancel}
          secondaryLabel="Mantener reserva"
          onSecondary={() => setCancelTarget(null)}
        >
          {cancelTarget && cancelSpace && (
            <div className="mt-3 rounded-xl bg-surface p-3 text-left">
              <p className="text-xs font-bold text-ink">{cancelSpace.nombre}</p>
              <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
                {dayCompactYear(parseISO(cancelTarget.fecha))} · {cancelTarget.inicio} – {cancelTarget.fin}
              </p>
            </div>
          )}
        </Modal>
      </Presence>
    </div>
  )
}

function ReservationCard({
  r,
  state,
  mine,
  now,
  onQr,
  onCancel,
}: {
  r: Reservation
  state: ViewState
  mine: boolean
  now: Date
  onQr: () => void
  onCancel: () => void
}) {
  const space = getSpace(r.spaceId)
  if (!space) return null
  const day = parseISO(r.fecha)

  return (
    <article className="rounded-card bg-card p-4 shadow-card" aria-label={`${space.nombre}, ${dayCompact(day)}`}>
      <div className="flex items-center justify-between">
        {state === 'proxima' ? (
          <Badge tone="virtual">Confirmada</Badge>
        ) : state === 'pasada' ? (
          <Badge tone="neutral">Finalizada</Badge>
        ) : (
          <span className="inline-block rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-semibold text-primary">
            Cancelada
          </span>
        )}
        <span className="text-xs font-semibold text-primary">
          {state === 'proxima' ? relativeDay(day, startOfDay(now)) : ''}
        </span>
      </div>
      <h3 className="mt-2 text-[0.9375rem] font-extrabold text-ink">{space.nombre}</h3>
      <p className="mt-1.5 text-sm font-semibold text-ink">
        {dayCompact(day)} · {r.inicio} – {r.fin}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">{placeLine(r)}</p>

      {state === 'proxima' && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onQr}
            className="pressable flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-white"
          >
            <Icon name="qr_code_2" size={18} />
            Ver QR
          </button>
          {mine ? (
            <button
              type="button"
              onClick={onCancel}
              className="pressable min-h-11 flex-1 rounded-full bg-card text-sm font-semibold text-ink shadow-card"
            >
              Cancelar
            </button>
          ) : (
            <span className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-fill/5 text-xs font-medium text-ink-muted">
              Invitado
            </span>
          )}
        </div>
      )}
    </article>
  )
}
