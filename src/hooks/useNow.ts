import { useEffect, useState } from 'react'

/** Fecha y hora actuales, refrescadas cada 30 s (disponibilidad "ahora"). */
export function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
