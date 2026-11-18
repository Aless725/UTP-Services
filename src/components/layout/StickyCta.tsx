import type { ReactNode } from 'react'
import { useShell } from './ShellContext'

/**
 * Zona de acciones fija al pie del contenido, siempre por encima de la barra
 * inferior (o pegada al borde en el panel derecho, que no tiene barra).
 */
export default function StickyCta({ children }: { children: ReactNode }) {
  const { detailPath } = useShell()
  return (
    <div
      className={`sticky z-10 mt-auto border-t border-fill/5 bg-surface px-5 pb-2 pt-3 ${
        detailPath ? 'bottom-0' : 'bottom-[calc(env(safe-area-inset-bottom)+92px)]'
      }`}
    >
      {children}
    </div>
  )
}
