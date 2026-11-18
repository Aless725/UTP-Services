import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import MoreSheet from '@/features/more/MoreSheet'
import BottomNav from './BottomNav'

const TABS = ['/inicio', '/calendario', '/cursos', '/pagos']
const isTab = (p: string | null) => !!p && TABS.includes(p)

/**
 * Elige la animación de entrada:
 *  - entre pestañas principales: aparece con un leve ascenso (movimiento lateral).
 *  - al avanzar a un detalle: entra desde la derecha.
 *  - al volver: entra desde la izquierda.
 */
function usePageAnimation(pathname: string): string {
  const navType = useNavigationType()
  const state = useRef<{ path: string | null; anim: string }>({ path: null, anim: 'animate-page-in' })
  // Se decide una sola vez por ruta, para no reiniciar la animación en re-renders.
  if (state.current.path !== pathname) {
    const from = state.current.path
    const anim =
      from === null || (isTab(from) && isTab(pathname))
        ? 'animate-page-in'
        : navType === 'POP'
          ? 'animate-page-back'
          : 'animate-page-forward'
    state.current = { path: pathname, anim }
  }
  return state.current.anim
}

/** Estructura de las pantallas principales: contenido con scroll + barra flotante. */
export default function AppLayout() {
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const animation = usePageAnimation(pathname)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="relative h-full">
      <div
        ref={scroller}
        className="no-scrollbar h-full overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+110px)]"
      >
        <div key={pathname} className={animation}>
          <Outlet />
        </div>
      </div>
      <BottomNav moreOpen={moreOpen} onToggleMore={() => setMoreOpen((o) => !o)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
