import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/profile/profileData'

/** Botón de perfil: lleva a "Mi Perfil". Muestra la foto si el alumno la subió. */
export default function ProfileButton() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { avatar } = useProfile(session?.codigo ?? '')

  return (
    <button
      type="button"
      onClick={() => navigate('/perfil')}
      aria-label="Mi perfil"
      className="pressable flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-card shadow-card"
    >
      {avatar ? (
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon name="person" size={20} />
      )}
    </button>
  )
}
