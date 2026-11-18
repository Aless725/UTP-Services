import { useMemo, useState } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { STUDENTS, initialsOf } from '@/features/reservations/spacesData'
import type { Course } from '../coursesData'
import { CURRENT_WEEK, threadsOf, type Post, type Thread } from './courseContent'
import type { CourseStateApi } from './useCourseState'

interface ForumsTabProps {
  course: Course
  state: CourseStateApi
  /** Foro que se abre al entrar (viene del contenido de una semana). */
  initialThread?: string | null
}

export default function ForumsTab({ course, state, initialThread = null }: ForumsTabProps) {
  const threads = useMemo(() => threadsOf(course.id, course.docente), [course.id, course.docente])
  const [openId, setOpenId] = useState<string | null>(initialThread)
  const current = threads.find((t) => t.id === openId) ?? null

  const count = (t: Thread) => t.base.length - (t.base.length > 0 ? 1 : 0) + (state.posts[t.id]?.length ?? 0)

  return (
    <div>
      <ul className="stagger space-y-3">
        {threads.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              disabled={!t.abierto}
              onClick={() => setOpenId(t.id)}
              className="pressable flex min-h-16 w-full items-center gap-3 rounded-card bg-card p-4 text-left shadow-card disabled:opacity-60 disabled:active:scale-100"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  t.abierto ? 'bg-info-soft text-info' : 'bg-fill/5 text-ink-muted'
                }`}
              >
                <Icon name={t.abierto ? 'forum' : 'lock'} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">{t.titulo}</span>
                <span className="block text-xs text-ink-muted">
                  {t.abierto
                    ? `${count(t)} ${count(t) === 1 ? 'respuesta' : 'respuestas'}${t.semana === CURRENT_WEEK ? ' · Semana actual' : ''}`
                    : `Se abre en la semana ${t.semana}`}
                </span>
              </span>
              {t.abierto && <Icon name="chevron_right" size={20} className="text-ink-muted" />}
            </button>
          </li>
        ))}
      </ul>

      <ThreadSheet thread={current} onClose={() => setOpenId(null)} state={state} />
    </div>
  )
}

function ThreadSheet({
  thread,
  onClose,
  state,
}: {
  thread: Thread | null
  onClose: () => void
  state: CourseStateApi
}) {
  const { session } = useAuth()
  const { show } = useToast()
  const [text, setText] = useState('')
  const [last, setLast] = useState<Thread | null>(thread)
  if (thread && thread !== last) setLast(thread)
  const t = thread ?? last

  const mine = t ? (state.posts[t.id] ?? []) : []
  const posts: Post[] = t ? [...t.base, ...mine] : []
  const autor = session ? (STUDENTS[session.codigo] ?? session.nombre) : 'Estudiante'

  const publish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!t || text.trim().length < 2) return
    const d = new Date()
    state.addPost(t.id, {
      autor,
      rol: 'Estudiante',
      texto: text.trim(),
      cuando: `Hoy, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    })
    setText('')
    show('Respuesta publicada', 'send')
  }

  return (
    <BottomSheet open={!!thread} onClose={onClose} title={t?.titulo ?? 'Foro'}>
      <ul className="max-h-[48dvh] space-y-4 overflow-y-auto overscroll-contain py-2" aria-live="polite">
        {posts.map((p, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                p.rol === 'Docente' ? 'bg-primary text-white' : 'bg-primary-soft text-primary'
              }`}
            >
              {initialsOf(p.autor)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 text-xs">
                <span className="font-bold text-ink">{p.autor}</span>
                {p.rol === 'Docente' && (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-semibold text-primary">
                    Docente
                  </span>
                )}
                <span className="text-ink-muted">{p.cuando}</span>
              </p>
              <p className="mt-0.5 text-sm leading-snug text-ink">{p.texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={publish} className="mt-2 border-t border-fill/5 pt-3">
        <label htmlFor="resp" className="sr-only">
          Tu respuesta
        </label>
        <textarea
          id="resp"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={400}
          placeholder="Escribe tu consulta o respuesta…"
          className="w-full resize-none rounded-xl bg-surface p-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={text.trim().length < 2}
          className="pressable mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
        >
          <Icon name="send" size={18} />
          Publicar
        </button>
      </form>
    </BottomSheet>
  )
}
