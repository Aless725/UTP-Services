import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import TextField from '@/components/ui/TextField'
import AuthLayout, { AuthHeading } from './AuthLayout'
import { updatePassword } from './authService'
import { isPasswordValid, normalizeCodigo, passwordRules, validateCodigo } from './validation'

export default function NewPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const usuario = normalizeCodigo(params.get('u') ?? '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (validateCodigo(usuario)) return <Navigate to="/recuperar" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid(password)) return setError('La contraseña no cumple los requisitos.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    setError(null)
    setLoading(true)
    try {
      await updatePassword(usuario, password)
      navigate('/contrasena-actualizada?u=' + usuario, { replace: true })
    } catch {
      setError('No pudimos guardar la contraseña. Intenta nuevamente.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
        <AuthHeading
          title="Nueva contraseña"
          subtitle="Crea una contraseña segura para volver a ingresar a UTP+Service."
        />
        <p className="-mt-3 mb-4 text-[11px] font-semibold text-ink">Usuario: {usuario}</p>

        <div className="space-y-4">
          <TextField
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={error}
            autoComplete="new-password"
          />
        </div>

        <div className="mt-5" aria-live="polite">
          <p className="text-[11px] font-semibold text-ink">Tu contraseña debe incluir:</p>
          <ul className="mt-2 space-y-1.5">
            {passwordRules.map((r) => {
              const ok = r.test(password)
              return (
                <li key={r.id} className="flex items-center gap-2 text-[11px] text-ink-muted">
                  <Icon name={ok ? 'check' : 'radio_button_unchecked'} size={14} className={ok ? 'text-primary' : 'text-ink-faint'} />
                  <span>
                    {r.label}
                    <span className="sr-only">{ok ? ' (cumplido)' : ' (pendiente)'}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <Button type="submit" full className="mt-6" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
        <Link to="/login" className="mx-auto mt-3 flex min-h-11 items-center text-xs font-medium text-primary">
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  )
}
