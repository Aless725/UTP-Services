import { NavLink, useLocation } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import PlusIcon from '@/components/ui/PlusIcon'
import { activeOf, tabs } from './navTabs'

interface SideNavProps {
  moreOpen: boolean
  onToggleMore: () => void
}

/** Navegación vertical para el celular en horizontal: mismas secciones que la barra inferior. */
export default function SideNav({ moreOpen, onToggleMore }: SideNavProps) {
  const { pathname } = useLocation()
  return (
    <nav
      aria-label="Navegación principal"
      className="absolute inset-y-2 left-2 z-20 flex w-[calc(var(--rail)-0.5rem)] flex-col items-center justify-between rounded-[22px] glass py-1.5 shadow-float"
    >
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-evenly">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `pressable flex min-h-11 w-full flex-1 flex-col items-center justify-center gap-0.5 ${
                activeOf(t.to, isActive, pathname) ? 'text-primary' : 'text-ink-muted'
              }`
            }
          >
            {({ isActive }) => {
              const on = activeOf(t.to, isActive, pathname)
              return (
                <>
                  <Icon name={t.icon} size={22} filled={on} />
                  <span className={`text-[0.5625rem] ${on ? 'font-bold' : 'font-medium'}`}>{t.label}</span>
                </>
              )
            }}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleMore}
        aria-label="Más de UTP+"
        aria-expanded={moreOpen}
        aria-haspopup="dialog"
        className="pressable mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white"
      >
        <span className={`transition-transform duration-300 ease-out ${moreOpen ? 'rotate-45' : ''}`}>
          <PlusIcon size={22} />
        </span>
      </button>
    </nav>
  )
}
