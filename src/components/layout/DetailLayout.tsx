import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

/** Contenedor con scroll del panel derecho (sin barra inferior). */
export default function DetailLayout({ children, id }: { children?: ReactNode; id?: string }) {
  const { pathname } = useLocation()
  return (
    <div className="no-scrollbar h-full overflow-y-auto overscroll-contain pb-8">
      <div key={id ?? pathname} className="animate-page-forward mx-auto w-full max-w-[560px]">
        {children ?? <Outlet />}
      </div>
    </div>
  )
}
