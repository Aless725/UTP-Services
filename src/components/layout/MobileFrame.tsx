import type { ReactNode } from 'react'

/**
 * Móvil: ocupa toda la pantalla (respeta notch y barra de inicio con safe-area).
 * Escritorio: simula un iPhone 15 Pro / 16 (393×852).
 */
export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-900 sm:p-6">
      <main className="relative h-dvh w-full overflow-hidden bg-surface sm:h-[852px] sm:max-h-[calc(100dvh-3rem)] sm:w-[393px] sm:rounded-[48px] sm:ring-8 sm:ring-neutral-800">
        {children}
      </main>
    </div>
  )
}
