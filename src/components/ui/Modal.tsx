import { useEffect, useRef, type ReactNode } from 'react'
import Icon from './Icon'
import { useLeaving } from './Presence'

interface ModalProps {
  icon: string
  /** Si es true el ícono gira (estado de carga). */
  spinning?: boolean
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  actionIcon?: string
  children?: ReactNode
}

/**
 * Diálogo centrado sobre un fondo atenuado. Se renderiza dentro del marco móvil.
 * Úsalo dentro de <Presence> para que también anime su salida.
 */
export default function Modal({
  icon,
  spinning,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  actionIcon,
  children,
}: ModalProps) {
  const btn = useRef<HTMLButtonElement>(null)
  const leaving = useLeaving()

  useEffect(() => {
    btn.current?.focus()
  }, [])

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-5 ${
        leaving ? 'pointer-events-none animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-live="assertive"
        aria-label={title}
        className={`w-full rounded-[22px] bg-card px-5 pb-5 pt-6 text-center shadow-float ${
          leaving ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon name={icon} size={22} className={spinning ? 'animate-spin' : ''} />
        </div>
        <h2 className="mt-3 text-base font-bold text-ink">{title}</h2>
        {description && <p className="mt-2 text-xs leading-relaxed text-ink-muted">{description}</p>}
        {children}
        {actionLabel && (
          <button
            ref={btn}
            type="button"
            onClick={onAction}
            className="pressable mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
          >
            {actionIcon && <Icon name={actionIcon} size={18} />}
            {actionLabel}
          </button>
        )}
        {secondaryLabel && (
          <button
            type="button"
            onClick={onSecondary}
            className="pressable mt-2 min-h-11 w-full rounded-full bg-card text-sm font-semibold text-primary shadow-card"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}
