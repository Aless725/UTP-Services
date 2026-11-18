interface ChipProps {
  active: boolean
  onClick: () => void
  children: string
}

/** Chip de filtro (mismo estilo que el calendario). */
export default function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`pressable min-h-9 shrink-0 rounded-full px-4 text-xs font-medium transition-colors ${
        active ? 'bg-ink text-surface' : 'bg-card text-ink-muted shadow-card'
      }`}
    >
      {children}
    </button>
  )
}
