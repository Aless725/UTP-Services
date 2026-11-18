import { useEffect, useState } from 'react'

interface SeatBarProps {
  total: number
  taken: number
}

/** Barra segmentada de cupos: los segmentos se llenan en cascada (solo transform). */
export default function SeatBar({ total, taken }: SeatBarProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div role="img" aria-label={`${taken} de ${total} integrantes`} className="mt-2 flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-fill/10">
          <span
            className="block h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-smooth"
            style={{
              transform: `scaleX(${ready && i < taken ? 1 : 0})`,
              transitionDelay: `${i * 70}ms`,
            }}
          />
        </span>
      ))}
    </div>
  )
}
