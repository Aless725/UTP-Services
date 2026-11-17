import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'

/** Botón de perfil: abre una hoja con los datos del alumno y "Cerrar sesión". */
export default function ProfileButton() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Perfil"
        className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card"
      >
        <Icon name="person" size={20} />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Mi perfil">
        <div className="flex items-center gap-3 py-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon name="person" size={26} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{session?.nombre}</p>
            <p className="text-xs text-ink-muted">{session?.codigo} · Ing. Sistemas e Informática</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/login', { replace: true })
          }}
          className="pressable mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
        >
          <Icon name="logout" size={18} />
          Cerrar sesión
        </button>
      </BottomSheet>
    </>
  )
}
