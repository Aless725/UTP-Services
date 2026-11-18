import type { ReactNode } from 'react'
import BackButton from '@/components/ui/BackButton'

interface DarkHeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  /** Altura extra inferior para que una tarjeta pueda superponerse. */
  overlap?: boolean
}

/** Encabezado oscuro de Perfil y Accesibilidad (igual en tema claro y oscuro). */
export default function DarkHeader({ title, subtitle, right, overlap }: DarkHeaderProps) {
  return (
    <header
      className={`bg-neutral-900 px-5 pt-[max(env(safe-area-inset-top),20px)] text-white ${
        overlap ? 'pb-12' : 'pb-5'
      }`}
    >
      <div className="flex items-center justify-between">
        <BackButton onDark />
        {right}
      </div>
      <h1 className="mt-4 text-title">{title}</h1>
      {subtitle && <p className="mt-1 text-xs text-white/70">{subtitle}</p>}
    </header>
  )
}
