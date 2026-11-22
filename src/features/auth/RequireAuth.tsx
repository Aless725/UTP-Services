import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { safeReturnTo } from './returnTo'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  const { pathname, search } = useLocation()
  if (!ready) return <div role="status" aria-label="Cargando" className="min-h-[100dvh] bg-surface" />
  return session ? <>{children}</> : <Navigate to="/login" state={{ from: safeReturnTo(pathname + search) }} replace />
}
