import { useId, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import PlusIcon from '@/components/ui/PlusIcon'
import { useAuth } from '@/features/auth/AuthContext'
import { genero } from '@/features/profile/profileData'
import { addDays, dayField, parseISO, startOfDay, toISO } from '@/lib/date'
import { GROUP_COURSES, MAX_CUPOS, MIN_CUPOS, SALAS, type Modalidad } from './groupsData'
import { createGroup, validateNewGroup } from './groupsStore'

const fieldBase =
  'relative flex h-11 w-full items-center rounded-lg bg-card px-3 text-sm text-ink shadow-card focus-within:ring-2 focus-within:ring-primary'

export default function CreateGroupPage() {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const navigate = useNavigate()
  const today = startOfDay(new Date())

  const [curso, setCurso] = useState('Taller de programación')
  const [tema, setTema] = useState('')
  const [modalidad, setModalidad] = useState<Modalidad>('Presencial')
  const [lugar, setLugar] = useState<string>(SALAS[1])
  const [enlace, setEnlace] = useState('')
  const [fecha, setFecha] = useState(toISO(addDays(today, 1)))
  const [inicio, setInicio] = useState('18:00')
  const [fin, setFin] = useState('19:00')
  const [cupos, setCupos] = useState(5)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = { curso, tema, modalidad, fecha, inicio, fin, lugar, enlace, cupos }
    const err = validateNewGroup(input)
    setError(err)
    if (err) return
    const id = createGroup(input, codigo)
    navigate(`/grupos/creado/${id}`, { replace: true })
  }

  return (
    <form onSubmit={submit} noValidate className="px-5 pb-4 pt-[max(env(safe-area-inset-top),20px)]">
      <div className="flex items-center justify-between">
        <BackButton to="/grupos" label="Volver a grupos" />
        <Link to="/grupos" className="flex min-h-11 items-center text-xs font-semibold text-primary">
          Cancelar
        </Link>
      </div>
      <h1 className="mt-4 text-title text-ink">Crear grupo</h1>
      <p className="mt-1 text-xs text-ink-muted">Organiza una sesión con tu curso.</p>

      <div className="stagger mt-5 space-y-3.5">
        <Field label="Curso">
          {(id) => (
            <div className={fieldBase}>
              <select
                id={id}
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                className="h-full w-full appearance-none bg-transparent pr-6 outline-none"
              >
                {GROUP_COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-ink-muted" />
            </div>
          )}
        </Field>

        <Field label="Nombre u objetivo">
          {(id) => (
            <div className={fieldBase}>
              <input
                id={id}
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                maxLength={60}
                placeholder="Ej. Repaso de algoritmos"
                className="h-full w-full bg-transparent pr-6 outline-none placeholder:text-ink-faint"
              />
              <Icon name="edit" size={16} className="pointer-events-none absolute right-3 text-ink-muted" />
            </div>
          )}
        </Field>

        <div>
          <p className="mb-1.5 text-[0.6875rem] text-ink-muted" id="mod-label">
            Modalidad
          </p>
          <div
            role="radiogroup"
            aria-labelledby="mod-label"
            className="relative flex rounded-lg bg-fill/[0.06] p-0.5"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md bg-card shadow-card transition-transform duration-300 ease-smooth"
              style={{ transform: `translate3d(${modalidad === 'Virtual' ? 100 : 0}%, 0, 0)` }}
            />
            {(['Presencial', 'Virtual'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={modalidad === m}
                onClick={() => setModalidad(m)}
                className={`relative z-10 flex min-h-11 flex-1 items-center justify-center gap-1 text-sm transition-colors ${
                  modalidad === m ? 'font-semibold text-ink' : 'text-ink-muted'
                }`}
              >
                {modalidad === m && <Icon name="check" size={16} className="text-primary" />}
                {m}
              </button>
            ))}
          </div>
        </div>

        {modalidad === 'Virtual' ? (
          <Field label="Enlace de la sesión" key="enlace">
            {(id) => (
              <div className={fieldBase}>
                <input
                  id={id}
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  inputMode="url"
                  autoCapitalize="none"
                  placeholder="https://utpvirtual.zoom.us/…"
                  className="h-full w-full bg-transparent pr-6 outline-none placeholder:text-ink-faint"
                />
                <Icon name="link" size={18} className="pointer-events-none absolute right-3 text-ink-muted" />
              </div>
            )}
          </Field>
        ) : (
          <Field label="Sala (Lima Centro · Biblioteca)" key="sala">
            {(id) => (
              <div className={fieldBase}>
                <select
                  id={id}
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  className="h-full w-full appearance-none bg-transparent pr-6 outline-none"
                >
                  {SALAS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-ink-muted" />
              </div>
            )}
          </Field>
        )}

        <Field label="Fecha">
          {(id) => (
            <div className={fieldBase}>
              <span className="pointer-events-none flex-1">{dayField(parseISO(fecha))}</span>
              <Icon name="calendar_today" size={18} className="pointer-events-none text-ink-muted" />
              <input
                id={id}
                type="date"
                value={fecha}
                min={toISO(today)}
                onChange={(e) => e.target.value && setFecha(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio">
            {(id) => <TimeField id={id} value={inicio} onChange={setInicio} />}
          </Field>
          <Field label="Fin">{(id) => <TimeField id={id} value={fin} onChange={setFin} />}</Field>
        </div>

        <div className="flex min-h-12 items-center justify-between rounded-lg bg-card px-3 shadow-card">
          <span id="cupos-label" className="text-sm text-ink">
            Cupos totales
          </span>
          <div role="group" aria-labelledby="cupos-label" className="flex items-center">
            <button
              type="button"
              onClick={() => setCupos((c) => Math.max(MIN_CUPOS, c - 1))}
              disabled={cupos <= MIN_CUPOS}
              aria-label="Menos cupos"
              className="pressable flex h-11 w-11 items-center justify-center text-primary disabled:text-ink-faint"
            >
              <PlusIcon minus size={18} />
            </button>
            <span aria-live="polite" className="w-6 text-center text-sm font-bold text-ink">
              {cupos}
            </span>
            <button
              type="button"
              onClick={() => setCupos((c) => Math.min(MAX_CUPOS, c + 1))}
              disabled={cupos >= MAX_CUPOS}
              aria-label="Más cupos"
              className="pressable flex h-11 w-11 items-center justify-center text-primary disabled:text-ink-faint"
            >
              <PlusIcon size={18} />
            </button>
          </div>
        </div>
        <p className="px-1 text-[0.6875rem] leading-snug text-ink-muted">
          Todos los campos son necesarios. Los {cupos} cupos te incluyen como{' '}
          {genero(codigo, 'organizadora', 'organizador')}.
        </p>
      </div>

      {error && (
        <p role="alert" className="animate-rise mt-3 flex items-start gap-2 text-xs font-medium text-primary">
          <Icon name="error" size={16} className="mt-px shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        className="pressable mt-4 min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
      >
        Crear grupo
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.6875rem] text-ink-muted">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

function TimeField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={fieldBase}>
      <span className="pointer-events-none flex-1">{value}</span>
      <Icon name="schedule" size={18} className="pointer-events-none text-ink-muted" />
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}
