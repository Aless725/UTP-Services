import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { safeReturnTo } from './returnTo'
import { hasSeenOnboarding } from '@/lib/storage'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  const { pathname, search } = useLocation()
  if (!ready) return <div role="status" aria-label="Cargando" className="min-h-[100dvh] bg-surface" />
  if (session) return <>{children}</>
  const from = safeReturnTo(pathname + search)
  // Primer uso en este dispositivo: se abre la introducción y luego el acceso, conservando el destino.
  if (!hasSeenOnboarding()) return <Navigate to="/onboarding" state={{ returnTo: from }} replace />
  return <Navigate to="/login" state={{ from: safeReturnTo(pathname + search) }} replace />
}
