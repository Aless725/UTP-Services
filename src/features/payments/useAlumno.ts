import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/profile/profileData'

/** Nombre y código del alumno para los documentos (comprobantes y constancias). */
export function useAlumno() {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const { data } = useProfile(codigo)
  return { codigo, nombre: data.nombreCompleto }
}
