import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MoreSheet from '@/features/more/MoreSheet'
import BottomNav from './BottomNav'

/** Estructura de las pantallas principales: contenido con scroll + barra flotante. */
export default function AppLayout() {
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="relative h-full">
      <div
        ref={scroller}
        className="no-scrollbar h-full overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+110px)]"
      >
        <div key={pathname} className="animate-page-in">
          <Outlet />
        </div>
      </div>
      <BottomNav moreOpen={moreOpen} onToggleMore={() => setMoreOpen((o) => !o)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
