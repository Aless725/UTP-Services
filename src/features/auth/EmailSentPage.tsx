import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import AuthLayout, { AuthHeading, InfoCard } from './AuthLayout'
import { requestPasswordReset } from './authService'
import { codigoToEmail, normalizeCodigo, validateCodigo } from './validation'

export default function EmailSentPage() {
  const [params] = useSearchParams()
  const usuario = normalizeCodigo(params.get('u') ?? '')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  if (validateCodigo(usuario)) return <Navigate to="/recuperar" replace />

  const resend = async () => {
    setResending(true)
    setResent(false)
    await requestPasswordReset(usuario)
    setResending(false)
    setResent(true)
  }

  return (
    <AuthLayout>
      <AuthHeading
        title="Correo enviado"
        subtitle="Te enviamos un enlace para restablecer tu contraseña al siguiente correo institucional:"
      />
      <InfoCard icon="mark_email_read" title={codigoToEmail(usuario)} caption={`Cuenta de alumno · ${usuario}`} />

      <p className="mt-5 text-xs leading-relaxed text-ink-muted">
        Revisa tu bandeja de entrada y la carpeta de spam. Abre el enlace para crear una nueva contraseña.
      </p>
      <p className="mt-3 text-xs font-semibold text-ink">¿No recibiste el correo? Puedes reenviarlo.</p>
      <p role="status" className="mt-2 min-h-4 text-xs text-success">
        {resent ? 'Enlace reenviado.' : ''}
      </p>

      <Button full className="mt-6" onClick={resend} disabled={resending}>
        {resending ? 'Reenviando…' : 'Reenviar enlace'}
      </Button>
      <Link to="/login" className="mx-auto mt-3 flex min-h-11 items-center text-xs font-medium text-primary">
        Volver al inicio de sesión
      </Link>

      {/* Solo demo: simula abrir el enlace recibido por correo */}
      <Link
        to={`/nueva-contrasena?u=${usuario}`}
        className="mx-auto mt-auto flex min-h-11 items-center text-[0.6875rem] text-ink-faint underline"
      >
        Demo: abrir enlace del correo
      </Link>
    </AuthLayout>
  )
}
