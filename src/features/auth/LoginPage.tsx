import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Presence from '@/components/ui/Presence'
import TextField from '@/components/ui/TextField'
import AuthLayout, { AuthHeading } from './AuthLayout'
import { useAuth } from './AuthContext'
import { validateCodigo } from './validation'
import { safeReturnTo } from './returnTo'
import { hasSeenOnboarding } from '@/lib/storage'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('volver') ?? (location.state as { from?: unknown } | null)?.from)
  const { signIn, session } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [usuarioError, setUsuarioError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const uErr = validateCodigo(usuario)
    const pErr = password ? null : 'Ingresa tu contraseña.'
    setUsuarioError(uErr)
    setPasswordError(pErr)
    if (uErr || pErr) return

    setStatus('loading')
    try {
      await signIn(usuario, password)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  // Primer uso en este dispositivo: antes del acceso siempre se ve la introducción.
  if (!session && !hasSeenOnboarding()) {
    return <Navigate to="/onboarding" state={{ returnTo }} replace />
  }

  return (
    <>
      <AuthLayout back={{ to: '/onboarding', state: { from: 'login' }, label: 'Ver introducción' }}>
        <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
          <AuthHeading title="Accede" subtitle="Ingresando tus datos de alumno" />

          <div className="space-y-4">
            <TextField
              label="Usuario:"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              error={usuarioError}
              helper="Ejemplo: U22693560 (No colocar @utp.edu.pe)"
              autoComplete="username"
              autoCapitalize="characters"
              inputMode="text"
              placeholder="U22693560"
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" full className="mt-8" disabled={status === 'loading'}>
            Ingresar
          </Button>
          <Link
            to="/recuperar"
            className="mx-auto mt-3 flex min-h-11 items-center text-xs font-medium text-primary"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      </AuthLayout>

      <Presence show={status === 'loading'}>
        <Modal
          icon="progress_activity"
          spinning
          title="Iniciando sesión"
          description="Estamos validando tus credenciales. Espera un momento."
        />
      </Presence>
      <Presence show={status === 'success'}>
        <Modal
          icon="check"
          title="Acceso exitoso"
          description="Tus credenciales se han validado correctamente."
          actionLabel="Continuar"
          onAction={() => navigate(returnTo, { replace: true })}
        />
      </Presence>
      <Presence show={status === 'error'}>
        <Modal
          icon="warning"
          title="Usuario o contraseña incorrectos"
          actionLabel="Intentar nuevamente"
          onAction={() => setStatus('idle')}
        />
      </Presence>
    </>
  )
}
