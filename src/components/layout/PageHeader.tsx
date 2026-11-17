import ProfileButton from './ProfileButton'

interface PageHeaderProps {
  title: string
  eyebrow?: string
}

export default function PageHeader({ title, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <div>
        {eyebrow && <p className="text-xs text-ink-muted">{eyebrow}</p>}
        <h1 className="text-title text-ink">{title}</h1>
      </div>
      <ProfileButton />
    </header>
  )
}
