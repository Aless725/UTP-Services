import Icon from '@/components/ui/Icon'
import { Link } from 'react-router-dom'
import type { Programa } from '../empleabilidadData'

export default function ProgramaCard({ programa: p }: { programa: Programa }) {
  return (
    <article className="rounded-card bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={p.icono} size={23} />
        </span>
        <h2 className="text-base font-extrabold text-ink">{p.titulo}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.descripcion}</p>
      <dl className="mt-3 space-y-2 border-t border-fill/5 pt-3 text-xs">
        <div className="flex items-start gap-2">
          <Icon name="school" size={18} className="shrink-0 text-primary" />
          <dt className="sr-only">Dirigido a</dt>
          <dd className="text-ink">{p.ciclos}</dd>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="schedule" size={18} className="shrink-0 text-primary" />
          <dt className="sr-only">Frecuencia</dt>
          <dd className="text-ink">{p.frecuencia}</dd>
        </div>
        {p.requisitos.length > 0 && (
          <div className="flex items-start gap-2">
            <Icon name="workspace_premium" size={18} className="shrink-0 text-primary" />
            <dt className="sr-only">Requisitos</dt>
            <dd className="text-ink">{p.requisitos.join(' · ')}</dd>
          </div>
        )}
      </dl>
      <Link
        to={`/empleabilidad/programas/${p.id}`}
        aria-label={`Ver programa: ${p.titulo}`}
        className="pressable mt-3 flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-primary"
      >
        Ver programa
        <Icon name="chevron_right" size={20} />
      </Link>
    </article>
  )
}
