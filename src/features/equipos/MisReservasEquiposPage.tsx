import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Badge from '@/components/ui/Badge'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useNow } from '@/hooks/useNow'
import { dayShort, parseISO } from '@/lib/date'
import { TIPOS, situacion, useEquipos, useMisReservasEquipos, type SituacionReserva } from './equiposData'

const TEXTO_VACIO: Record<SituacionReserva, { titulo: string; texto: string }> = {
  proxima: { titulo: 'No tienes reservas próximas', texto: 'Reserva un equipo para verlo aquí.' },
  pasada: { titulo: 'Aún no tienes reservas pasadas', texto: 'Aquí verás tu historial de uso.' },
  cancelada: { titulo: 'No tienes reservas canceladas', texto: 'Las que canceles aparecerán aquí.' },
}

export default function MisReservasEquiposPage() {
  const mis = useMisReservasEquipos()
  const equipos = useEquipos()
  const now = useNow(60_000)
  const { detailPath } = useShell()
  const [filtro, setFiltro] = useState<SituacionReserva>('proxima')

  const all = useMemo(() => mis.data ?? [], [mis.data])
  const por = (s: SituacionReserva) => all.filter((r) => situacion(r, now) === s)
  const list = por(filtro)
  // Próximas de la más cercana a la más lejana; el resto, de la más reciente a la más antigua.
  const ordenadas = filtro === 'proxima' ? list : [...list].reverse()

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader title="Mis reservas" back="/equipos" backLabel="Volver a equipos" subtitle="Tus reservas de laptops, computadoras y tablets." />

      <div role="tablist" aria-label="Filtrar reservas" className="mt-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
        <Chip active={filtro === 'proxima'} onClick={() => setFiltro('proxima')}>{`Próximas (${por('proxima').length})`}</Chip>
        <Chip active={filtro === 'pasada'} onClick={() => setFiltro('pasada')}>{`Pasadas (${por('pasada').length})`}</Chip>
        <Chip active={filtro === 'cancelada'} onClick={() => setFiltro('cancelada')}>{`Canceladas (${por('cancelada').length})`}</Chip>
      </div>

      <section aria-label="Reservas" className="mt-4 px-5">
        {mis.isLoading ? (
          <div role="status" aria-label="Cargando" className="space-y-px overflow-hidden rounded-card">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.5rem] w-full rounded-none" />
            ))}
          </div>
        ) : mis.isError ? (
          <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
            <Icon name="cloud_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar tus reservas</p>
            <button type="button" onClick={() => mis.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : ordenadas.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="devices" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">{TEXTO_VACIO[filtro].titulo}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{TEXTO_VACIO[filtro].texto}</p>
            {filtro === 'proxima' && (
              <Link to="/equipos" className="pressable mt-2 flex min-h-11 items-center text-sm font-semibold text-primary">
                Ver equipos
              </Link>
            )}
          </div>
        ) : (
          <ul key={filtro} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {ordenadas.map((r) => {
              const eq = equipos.data?.find((e) => e.id === r.equipoId)
              return (
                <li key={r.id}>
                  <Link
                    to={`/equipos/reserva/${r.codigo}`}
                    aria-current={detailPath === `/equipos/reserva/${r.codigo}` ? 'page' : undefined}
                    className={`pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3 ${
                      detailPath === `/equipos/reserva/${r.codigo}` ? 'bg-primary-soft' : ''
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon name={eq ? TIPOS[eq.tipo].icon : 'devices'} size={20} filled />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-snug text-ink">{eq?.nombre ?? 'Equipo'}</span>
                      <span className="block text-[0.6875rem] text-ink-muted">
                        {dayShort(parseISO(r.fecha))} · {r.inicio} – {r.fin}
                      </span>
                      <span className="block text-[0.6875rem] text-ink-faint">{r.codigo}</span>
                    </span>
                    {filtro === 'proxima' ? (
                      <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
                    ) : (
                      <Badge tone="neutral">{filtro === 'cancelada' ? 'Cancelada' : 'Finalizada'}</Badge>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
