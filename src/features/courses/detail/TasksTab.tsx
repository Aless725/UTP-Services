import { useMemo, useRef, useState } from 'react'
import Badge from '@/components/ui/Badge'
import BottomSheet from '@/components/ui/BottomSheet'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { diffDays, startOfDay } from '@/lib/date'
import { useNow } from '@/hooks/useNow'
import type { Course } from '../coursesData'
import { tasksOf, type Task } from './courseContent'
import type { CourseStateApi } from './useCourseState'

type Filter = 'pendientes' | 'entregadas'

const fmtDue = (d: Date) =>
  `${d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')}, 23:59`

export default function TasksTab({ course, state }: { course: Course; state: CourseStateApi }) {
  const { show } = useToast()
  const now = useNow(60000)
  const [filter, setFilter] = useState<Filter>('pendientes')
  const [target, setTarget] = useState<Task | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const tasks = useMemo(() => tasksOf(course.id), [course.id])
  const delivered = (t: Task) => t.entregadaDemo || !!state.entregas[t.id]
  const pending = tasks.filter((t) => !delivered(t))
  const done = tasks.filter(delivered)
  const list = filter === 'pendientes' ? pending : done

  const close = () => {
    setTarget(null)
    setFile(null)
  }

  const submit = () => {
    if (!target || !file) return
    state.deliver(target.id, file.name)
    show('Tarea entregada', 'task_alt')
    close()
  }

  return (
    <div>
      <div role="tablist" aria-label="Estado de las tareas" className="flex gap-2">
        <Chip active={filter === 'pendientes'} onClick={() => setFilter('pendientes')}>
          {`Pendientes (${pending.length})`}
        </Chip>
        <Chip active={filter === 'entregadas'} onClick={() => setFilter('entregadas')}>
          {`Entregadas (${done.length})`}
        </Chip>
      </div>

      {list.length === 0 ? (
        <div key={filter} className="animate-rise mt-3 flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
          <Icon name={filter === 'pendientes' ? 'task_alt' : 'assignment'} size={32} className="text-ink-faint" />
          <p className="mt-2 text-sm font-medium text-ink">
            {filter === 'pendientes' ? 'No tienes tareas pendientes' : 'Aún no entregaste tareas'}
          </p>
        </div>
      ) : (
        <ul key={filter} className="stagger mt-3 space-y-3" aria-live="polite">
          {list.map((t) => {
            const entrega = state.entregas[t.id]
            const days = diffDays(startOfDay(now), t.vence)
            const urgent = !delivered(t) && days <= 2
            return (
              <li key={t.id} className="rounded-card bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold leading-snug text-ink">{t.titulo}</h3>
                  {delivered(t) ? <Badge tone="virtual">Entregada</Badge> : urgent ? <Badge tone="presencial">Por vencer</Badge> : null}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Icon name="schedule" size={14} />
                  Vence {fmtDue(t.vence)} · Semana {t.semana}
                </p>

                {delivered(t) ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
                    <Icon name="attach_file" size={14} />
                    {entrega ? entrega.archivo : `Entrega_${t.semana}.pdf`}
                    {t.notaDemo !== undefined && (
                      <span className="ml-auto font-bold text-ink">Nota: {t.notaDemo}</span>
                    )}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTarget(t)}
                    className="pressable mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
                  >
                    <Icon name="upload_file" size={18} />
                    Entregar tarea
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <BottomSheet open={!!target} onClose={close} title="Entregar tarea">
        {target && (
          <div>
            <p className="text-sm font-semibold text-ink">{target.titulo}</p>
            <p className="mt-0.5 text-xs text-ink-muted">Vence {fmtDue(target.vence)}</p>

            <input
              ref={input}
              type="file"
              accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="pressable mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-primary px-3 text-sm font-semibold text-primary"
            >
              <Icon name={file ? 'description' : 'attach_file'} size={18} />
              <span className="truncate">{file ? file.name : 'Seleccionar archivo'}</span>
            </button>
            <p className="mt-1.5 text-[0.6875rem] text-ink-muted">PDF, Word, ZIP o imagen. Entrega de demostración.</p>

            <button
              type="button"
              onClick={submit}
              disabled={!file}
              className="pressable mt-4 min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
            >
              Enviar entrega
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
