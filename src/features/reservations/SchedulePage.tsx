import { useEffect, useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { useNow } from '@/hooks/useNow'
import {
  addDays,
  dayCompact,
  diffDays,
  monthTitle,
  parseISO,
  startOfDay,
  toISO,
  weekdayAbbrCap,
} from '@/lib/date'
import { useDraft } from './draftStore'
import { useReservationData } from './reservationsStore'
import { MAX_BOOKING_DATE, SETTINGS, buildSlots, isOpenDay, isWithinWindow } from './rules'
import { getSpace } from './spacesData'

/** Domingo de la semana que contiene a `d`. */
const weekStart = (d: Date) => addDays(startOfDay(d), -d.getDay())

export default function SchedulePage() {
  const { id } = useParams()
  const space = getSpace(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const now = useNow(60000)
  const { all } = useReservationData(session?.codigo ?? '')
  const { draft, patch } = useDraft()

  const today = startOfDay(now)
  const selected = parseISO(draft.fecha)
  const start = weekStart(selected)
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [start])
  const maxDate = MAX_BOOKING_DATE(today)

  const slots = useMemo(
    () => (space ? buildSlots(space, draft.fecha, draft.duracion, all, now) : []),
    [space, draft.fecha, draft.duracion, all, now],
  )

  // Si el horario elegido ya no está libre (cambió la duración o se ocupó), se limpia.
  useEffect(() => {
    if (draft.inicio && !slots.some((s) => s.inicio === draft.inicio && s.estado === 'libre')) {
      patch({ inicio: null })
    }
  }, [slots, draft.inicio, patch])

  if (!space) return <Navigate to="/reservas" replace />

  const dayEnabled = (d: Date) => isWithinWindow(d, today) && isOpenDay(space.tipo, d)
  const canPrev = diffDays(today, addDays(start, -1)) >= 0
  const canNext = addDays(start, 7).getTime() <= maxDate.getTime()
  const picked = slots.find((s) => s.inicio === draft.inicio)

  const go = () => {
    if (!picked) return
    navigate(
      space.tipo === 'sala_grupal'
        ? `/reservas/espacio/${space.id}/integrantes`
        : `/reservas/espacio/${space.id}/confirmar`,
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="Fecha y horario"
        back={`/reservas/espacio/${space.id}`}
        backLabel="Volver al detalle del espacio"
        subtitle={`${space.nombre} · ${space.edificio}, piso ${space.piso}`}
      />

      <div className="stagger space-y-3 px-5 pt-4">
        <section aria-label="Elegir día" className="rounded-card bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">{monthTitle(selected)}</h2>
            <div className="-mr-2 flex">
              <button
                type="button"
                onClick={() => patch({ fecha: toISO(addDays(selected, -7)), inicio: null })}
                disabled={!canPrev}
                aria-label="Semana anterior"
                className="pressable flex h-11 w-10 items-center justify-center text-ink disabled:text-ink-faint"
              >
                <Icon name="chevron_left" size={22} />
              </button>
              <button
                type="button"
                onClick={() => patch({ fecha: toISO(addDays(selected, 7)), inicio: null })}
                disabled={!canNext}
                aria-label="Semana siguiente"
                className="pressable flex h-11 w-10 items-center justify-center text-ink disabled:text-ink-faint"
              >
                <Icon name="chevron_right" size={22} />
              </button>
            </div>
          </div>

          <div role="radiogroup" aria-label="Día" className="mt-2 grid grid-cols-7 gap-1.5">
            {days.map((d) => {
              const enabled = dayEnabled(d)
              const on = diffDays(d, selected) === 0
              const isToday = diffDays(today, d) === 0
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${dayCompact(d)}${enabled ? '' : ', no disponible'}`}
                  disabled={!enabled}
                  onClick={() => patch({ fecha: toISO(d), inicio: null })}
                  className={`pressable relative flex min-h-[3.5rem] flex-col items-center justify-center rounded-xl text-[0.6875rem] transition-colors duration-200 ${
                    on
                      ? 'bg-primary text-white'
                      : enabled
                        ? 'bg-card text-ink shadow-card'
                        : 'bg-card text-ink-faint shadow-card'
                  }`}
                >
                  <span className={on ? 'text-white/85' : enabled ? 'text-ink-muted' : 'text-ink-faint'}>
                    {weekdayAbbrCap(d)}
                  </span>
                  <span className="text-base font-bold leading-tight">{d.getDate()}</span>
                  {isToday && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1 h-1 w-1 rounded-full ${on ? 'bg-white' : 'bg-primary'}`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {space.tipo === 'sala_grupal' && (
            <p className="mt-3 text-xs text-ink-muted">Los sábados la biblioteca no habilita salas grupales.</p>
          )}
        </section>

        <section aria-label="Duración" className="rounded-card bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold text-ink">Duración</h2>
          <div role="tablist" aria-label="Duración de la reserva" className="mt-3 flex gap-2">
            {([1, 2] as const)
              .filter((h) => h <= SETTINGS.maxHours)
              .map((h) => (
                <Chip
                  key={h}
                  active={draft.duracion === h}
                  onClick={() => patch({ duracion: h, inicio: null })}
                >
                  {h === 1 ? '1 hora' : `${h} horas`}
                </Chip>
              ))}
          </div>
        </section>

        <section aria-label="Horarios disponibles" className="rounded-card bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold text-ink">Horarios disponibles · {dayCompact(selected)}</h2>

          {slots.length === 0 ? (
            <p className="mt-3 text-xs text-ink-muted">
              No hay horarios para este día. Elige otra fecha.
            </p>
          ) : (
            <ul key={draft.fecha + draft.duracion} className="stagger mt-3 grid grid-cols-2 gap-2.5" aria-live="polite">
              {slots.map((s) => {
                const on = s.inicio === draft.inicio
                const free = s.estado === 'libre'
                return (
                  <li key={s.inicio}>
                    <button
                      type="button"
                      disabled={!free}
                      aria-pressed={on}
                      onClick={() => patch({ inicio: s.inicio })}
                      className={`pressable flex min-h-[3.75rem] w-full flex-col items-center justify-center rounded-xl px-2 py-2 transition-colors duration-200 ${
                        on
                          ? 'bg-primary text-white'
                          : free
                            ? 'bg-card text-ink shadow-card'
                            : 'bg-fill/5 text-ink-muted'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${free ? '' : 'line-through'}`}>
                        {s.inicio} – {s.fin}
                      </span>
                      <span className={`text-[0.6875rem] ${on ? 'font-semibold text-white' : 'text-ink-muted'}`}>
                        {on ? 'Seleccionado' : free ? 'Disponible' : s.estado === 'pasado' ? 'Pasado' : 'Ocupado'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <StickyCta>
        <button
          type="button"
          onClick={go}
          disabled={!picked}
          className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
        >
          Continuar
        </button>
      </StickyCta>
    </div>
  )
}
