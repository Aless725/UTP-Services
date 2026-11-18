import { useMemo, useState } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { STUDENTS, initialsOf } from '@/features/reservations/spacesData'
import { useNow } from '@/hooks/useNow'
import { diffDays, startOfDay } from '@/lib/date'
import type { Course } from '../coursesData'
import { rangeLabel, threadsOf, type Post, type Thread } from './courseContent'
import type { CourseStateApi } from './useCourseState'

type Filter = 'abiertos' | 'calificados' | 'todos'

interface ForumsTabProps {
  course: Course
  state: CourseStateApi
  /** Foro que se abre al entrar (viene del contenido de una semana). */
  initialThread?: string | null
}

const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
const fmtDay = (d: Date) => DAY.format(d).replace(/\./g, '')

/** Texto breve de disponibilidad del foro. */
function availability(t: Thread, now: Date): { text: string; tone: 'ok' | 'off' } {
  if (!t.hasta || !t.desde) return { text: 'Siempre abierto', tone: 'ok' }
  if (t.estado === 'proximo') return { text: `Abre el ${fmtDay(t.desde)}`, tone: 'off' }
  if (t.estado === 'cerrado') return { text: `Cerrado el ${fmtDay(t.hasta)}`, tone: 'off' }
  const d = diffDays(startOfDay(now), t.hasta)
  return { text: d <= 0 ? 'Cierra hoy' : d === 1 ? 'Cierra mañana' : `Cierra en ${d} días`, tone: 'ok' }
}

export default function ForumsTab({ course, state, initialThread = null }: ForumsTabProps) {
  const now = useNow(60000)
  const threads = useMemo(() => threadsOf(course.id, course.docente, now), [course.id, course.docente, now])
  const [filter, setFilter] = useState<Filter>(initialThread ? 'todos' : 'abiertos')
  const [openId, setOpenId] = useState<string | null>(initialThread)
  const current = threads.find((t) => t.id === openId) ?? null

  const total = (t: Thread) => t.base.length + (state.posts[t.id]?.length ?? 0)
  const visible = threads.filter((t) =>
    filter === 'abiertos' ? t.estado === 'abierto' : filter === 'calificados' ? t.tipo === 'calificado' : true,
  )
  const counts = {
    abiertos: threads.filter((t) => t.estado === 'abierto').length,
    calificados: threads.filter((t) => t.tipo === 'calificado').length,
    todos: threads.length,
  }

  return (
    <div>
      <div role="tablist" aria-label="Filtrar foros" className="flex gap-2">
        <Chip active={filter === 'abiertos'} onClick={() => setFilter('abiertos')}>{`Abiertos (${counts.abiertos})`}</Chip>
        <Chip active={filter === 'calificados'} onClick={() => setFilter('calificados')}>
          {`Calificados (${counts.calificados})`}
        </Chip>
        <Chip active={filter === 'todos'} onClick={() => setFilter('todos')}>{`Todos (${counts.todos})`}</Chip>
      </div>

      <ul key={filter} className="stagger mt-3 space-y-3" aria-live="polite">
        {visible.map((t) => {
          const av = availability(t, now)
          const locked = t.estado === 'proximo'
          const n = total(t)
          return (
            <li key={t.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => setOpenId(t.id)}
                className="pressable block w-full rounded-card bg-card p-4 text-left shadow-card disabled:opacity-60 disabled:active:scale-100"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-snug text-ink">{t.titulo}</span>
                  {!locked && <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />}
                </span>

                <span className="mt-2 flex flex-wrap items-center gap-1.5">
                  <KindBadge kind={t.tipo} />
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${
                      av.tone === 'ok' ? 'bg-success-soft text-success' : 'bg-fill/5 text-ink-muted'
                    }`}
                  >
                    <Icon name={locked ? 'lock' : 'schedule'} size={12} />
                    {av.text}
                  </span>
                </span>

                <span className="mt-2 line-clamp-2 block text-xs leading-snug text-ink-muted">{t.descripcion}</span>

                {!locked && (
                  <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                    <Icon name="chat_bubble" size={14} />
                    {n === 0 ? 'Sin comentarios' : `${n} ${n === 1 ? 'comentario' : 'comentarios'}`}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <ThreadSheet thread={current} now={now} onClose={() => setOpenId(null)} state={state} />
    </div>
  )
}

function KindBadge({ kind }: { kind: Thread['tipo'] }) {
  return kind === 'calificado' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-semibold text-primary">
      <Icon name="grade" size={12} filled />
      Calificado
    </span>
  ) : (
    <span className="inline-block rounded-full bg-fill/5 px-2 py-0.5 text-[0.625rem] font-semibold text-ink-muted">
      No calificado
    </span>
  )
}

function ThreadSheet({
  thread,
  now,
  onClose,
  state,
}: {
  thread: Thread | null
  now: Date
  onClose: () => void
  state: CourseStateApi
}) {
  const { session } = useAuth()
  const { show } = useToast()
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Post | null>(null)
  // Conserva el último foro mientras se anima el cierre de la hoja.
  const [last, setLast] = useState<Thread | null>(thread)
  if (thread && thread !== last) setLast(thread)
  const t = thread ?? last

  const autor = session ? (STUDENTS[session.codigo] ?? session.nombre) : 'Estudiante'
  const mine: Post[] = t ? (state.posts[t.id] ?? []).map((p, i) => ({ ...p, id: p.id ?? `${t.id}-u${i}` })) : []
  const all = t ? [...t.base, ...mine] : []
  const roots = all.filter((p) => !p.parent)
  const repliesOf = (id: string) => all.filter((p) => p.parent === id)
  const canPost = !!t && t.estado === 'abierto'
  const av = t ? availability(t, now) : null

  const publish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!t || text.trim().length < 2) return
    const d = new Date()
    state.addPost(t.id, {
      id: `${t.id}-u${Date.now().toString(36)}`,
      autor,
      rol: 'Estudiante',
      texto: text.trim(),
      cuando: `Hoy, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      parent: replyTo?.id,
    })
    setText('')
    setReplyTo(null)
    show(replyTo ? 'Respuesta publicada' : 'Comentario publicado', 'send')
  }

  const close = () => {
    setText('')
    setReplyTo(null)
    onClose()
  }

  return (
    <BottomSheet open={!!thread} onClose={close} title={t?.titulo ?? 'Foro'}>
      {t && av && (
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <KindBadge kind={t.tipo} />
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${
                av.tone === 'ok' ? 'bg-success-soft text-success' : 'bg-fill/5 text-ink-muted'
              }`}
            >
              <Icon name="schedule" size={12} />
              {av.text}
            </span>
            {t.desde && t.hasta && (
              <span className="text-[0.6875rem] text-ink-muted">{rangeLabel(t.desde, t.hasta)}</span>
            )}
          </div>
          <p className="mt-2 text-sm leading-snug text-ink">{t.descripcion}</p>

          <h3 className="mb-1 mt-4 text-xs font-bold text-ink">
            Comentarios ({all.length})
          </h3>

          <ul className="max-h-[34dvh] space-y-4 overflow-y-auto overscroll-contain py-2" aria-live="polite">
            {roots.length === 0 && <li className="py-4 text-center text-xs text-ink-muted">Sé la primera persona en comentar.</li>}
            {roots.map((p) => (
              <li key={p.id}>
                <Comment p={p} onReply={canPost ? () => setReplyTo(p) : undefined} />
                {repliesOf(p.id).length > 0 && (
                  <ul className="ml-5 mt-3 space-y-3 border-l-2 border-fill/10 pl-3">
                    {repliesOf(p.id).map((r) => (
                      <li key={r.id}>
                        <Comment p={r} small />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {canPost ? (
            <form onSubmit={publish} className="mt-2 border-t border-fill/5 pt-3">
              {replyTo && (
                <p className="mb-2 flex items-center justify-between rounded-lg bg-surface px-3 py-1.5 text-xs text-ink-muted">
                  <span className="truncate">Respondiendo a {replyTo.autor}</span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    aria-label="Cancelar respuesta"
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </p>
              )}
              <label htmlFor="resp" className="sr-only">
                {replyTo ? 'Tu respuesta' : 'Tu comentario'}
              </label>
              <div className="flex items-end gap-2">
                <textarea
                  id="resp"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  maxLength={400}
                  placeholder={replyTo ? 'Escribe tu respuesta…' : 'Escribe un comentario…'}
                  className="min-h-11 flex-1 resize-none rounded-xl bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={text.trim().length < 2}
                  aria-label="Publicar"
                  className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
                >
                  <Icon name="send" size={18} />
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-2 flex items-start gap-2 rounded-xl bg-fill/5 p-3 text-xs leading-snug text-ink-muted">
              <Icon name="lock" size={16} className="mt-px shrink-0" />
              Este foro está cerrado. Puedes leer los comentarios, pero ya no publicar.
            </p>
          )}
        </div>
      )}
    </BottomSheet>
  )
}

function Comment({ p, small, onReply }: { p: Post; small?: boolean; onReply?: () => void }) {
  const teacher = p.rol === 'Docente'
  return (
    <div className="flex gap-2.5">
      <span
        className={`flex shrink-0 items-center justify-center rounded-full font-bold ${
          small ? 'h-7 w-7 text-[0.625rem]' : 'h-9 w-9 text-xs'
        } ${teacher ? 'bg-primary text-white' : 'bg-primary-soft text-primary'}`}
      >
        {initialsOf(p.autor)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-xs">
          <span className="font-bold text-ink">{p.autor}</span>
          {teacher && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-semibold text-primary">
              Docente
            </span>
          )}
          <span className="text-ink-muted">{p.cuando}</span>
        </p>
        <p className="mt-0.5 text-sm leading-snug text-ink">{p.texto}</p>
        {onReply && (
          <button
            type="button"
            onClick={onReply}
            className="mt-0.5 flex min-h-9 items-center text-xs font-semibold text-primary"
          >
            Responder
          </button>
        )}
      </div>
    </div>
  )
}
