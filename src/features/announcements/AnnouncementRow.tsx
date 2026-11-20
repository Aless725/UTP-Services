import { Link } from 'react-router-dom'
import { useShell } from '@/components/layout/ShellContext'
import Icon from '@/components/ui/Icon'
import { monthAbbr, parseISO } from '@/lib/date'
import { CATEGORIES, type CampusAnnouncement } from './announcementsData'

interface AnnouncementRowProps {
  item: CampusAnnouncement
  /** Muestra el lugar además de la sede (lista completa). */
  withPlace?: boolean
}

/** Tarjeta de un anuncio: ícono de la categoría, título y dónde y cuándo. */
export default function AnnouncementRow({ item: a, withPlace }: AnnouncementRowProps) {
  const { detailPath } = useShell()
  const cat = CATEGORIES[a.categoria]
  const d = parseISO(a.fecha)
  const when = `${d.getDate()} ${monthAbbr(d)}`
  const selected = detailPath === `/anuncios/${a.id}`

  return (
    <Link
      to={`/anuncios/${a.id}`}
      aria-current={selected ? 'page' : undefined}
      className={`pressable flex min-h-14 items-center gap-3 rounded-card bg-card p-3 shadow-card ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cat.tone}`}>
        <Icon name={cat.icon} size={20} filled />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">{a.titulo}</span>
        <span className="block truncate text-[0.6875rem] text-ink-muted">
          {withPlace ? `${when} · ${a.lugar} · ${a.sede}` : `${a.sede} · ${when}`}
        </span>
      </span>
      {a.asistire ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[0.625rem] font-semibold text-success">
          <Icon name="check" size={12} />
          Asistirás
        </span>
      ) : (
        <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
      )}
    </Link>
  )
}
