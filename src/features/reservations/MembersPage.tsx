import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import PlusIcon from '@/components/ui/PlusIcon'
import { useAuth } from '@/features/auth/AuthContext'
import { normalizeCodigo, validateCodigo } from '@/features/auth/validation'
import { useCourseList } from '@/features/courses/useCourses'
import { useDraft } from './draftStore'
import { SETTINGS } from './rules'
import { STUDENTS, getSpace, initialsOf } from './spacesData'


export default function MembersPage() {
  const { id } = useParams()
  const space = getSpace(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const { draft, patch } = useDraft()
  const [sheet, setSheet] = useState(false)
  const courses = useCourseList()
  const MOTIVOS = useMemo(() => courses.flatMap((c) => [`Proyecto · ${c.nombre}`, `Repaso · ${c.nombre}`]), [courses])

  // El organizador siempre es el primer integrante y hay un motivo por defecto.
  useEffect(() => {
    const members = draft.miembros.includes(codigo) ? draft.miembros : [codigo, ...draft.miembros]
    if (members !== draft.miembros) patch({ miembros: members })
  }, [codigo, draft.miembros, patch])

  // Motivo por defecto en cuanto llegan los cursos del alumno.
  useEffect(() => {
    if (!draft.motivo && MOTIVOS.length) patch({ motivo: MOTIVOS[1] ?? MOTIVOS[0] })
  }, [MOTIVOS, draft.motivo, patch])

  if (!space) return <Navigate to="/reservas" replace />
  if (space.tipo !== 'sala_grupal' || !draft.inicio) {
    return <Navigate to={`/reservas/espacio/${space.id}/${draft.inicio ? 'confirmar' : 'horario'}`} replace />
  }

  const members = draft.miembros
  const missing = SETTINGS.minMembers - members.length
  const full = members.length >= space.capMax
  const ready = missing <= 0 && !!draft.motivo

  const remove = (c: string) => patch({ miembros: members.filter((m) => m !== c) })
  const add = (c: string) => patch({ miembros: [...members, c] })

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="Integrantes"
        back={`/reservas/espacio/${space.id}/horario`}
        backLabel="Volver a fecha y horario"
        subtitle={`Agrega a tus compañeros con su código de alumno. La sala requiere mínimo ${SETTINGS.minMembers} integrantes.`}
      />

      <div className="stagger space-y-3 px-5 pt-4">
        <section className="rounded-card bg-card p-4 shadow-card">
          <label htmlFor="motivo" className="text-xs text-ink-muted">
            Motivo de la reserva
          </label>
          <div className="relative mt-2 flex h-11 items-center rounded-lg bg-surface px-3 focus-within:ring-2 focus-within:ring-primary">
            <select
              id="motivo"
              value={draft.motivo}
              onChange={(e) => patch({ motivo: e.target.value })}
              className="h-full w-full appearance-none bg-transparent pr-6 text-sm text-ink outline-none"
            >
              {MOTIVOS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-ink-muted" />
          </div>
        </section>

        <section aria-labelledby="int" className="rounded-card bg-card px-4 py-3 shadow-card">
          <div className="flex items-center justify-between py-1">
            <h2 id="int" className="text-sm font-bold text-ink">
              Integrantes
            </h2>
            <span aria-live="polite" className="text-xs font-semibold text-ink-muted">
              {members.length} de {space.capMax}
            </span>
          </div>
          <ul className="divide-y divide-fill/5">
            {members.map((m) => {
              const isMe = m === codigo
              const name = isMe ? (session ? (STUDENTS[codigo] ?? session.nombre) : '') : (STUDENTS[m] ?? m)
              return (
                <li key={m} className="flex items-center gap-3 py-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isMe ? 'bg-primary text-white' : 'bg-primary-soft text-primary'
                    }`}
                  >
                    {initialsOf(name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{name}</span>
                    <span className="block text-xs text-ink-muted">
                      {m}
                      {isMe && ' · Organizador'}
                    </span>
                  </span>
                  {isMe ? (
                    <span className="text-xs font-semibold text-primary">Tú</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      aria-label={`Quitar a ${name}`}
                      className="pressable flex h-11 w-11 items-center justify-center text-ink-muted"
                    >
                      <Icon name="close" size={20} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => setSheet(true)}
          disabled={full}
          className="pressable flex min-h-14 w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-primary text-sm font-semibold text-primary disabled:border-ink-faint disabled:text-ink-faint"
        >
          <PlusIcon size={18} />
          {full ? 'Capacidad completa' : 'Agregar integrante'}
        </button>
      </div>

      <StickyCta>
        {!ready && (
          <p role="status" className="mb-2 text-center text-xs text-ink-muted">
            {missing > 0 ? `Faltan ${missing} ${missing === 1 ? 'integrante' : 'integrantes'} para continuar.` : ''}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate(`/reservas/espacio/${space.id}/confirmar`)}
          disabled={!ready}
          className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
        >
          Continuar
        </button>
      </StickyCta>

      <AddMemberSheet
        open={sheet}
        onClose={() => setSheet(false)}
        members={members}
        onAdd={(c) => {
          add(c)
          if (members.length + 1 >= space.capMax) setSheet(false)
        }}
        capacity={space.capMax}
      />
    </div>
  )
}

function AddMemberSheet({
  open,
  onClose,
  members,
  onAdd,
  capacity,
}: {
  open: boolean
  onClose: () => void
  members: string[]
  onAdd: (c: string) => void
  capacity: number
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setValue('')
      setError(null)
    }
  }, [open])

  const suggestions = useMemo(
    () => Object.entries(STUDENTS).filter(([c]) => !members.includes(c)).slice(0, 5),
    [members],
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateCodigo(value)
    if (err) return setError(err)
    const c = normalizeCodigo(value)
    if (!STUDENTS[c]) return setError('No encontramos ese código de alumno.')
    if (members.includes(c)) return setError('Ese compañero ya está en la lista.')
    if (members.length >= capacity) return setError('La sala ya alcanzó su capacidad.')
    onAdd(c)
    setValue('')
    setError(null)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Agregar integrante">
      <form onSubmit={submit} noValidate>
        <label htmlFor="cod" className="text-xs text-ink-muted">
          Código de alumno
        </label>
        <input
          id="cod"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="U22693560"
          aria-invalid={error ? true : undefined}
          className={`mt-1.5 h-11 w-full rounded-lg bg-surface px-3 text-sm text-ink outline-none ring-1 focus:ring-2 focus:ring-primary ${
            error ? 'ring-primary' : 'ring-transparent'
          }`}
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-primary">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="pressable mt-3 min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
        >
          Agregar
        </button>
      </form>

      {suggestions.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold text-ink-muted">Compañeros de tus cursos</p>
          <ul className="mt-1 divide-y divide-fill/5">
            {suggestions.map(([c, name]) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => onAdd(c)}
                  className="pressable flex min-h-12 w-full items-center gap-3 py-2 text-left"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {initialsOf(name)}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{name}</span>
                    <span className="block text-xs text-ink-muted">{c}</span>
                  </span>
                  <PlusIcon size={18} className="text-primary" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </BottomSheet>
  )
}
