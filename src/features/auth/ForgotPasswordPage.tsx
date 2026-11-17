import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import AuthLayout, { AuthHeading } from './AuthLayout'
import { requestPasswordReset } from './authService'
import { normalizeCodigo, validateCodigo } from './validation'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateCodigo(usuario)
    setError(err)
    if (err) return
    setLoading(true)
    try {
      await requestPasswordReset(usuario)
      navigate(`/recuperar/enviado?u=${normalizeCodigo(usuario)}`)
    } catch {
      setError('No pudimos enviar el enlace. Intenta nuevamente.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
        <AuthHeading
          title="¿Olvidaste tu contraseña?"
          subtitle="Ingresa tu usuario de alumno. Te enviaremos un enlace a tu correo institucional para recuperar el acceso."
        />
        <TextField
          label="Usuario:"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          error={error}
          helper="No colocar @utp.edu.pe"
          autoComplete="username"
          autoCapitalize="characters"
          placeholder="U22693560"
        />
        <p className="mt-5 text-xs leading-relaxed text-ink-muted">
          El enlace se enviará al correo institucional asociado a tu cuenta de alumno.
        </p>
        <Button type="submit" full className="mt-8" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </Button>
        <Link to="/login" className="mx-auto mt-3 flex min-h-11 items-center text-xs font-medium text-primary">
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  )
}
