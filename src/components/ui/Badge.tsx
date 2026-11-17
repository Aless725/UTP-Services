const tones = {
  presencial: 'bg-primary-soft text-primary',
  virtual: 'bg-success-soft text-success',
  neutral: 'bg-black/5 text-ink-muted',
} as const

export default function Badge({ tone, children }: { tone: keyof typeof tones; children: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}
