import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import AuthLayout, { AuthHeading } from './AuthLayout'
import { safeReturnTo } from './returnTo'

/** Pantalla fuera de RequireAuth: permite recuperar el acceso sin volver a enviar una inscripción. */
export default function SessionExpiredPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const returnTo = safeReturnTo(params.get('volver') ?? '/talleres')

  return (
    <AuthLayout>
      <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon name="lock_clock" size={28} />
      </span>
      <AuthHeading title="Sesión expirada" subtitle="Vuelve a iniciar sesión para continuar con tu inscripción." />
      <p className="text-sm leading-relaxed text-ink-muted">
        Regresarás a la pantalla donde estabas. Revisa el estado de tu inscripción antes de confirmar nuevamente.
      </p>
      <Button
        full
        className="mt-6"
        onClick={() => navigate(`/login?volver=${encodeURIComponent(returnTo)}`, { replace: true })}
      >
        Volver a iniciar sesión
      </Button>
    </AuthLayout>
  )
}
