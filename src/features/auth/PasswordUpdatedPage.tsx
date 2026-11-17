import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout, { AuthHeading, InfoCard } from './AuthLayout'
import { normalizeCodigo } from './validation'

export default function PasswordUpdatedPage() {
  const [params] = useSearchParams()
  const usuario = normalizeCodigo(params.get('u') ?? '')

  return (
    <AuthLayout>
      <AuthHeading
        title="Contraseña actualizada"
        subtitle="Tu contraseña se guardó correctamente. Ya puedes ingresar con tus nuevas credenciales."
      />
      <InfoCard icon="verified_user" title="Tu cuenta está lista" caption={`Usuario: ${usuario}`} />
      <p className="mt-5 text-xs leading-relaxed text-ink-muted">
        Usa tu nueva contraseña la próxima vez que inicies sesión en UTP+Service.
      </p>
      <Link
        to="/login"
        className="mt-8 flex min-h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
      >
        Iniciar sesión
      </Link>
    </AuthLayout>
  )
}
