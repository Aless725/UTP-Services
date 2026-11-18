import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { useNow } from '@/hooks/useNow'
import { dayCompact, parseISO, relativeDay, startOfDay } from '@/lib/date'
import { availabilityOf } from './availability'
import { useDraft } from './draftStore'
import { useReservationData } from './reservationsStore'
import { SETTINGS, availableNow, isOpenNow, viewStateOf } from './rules'
import SpaceRow from './SpaceRow'
import { SPACES, TYPE_INFO, getSpace, longPlace, type SpaceType } from './spacesData'

const TYPES: SpaceType[] = ['sala_grupal', 'pc', 'cubiculo']

export default function ReservationsHome() {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const now = useNow()
  const { draft } = useDraft()
  const { all, mine } = useReservationData(codigo)
  const [query, setQuery] = useState('')

  const inSede = useMemo(() => SPACES.filter((s) => s.sede === draft.sede), [draft.sede])
  const next = mine.find((r) => viewStateOf(r, now) === 'proxima')
  const nextSpace = getSpace(next?.spaceId)

  const q = query.trim().toLowerCase()
  const results = useMemo(
    () =>
      q
        ? inSede
            .filter((s) => `${s.nombre} ${s.edificio} piso ${s.piso}`.toLowerCase().includes(q))
            .slice(0, 12)
        : [],
    [q, inSede],
  )

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Reserva de espacios" back="/inicio" backLabel="Volver al inicio" />

      <div className="stagger px-5">
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Reserva salas grupales, PCs de biblioteca o cubículos de estudio en tu sede.
        </p>

        <label className="mt-4 flex min-h-11 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={18} className="text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar sala, PC o pabellón"
            aria-label="Buscar sala, PC o pabellón"
            className="h-11 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
          />
        </label>

        {q ? (
          <section aria-label="Resultados de búsqueda" className="mt-5">
            <h2 className="text-[0.9375rem] font-bold text-ink">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </h2>
            {results.length === 0 ? (
              <p className="mt-3 rounded-card bg-card p-4 text-center text-xs text-ink-muted shadow-card">
                No encontramos espacios con ese nombre en {draft.sede}.
              </p>
            ) : (
              <ul className="mt-3 space-y-3" aria-live="polite">
                {results.map((s) => (
                  <li key={s.id}>
                    <SpaceRow space={s} availability={availabilityOf(s, draft.fecha, all, now)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            <h2 className="mt-5 text-[0.9375rem] font-bold text-ink">¿Qué quieres reservar?</h2>
            <ul className="mt-3 space-y-3">
              {TYPES.map((t) => {
                const info = TYPE_INFO[t]
                const spaces = inSede.filter((s) => s.tipo === t)
                const n = availableNow(spaces, all, now)
                return (
                  <li key={t}>
                    <Link
                      to={`/reservas/lista/${info.slug}`}
                      className="pressable flex items-center gap-3 rounded-card bg-card p-3.5 shadow-card"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <Icon name={info.icon} size={22} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.9375rem] font-bold text-ink">{info.titulo}</span>
                        <span className="block text-xs text-ink-muted">{info.descripcion}</span>
                        <span
                          className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${
                            isOpenNow(now) ? 'text-success' : 'text-ink-muted'
                          }`}
                        >
                          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
                          {isOpenNow(now)
                            ? `${n} disponibles ahora`
                            : `Cerrado ahora · abre a las ${String(SETTINGS.openHour).padStart(2, '0')}:00`}
                        </span>
                      </span>
                      <Icon name="chevron_right" size={20} className="text-ink-muted" />
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex items-baseline justify-between">
              <h2 className="text-[0.9375rem] font-bold text-ink">Tu próxima reserva</h2>
              <Link to="/reservas/mis" className="flex min-h-9 items-center text-xs font-semibold text-primary">
                Mis reservas
              </Link>
            </div>

            {next && nextSpace ? (
              <Link
                to="/reservas/mis"
                className="pressable mt-3 block rounded-card bg-card p-3.5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <Badge tone="virtual">Confirmada</Badge>
                  <span className="text-xs font-semibold text-primary">
                    {relativeDay(parseISO(next.fecha), startOfDay(now))}
                  </span>
                </div>
                <p className="mt-2 text-[0.9375rem] font-bold text-ink">{nextSpace.nombre}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {dayCompact(parseISO(next.fecha))} · {next.inicio} – {next.fin} · {longPlace(nextSpace).replace(' · ', ', ').replace('Piso', 'piso')}
                </p>
              </Link>
            ) : (
              <div className="mt-3 rounded-card bg-card p-4 text-center shadow-card">
                <Icon name="event_available" size={28} className="text-ink-faint" />
                <p className="mt-1 text-sm font-medium text-ink">Aún no tienes reservas próximas</p>
                <p className="text-xs text-ink-muted">Elige un tipo de espacio para empezar.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
