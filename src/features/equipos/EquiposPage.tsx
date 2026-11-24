import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useNow } from '@/hooks/useNow'
import { addDays, startOfDay, toISO } from '@/lib/date'
import {
  TIPOS,
  proximaDisponibilidad,
  situacion,
  useEquipos,
  useMisReservasEquipos,
  useOcupacion,
  type Equipo,
  type TipoEquipo,
} from './equiposData'

type Filtro = 'todos' | TipoEquipo

export default function EquiposPage() {
  const equipos = useEquipos()
  const reservas = useMisReservasEquipos()
  const now = useNow(60_000)
  const hoy = startOfDay(now)
  const ocupacion = useOcupacion(toISO(hoy), toISO(addDays(hoy, 7)))
  const { detailPath } = useShell()
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const all = useMemo(() => equipos.data ?? [], [equipos.data])
  const list = filtro === 'todos' ? all : all.filter((e) => e.tipo === filtro)
  const proximas = (reservas.data ?? []).filter((r) => situacion(r, now) === 'proxima').length
  const total = reservas.data?.length ?? 0

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Reserva de equipos"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Reserva una laptop, computadora o tablet para usar dentro del campus."
      />

      <div className="mt-4 px-5">
        <Link
          to="/equipos/mis"
          className="pressable flex min-h-16 items-center gap-3 rounded-card bg-card px-3.5 py-3 shadow-card"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon name="event_available" size={20} filled />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">Mis reservas de equipos</span>
            <span className="block text-[0.6875rem] text-ink-muted">
              {reservas.isLoading
                ? 'Cargando…'
                : total === 0
                  ? 'Aún no tienes reservas'
                  : proximas > 0
                    ? `${proximas} ${proximas === 1 ? 'reserva próxima' : 'reservas próximas'}`
                    : `${total} ${total === 1 ? 'reserva' : 'reservas'} en total`}
            </span>
          </span>
          <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
        </Link>
      </div>

      <div role="tablist" aria-label="Tipo de equipo" className="mt-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
        <Chip active={filtro === 'todos'} onClick={() => setFiltro('todos')}>{`Todos (${all.length})`}</Chip>
        {(Object.keys(TIPOS) as TipoEquipo[]).map((t) => (
          <Chip key={t} active={filtro === t} onClick={() => setFiltro(t)}>
            {`${TIPOS[t].plural} (${all.filter((e) => e.tipo === t).length})`}
          </Chip>
        ))}
      </div>

      <section aria-label="Equipos" className="mt-4 px-5">
        {equipos.isLoading ? (
          <div role="status" aria-label="Cargando" className="space-y-px overflow-hidden rounded-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.5rem] w-full rounded-none" />
            ))}
          </div>
        ) : equipos.isError ? (
          <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
            <Icon name="cloud_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar los equipos</p>
            <button type="button" onClick={() => equipos.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="devices_off" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">No hay equipos de este tipo</p>
            <p className="mt-0.5 text-xs text-ink-muted">Prueba con otro filtro.</p>
          </div>
        ) : (
          <ul key={filtro} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {list.map((e) => (
              <EquipoRow
                key={e.id}
                equipo={e}
                seleccionado={!!detailPath && detailPath.startsWith(`/equipos/${e.id}`)}
                disponibilidad={ocupacion.data ? proximaDisponibilidad(e.id, ocupacion.data, now) : null}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function EquipoRow({
  equipo,
  seleccionado,
  disponibilidad,
}: {
  equipo: Equipo
  seleccionado: boolean
  disponibilidad: { texto: string; libre: boolean } | null
}) {
  return (
    <li>
      <Link
        to={`/equipos/${equipo.id}`}
        aria-current={seleccionado ? 'page' : undefined}
        className={`pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3 ${seleccionado ? 'bg-primary-soft' : ''}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={TIPOS[equipo.tipo].icon} size={20} filled />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-snug text-ink">{equipo.nombre}</span>
          <span className="block text-[0.6875rem] text-ink-muted">
            {equipo.ubicacion} · {equipo.sede}
          </span>
          {disponibilidad && (
            <span
              className={`mt-0.5 flex items-center gap-1 text-[0.6875rem] font-semibold ${
                disponibilidad.libre ? 'text-success' : 'text-ink-muted'
              }`}
            >
              <Icon name={disponibilidad.libre ? 'check_circle' : 'schedule'} size={13} filled={disponibilidad.libre} />
              {disponibilidad.texto}
            </span>
          )}
        </span>
        <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
      </Link>
    </li>
  )
}
