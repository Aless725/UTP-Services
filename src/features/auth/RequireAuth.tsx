import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  return session ? <>{children}</> : <Navigate to="/login" replace />
}
