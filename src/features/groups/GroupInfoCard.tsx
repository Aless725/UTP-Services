import type { ReactNode } from 'react'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { dayFull, parseISO } from '@/lib/date'
import type { GroupView } from './groupsStore'

interface GroupInfoCardProps {
  group: GroupView
  topRight?: ReactNode
  footer: ReactNode
  /** Muestra el enlace virtual (solo para integrantes). */
  showLink?: boolean
}

/** Tarjeta de detalle compartida por "Grupo creado", "Detalle del grupo" y "Mi grupo". */
export default function GroupInfoCard({ group: g, topRight, footer, showLink }: GroupInfoCardProps) {
  const virtual = g.modalidad === 'Virtual'
  return (
    <section className="rounded-card bg-card p-4 shadow-card" aria-label={`${g.curso}, ${g.tema}`}>
      <div className="flex items-center justify-between">
        <Badge tone={virtual ? 'virtual' : 'presencial'}>{g.modalidad}</Badge>
        {topRight}
      </div>
      <h2 className="mt-3 text-xl font-extrabold text-ink">{g.curso}</h2>
      <p className="mt-0.5 text-sm text-ink-muted">{g.tema}</p>

      <div className="mt-3 space-y-3 border-t border-fill/5 pt-3">
        <Row icon="calendar_today" caption={dayFull(parseISO(g.fecha))}>
          {g.inicio}–{g.fin}
        </Row>
        {virtual ? (
          <Row icon="videocam" caption={g.plataforma ?? 'Virtual'}>
            {showLink && g.enlace ? (
              <a
                href={g.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-primary underline-offset-2 hover:underline"
              >
                {g.enlace}
              </a>
            ) : (
              <span className="font-normal text-ink-muted">El enlace se muestra al unirte.</span>
            )}
          </Row>
        ) : (
          <Row icon="location_on" caption={g.sede ?? 'Lima Centro'}>
            {g.lugar?.split(' · ')[0]}
          </Row>
        )}
      </div>

      <div className="mt-3 border-t border-fill/5 pt-3">{footer}</div>
    </section>
  )
}

function Row({ icon, caption, children }: { icon: string; caption: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fill/5 text-ink-muted">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.6875rem] text-ink-muted">{caption}</p>
        <p className="text-sm font-semibold text-ink">{children}</p>
      </div>
    </div>
  )
}
