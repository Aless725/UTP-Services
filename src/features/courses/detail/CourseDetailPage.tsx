import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import PageLoading from '@/components/ui/PageLoading'
import SegmentedControl from '@/components/ui/SegmentedControl'
import type { Course } from '../coursesData'
import { useCourses } from '../useCourses'
import AnnouncementsTab from './AnnouncementsTab'
import ContentTab from './ContentTab'
import ForumsTab from './ForumsTab'
import NotesTab from './NotesTab'
import SummaryTab, { type SectionId } from './SummaryTab'
import SyllabusTab from './SyllabusTab'
import TasksTab from './TasksTab'
import ZoomTab from './ZoomTab'
import { announcementsOf } from './courseContent'
import { CourseRawContext, useCourseRaw, useRaw } from './useCourseRaw'
import { useCourseState } from './useCourseState'

/** Tres secciones siempre a la vista: caben bien en cualquier pantalla. */
const MAIN: { value: SectionId; label: string }[] = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'notas', label: 'Notas' },
  { value: 'tareas', label: 'Tareas' },
]

/** Secciones que viven detrás del botón "Más". */
const MORE: { value: SectionId; label: string; icon: string }[] = [
  { value: 'contenido', label: 'Contenido', icon: 'folder_open' },
  { value: 'foros', label: 'Foros', icon: 'forum' },
  { value: 'anuncios', label: 'Anuncios', icon: 'campaign' },
  { value: 'zoom', label: 'Zoom', icon: 'videocam' },
  { value: 'silabo', label: 'Sílabo', icon: 'description' },
]

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
  const [tab, setTab] = useState<SectionId>('resumen')
  const [moreOpen, setMoreOpen] = useState(false)
  const [forumWeek, setForumWeek] = useState<number | null>(null)
  const state = useCourseState(course.id)
  const raw = useRaw()

  const unread = useMemo(
    () => announcementsOf(raw).filter((a) => a.nuevo && !state.leidos.includes(a.id)).length,
    [raw, state.leidos],
  )

  const inMore = MORE.find((m) => m.value === tab)

  const go = (section: SectionId) => {
    setForumWeek(null)
    setTab(section)
  }
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
        subtitle={`${course.docente} · ${course.creditos} créditos`}
      />

      <div className="mt-4 flex items-center gap-2 px-5">
        <div className="min-w-0 flex-1">
          <SegmentedControl<SectionId>
            label="Secciones del curso"
            value={inMore ? '' : tab}
            onChange={go}
            options={MAIN}
          />
        </div>
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label={unread ? `Más secciones, ${unread} anuncios nuevos` : 'Más secciones'}
          aria-haspopup="dialog"
          className={`pressable relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
            inMore ? 'bg-ink text-surface' : 'bg-card text-ink shadow-card'
          }`}
        >
          <Icon name="more_horiz" size={22} />
          {unread > 0 && !inMore && (
            <span aria-hidden="true" className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface" />
          )}
        </button>
      </div>

      {inMore && <h2 className="px-5 pt-4 text-lg font-bold text-ink">{inMore.label}</h2>}

      <div key={tab} className={`animate-rise px-5 ${inMore ? 'pt-3' : 'pt-4'}`} role="tabpanel">
        {tab === 'resumen' && <SummaryTab course={course} state={state} go={go} />}
        {tab === 'contenido' && <ContentTab state={state} onOpenForum={openForum} />}
        {tab === 'notas' && <NotesTab />}
        {tab === 'tareas' && <TasksTab state={state} />}
        {tab === 'foros' && <ForumsTab state={state} initialThread={forumWeek ? `${course.id}-f${forumWeek}` : null} />}
        {tab === 'anuncios' && <AnnouncementsTab course={course} state={state} />}
        {tab === 'zoom' && <ZoomTab course={course} />}
        {tab === 'silabo' && <SyllabusTab course={course} />}
      </div>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Más secciones">
        <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-surface">
          {MORE.map((m) => (
            <li key={m.value}>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  go(m.value)
                }}
                className="pressable flex min-h-14 w-full items-center gap-3 px-3.5 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-primary shadow-card">
                  <Icon name={m.icon} size={18} filled />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink">{m.label}</span>
                {m.value === 'anuncios' && unread > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-bold text-white">{unread} nuevos</span>
                )}
                <Icon name="chevron_right" size={18} className="text-ink-faint" />
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  )
}
