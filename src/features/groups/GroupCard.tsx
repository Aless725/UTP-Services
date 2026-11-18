import { Link } from 'react-router-dom'
import { useShell } from '@/components/layout/ShellContext'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { dayShort, parseISO } from '@/lib/date'
import type { GroupView } from './groupsStore'

interface GroupCardProps {
  group: GroupView
  /** Texto del rol (solo en "Mis grupos"). */
  role?: string
  showDetails?: boolean
}

export default function GroupCard({ group: g, role, showDetails }: GroupCardProps) {
  const { detailPath } = useShell()
  const selected = detailPath === `/grupos/${g.id}`
  const place = g.modalidad === 'Virtual' ? g.plataforma : g.lugar
  return (
    <Link
      to={`/grupos/${g.id}`}
      className={`pressable block rounded-card bg-card p-3.5 shadow-card ${selected ? 'ring-2 ring-primary' : ''}`}
      aria-current={selected ? 'page' : undefined}
      aria-label={`${g.curso}, ${g.tema}`}
    >
      <div className="flex items-center justify-between">
        <Badge tone={g.modalidad === 'Virtual' ? 'virtual' : 'presencial'}>{g.modalidad}</Badge>
        {role ? (
          <span className="rounded-full bg-fill/5 px-2.5 py-0.5 text-[0.625rem] font-semibold text-ink-muted">
            {role}
          </span>
        ) : (
          <Icon name="chevron_right" size={20} className="text-ink-muted" />
        )}
      </div>
      <h3 className="mt-2 text-base font-bold text-ink">{g.curso}</h3>
      <p className="text-xs text-ink-muted">{g.tema}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink">
        <Icon name="calendar_today" size={14} className="text-ink-muted" />
        {dayShort(parseISO(g.fecha))} · {g.inicio}–{g.fin}
      </p>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="min-w-0 truncate text-ink-muted">{place}</span>
        <span className="shrink-0 pl-2 font-semibold text-primary">
          {g.integrantes}/{g.cupos} integrantes
        </span>
      </div>
      {showDetails && (
        <p className="mt-2 flex items-center justify-between text-xs font-semibold text-primary">
          Ver detalles
          <Icon name="chevron_right" size={18} />
        </p>
      )}
    </Link>
  )
}
