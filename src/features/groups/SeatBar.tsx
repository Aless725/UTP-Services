interface SeatBarProps {
  total: number
  taken: number
}

/** Barra segmentada de cupos (un segmento por integrante). */
export default function SeatBar({ total, taken }: SeatBarProps) {
  return (
    <div
      role="img"
      aria-label={`${taken} de ${total} integrantes`}
      className="mt-2 flex gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 origin-left rounded-full transition-colors duration-300 ${
            i < taken ? 'bg-primary' : 'bg-fill/10'
          }`}
        />
      ))}
    </div>
  )
}
