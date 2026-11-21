import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { useUnreadCount } from './notificationsData'

/** Campanita del inicio: lleva al centro de notificaciones y muestra cuántas hay sin leer. */
export default function NotificationBell() {
  const unread = useUnreadCount()
  return (
    <Link
      to="/notificaciones"
      aria-label={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
      className="pressable relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card"
    >
      <Icon name="notifications" size={20} />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-none text-white"
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
