interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}

/** Control segmentado con píldora deslizante. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const index = options.findIndex((o) => o.value === value)
  const width = 100 / options.length
  return (
    <div role="tablist" aria-label={label} className="relative flex rounded-full bg-black/[0.06] p-1">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-full bg-white shadow-card transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `calc(${width}% - 4px)`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 min-h-11 flex-1 px-2 text-xs font-medium leading-tight transition-colors ${
            o.value === value ? 'text-ink' : 'text-ink-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
