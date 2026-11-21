import { NavLink, useLocation } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import PlusIcon from '@/components/ui/PlusIcon'

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
  const { pathname } = useLocation()
  // En "Mi Perfil" la pestaña activa es Inicio, desde donde se accede.
  const activeOf = (to: string, isActive: boolean) =>
    isActive || (to === '/inicio' && ['/perfil', '/grupos', '/mas', '/reservas', '/anuncios', '/soporte', '/notificaciones', '/correo', '/tramites'].some((p) => pathname.startsWith(p)))
  return (
    <nav
      aria-label="Navegación principal"
      className="absolute inset-x-3 bottom-[var(--nav-bottom)] z-20 flex h-[68px] items-center rounded-[26px] glass px-2 shadow-float"
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `pressable group flex h-full min-w-11 flex-1 flex-col items-center justify-center gap-0.5 ${
              activeOf(t.to, isActive) ? 'text-primary' : 'text-ink-muted'
            }`
          }
        >
          {({ isActive: a }) => {
            const isActive = activeOf(t.to, a)
            return (
            <>
              <span
                className={`transition-transform duration-300 ease-smooth ${
                  isActive ? '-translate-y-0.5 scale-110' : ''
                }`}
              >
                <Icon name={t.icon} size={22} filled={isActive} />
              </span>
              <span className={`text-[0.625rem] ${isActive ? 'font-bold' : 'font-medium'}`}>{t.label}</span>
            </>
            )
          }}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onToggleMore}
        aria-label="Más de UTP+"
        aria-expanded={moreOpen}
        aria-haspopup="dialog"
        className="pressable ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white"
      >
        <span className={`transition-transform duration-300 ease-out ${moreOpen ? 'rotate-45' : ''}`}>
          <PlusIcon size={24} />
        </span>
      </button>
    </nav>
  )
}
