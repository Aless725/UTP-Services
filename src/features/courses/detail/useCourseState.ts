import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { courseKey } from './useCourseRaw'
import type { Post } from './courseContent'

/** Lo que el alumno hace dentro de un curso (Supabase: material_progress, task_submissions, announcement_reads). */
interface CourseState {
  /** Materiales marcados como vistos. */
  done: string[]
  /** Tareas entregadas: id → archivo, fecha y nota (si el docente ya calificó). */
  entregas: Record<string, { archivo: string; en: string; nota?: number }>
  /** Anuncios leídos. */
  leidos: string[]
}

const EMPTY: CourseState = { done: [], entregas: {}, leidos: [] }
const stateKey = (courseId: string) => ['curso-estado', courseId] as const

async function fetchState(courseId: string): Promise<CourseState> {
  const [prog, sub, rd] = await Promise.all([
    supabase.from('material_progress').select('material_id').eq('course_id', courseId),
    supabase.from('task_submissions').select('task_id, archivo, entregada_en, nota').eq('course_id', courseId),
    supabase.from('announcement_reads').select('announcement_id').eq('course_id', courseId),
  ])
  if (prog.error) throw prog.error
  if (sub.error) throw sub.error
  if (rd.error) throw rd.error
  return {
    done: prog.data.map((r) => r.material_id),
    entregas: Object.fromEntries(
      sub.data.map((s) => [s.task_id, { archivo: s.archivo, en: s.entregada_en, nota: s.nota ?? undefined }]),
    ),
    leidos: rd.data.map((r) => r.announcement_id),
  }
}

export function useCourseState(courseId: string) {
  const qc = useQueryClient()
  const key = stateKey(courseId)
  const { data } = useQuery({ queryKey: key, queryFn: () => fetchState(courseId), staleTime: 60_000 })
  const state = data ?? EMPTY

  /** Aplica el cambio en pantalla al instante y lo guarda; si falla, vuelve a leer el estado real. */
  const mutate = useCallback(
    async (apply: (s: CourseState) => CourseState, save: () => PromiseLike<{ error: unknown }>) => {
      qc.setQueryData<CourseState>(key, (s) => apply(s ?? EMPTY))
      const { error } = await save()
      if (error) {
        await qc.invalidateQueries({ queryKey: key })
        throw error
      }
    },
    [qc, key],
  )

  const toggleDone = useCallback(
    (id: string) => {
      const has = state.done.includes(id)
      return mutate(
        (s) => ({ ...s, done: has ? s.done.filter((x) => x !== id) : [...s.done, id] }),
        () =>
          has
            ? supabase.from('material_progress').delete().eq('material_id', id)
            : supabase.from('material_progress').insert({ course_id: courseId, material_id: id }),
      )
    },
    [state.done, mutate, courseId],
  )

  const deliver = useCallback(
    (taskId: string, archivo: string) =>
      mutate(
        (s) => ({ ...s, entregas: { ...s.entregas, [taskId]: { archivo, en: new Date().toISOString() } } }),
        () => supabase.from('task_submissions').insert({ course_id: courseId, task_id: taskId, archivo }),
      ),
    [mutate, courseId],
  )

  const markRead = useCallback(
    (id: string) => {
      if (state.leidos.includes(id)) return Promise.resolve()
      return mutate(
        (s) => ({ ...s, leidos: [...s.leidos, id] }),
        () =>
          supabase
            .from('announcement_reads')
            .upsert({ course_id: courseId, announcement_id: id }, { onConflict: 'user_id,announcement_id', ignoreDuplicates: true }),
      )
    },
    [state.leidos, mutate, courseId],
  )

  /** Publica un comentario o respuesta; el servidor pone el autor. Luego se recarga el foro. */
  const addPost = useCallback(
    async (threadId: string, post: Pick<Post, 'texto' | 'parent'>) => {
      const { error } = await supabase.rpc('publicar_comentario', {
        p_thread: threadId,
        p_texto: post.texto,
        p_parent: post.parent ?? null,
      })
      if (error) throw error
      await qc.invalidateQueries({ queryKey: courseKey(courseId) })
    },
    [qc, courseId],
  )

  return { ...state, toggleDone, deliver, markRead, addPost }
}

export type CourseStateApi = ReturnType<typeof useCourseState>
