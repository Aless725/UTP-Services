import { NavLink } from 'react-router-dom'
import Icon from '@/components/ui/Icon'

const tabs = [
  { to: '/inicio', label: 'Inicio', icon: 'home' },
  { to: '/calendario', label: 'Calendario', icon: 'calendar_month' },
  { to: '/cursos', label: 'Cursos', icon: 'menu_book' },
  { to: '/pagos', label: 'Pagos', icon: 'credit_card' },
]

interface BottomNavProps {
  moreOpen: boolean
  onToggleMore: () => void
}

/** Barra inferior flotante con acceso a "Más de UTP+". */
export default function BottomNav({ moreOpen, onToggleMore }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-20 flex h-[68px] items-center rounded-[26px] bg-white/95 px-2 shadow-float backdrop-blur"
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `pressable group flex h-full min-w-11 flex-1 flex-col items-center justify-center gap-0.5 ${
              isActive ? 'text-primary' : 'text-ink-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive ? '-translate-y-0.5 scale-110' : ''
                }`}
              >
                <Icon name={t.icon} size={22} filled={isActive} />
              </span>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onToggleMore}
        aria-label="Más de UTP+"
        aria-expanded={moreOpen}
        aria-haspopup="dialog"
        className="pressable ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-card"
      >
        <span className={`transition-transform duration-300 ease-out ${moreOpen ? 'rotate-45' : ''}`}>
          <Icon name="add" size={26} />
        </span>
      </button>
    </nav>
  )
}
