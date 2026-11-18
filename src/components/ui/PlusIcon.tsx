interface Props {
  size?: number
  /** Si es true dibuja "−" (menos). */
  minus?: boolean
  className?: string
}

/** "+" y "−" con puntas redondeadas, como en el diseño (el glifo de Material las tiene cuadradas). */
export default function PlusIcon({ size = 24, minus, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d={minus ? 'M6 12h12' : 'M12 5.5v13M5.5 12h13'} />
    </svg>
  )
}
