import type { ReactNode } from 'react'
import BackButton from '@/components/ui/BackButton'

interface FlowHeaderProps {
  title: string
  /** Ruta a la que regresa el botón circular. */
  back: string
  backLabel: string
  subtitle?: string
  right?: ReactNode
}

/** Encabezado de los pasos de un flujo: botón circular de regreso, título y subtítulo. */
export default function FlowHeader({ title, back, backLabel, subtitle, right }: FlowHeaderProps) {
  return (
    <header className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <div className="flex items-center justify-between">
        <BackButton to={back} label={backLabel} />
        {right}
      </div>
      <h1 className="mt-4 text-title text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{subtitle}</p>}
    </header>
  )
}
