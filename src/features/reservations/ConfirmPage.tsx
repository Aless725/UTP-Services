import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import Presence from '@/components/ui/Presence'
import { useAuth } from '@/features/auth/AuthContext'
import { useNow } from '@/hooks/useNow'
import { dayCompact, dayCompactYear, parseISO } from '@/lib/date'
import { useDraft } from './draftStore'
import { createReservation, useReservationData } from './reservationsStore'
import { ReservationError, SETTINGS, fromMin, suggestAlternatives, toMin } from './rules'
import { getSpace, longPlace } from './spacesData'

type Failure =
  | { kind: 'offline' }
  | { kind: 'rule'; reason: ReservationError['reason']; message: string }
  | null

export default function ConfirmPage() {
  const { id } = useParams()
  const space = getSpace(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const now = useNow(60000)
  const { draft, patch, reset } = useDraft()
  const { all } = useReservationData(codigo)
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<Failure>(null)

  const sala = space?.tipo === 'sala_grupal'
  const fin = draft.inicio ? fromMin(toMin(draft.inicio) + draft.duracion * 60) : ''

  const alternatives = useMemo(
    () =>
      failure?.kind === 'rule' && failure.reason === 'conflict' && space
        ? suggestAlternatives(space, draft.fecha, draft.duracion, all, now)
        : [],
    [failure, space, draft.fecha, draft.duracion, all, now],
  )

  if (!space) return <Navigate to="/reservas" replace />
  // 'busy' sigue activo tras confirmar, para no redirigir mientras se limpia el borrador.
  if (!draft.inicio && !busy) return <Navigate to={`/reservas/espacio/${space.id}/horario`} replace />
  if (!busy && sala && draft.miembros.length < SETTINGS.minMembers) {
    return <Navigate to={`/reservas/espacio/${space.id}/integrantes`} replace />
  }

  const back = sala ? `/reservas/espacio/${space.id}/integrantes` : `/reservas/espacio/${space.id}/horario`
  const noun = sala ? 'la sala' : 'el espacio'

  const confirm = async () => {
    setBusy(true)
    setFailure(null)
    await new Promise((r) => setTimeout(r, 900))
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setBusy(false)
      return setFailure({ kind: 'offline' })
    }
    try {
      const r = createReservation(
        {
          spaceId: space.id,
          fecha: draft.fecha,
          inicio: draft.inicio!,
          fin,
          motivo: sala ? draft.motivo : 'Uso individual',
          miembros: sala ? draft.miembros : [codigo],
        },
        codigo,
      )
      navigate(`/reservas/confirmada/${r.codigo}`, { replace: true })
      reset()
    } catch (e) {
      setBusy(false)
      setFailure(
        e instanceof ReservationError
          ? { kind: 'rule', reason: e.reason, message: e.message }
          : { kind: 'rule', reason: 'invalid', message: 'No pudimos completar la reserva. Inténtalo de nuevo.' },
      )
    }
  }

  const failedRule = failure?.kind === 'rule' ? failure : null
  const rules = [
    `Registra tu ingreso con el QR hasta ${SETTINGS.checkinGraceMin} min después del inicio.`,
    `Si nadie registra el ingreso, ${noun} se libera para otros alumnos.`,
    `Puedes cancelar sin penalidad hasta ${SETTINGS.freeCancelMinutes === 60 ? '1 hora' : `${SETTINGS.freeCancelMinutes} min`} antes.`,
  ]

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Confirmar reserva" back={back} backLabel="Volver al paso anterior" />

      <div className="stagger space-y-3 px-5 pt-4">
        <section aria-labelledby="resumen" className="rounded-card bg-card p-4 shadow-card">
          <h2 id="resumen" className="border-b border-fill/5 pb-3 text-sm font-bold text-ink">
            Resumen de tu reserva
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Item label="Espacio" value={space.nombre} wide />
            <Item label="Fecha" value={dayCompactYear(parseISO(draft.fecha))} />
            <Item label="Horario" value={`${draft.inicio} – ${fin}`} />
            <Item label="Ubicación" value={longPlace(space)} />
            {sala && <Item label="Integrantes" value={`${draft.miembros.length} personas`} />}
            {sala && <Item label="Motivo" value={draft.motivo} wide />}
          </dl>
        </section>

        <section aria-labelledby="antes" className="rounded-card bg-card p-4 shadow-card">
          <h2 id="antes" className="text-sm font-bold text-ink">
            Antes de confirmar
          </h2>
          <ul className="mt-3 space-y-2.5">
            {rules.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-xs leading-snug text-ink-muted">
                <Icon name="check" size={16} className="mt-px shrink-0 text-success" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 px-1">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
              accepted ? 'border-primary bg-primary text-white' : 'border-ink-faint bg-card text-transparent'
            }`}
          >
            <Icon name="check" size={16} />
          </span>
          <span className="text-sm text-ink">Acepto las normas de uso de espacios UTP</span>
        </label>
      </div>

      <StickyCta>
        <button
          type="button"
          onClick={confirm}
          disabled={!accepted || busy}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
        >
          {busy ? (
            <>
              <Icon name="progress_activity" size={18} className="animate-spin" />
              Confirmando…
            </>
          ) : (
            'Confirmar reserva'
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/reservas/espacio/${space.id}/horario`)}
          disabled={busy}
          className="mx-auto mt-1 flex min-h-11 items-center px-4 text-sm font-semibold text-ink"
        >
          Cambiar horario
        </button>
      </StickyCta>

      <Presence show={failure?.kind === 'offline'}>
        <Modal
          icon="wifi_off"
          title="No pudimos confirmar tu reserva"
          description="La conexión se interrumpió. Revisa tu internet e inténtalo de nuevo. Tus datos se mantienen."
          actionLabel="Reintentar"
          actionIcon="refresh"
          onAction={confirm}
          secondaryLabel="Cerrar"
          onSecondary={() => setFailure(null)}
        />
      </Presence>

      <Presence show={!!failedRule}>
        <Modal
          icon={failedRule?.reason === 'conflict' ? 'event_busy' : 'block'}
          title={failedRule?.reason === 'conflict' ? 'Ese horario ya no está libre' : 'No se pudo reservar'}
          description={failedRule?.message}
          actionLabel={
            failedRule?.reason === 'conflict'
              ? 'Elegir otro horario'
              : failedRule?.reason === 'active_exists'
                ? 'Ver mis reservas'
                : 'Entendido'
          }
          onAction={() => {
            const reason = failedRule?.reason
            setFailure(null)
            if (reason === 'conflict') navigate(`/reservas/espacio/${space.id}/horario`)
            else if (reason === 'active_exists') navigate('/reservas/mis')
          }}
          secondaryLabel={failedRule?.reason === 'active_exists' ? 'Cerrar' : undefined}
          onSecondary={() => setFailure(null)}
        >
          {alternatives.length > 0 && (
            <div className="mt-3 text-left">
              <p className="text-[0.6875rem] font-semibold text-ink-muted">Horarios cercanos disponibles</p>
              <ul className="mt-1.5 space-y-1.5">
                {alternatives.map((a) => (
                  <li key={a.fecha + a.inicio}>
                    <button
                      type="button"
                      onClick={() => {
                        patch({ fecha: a.fecha, inicio: a.inicio })
                        setFailure(null)
                      }}
                      className="pressable flex min-h-11 w-full items-center justify-between rounded-xl bg-surface px-3 text-xs font-semibold text-ink"
                    >
                      {dayCompact(parseISO(a.fecha))} · {a.inicio} – {a.fin}
                      <Icon name="chevron_right" size={18} className="text-ink-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal>
      </Presence>
    </div>
  )
}

function Item({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-[0.6875rem] text-ink-muted">{label}</dt>
      <dd className="text-sm font-bold text-ink">{value}</dd>
    </div>
  )
}
