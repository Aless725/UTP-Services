import type { ReactNode } from 'react'

/**
 * En móvil ocupa toda la pantalla; en escritorio simula un iPhone (390×844).
 */
export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink sm:p-6">
      <main className="relative h-dvh w-full overflow-hidden bg-surface sm:h-[844px] sm:max-h-[calc(100dvh-3rem)] sm:w-[390px] sm:rounded-[40px] sm:shadow-float">
        {children}
      </main>
    </div>
  )
}
