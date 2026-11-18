interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}

/** Interruptor estilo iOS. Solo anima transform y color. */
export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ${
        checked ? 'bg-primary' : 'bg-fill/20'
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute left-0.5 top-0.5 h-[27px] w-[27px] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
        style={{ transform: `translate3d(${checked ? 20 : 0}px, 0, 0)` }}
      />
    </button>
  )
}
