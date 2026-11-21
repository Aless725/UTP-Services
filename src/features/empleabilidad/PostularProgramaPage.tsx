import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import TextField from '@/components/ui/TextField'
import { useAuth } from '@/features/auth/AuthContext'
import { emailOf, useProfile } from '@/features/profile/profileData'
import { useOnline } from '@/lib/online'
import EmpleabilidadState, { EmpleoQuery } from './components/EmpleabilidadState'
import { EmpleoError, useMisPostulaciones, usePostularPrograma, usePrograma } from './empleabilidadData'
import { validarPrograma, type ProgramaErrors, type ProgramaValues } from './validation'

export default function PostularProgramaPage() {
  const { id } = useParams()
  const programa = usePrograma(id)
  const postulaciones = useMisPostulaciones()
  const enviar = usePostularPrograma()
  const { session } = useAuth()
  const { data: profile } = useProfile(session?.codigo ?? '')
  const online = useOnline()
  const navigate = useNavigate()
  const fieldId = useId()
  const busy = useRef(false)
  const [draft, setDraft] = useState<Partial<ProgramaValues>>({})
  const [errors, setErrors] = useState<ProgramaErrors>({})
  const [error, setError] = useState<EmpleoError | null>(null)
  const values: ProgramaValues = {
    nombre: profile.nombreCompleto,
    correo: emailOf(session?.codigo ?? ''),
    campus: profile.campus,
    ciclo: '',
    acepta: false,
    ...draft,
  }
  const update = <K extends keyof ProgramaValues>(key: K, value: ProgramaValues[K]) => {
    setDraft((old) => ({ ...old, [key]: value }))
    setErrors((old) => ({ ...old, [key]: undefined }))
  }
  const p = programa.data
  const anterior = postulaciones.data?.find((item) => item.programa_id === id)
  const disponible = !!p && error?.reason !== 'unavailable'
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy.current || enviar.isPending || !p || !disponible || anterior) return
    const form = event.currentTarget
    const invalid = validarPrograma(values)
    setErrors(invalid)
    setError(null)
    const first = Object.keys(invalid)[0]
    if (first) {
      const input = form.elements.namedItem(first) as HTMLElement | null
      input?.focus()
      return
    }
    busy.current = true
    try {
      const receipt = await enviar.mutateAsync({ programaId: p.id, ...values })
      navigate(`/empleabilidad/postulaciones/${receipt.id}/confirmacion`, { replace: true })
    } catch (e) {
      const err =
        e instanceof EmpleoError
          ? e
          : new EmpleoError('other', 'No pudimos confirmar tu postulación. Tus datos siguen aquí; puedes reintentar.')
      setError(err)
      const fields = {
        invalid_name: 'nombre',
        invalid_email: 'correo',
        invalid_campus: 'campus',
        invalid_cycle: 'ciclo',
        invalid_consent: 'acepta',
      } as const
      if (err.reason in fields) {
        const field = fields[err.reason as keyof typeof fields]
        setErrors({ [field]: err.message })
        const input = form.elements.namedItem(field) as HTMLElement | null
        input?.focus()
      }
    } finally {
      busy.current = false
    }
  }
  return (
    <form noValidate onSubmit={submit} className="flex flex-1 flex-col" aria-label="Postulación a programa">
      <FlowHeader title="Postular al programa" back={`/empleabilidad/programas/${id}`} backLabel="Volver al programa" />
      <div className="flex-1 space-y-3 px-5 pb-4 pt-4">
        <EmpleoQuery query={programa}>
          {anterior ? (
            <EmpleabilidadState
              icon="check_circle"
              title="Ya postulaste a este programa"
              description="Tu postulación está registrada. Puedes revisar su estado en Mis postulaciones."
              action="Ver mi postulación"
              to={`/empleabilidad/postulaciones/${anterior.id}`}
            />
          ) : !p || !disponible ? (
            <EmpleabilidadState
              icon="school"
              title="Este programa no recibe postulaciones"
              description="Puedes explorar los otros programas disponibles."
              action="Ver programas"
              to="/empleabilidad/programas"
            />
          ) : (
            <>
              <section className="flex items-center gap-3 rounded-card bg-card p-4 shadow-card">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={p.icono} size={25} />
                </span>
                <div>
                  <p className="text-xs text-ink-muted">Programa seleccionado</p>
                  <h2 className="text-base font-bold text-ink">{p.titulo}</h2>
                </div>
              </section>
              <p className="text-sm leading-relaxed text-ink-muted">
                Completa tus datos para registrar tu interés. Todos los campos son obligatorios. Los requisitos
                académicos se revisarán después del envío.
              </p>
              {error && (
                <div role="alert" className="rounded-card bg-primary-soft p-4">
                  <p className="text-sm font-bold text-ink">No pudimos confirmar tu postulación</p>
                  <p className="mt-1 text-sm text-ink-muted">{error.message}</p>
                  {error.reason === 'unauthorized' && (
                    <Link to="/login" className="inline-flex min-h-11 items-center text-sm font-bold text-primary">
                      Volver a iniciar sesión
                    </Link>
                  )}
                </div>
              )}
              <section className="space-y-4 rounded-card bg-card p-4 shadow-card" aria-label="Datos de la postulación">
                <TextField
                  name="nombre"
                  label="Nombres y apellidos"
                  autoComplete="name"
                  value={values.nombre}
                  maxLength={120}
                  required
                  disabled={enviar.isPending}
                  onChange={(e) => update('nombre', e.target.value)}
                  error={errors.nombre}
                />
                <TextField
                  name="codigo"
                  label="Código de estudiante"
                  value={session?.codigo ?? ''}
                  readOnly
                  helper="Corresponde a tu cuenta autenticada."
                />
                <TextField
                  name="correo"
                  label="Correo institucional"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.correo}
                  maxLength={254}
                  required
                  disabled={enviar.isPending}
                  onChange={(e) => update('correo', e.target.value)}
                  error={errors.correo}
                />
                <TextField
                  name="campus"
                  label="Campus"
                  value={values.campus}
                  maxLength={120}
                  required
                  disabled={enviar.isPending}
                  onChange={(e) => update('campus', e.target.value)}
                  error={errors.campus}
                />
                <div>
                  <label htmlFor={`${fieldId}-ciclo`} className="mb-1.5 block text-xs font-semibold text-ink">
                    Ciclo actual
                  </label>
                  <select
                    id={`${fieldId}-ciclo`}
                    name="ciclo"
                    value={values.ciclo}
                    onChange={(e) => update('ciclo', e.target.value)}
                    required
                    disabled={enviar.isPending}
                    aria-invalid={!!errors.ciclo}
                    aria-describedby={errors.ciclo ? `${fieldId}-ciclo-error` : undefined}
                    className="min-h-11 w-full rounded-lg bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona tu ciclo</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}.º ciclo
                      </option>
                    ))}
                  </select>
                  {errors.ciclo && (
                    <p id={`${fieldId}-ciclo-error`} role="alert" className="mt-1.5 text-xs text-primary">
                      {errors.ciclo}
                    </p>
                  )}
                </div>
              </section>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-relaxed text-ink">
                <input
                  name="acepta"
                  type="checkbox"
                  checked={values.acepta}
                  onChange={(e) => update('acepta', e.target.checked)}
                  required
                  disabled={enviar.isPending}
                  aria-invalid={!!errors.acepta}
                  aria-describedby={errors.acepta ? `${fieldId}-acepta-error` : undefined}
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                />
                He revisado los requisitos del programa y confirmo que mis datos son correctos.
              </label>
              {errors.acepta && (
                <p id={`${fieldId}-acepta-error`} role="alert" className="text-xs text-primary">
                  {errors.acepta}
                </p>
              )}
              <p className="text-xs leading-relaxed text-ink-muted">
                Registro de demostración. No se envían datos a la universidad ni se garantiza la admisión al programa.
              </p>
              {!online && (
                <p role="status" className="text-sm text-ink-muted">
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
            {enviar.isPending ? 'Enviando postulación…' : error ? 'Reintentar envío' : 'Enviar postulación'}
          </Button>
          <Link
            to={`/empleabilidad/programas/${id}`}
            className="flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
          >
            Cancelar
          </Link>
          {enviar.isPending && (
            <p role="status" className="text-center text-xs text-ink-muted">
              Estamos confirmando tu postulación.
            </p>
          )}
        </StickyCta>
      )}
    </form>
  )
}
