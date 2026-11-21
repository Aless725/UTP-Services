import type { ReactNode } from 'react'
import { useDevice } from './DeviceContext'
import DeviceSwitcher from './DeviceSwitcher'
import OfflineBanner from './OfflineBanner'

const FRAME = 'ring-8 ring-neutral-800'
const MAX_H = 'max-h-[calc(100dvh-5.5rem)]'

/**
 * Contenedor raíz.
 * - Celular: pantalla completa (respeta notch y barra de inicio).
 * - Escritorio: marco de celular, de doble pantalla o de tableta, según la vista previa elegida.
 * - Tableta, plegable abierto o doble pantalla real: pantalla completa con dos paneles.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const { mode, framed } = useDevice()

  const size = !framed
    ? 'h-dvh w-full pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]'
    : mode === 'phone'
      ? `h-[852px] ${MAX_H} w-[393px] rounded-[48px] ${FRAME}`
      : mode === 'dual'
        ? `h-[852px] ${MAX_H} w-[810px] max-w-full rounded-[40px] ${FRAME}`
        : `h-[768px] ${MAX_H} w-[1024px] max-w-full rounded-[32px] ${FRAME}`

  return (
    <div
      className={`flex min-h-dvh items-center justify-center ${framed ? 'bg-neutral-900 px-6 pb-6 pt-16' : 'bg-surface'}`}
    >
      {framed && <DeviceSwitcher />}
      <main className={`relative overflow-hidden bg-surface ${size}`}>
        <OfflineBanner />
        {children}
      </main>
    </div>
  )
}
