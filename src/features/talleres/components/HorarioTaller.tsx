import Icon from '@/components/ui/Icon'
import type { HorarioTaller as Horario } from '../talleresData'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function HorarioTaller({ horarios, compact = false }: { horarios: Horario[]; compact?: boolean }) {
  const ordenados = [...horarios].sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio))
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex gap-1" aria-label="Días del taller">
        {DIAS.map((dia, i) => {
          const activo = horarios.some((h) => h.dia === i + 1)
          return (
            <span
              key={dia}
              aria-label={`${dia}: ${activo ? 'con sesión' : 'sin sesión'}`}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.6875rem] font-semibold ${activo ? 'bg-primary-soft text-primary' : 'bg-fill/5 text-ink-muted'}`}
            >
              {dia[0]}
            </span>
          )
        })}
      </div>
      {compact ? (
        <p className="flex items-start gap-2 text-xs text-ink-muted">
          <Icon name="schedule" size={17} className="shrink-0" />
          {ordenados.length === 1
            ? `${DIAS[ordenados[0].dia - 1]} · ${ordenados[0].inicio.slice(0, 5)}–${ordenados[0].fin.slice(0, 5)}`
            : `${ordenados.length} sesiones por semana · Ver horarios`}
        </p>
      ) : (
        <ul className="space-y-2 text-sm text-ink">
          {ordenados.map((h) => (
            <li key={`${h.dia}-${h.inicio}`} className="flex flex-wrap items-center justify-between gap-2">
              <span>{DIAS[h.dia - 1]}</span>
              <span className="text-ink-muted">
                {h.inicio.slice(0, 5)}–{h.fin.slice(0, 5)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
