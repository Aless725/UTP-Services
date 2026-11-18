import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  if (!ready) return <div role="status" aria-label="Cargando" className="min-h-[100dvh] bg-surface" />
  return session ? <>{children}</> : <Navigate to="/login" replace />
}
