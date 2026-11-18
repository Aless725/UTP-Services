import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import type { Course } from '../coursesData'
import { useCourses } from '../useCourses'
import AnnouncementsTab from './AnnouncementsTab'
import ContentTab from './ContentTab'
import EvaluationsTab from './EvaluationsTab'
import ForumsTab from './ForumsTab'
import GradesTab from './GradesTab'
import SyllabusTab from './SyllabusTab'
import TasksTab from './TasksTab'
import ZoomTab from './ZoomTab'
import { announcementsOf, tasksOf } from './courseContent'
import { useCourseState } from './useCourseState'
import { CourseRawContext, useCourseRaw, useRaw } from './useCourseRaw'

type TabId = 'silabo' | 'contenido' | 'evaluaciones' | 'tareas' | 'foros' | 'notas' | 'anuncios' | 'zoom'

export default function CourseDetailPage() {
  const { id } = useParams()
  const courses = useCourses()
  const course = courses.data?.courses.find((c) => c.id === id)
  const { raw, isLoading, isError, refetch } = useCourseRaw(course?.id ?? '', courses.data?.cycle)

  if (courses.isLoading) return <PageLoading />
  if (!course) return <Navigate to="/cursos" replace />
  if (isError) {
    return (
      <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
        <FlowHeader title={course.nombre} back="/cursos" backLabel="Volver a cursos" />
        <div role="alert" className="mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar el curso</p>
          <button type="button" onClick={() => refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  if (isLoading || !raw) return <PageLoading />
  // La clave reinicia el estado al pasar de un curso a otro.
  return (
    <CourseRawContext.Provider value={raw}>
      <CourseDetail key={course.id} course={course} />
    </CourseRawContext.Provider>
  )
}

function CourseDetail({ course }: { course: Course }) {
  const [tab, setTab] = useState<TabId>('contenido')
  const [forumWeek, setForumWeek] = useState<number | null>(null)
  const state = useCourseState(course.id)
  const raw = useRaw()

  const pendingTasks = useMemo(
    () => tasksOf(raw).filter((t) => !state.entregas[t.id]).length,
    [raw, state.entregas],
  )
  const unread = useMemo(
    () => announcementsOf(raw).filter((a) => a.nuevo && !state.leidos.includes(a.id)).length,
    [raw, state.leidos],
  )

  const tabs: { id: TabId; label: string; icon: string; badge?: number }[] = [
    { id: 'silabo', label: 'Sílabo', icon: 'description' },
    { id: 'contenido', label: 'Contenido', icon: 'folder_open' },
    { id: 'evaluaciones', label: 'Evaluaciones', icon: 'fact_check' },
    { id: 'tareas', label: 'Tareas', icon: 'assignment', badge: pendingTasks },
    { id: 'foros', label: 'Foros', icon: 'forum' },
    { id: 'notas', label: 'Notas', icon: 'grade' },
    { id: 'anuncios', label: 'Anuncios', icon: 'campaign', badge: unread },
    { id: 'zoom', label: 'Zoom', icon: 'videocam' },
  ]

  const openForum = (week: number) => {
    setForumWeek(week)
    setTab('foros')
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title={course.nombre}
        back="/cursos"
        backLabel="Volver a cursos"
        subtitle={`${course.docente} · ${course.creditos} créditos · ${course.modalidad}`}
      />

      {/* Las 8 secciones visibles a la vez: sin deslizar. */}
      <div role="tablist" aria-label="Secciones del curso" className="mt-4 grid grid-cols-4 gap-2 px-5">
        {tabs.map((t) => {
          const on = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={t.badge ? `${t.label}, ${t.badge} pendientes` : t.label}
              onClick={() => {
                setForumWeek(null)
                setTab(t.id)
              }}
              className={`pressable relative flex min-h-[3.75rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors duration-200 ${
                on ? 'bg-ink text-surface' : 'bg-card text-ink-muted shadow-card'
              }`}
            >
              <Icon name={t.icon} size={22} filled={on} />
              <span className="max-w-full truncate text-[0.625rem] font-semibold leading-none">{t.label}</span>
              {!!t.badge && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-bold leading-none text-white"
                >
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div key={tab} className="animate-rise px-5 pt-4" role="tabpanel">
        {tab === 'silabo' && <SyllabusTab course={course} />}
        {tab === 'contenido' && <ContentTab state={state} onOpenForum={openForum} />}
        {tab === 'evaluaciones' && <EvaluationsTab course={course} />}
        {tab === 'tareas' && <TasksTab state={state} />}
        {tab === 'foros' && (
          <ForumsTab
            state={state}
            initialThread={forumWeek ? `${course.id}-f${forumWeek}` : null}
          />
        )}
        {tab === 'notas' && <GradesTab course={course} />}
        {tab === 'anuncios' && <AnnouncementsTab course={course} state={state} />}
        {tab === 'zoom' && <ZoomTab course={course} />}
      </div>
    </div>
  )
}
