import { useId, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import { useAuth } from '@/features/auth/AuthContext'
import { useCourseList } from '@/features/courses/useCourses'
import { emailOf } from '@/features/profile/profileData'
import { TramiteError, precio, useTramiteActions, useTramiteTipos, type Campo } from './tramitesData'

const fieldBase =
  'relative flex h-11 w-full items-center rounded-lg bg-surface px-3 text-sm text-ink focus-within:ring-2 focus-within:ring-primary'

/** Formulario de un trámite: se arma con los campos que define cada uno en la base de datos. */
export default function SolicitarTramitePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [params] = useSearchParams()
  // Para demostrar el estado de error: ...?demo=error
  const simularError = params.get('demo') === 'error'

  const tipos = useTramiteTipos()
  const cursos = useCourseList()
  const { solicitar } = useTramiteActions()
  const t = tipos.data?.find((x) => x.id === id)

  const [values, setValues] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tocado, setTocado] = useState(false)

  // Valores iniciales: la primera opción de cada selección.
  const valor = (c: Campo) => values[c.key] ?? (c.type === 'select' ? (c.options?.[0] ?? '') : '')

  const faltantes = useMemo(
    () =>
      (t?.campos ?? []).filter((c) => {
        if (!c.required) return false
        const v = values[c.key] ?? (c.type === 'select' ? (c.options?.[0] ?? '') : '')
        return c.type === 'check' ? v !== 'true' : !v.trim()
      }),
    [t, values],
  )

  if (tipos.isLoading) return <PageLoading />
  if (!t) return <Navigate to="/tramites" replace />

  const correo = emailOf(session?.codigo ?? '')

  const enviar = async () => {
    setTocado(true)
    if (enviando || faltantes.length > 0) return
    setError(null)
    setEnviando(true)
    const detalle: Record<string, string> = {}
    for (const c of t.campos) {
      const v = valor(c).trim()
      if (v) detalle[c.key] = v
    }
    try {
      // Pequeña espera para que se perciba el envío (y para la demostración del error).
      await new Promise((r) => setTimeout(r, 900))
      if (simularError) throw new TramiteError('other', 'Error simulado.')
      const codigo = await solicitar(t.id, detalle)
      navigate(`/tramites/solicitud/${codigo}`, { replace: true, state: { nueva: true } })
    } catch (e) {
      setEnviando(false)
      setError(
        e instanceof TramiteError && (e.reason === 'duplicate' || e.reason === 'invalid')
          ? e.message
          : e instanceof TramiteError && e.reason === 'offline'
            ? 'Parece que no hay conexión. Tus datos se conservan: reintenta cuando vuelva.'
            : 'Ocurrió un problema al enviar. Tus datos se conservan: puedes reintentar.',
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="Solicitar"
        back={`/tramites/${t.id}`}
        backLabel="Volver al trámite"
        subtitle={t.titulo}
      />

      <div className="stagger flex-1 space-y-3 px-5 pt-4">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-card bg-primary-soft p-3.5">
            <Icon name="error" size={20} className="mt-px shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold text-ink">No se pudo enviar la solicitud</p>
              <p className="mt-0.5 text-xs leading-snug text-ink-muted">{error}</p>
            </div>
          </div>
        )}

        <section aria-label="Datos de la solicitud" className="space-y-3.5 rounded-card bg-card p-4 shadow-card">
          {t.campos.length === 0 && <p className="text-xs text-ink-muted">Este trámite no necesita datos adicionales.</p>}
          {t.campos.map((c) => {
            const falta = tocado && faltantes.includes(c)
            const set = (v: string) => setValues((s) => ({ ...s, [c.key]: v }))
            return (
              <Field key={c.key} campo={c} falta={falta}>
                {(fid) => {
                  if (c.type === 'select')
                    return <Select id={fid} value={valor(c)} onChange={set} options={(c.options ?? []).map((o) => ({ value: o, label: o }))} />
                  if (c.type === 'curso')
                    return (
                      <Select
                        id={fid}
                        value={valor(c)}
                        onChange={set}
                        placeholder="Elige un curso"
                        options={cursos.map((x) => ({ value: x.id, label: x.nombre }))}
                      />
                    )
                  if (c.type === 'textarea')
                    return (
                      <textarea
                        id={fid}
                        value={valor(c)}
                        onChange={(e) => set(e.target.value.slice(0, 400))}
                        rows={3}
                        aria-invalid={falta || undefined}
                        className="w-full resize-none rounded-lg bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
                      />
                    )
                  if (c.type === 'check')
                    return (
                      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
                        <input
                          id={fid}
                          type="checkbox"
                          checked={valor(c) === 'true'}
                          onChange={(e) => set(e.target.checked ? 'true' : '')}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                        />
                        <span>{c.label}</span>
                      </label>
                    )
                  return (
                    <div className={fieldBase}>
                      <input
                        id={fid}
                        value={valor(c)}
                        onChange={(e) => set(e.target.value.slice(0, 120))}
                        aria-invalid={falta || undefined}
                        className="h-full w-full bg-transparent outline-none"
                      />
                    </div>
                  )
                }}
              </Field>
            )
          })}
        </section>

        <section aria-label="Resumen del servicio" className="flex items-center justify-between gap-3 rounded-card bg-card p-4 shadow-card">
          <div>
            <p className="text-[0.6875rem] text-ink-muted">Resumen del servicio</p>
            <p className="text-lg font-extrabold text-ink">{precio(t.costo)}</p>
          </div>
          <p className="text-right text-[0.6875rem] text-ink-muted">
            {t.plazo}
            <br />
            {t.modalidad}
          </p>
        </section>

        <p className="flex items-start gap-2 px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
          <Icon name="info" size={14} className="mt-px shrink-0" />
          Recibirás las novedades en {correo}.
          {t.costo > 0 && ' El cobro figurará en la sección de Pagos; tendrás 24 horas para regularizarlo o la solicitud se cancelará.'}
        </p>
      </div>

      <StickyCta>
        <Button full onClick={enviar} disabled={enviando} aria-busy={enviando}>
          {enviando ? 'Enviando…' : error ? 'Reintentar' : 'Enviar solicitud'}
        </Button>
        {enviando && (
          <p role="status" className="mt-2 text-center text-xs text-ink-muted">
            Estamos validando la información. Espera un momento.
          </p>
        )}
      </StickyCta>
    </div>
  )
}

function Field({ campo, falta, children }: { campo: Campo; falta: boolean; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div>
      {campo.type !== 'check' && (
        <label htmlFor={id} className="mb-1.5 block text-[0.6875rem] text-ink-muted">
          {campo.label}
          {!campo.required && <span className="text-ink-faint"> (opcional)</span>}
        </label>
      )}
      {children(id)}
      {falta && (
        <p role="alert" className="mt-1 text-[0.6875rem] font-semibold text-primary">
          {campo.type === 'check' ? 'Debes aceptar para continuar.' : 'Completa este dato.'}
        </p>
      )}
    </div>
  )
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div className={fieldBase}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full appearance-none bg-transparent pr-6 outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-ink-muted" />
    </div>
  )
}
