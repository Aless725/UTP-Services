import type { CSSProperties } from 'react'

interface IconProps {
  /** Nombre del ícono en Google Material Symbols (ej. "arrow_forward") */
  name: string
  size?: number
  filled?: boolean
  /** Texto accesible. Si se omite, el ícono es decorativo. */
  label?: string
  className?: string
}

export default function Icon({ name, size = 24, filled, label, className = '' }: IconProps) {
  const style: CSSProperties = { fontSize: size }
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className}`}
      style={style}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  )
}
