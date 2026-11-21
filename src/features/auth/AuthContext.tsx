import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resetGroups } from '@/features/groups/groupsStore'
import { resetReservations } from '@/features/reservations/reservationsStore'
import { clearPersistedCache, startPersisting } from '@/lib/queryPersist'
import { fetchSession, forgetSession, restoreSession, signIn as doSignIn, signOut as doSignOut, type Session } from './authService'

interface AuthState {
  session: Session | null
  /** false mientras se recupera la sesión guardada (evita parpadear al login). */
  ready: boolean
  signIn: (usuario: string, password: string) => Promise<Session>
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const queryClient = useQueryClient()

  const clearData = useCallback(() => {
    resetGroups()
    resetReservations()
    queryClient.clear()
    clearPersistedCache()
    forgetSession()
  }, [queryClient])

  // Con sesión, se muestran y se guardan los últimos datos para poder verlos sin conexión.
  const codigo = session?.codigo
  useEffect(() => {
    if (codigo) startPersisting(queryClient, codigo)
  }, [codigo, queryClient])

  useEffect(() => {
    let alive = true
    restoreSession()
      .then((s) => alive && setSession(s))
      .catch(() => undefined)
      .finally(() => alive && setReady(true))

    // Cierre de sesión desde otra pestaña o sesión caducada.
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        clearData()
      } else if (event === 'SIGNED_IN' && s) {
        // Fuera del callback para no bloquear a Supabase con otra consulta.
        setTimeout(() => fetchSession().then((p) => alive && p && setSession(p)), 0)
      }
    })
    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [clearData])

  const signIn = useCallback(async (usuario: string, password: string) => {
    const s = await doSignIn(usuario, password)
    setSession(s)
    return s
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    clearData()
    void doSignOut()
  }, [clearData])

  const value = useMemo(() => ({ session, ready, signIn, signOut }), [session, ready, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
