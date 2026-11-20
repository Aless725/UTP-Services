import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import MoreSheet from '@/features/more/MoreSheet'
import { DockContext } from './DockContext'
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

/** Pantallas que reemplazan la barra de navegación por su propia barra (el asistente la convierte en cuadro de mensaje). */
const isChat = (p: string) => p === '/soporte'

/** Altura del teclado en pantallas táctiles, para que la barra no quede tapada. */
function useKeyboardOffset(active: boolean): number {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!active || !vv) return setOffset(0)
    const update = () => setOffset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)))
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])
  return offset
}

/** Estructura de las pantallas principales: contenido con scroll + barra flotante. */
export default function AppLayout() {
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const animation = usePageAnimation(pathname)
  const chat = isChat(pathname)
  const [dockEl, setDockEl] = useState<HTMLElement | null>(null)
  const keyboard = useKeyboardOffset(chat)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="relative h-full">
      <div
        ref={scroller}
        className={`no-scrollbar h-full overflow-y-auto overscroll-contain ${chat ? 'pb-[calc(env(safe-area-inset-bottom)+160px)]' : 'pb-[calc(env(safe-area-inset-bottom)+110px)]'}`}
      >
        <div key={pathname} className={`flex min-h-full flex-col ${animation}`}>
          <DockContext.Provider value={chat ? dockEl : null}>
            <Outlet />
          </DockContext.Provider>
        </div>
      </div>
      {chat ? (
        // La barra de navegación se transforma en el cuadro de mensaje: mismo lugar, misma forma.
        <div
          key="dock-chat"
          ref={setDockEl}
          style={keyboard ? { transform: `translate3d(0, -${keyboard}px, 0)` } : undefined}
          className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+24px)] z-20 animate-rise"
        />
      ) : (
        <BottomNav moreOpen={moreOpen} onToggleMore={() => setMoreOpen((o) => !o)} />
      )}
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
