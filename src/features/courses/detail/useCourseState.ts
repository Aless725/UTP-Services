import { useCallback } from 'react'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import type { Post } from './courseContent'

/** Lo que el alumno hace dentro de un curso. En el backend serán tablas por alumno y curso. */
interface CourseState {
  /** Materiales marcados como vistos. */
  done: string[]
  /** Tareas entregadas: id → archivo y fecha. */
  entregas: Record<string, { archivo: string; en: string }>
  /** Publicaciones propias en los foros: id del foro → publicaciones. */
  posts: Record<string, Post[]>
  /** Anuncios leídos. */
  leidos: string[]
}

const empty: CourseState = { done: [], entregas: {}, posts: {}, leidos: [] }

export function useCourseState(courseId: string) {
  const [state, setState] = useLocalStorageState<CourseState>(`utp.curso.${courseId}`, empty)

  const toggleDone = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, done: s.done.includes(id) ? s.done.filter((x) => x !== id) : [...s.done, id] })),
    [setState],
  )

  const deliver = useCallback(
    (taskId: string, archivo: string) =>
      setState((s) => ({ ...s, entregas: { ...s.entregas, [taskId]: { archivo, en: new Date().toISOString() } } })),
    [setState],
  )

  const addPost = useCallback(
    (threadId: string, post: Post) =>
      setState((s) => ({ ...s, posts: { ...s.posts, [threadId]: [...(s.posts[threadId] ?? []), post] } })),
    [setState],
  )

  const markRead = useCallback(
    (id: string) => setState((s) => (s.leidos.includes(id) ? s : { ...s, leidos: [...s.leidos, id] })),
    [setState],
  )

  return { ...state, toggleDone, deliver, addPost, markRead }
}

export type CourseStateApi = ReturnType<typeof useCourseState>
