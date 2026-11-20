import { useState } from 'react'
import { useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import { useToast } from '@/components/ui/Toast'
import { dayFull, parseISO } from '@/lib/date'
import {
  AttendanceError,
  CATEGORIES,
  addAnnouncementToCalendar,
  cuposLibres,
  isPast,
  shareAnnouncement,
  useAttendance,
  useCampusAnnouncement,
} from './announcementsData'

export default function AnnouncementDetailPage() {
  const { id } = useParams()
  const { data: a, isLoading, isError, refetch } = useCampusAnnouncement(id)
  const attend = useAttendance()
  const { show } = useToast()
  const [busy, setBusy] = useState(false)

  if (isLoading) return <PageLoading />
  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Anuncio" back="/anuncios" backLabel="Volver a anuncios" />
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar este anuncio</p>
          <button type="button" onClick={() => refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  if (!a) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Anuncio" back="/anuncios" backLabel="Volver a anuncios" />
        <div className="mt-20 flex flex-col items-center px-5 text-center">
          <Icon name="search_off" size={36} className="text-ink-faint" />
          <h2 className="mt-3 text-base font-bold text-ink">No encontramos este anuncio</h2>
          <p className="mt-1 text-xs text-ink-muted">Puede que ya no esté disponible.</p>
        </div>
      </div>
    )
  }

  const cat = CATEGORIES[a.categoria]
  const past = isPast(a)
  const libres = cuposLibres(a)
  const full = libres === 0 && !a.asistire

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      await attend(a.id, !a.asistire)
      show(a.asistire ? 'Cancelaste tu asistencia' : '¡Listo! Te esperamos', a.asistire ? 'event_busy' : 'event_available')
    } catch (e) {
      const reason = e instanceof AttendanceError ? e.reason : 'other'
      show(
        reason === 'full'
          ? 'Ya no quedan cupos'
          : reason === 'past'
            ? 'Esta actividad ya terminó'
            : 'No pudimos guardar tu asistencia. Inténtalo de nuevo.',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    const r = await shareAnnouncement(a)
    if (r === 'copied') show('Enlace copiado', 'content_copy')
    if (r === 'error') show('No se pudo compartir', 'error')
  }

  const rows: { icon: string; label: string; value: string }[] = [
    { icon: 'calendar_today', label: 'Fecha', value: dayFull(parseISO(a.fecha)) },
    { icon: 'schedule', label: 'Horario', value: `${a.inicio} – ${a.fin}` },
    { icon: 'location_on', label: 'Lugar', value: `${a.lugar} · ${a.sede}` },
    {
      icon: 'group',
      label: 'Asistencia',
      value:
        libres === null
          ? `Entrada libre · ${a.asistentes} ${a.asistentes === 1 ? 'confirmado' : 'confirmados'}`
          : `${a.asistentes} de ${a.cupos} cupos ocupados`,
    },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title={a.titulo} back="/anuncios" backLabel="Volver a anuncios" subtitle={a.resumen} />

      <div className="stagger flex-1 space-y-3 px-5 pt-4">
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${cat.tone}`}>
            <Icon name={cat.icon} size={18} filled />
          </span>
          <span className="text-xs font-semibold text-ink-muted">{cat.label}</span>
          {past && <span className="ml-auto rounded-full bg-fill/5 px-2.5 py-0.5 text-[0.625rem] font-semibold text-ink-muted">Finalizada</span>}
          {a.asistire && !past && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[0.625rem] font-semibold text-success">
              <Icon name="check" size={12} />
              Asistirás
            </span>
          )}
        </div>

        <section aria-label="Datos de la actividad" className="rounded-card bg-card p-4 shadow-card">
          <dl className="divide-y divide-fill/5">
            {rows.map((r) => (
              <div key={r.label} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <Icon name={r.icon} size={18} className="mt-0.5 shrink-0 text-ink-muted" />
                <div className="min-w-0">
                  <dt className="text-[0.6875rem] text-ink-muted">{r.label}</dt>
                  <dd className="text-sm font-medium text-ink">{r.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="acerca" className="rounded-card bg-card p-4 shadow-card">
          <h2 id="acerca" className="text-sm font-bold text-ink">
            Acerca de la actividad
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">{a.descripcion}</p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              addAnnouncementToCalendar(a)
              show('Evento descargado', 'event_available')
            }}
            className="pressable flex min-h-12 items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold text-primary shadow-card"
          >
            <Icon name="event_available" size={18} />
            Calendario
          </button>
          <button
            type="button"
            onClick={share}
            className="pressable flex min-h-12 items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold text-primary shadow-card"
          >
            <Icon name="share" size={18} />
            Compartir
          </button>
        </div>
      </div>

      {!past && (
        <StickyCta>
          <button
            type="button"
            onClick={toggle}
            disabled={busy || full}
            aria-pressed={a.asistire}
            className={`pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold disabled:opacity-60 ${
              a.asistire ? 'bg-card text-primary shadow-card' : 'bg-primary text-white'
            }`}
          >
            <Icon name={a.asistire ? 'event_busy' : 'how_to_reg'} size={18} />
            {busy ? 'Guardando…' : full ? 'Sin cupos disponibles' : a.asistire ? 'Cancelar asistencia' : 'Asistiré'}
          </button>
          {libres !== null && !a.asistire && !full && (
            <p className="mt-2 text-center text-xs text-ink-muted">
              Quedan {libres} {libres === 1 ? 'cupo' : 'cupos'}
            </p>
          )}
        </StickyCta>
      )}
    </div>
  )
}
