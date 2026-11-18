import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

const LeavingContext = createContext(false)

/** true mientras el elemento está reproduciendo su animación de salida. */
export const useLeaving = () => useContext(LeavingContext)

interface PresenceProps {
  show: boolean
  children: ReactNode
  /** Debe coincidir con la duración de la animación de salida. */
  duration?: number
}

/**
 * Mantiene montado el contenido durante su animación de salida.
 * Los hijos leen `useLeaving()` para elegir la animación de entrada o de salida.
 */
export default function Presence({ show, children, duration = 220 }: PresenceProps) {
  const [mounted, setMounted] = useState(show)
  const last = useRef(children)
  if (show) last.current = children

  useEffect(() => {
    if (show) {
      setMounted(true)
      return
    }
    const t = setTimeout(() => setMounted(false), duration)
    return () => clearTimeout(t)
  }, [show, duration])

  if (!show && !mounted) return null
  return <LeavingContext.Provider value={!show}>{show ? children : last.current}</LeavingContext.Provider>
}
