import type { ReactNode } from 'react'
import { useDevice } from './DeviceContext'

/**
 * Dos paneles. En doble pantalla deja una bisagra entre ambos y, si el navegador
 * reporta los segmentos reales (CSS Viewport Segments), se alinea a cada pantalla.
 */
export default function TwoPane({ left, right }: { left: ReactNode; right: ReactNode }) {
  const { mode, stacked } = useDevice()
  const dual = mode === 'dual'

  // Bisagra horizontal (equipo plegado en vertical): una pantalla arriba y otra abajo.
  if (stacked) {
    return (
      <div className="flex h-full flex-col">
        <section className="dual-top relative min-h-0 flex-1 overflow-hidden bg-surface">{left}</section>
        <div aria-hidden="true" className="dual-hinge-h h-6 shrink-0 bg-neutral-900" />
        <section className="dual-bottom relative min-h-0 flex-1 overflow-hidden bg-surface">{right}</section>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <section
        className={`relative h-full overflow-hidden bg-surface ${
          dual ? 'dual-left min-w-0 flex-1' : 'w-[calc(400px+var(--rail))] shrink-0 border-r border-fill/10'
        }`}
      >
        {left}
      </section>
      {dual && <div aria-hidden="true" className="dual-hinge w-6 shrink-0 bg-neutral-900" />}
      <section className={`relative h-full min-w-0 flex-1 overflow-hidden bg-surface ${dual ? 'dual-right' : ''}`}>
        {right}
      </section>
    </div>
  )
}
