import type { ReactNode } from 'react'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import Logo from '@/components/ui/Logo'

interface AuthLayoutProps {
  children: ReactNode
  /** Botón circular de regreso en la esquina superior izquierda. */
  back?: { to: string; label: string; state?: unknown }
}

export default function AuthLayout({ children, back }: AuthLayoutProps) {
  return (
    <div className="relative h-full bg-surface">
      {back && (
        <div className="absolute left-5 top-[max(env(safe-area-inset-top),20px)] z-10">
          <BackButton to={back.to} state={back.state} label={back.label} />
        </div>
      )}
      <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-24">
        <div className="flex animate-rise justify-center">
          <Logo size="md" />
        </div>
        <div className="mt-16 flex flex-1 flex-col">{children}</div>
        <p className="pt-8 text-center text-[0.6875rem] text-ink-faint">UTP+ Service · Servicios para alumnos UTP</p>
      </div>
    </div>
  )
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-base font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{subtitle}</p>}
    </header>
  )
}

/** Tarjeta de confirmación (correo enviado / cuenta lista). */
export function InfoCard({ icon, title, caption }: { icon: string; title: string; caption: string }) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-card p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-ink">{title}</p>
        <p className="text-[0.6875rem] text-ink-muted">{caption}</p>
      </div>
    </div>
  )
}
