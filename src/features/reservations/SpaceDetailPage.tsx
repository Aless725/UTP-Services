import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { useNow } from '@/hooks/useNow'
import { summaryDuration } from './availability'
import { useDraft } from './draftStore'
import { useReservationData } from './reservationsStore'
import { SETTINGS, nextAvailableDate } from './rules'
import { EQUIPMENT, TYPE_INFO, getSpace, longPlace } from './spacesData'
import { toISO, startOfDay } from '@/lib/date'

export default function SpaceDetailPage() {
  const { id } = useParams()
  const space = getSpace(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const { all } = useReservationData(session?.codigo ?? '')
  const now = useNow(60000)
  const { patch } = useDraft()

  if (!space) return <Navigate to="/reservas" replace />

  const info = TYPE_INFO[space.tipo]
  const today = toISO(startOfDay(now))
  const available = nextAvailableDate(space, today, summaryDuration(space), all, now) !== null
  const individual = space.capMax === 1

  const choose = () => {
    patch({ sede: space.sede, inicio: null })
    navigate(`/reservas/espacio/${space.id}/horario`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="Detalle del espacio"
        back={`/reservas/lista/${info.slug}`}
        backLabel={`Volver a ${info.titulo.toLowerCase()}`}
      />

      <div className="stagger space-y-3 px-5 pt-4">
        <section className="rounded-card bg-card p-4 shadow-card">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              available ? 'bg-success-soft text-success' : 'bg-fill/5 text-ink-muted'
            }`}
          >
            <Icon name={available ? 'check' : 'schedule'} size={14} />
            {available ? 'Disponible' : 'Sin horarios'}
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-ink">{space.nombre}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{space.descripcion}</p>
        </section>

        <section className="divide-y divide-fill/5 rounded-card bg-card px-4 shadow-card">
          <Info
            icon="groups"
            caption="Capacidad"
            value={individual ? '1 persona' : `De ${space.capMin} a ${space.capMax} personas`}
            note={individual ? 'Uso individual' : `Necesitas al menos ${space.capMin} integrantes`}
          />
          <Info
            icon="schedule"
            caption="Duración máxima"
            value={`${SETTINGS.maxHours} horas por reserva`}
            note="1 reserva activa por tipo de espacio"
          />
          <Info icon="location_on" caption="Ubicación" value={longPlace(space)} note={space.sede} />
        </section>

        <section className="rounded-card bg-card p-4 shadow-card">
          <h3 className="text-sm font-bold text-ink">Equipamiento</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {space.equip.map((k) => (
              <li
                key={k}
                className="flex items-center gap-1.5 rounded-full bg-fill/5 px-3 py-2 text-xs font-medium text-ink"
              >
                <Icon name={EQUIPMENT[k].icon} size={16} />
                {EQUIPMENT[k].label}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <StickyCta>
        <button
          type="button"
          onClick={choose}
          className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
        >
          Elegir fecha y horario
        </button>
      </StickyCta>
    </div>
  )
}

function Info({ icon, caption, value, note }: { icon: string; caption: string; value: string; note: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <Icon name={icon} size={22} className="mt-0.5 text-ink" />
      <div>
        <p className="text-[0.6875rem] text-ink-muted">{caption}</p>
        <p className="text-sm font-bold text-ink">{value}</p>
        <p className="text-xs text-ink-muted">{note}</p>
      </div>
    </div>
  )
}
