import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import TextField from '@/components/ui/TextField'
import { useAuth } from '@/features/auth/AuthContext'
import { emailOf, useProfile } from '@/features/profile/profileData'
import { useNow } from '@/hooks/useNow'
import { useOnline } from '@/lib/online'
import EmpleabilidadState, { EmpleoQuery } from './components/EmpleabilidadState'
import {
  EmpleoError,
  ofertaVigente,
  TIPOS_OFERTA,
  useMisPostulaciones,
  useOferta,
  usePostularOferta,
} from './empleabilidadData'
import { validarPostulacion, type PostulacionErrors } from './validation'

export default function PostularPage() {
  const { id } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: profile } = useProfile(session?.codigo ?? '')
  const oferta = useOferta(id)
  const postulaciones = useMisPostulaciones()
  const enviar = usePostularOferta()
  const online = useOnline()
  const now = useNow()
  const sending = useRef(false)
  const [nombre, setNombre] = useState<string | null>(null)
  const [correo, setCorreo] = useState<string | null>(null)
  const [errors, setErrors] = useState<PostulacionErrors>({})
  const [error, setError] = useState<EmpleoError | null>(null)
  const values = { nombre: nombre ?? profile.nombreCompleto, correo: correo ?? emailOf(session?.codigo ?? '') }
  const o = oferta.data
  const anterior = postulaciones.data?.find((p) => p.oferta_id === id)
  const disponible = !!o && ofertaVigente(o, now) && error?.reason !== 'unavailable'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending.current || enviar.isPending || !o || !disponible) return
    const form = event.currentTarget
    const invalid = validarPostulacion(values)
    setErrors(invalid)
    setError(null)
    if (Object.keys(invalid).length) {
      const input = form.elements.namedItem(invalid.nombre ? 'nombre' : 'correo') as HTMLInputElement | null
      input?.focus()
      return
    }
    sending.current = true
    try {
      const p = await enviar.mutateAsync({ ofertaId: o.id, ...values })
      navigate(`/empleabilidad/postulaciones/${p.id}/confirmacion`, { replace: true })
    } catch (e) {
      const err =
        e instanceof EmpleoError
          ? e
          : new EmpleoError('other', 'No pudimos confirmar el envío. Tus datos siguen aquí; puedes reintentar.')
      setError(err)
      if (err.reason === 'invalid_name' || err.reason === 'invalid_email') {
        const field = err.reason === 'invalid_name' ? 'nombre' : 'correo'
        setErrors({ [field]: err.message })
        const input = form.elements.namedItem(field) as HTMLInputElement | null
        input?.focus()
      }
    } finally {
      sending.current = false
    }
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-1 flex-col" aria-label="Formulario de postulación">
      <FlowHeader title="Postulación" back={`/empleabilidad/ofertas/${id}${search}`} backLabel="Volver a la oferta" />
      <div className="flex-1 space-y-3 px-5 pb-4 pt-4">
        <EmpleoQuery query={oferta}>
          {anterior ? (
            <EmpleabilidadState
              icon="check_circle"
              title="Ya postulaste a esta oferta"
              description="Tu postulación está registrada. Puedes consultar su estado y los datos que enviaste."
              action="Ver mi postulación"
              to={`/empleabilidad/postulaciones/${anterior.id}`}
            />
          ) : !o || !disponible ? (
            <EmpleabilidadState
              icon="event_busy"
              title="La convocatoria ha cerrado"
              description="Ya no se reciben nuevas postulaciones para esta oferta. Puedes encontrar otras oportunidades en la bolsa de trabajo."
              action="Explorar otras ofertas"
              to={`/empleabilidad/ofertas${search}`}
            />
          ) : (
            <>
              <section className="rounded-card bg-card p-4 shadow-card" aria-label="Oferta seleccionada">
                <p className="text-xs text-ink-muted">Oferta seleccionada</p>
                <h2 className="mt-1 text-base font-bold text-ink">{o.puesto}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {o.empresa} · {o.ciudad} · {TIPOS_OFERTA[o.tipo]}
                </p>
              </section>
              {error && (
                <div role="alert" className="rounded-card bg-primary-soft p-4">
                  <p className="text-sm font-bold text-ink">
                    {error.reason === 'invalid_email' ? 'Revisa tu correo' : 'No pudimos confirmar el envío'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{error.message}</p>
                  {error.reason === 'unauthorized' && (
                    <Link to="/login" className="inline-flex min-h-11 items-center text-sm font-bold text-primary">
                      Volver a iniciar sesión
                    </Link>
                  )}
                </div>
              )}
              <section className="space-y-4 rounded-card bg-card p-4 shadow-card" aria-label="Datos de contacto">
                <h2 className="text-sm font-bold text-ink">Revisa tus datos de contacto</h2>
                <TextField
                  name="nombre"
                  label="Nombre completo"
                  autoComplete="name"
                  value={values.nombre}
                  maxLength={120}
                  required
                  disabled={enviar.isPending}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setErrors((prev) => ({ ...prev, nombre: undefined }))
                  }}
                  error={errors.nombre}
                />
                <TextField
                  name="correo"
                  label="Correo electrónico"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.correo}
                  maxLength={254}
                  required
                  disabled={enviar.isPending}
                  onChange={(e) => {
                    setCorreo(e.target.value)
                    setErrors((prev) => ({ ...prev, correo: undefined }))
                  }}
                  error={errors.correo}
                  helper="Usaremos este correo de contacto para esta postulación. Tu perfil institucional no cambia."
                />
              </section>
              <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-muted">
                <Icon name="info" size={17} className="mt-0.5 shrink-0" />
                Esta es una postulación de demostración. Se guardarán tu nombre y correo; no se envían datos a empresas
                reales.
              </p>
              {!online && (
                <p role="status" className="rounded-card bg-card p-3 text-sm text-ink-muted">
                  Sin conexión. Tus datos siguen aquí; podrás enviarlos cuando vuelva internet.
                </p>
              )}
            </>
          )}
        </EmpleoQuery>
      </div>
      {disponible && !anterior && (
        <StickyCta>
          <Button full type="submit" disabled={enviar.isPending || !online} aria-busy={enviar.isPending}>
            {enviar.isPending ? 'Enviando…' : error ? 'Reintentar envío' : 'Enviar postulación'}
          </Button>
          {enviar.isPending && (
            <p role="status" className="mt-2 text-center text-xs text-ink-muted">
              Estamos confirmando tu postulación.
            </p>
          )}
        </StickyCta>
      )}
    </form>
  )
}
