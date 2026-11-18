import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Chip from '@/components/ui/Chip'
import { courses, type Course } from '../coursesData'
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

type TabId = 'silabo' | 'contenido' | 'evaluaciones' | 'tareas' | 'foros' | 'notas' | 'anuncios' | 'zoom'

export default function CourseDetailPage() {
  const { id } = useParams()
  const course = courses.find((c) => c.id === id)
  if (!course) return <Navigate to="/cursos" replace />
  // La clave reinicia el estado al pasar de un curso a otro.
  return <CourseDetail key={course.id} course={course} />
}

function CourseDetail({ course }: { course: Course }) {
  const [tab, setTab] = useState<TabId>('contenido')
  const [forumWeek, setForumWeek] = useState<number | null>(null)
  const state = useCourseState(course.id)
  const bar = useRef<HTMLDivElement>(null)

  const pendingTasks = useMemo(
    () => tasksOf(course.id).filter((t) => !t.entregadaDemo && !state.entregas[t.id]).length,
    [course.id, state.entregas],
  )
  const unread = useMemo(
    () => announcementsOf(course.id, course.docente).filter((a) => a.nuevo && !state.leidos.includes(a.id)).length,
    [course.id, course.docente, state.leidos],
  )

  const tabs: { id: TabId; label: string }[] = [
    { id: 'silabo', label: 'Sílabo' },
    { id: 'contenido', label: 'Contenido' },
    { id: 'evaluaciones', label: 'Evaluaciones' },
    { id: 'tareas', label: pendingTasks ? `Tareas (${pendingTasks})` : 'Tareas' },
    { id: 'foros', label: 'Foros' },
    { id: 'notas', label: 'Notas' },
    { id: 'anuncios', label: unread ? `Anuncios (${unread})` : 'Anuncios' },
    { id: 'zoom', label: 'Zoom' },
  ]

  // La pestaña elegida siempre queda visible en la barra deslizable.
  useEffect(() => {
    const reduce = document.documentElement.dataset.reduceMotion === 'true'
    bar.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [tab])

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

      <div
        ref={bar}
        role="tablist"
        aria-label="Secciones del curso"
        className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5"
      >
        {tabs.map((t) => (
          <Chip
            key={t.id}
            active={tab === t.id}
            onClick={() => {
              setForumWeek(null)
              setTab(t.id)
            }}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      <div key={tab} className="animate-rise px-5 pt-4" role="tabpanel">
        {tab === 'silabo' && <SyllabusTab course={course} />}
        {tab === 'contenido' && <ContentTab course={course} state={state} onOpenForum={openForum} />}
        {tab === 'evaluaciones' && <EvaluationsTab course={course} />}
        {tab === 'tareas' && <TasksTab course={course} state={state} />}
        {tab === 'foros' && (
          <ForumsTab
            course={course}
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
