import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

interface BackButtonProps {
  /** Ruta destino; si se omite, regresa en el historial. */
  to?: string
  /** Estado de navegación que recibirá la pantalla destino. */
  state?: unknown
  /** Variante para encabezados oscuros. */
  onDark?: boolean
  label?: string
}

/** Botón circular de regreso (mismo estilo en toda la app). */
export default function BackButton({ to, state, onDark, label = 'Volver' }: BackButtonProps) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to, { state }) : navigate(-1))}
      aria-label={label}
      className={`pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
        onDark ? 'bg-white/10 text-white' : 'bg-card text-ink shadow-card'
      }`}
    >
      <Icon name="chevron_left" size={22} />
    </button>
  )
}
