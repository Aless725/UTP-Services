import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getSession, signIn as doSignIn, signOut as doSignOut, type Session } from './authService'

interface AuthState {
  session: Session | null
  signIn: (usuario: string, password: string) => Promise<Session>
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession())

  const signIn = useCallback(async (usuario: string, password: string) => {
    const s = await doSignIn(usuario, password)
    setSession(s)
    return s
  }, [])

  const signOut = useCallback(() => {
    doSignOut()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
