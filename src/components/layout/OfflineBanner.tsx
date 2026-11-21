import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/ui/Icon'
import { useOnline } from '@/lib/online'

/**
 * Aviso de conexión en el borde superior: "Sin conexión" mientras no haya internet y,
 * al volver, un "Conexión restablecida" breve.
 */
export default function OfflineBanner() {
  const online = useOnline()
  const [back, setBack] = useState(false)
  const was = useRef(online)

  useEffect(() => {
    if (online && !was.current) {
      setBack(true)
      const t = setTimeout(() => setBack(false), 2400)
      was.current = online
      return () => clearTimeout(t)
    }
    was.current = online
    setBack(false)
  }, [online])

  if (online && !back) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-fade-in pointer-events-none absolute inset-x-0 top-0 z-[70] flex h-[max(env(safe-area-inset-top),1.125rem)] items-end justify-center gap-1.5 pb-0.5 text-[0.625rem] font-semibold ${
        online ? 'bg-success text-white' : 'bg-ink text-surface'
      }`}
    >
      <Icon name={online ? 'cloud_done' : 'cloud_off'} size={13} />
      {online ? 'Conexión restablecida' : 'Sin conexión · verás tus últimos datos guardados'}
    </div>
  )
}
