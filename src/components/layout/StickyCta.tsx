import type { CSSProperties, ReactNode } from 'react'
import { useShell } from './ShellContext'

/** Alto reservado para la barra inferior flotante (68 px + margen). */
const NAV_ROOM = 'calc(env(safe-area-inset-bottom) + 92px)'
/** Relleno inferior del contenedor con scroll (ver AppLayout). */
const SCROLL_PAD = 'calc(env(safe-area-inset-bottom) + 110px)'

/**
 * Barra de acciones fija al pie del contenido.
 * Con barra de navegación (un solo panel) se extiende hasta el borde inferior, por detrás
 * de la navegación, para no dejar ver contenido por el hueco; en el panel derecho se pega al borde.
 * `sticky` mide `bottom` dentro del relleno del contenedor, por eso se compensa con valores negativos.
 */
export default function StickyCta({ children }: { children: ReactNode }) {
  const { detailPath } = useShell()
  const style: CSSProperties = detailPath
    ? { bottom: '-2rem', marginBottom: '-2rem', paddingBottom: '2.5rem' }
    : { bottom: `calc(-1 * ${SCROLL_PAD})`, marginBottom: `calc(-1 * ${NAV_ROOM})`, paddingBottom: NAV_ROOM }
  return (
    <div className="sticky z-10 mt-auto border-t border-fill/5 bg-surface px-5 pt-3" style={style}>
      {children}
    </div>
  )
}
