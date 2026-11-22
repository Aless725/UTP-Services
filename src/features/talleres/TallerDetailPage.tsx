import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { useNow } from '@/hooks/useNow'
import { useOnline } from '@/lib/online'
import DeclaracionesInscripcion from './components/DeclaracionesInscripcion'
import HorarioTaller from './components/HorarioTaller'
import TalleresState, { TalleresQuery, tallerLink, useTallerSession } from './components/TalleresState'
import {
  categoriaDeRuta,
  CATEGORIAS_TALLER,
  fechaTaller,
  grupoAbierto,
  TallerError,
  useInscribirTaller,
  useMisTalleres,
  useTaller,
} from './talleresData'
import { validarDeclaraciones, type DeclaracionesTaller, type ErroresDeclaraciones } from './validation'

export default function TallerDetailPage() {
  const { categoria, tallerId } = useParams()
  const tipo = categoriaDeRuta(categoria)
  const taller = useTaller(tallerId)
  const mis = useMisTalleres()
  const inscribir = useInscribirTaller()
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const online = useOnline()
  const now = useNow()
  const selectId = useId()
  const busy = useRef(false)
  const [accepted, setAccepted] = useState<DeclaracionesTaller & { key: string }>({
    key: '',
    terminos: false,
    declaracion: false,
  })
  const [errors, setErrors] = useState<ErroresDeclaraciones>({})
  const [error, setError] = useState<TallerError | null>(null)
  useTallerSession(error)
  const t = taller.data?.categoria === tipo ? taller.data : null
  const groupId = params.get('grupo')
  const grupo = groupId
    ? t?.grupos.find((g) => g.id === groupId)
    : (t?.grupos.find((g) => grupoAbierto(g, now) && g.vacantes > 0) ?? t?.grupos[0])
  const anterior = mis.data?.find((i) => i.grupo_id === grupo?.id)
  // Fija la selección de un enlace directo: un refresco de vacantes nunca cambia de grupo.
  useEffect(() => {
    if (!groupId && grupo) {
      const next = new URLSearchParams(params)
      next.set('grupo', grupo.id)
      navigate({ pathname, search: next.toString() }, { replace: true })
    }
  }, [groupId, grupo, params, navigate, pathname])
  const key = `${grupo?.id}:${t?.version_terminos}`
  const values: DeclaracionesTaller = accepted.key === key ? accepted : { terminos: false, declaracion: false }
  const puedeInscribir =
    !!grupo &&
    grupoAbierto(grupo, now) &&
    grupo.vacantes > 0 &&
    !['full', 'closed', 'restricted', 'unavailable'].includes(error?.reason ?? '')
  const backParams = new URLSearchParams(params)
  backParams.delete('grupo')
  const back = `/talleres/${tipo ? CATEGORIAS_TALLER[tipo].ruta : 'culturales'}${backParams.size ? `?${backParams}` : ''}`
  const cambiarGrupo = (value: string) => {
    const next = new URLSearchParams(params)
    next.set('grupo', value)
    setError(null)
    setErrors({})
    navigate({ pathname, search: next.toString() }, { replace: true })
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy.current || inscribir.isPending || !t || !grupo || anterior || !puedeInscribir) return
    const form = event.currentTarget
    const invalid = validarDeclaraciones(values)
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
      const i = await inscribir.mutateAsync({ grupoId: grupo.id, version: t.version_terminos, ...values })
      navigate(`/talleres/inscripcion/${i.id}`, { replace: true })
    } catch (e) {
      const err =
        e instanceof TallerError
          ? e
          : new TallerError(
              'other',
              'No pudimos confirmar la inscripción. Tus selecciones siguen aquí; puedes reintentar.',
            )
      setError(err)
      if (err.reason === 'invalid_terms' || err.reason === 'invalid_declaration') {
        setAccepted({ key, terminos: false, declaracion: false })
        setErrors({ [err.reason === 'invalid_terms' ? 'terminos' : 'declaracion']: err.message })
      }
    } finally {
      busy.current = false
    }
  }
  return (
    <form noValidate onSubmit={submit} className="flex flex-1 flex-col" aria-label="Inscripción al taller">
      <FlowHeader
        title={tipo ? CATEGORIAS_TALLER[tipo].label : 'Taller'}
        back={back}
        backLabel="Volver al catálogo de talleres"
      />
      <div className="flex-1 space-y-3 px-5 pb-4 pt-4">
        <TalleresQuery query={taller}>
          {!t ? (
            <TalleresState
              title="No encontramos este taller"
              description="Puede que ya no esté disponible. Tus inscripciones anteriores siguen en Mis talleres."
              action="Ver talleres"
              to="/talleres"
            />
          ) : (
            <>
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="text-lg font-extrabold text-ink">{t.titulo}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{t.descripcion}</p>
              </section>
              {t.grupos.length > 1 && (
                <div>
                  <label htmlFor={selectId} className="mb-1.5 block text-xs font-semibold text-ink">
                    Grupo y horario
                  </label>
                  <select
                    id={selectId}
                    value={grupo?.id ?? ''}
                    disabled={inscribir.isPending}
                    onChange={(e) => cambiarGrupo(e.target.value)}
                    className="min-h-12 w-full rounded-card bg-card px-3 text-sm text-ink focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Selecciona un grupo
                    </option>
                    {t.grupos.map((g, index) => (
                      <option
                        key={g.id}
                        value={g.id}
                      >{`Grupo ${index + 1} · ${g.sede} · ${g.modalidad === 'virtual' ? 'Virtual' : 'Presencial'} · ${g.periodo}`}</option>
                    ))}
                  </select>
                </div>
              )}
              {!grupo ? (
                <TalleresState
                  title="No encontramos este grupo"
                  description="Selecciona un horario válido para consultar sus detalles."
                  action="Ver grupos del taller"
                  to={pathname}
                />
              ) : (
                <>
                  <section aria-label="Información del grupo" className="rounded-card bg-card p-4 shadow-card">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={grupo.modalidad === 'virtual' ? 'virtual' : 'presencial'}>
                        {grupo.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                      </Badge>
                      <span className="text-xs text-ink-muted">{grupo.periodo}</span>
                    </div>
                    <dl className="mt-3 space-y-3">
                      {[
                        ['person', 'Docente', grupo.docente],
                        ['calendar_today', 'Inicia', fechaTaller(grupo.inicio)],
                        ['event', 'Finaliza', fechaTaller(grupo.fin)],
                        ['location_on', 'Lugar', `${grupo.sede} · ${grupo.lugar}`],
                        ['groups', 'Vacantes', String(grupo.vacantes)],
                      ].map(([icon, label, value]) => (
                        <div key={label} className="flex items-start gap-3">
                          <Icon name={icon} size={19} className="mt-0.5 shrink-0 text-ink-muted" />
                          <div>
                            <dt className="text-xs text-ink-muted">{label}</dt>
                            <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </section>
                  <section aria-labelledby="horario-taller" className="rounded-card bg-card p-4 shadow-card">
                    <h2 id="horario-taller" className="mb-3 text-base font-bold text-ink">
                      Horarios del taller
                    </h2>
                    <HorarioTaller horarios={grupo.horarios} />
                  </section>
                  {anterior ? (
                    <TalleresState
                      icon={anterior.estado === 'inscrita' ? 'check_circle' : 'info'}
                      title={
                        anterior.estado === 'inscrita'
                          ? 'Ya estás inscrito en este grupo'
                          : 'Tu inscripción fue dada de baja'
                      }
                      description="Consulta el registro y su estado en Mis talleres."
                      action="Ver mi inscripción"
                      to={`/talleres/inscripcion/${anterior.id}`}
                    />
                  ) : (
                    <>
                      {!grupoAbierto(grupo, now) && (
                        <TalleresState
                          icon="event_busy"
                          title="Las inscripciones están cerradas"
                          description="Este grupo está fuera de su período de inscripción. Puedes consultar otros grupos o talleres."
                          action="Explorar talleres"
                          to={back}
                        />
                      )}
                      {grupoAbierto(grupo, now) && grupo.vacantes === 0 && (
                        <TalleresState
                          icon="groups"
                          title="Taller sin vacantes"
                          description="Ya no quedan cupos en este grupo. Revisa otros horarios o explora más talleres."
                          action="Explorar talleres"
                          to={back}
                        />
                      )}
                      {error && error.reason !== 'unauthorized' && (
                        <div role="alert" className="rounded-card bg-primary-soft p-4">
                          <p className="text-sm font-bold text-ink">
                            {error.reason === 'full'
                              ? 'La última vacante ya fue tomada'
                              : error.reason === 'restricted'
                                ? 'No puedes inscribirte en este período'
                                : 'No se pudo completar la inscripción'}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{error.message}</p>
                          {error.reason === 'restricted' && (
                            <Link
                              to="/soporte"
                              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary"
                            >
                              Contactar soporte
                            </Link>
                          )}
                        </div>
                      )}
                      <section className="rounded-card bg-card p-4 shadow-card">
                        <h2 className="text-base font-bold text-ink">Términos del taller</h2>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{t.terminos}</p>
                      </section>
                      {puedeInscribir && (
                        <DeclaracionesInscripcion
                          values={values}
                          errors={errors}
                          declaracion={t.declaracion}
                          disabled={inscribir.isPending}
                          onChange={(field, value) => {
                            setAccepted({ key, ...values, [field]: value })
                            setErrors((old) => ({ ...old, [field]: undefined }))
                          }}
                        />
                      )}
                      {!online && (
                        <p role="status" className="text-sm text-ink-muted">
                          Para confirmar tu inscripción necesitas conexión a internet.
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </TalleresQuery>
      </div>
      {t && grupo && (
        <StickyCta>
          {anterior ? (
            <Link className={`${tallerLink} w-full`} to={`/talleres/inscripcion/${anterior.id}`}>
              Ver mi inscripción
            </Link>
          ) : (
            <Button
              full
              type="submit"
              disabled={!online || !puedeInscribir || inscribir.isPending}
              aria-busy={inscribir.isPending}
            >
              {inscribir.isPending
                ? 'Confirmando inscripción…'
                : !puedeInscribir
                  ? 'Inscripción no disponible'
                  : error
                    ? 'Reintentar inscripción'
                    : 'Inscribirme'}
            </Button>
          )}
          {inscribir.isPending && (
            <p role="status" className="mt-2 text-center text-xs text-ink-muted">
              Estamos reservando tu vacante.
            </p>
          )}
        </StickyCta>
      )}
    </form>
  )
}
