import { Link, useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import type { Availability } from './availability'
import { shortPlace, type Space } from './spacesData'

interface SpaceRowProps {
  space: Space
  availability: Availability
}

const people = (s: Space) => (s.capMax === 1 ? '1 persona' : `${s.capMax} personas`)

/** Fila de espacio con su disponibilidad y el botón "Reservar". */
export default function SpaceRow({ space, availability }: SpaceRowProps) {
  const navigate = useNavigate()
  const to = `/reservas/espacio/${space.id}`
  return (
    <div className="flex items-center gap-3 rounded-card bg-card p-3.5 shadow-card">
      <Link to={to} className="min-w-0 flex-1" aria-label={`Ver ${space.nombre}`}>
        <p className="truncate text-[0.9375rem] font-bold text-ink">{space.nombre}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {shortPlace(space)} · {people(space)}
        </p>
        <p
          className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
            availability.ok ? 'text-success' : 'text-ink-muted'
          }`}
        >
          <Icon name={availability.ok ? 'check' : 'schedule'} size={14} />
          {availability.text}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => navigate(to)}
        className="pressable min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-white"
      >
        Reservar
      </button>
    </div>
  )
}
