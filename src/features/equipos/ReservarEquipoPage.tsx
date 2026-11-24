import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import PageLoading from '@/components/ui/PageLoading'
import Presence from '@/components/ui/Presence'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useNow } from '@/hooks/useNow'
import { dayShort, longDay, parseISO } from '@/lib/date'
import {
  DIAS_ANTICIPACION,
  EquipoError,
  diasReservables,
  franjasDelDia,
  situacion,
  useEquipoActions,
  useEquipos,
  useMisReservasEquipos,
  useOcupacion,
} from './equiposData'

type Horas = '2' | '4'

/** Elegir día, duración y horario de un equipo, y confirmar. Todo en una sola pantalla. */
export default function ReservarEquipoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const equipos = useEquipos()
  const mis = useMisReservasEquipos()
  const now = useNow(60_000)
  const dias = useMemo(() => diasReservables(now), [now])
  const ocupacion = useOcupacion(dias[0], dias[dias.length - 1])
  const { reservar } = useEquipoActions()

  const [fecha, setFecha] = useState<string | null>(null)
  const [horas, setHoras] = useState<Horas>('2')
  const [inicio, setInicio] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<EquipoError | null>(null)

  const equipo = equipos.data?.find((e) => e.id === id)
  if (equipos.isLoading) return <PageLoading />
  if (!equipo) return <Navigate to="/equipos" replace />

  const dia = fecha ?? dias[0]
  const franjas = franjasDelDia(equipo.id, dia, Number(horas), ocupacion.data ?? [], now)
  const elegida = franjas.find((f) => f.inicio === inicio && f.libre)
  const activa = (mis.data ?? []).find((r) => situacion(r, now) === 'proxima')

  const confirmar = async () => {
    if (!elegida) return
    setEnviando(true)
    try {
      const codigo = await reservar(equipo.id, dia, elegida.inicio, elegida.fin)
      navigate(`/equipos/reserva/${codigo}`, { replace: true, state: { nueva: true } })
    } catch (e) {
      setEnviando(false)
      setInicio(null)
      setError(e instanceof EquipoError ? e : new EquipoError('other', 'No pudimos confirmar tu reserva.'))
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Reservar" back={`/equipos/${equipo.id}`} backLabel="Volver al equipo" subtitle={equipo.nombre} />

      <div className="space-y-5 px-5 pb-6 pt-4">
        {activa && (
          <Link
            to={`/equipos/reserva/${activa.codigo}`}
            className="pressable flex items-center gap-3 rounded-card bg-primary-soft p-3.5"
          >
            <Icon name="info" size={20} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1 text-xs leading-snug text-ink">
              Ya tienes una reserva de equipo activa ({activa.codigo}). Cancélala para reservar otra.
            </span>
            <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
          </Link>
        )}

        <section aria-labelledby="dia">
          <h2 id="dia" className="mb-2 px-1 text-sm font-bold text-ink">
            Día
          </h2>
          <ul role="radiogroup" aria-label="Día" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
            {dias.map((d) => {
              const sel = d === dia
              const date = parseISO(d)
              const [sem, num] = dayShort(date).split(' ')
              return (
                <li key={d} className="shrink-0">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    aria-label={longDay(date)}
                    onClick={() => {
                      setFecha(d)
                      setInicio(null)
                    }}
                    className={`pressable flex h-16 w-14 flex-col items-center justify-center rounded-2xl ${
                      sel ? 'bg-primary text-white' : 'bg-card text-ink shadow-card'
                    }`}
                  >
                    <span className={`text-[0.6875rem] ${sel ? 'text-white/80' : 'text-ink-muted'}`}>{sem}</span>
                    <span className="text-lg font-bold leading-tight">{num}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-1 px-1 text-[0.6875rem] text-ink-faint">
            De lunes a viernes, hasta {DIAS_ANTICIPACION} días por adelantado.
          </p>
        </section>

        <section aria-labelledby="duracion">
          <h2 id="duracion" className="mb-2 px-1 text-sm font-bold text-ink">
            Duración
          </h2>
          <SegmentedControl<Horas>
            label="Duración de la reserva"
            value={horas}
            onChange={(v) => {
              setHoras(v)
              setInicio(null)
            }}
            options={[
              { value: '2', label: '2 horas' },
              { value: '4', label: '4 horas' },
            ]}
          />
        </section>

        <section aria-labelledby="horario">
          <h2 id="horario" className="mb-2 px-1 text-sm font-bold text-ink">
            Horario · {longDay(parseISO(dia))}
          </h2>
          {ocupacion.isLoading ? (
            <div role="status" aria-label="Cargando horarios" className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-card bg-fill/5" />
              ))}
            </div>
          ) : ocupacion.isError ? (
            <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
              <Icon name="cloud_off" size={28} className="text-ink-faint" />
              <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar los horarios</p>
              <button type="button" onClick={() => ocupacion.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
                Reintentar
              </button>
            </div>
          ) : franjas.every((f) => !f.libre) ? (
            <div className="flex flex-col items-center rounded-card bg-card px-6 py-8 text-center shadow-card">
              <Icon name="event_busy" size={30} className="text-ink-faint" />
              <p className="mt-2 text-sm font-medium text-ink">No quedan horarios este día</p>
              <p className="mt-0.5 text-xs text-ink-muted">Elige otro día u otra duración.</p>
            </div>
          ) : (
            <ul role="radiogroup" aria-label="Horarios" className="grid grid-cols-2 gap-2">
              {franjas.map((f) => {
                const sel = f.inicio === inicio
                return (
                  <li key={f.inicio}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      disabled={!f.libre}
                      onClick={() => setInicio(f.inicio)}
                      className={`pressable flex min-h-14 w-full flex-col items-start justify-center rounded-card px-3 text-left ${
                        sel
                          ? 'bg-primary-soft ring-2 ring-primary'
                          : f.libre
                            ? 'bg-card shadow-card'
                            : 'bg-fill/5 opacity-70'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${f.libre ? 'text-ink' : 'text-ink-faint'}`}>
                        {f.inicio} – {f.fin}
                      </span>
                      <span className={`text-[0.6875rem] font-medium ${sel ? 'text-primary' : f.libre ? 'text-success' : 'text-ink-faint'}`}>
                        {sel ? 'Seleccionado' : f.libre ? 'Disponible' : f.motivo === 'pasado' ? 'Ya pasó' : 'Ocupado'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {elegida && (
          <section aria-label="Resumen" className="animate-fade-in rounded-card bg-card p-4 shadow-card">
            <p className="text-sm font-bold text-ink">Tu reserva</p>
            <p className="mt-1 text-sm text-ink">
              {longDay(parseISO(dia))} · {elegida.inicio} – {elegida.fin}
            </p>
            <p className="text-xs text-ink-muted">
              {equipo.nombre} · {equipo.ubicacion}
            </p>
            <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-faint">
              Puedes cancelar sin penalidad hasta 1 hora antes del inicio.
            </p>
          </section>
        )}
      </div>

      <StickyCta>
        <button
          type="button"
          disabled={!elegida || !!activa || enviando}
          onClick={confirmar}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark disabled:opacity-50"
        >
          <Icon name="check" size={18} />
          Confirmar reserva
        </button>
      </StickyCta>

      <Presence show={enviando}>
        <Modal icon="progress_activity" spinning title="Confirmando tu reserva…" />
      </Presence>
      <Presence show={!!error}>
        <Modal
          icon={error?.reason === 'offline' ? 'wifi_off' : error?.reason === 'conflict' ? 'event_busy' : 'error'}
          title={
            error?.reason === 'conflict'
              ? 'Ese horario se ocupó'
              : error?.reason === 'offline'
                ? 'Sin conexión'
                : error?.reason === 'penalty'
                  ? 'No puedes reservar por ahora'
                  : error?.reason === 'active_exists'
                    ? 'Ya tienes una reserva activa'
                    : 'No pudimos reservar'
          }
          description={
            error?.reason === 'offline'
              ? 'Revisa tu conexión y vuelve a intentarlo. Tu selección se conserva.'
              : error?.message
          }
          actionLabel={error?.reason === 'conflict' ? 'Elegir otro horario' : 'Entendido'}
          onAction={() => setError(null)}
        />
      </Presence>
    </div>
  )
}
