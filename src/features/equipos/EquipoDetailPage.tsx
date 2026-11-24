import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import { useNow } from '@/hooks/useNow'
import { addDays, startOfDay, toISO } from '@/lib/date'
import { MAX_HORAS, TIPOS, proximaDisponibilidad, useEquipos, useOcupacion } from './equiposData'

export default function EquipoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const equipos = useEquipos()
  const now = useNow(60_000)
  const hoy = startOfDay(now)
  const ocupacion = useOcupacion(toISO(hoy), toISO(addDays(hoy, 7)))

  if (equipos.isLoading) return <PageLoading />
  if (equipos.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Detalle del equipo" back="/equipos" backLabel="Volver a equipos" />
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar el equipo</p>
          <button type="button" onClick={() => equipos.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  const equipo = equipos.data?.find((e) => e.id === id)
  if (!equipo) return <Navigate to="/equipos" replace />

  const disp = ocupacion.data ? proximaDisponibilidad(equipo.id, ocupacion.data, now) : null
  const tipo = TIPOS[equipo.tipo]

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Detalle del equipo" back="/equipos" backLabel="Volver a equipos" />

      <div className="stagger space-y-3 px-5 pt-4">
        <section className="rounded-card bg-card p-4 shadow-card">
          {disp && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                disp.libre ? 'bg-success-soft text-success' : 'bg-fill/5 text-ink-muted'
              }`}
            >
              <Icon name={disp.libre ? 'check' : 'schedule'} size={14} />
              {disp.texto}
            </span>
          )}
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name={tipo.icon} size={22} filled />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold leading-tight text-ink">{equipo.nombre}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{equipo.descripcion}</p>
            </div>
          </div>
        </section>

        <section className="divide-y divide-fill/5 rounded-card bg-card px-4 shadow-card">
          <Info icon="schedule" caption="Duración máxima" value={`${MAX_HORAS} horas por reserva`} note="1 reserva activa por alumno" />
          <Info icon="location_on" caption="Ubicación" value={equipo.ubicacion} note={equipo.sede} />
        </section>

        <section aria-labelledby="specs" className="rounded-card bg-card p-4 shadow-card">
          <h3 id="specs" className="text-sm font-bold text-ink">
            Especificaciones
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
            <Dato label="Procesador" value={equipo.procesador} />
            <Dato label="Memoria RAM" value={equipo.ram} />
            <Dato label="Almacenamiento" value={equipo.almacenamiento} />
            <Dato label="Sistema" value={equipo.sistema} />
          </dl>
        </section>

        {equipo.software.length > 0 && (
          <section aria-labelledby="software" className="rounded-card bg-card p-4 shadow-card">
            <h3 id="software" className="text-sm font-bold text-ink">
              Programas instalados
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {equipo.software.map((s) => (
                <li key={s} className="rounded-full bg-fill/5 px-3 py-2 text-xs font-medium text-ink">
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <StickyCta>
        <button
          type="button"
          onClick={() => navigate(`/equipos/${equipo.id}/reservar`)}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
        >
          <Icon name="event" size={18} />
          Elegir fecha y horario
        </button>
      </StickyCta>
    </div>
  )
}

function Info({ icon, caption, value, note }: { icon: string; caption: string; value: string; note?: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <Icon name={icon} size={20} className="mt-0.5 shrink-0 text-ink-muted" />
      <div className="min-w-0">
        <p className="text-[0.6875rem] text-ink-muted">{caption}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
        {note && <p className="text-[0.6875rem] text-ink-muted">{note}</p>}
      </div>
    </div>
  )
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.6875rem] text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}
