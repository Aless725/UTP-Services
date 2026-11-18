import { createContext, useContext, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Cycle } from '../coursesData'
import type { Meta, RawCourse } from './courseContent'

/** Todo lo que se necesita para pintar un curso, leído de Supabase. */
type RawBase = Omit<RawCourse, 'term'>

export const courseKey = (courseId: string) => ['curso-contenido', courseId] as const

async function fetchRaw(courseId: string): Promise<RawBase> {
  const [det, mat, ev, gr, tk, th, po, an] = await Promise.all([
    supabase.from('course_details').select('*').eq('course_id', courseId).single(),
    supabase.from('course_materials').select('*').eq('course_id', courseId).order('semana').order('orden'),
    supabase.from('course_evaluations').select('*').eq('course_id', courseId).order('orden'),
    supabase.from('evaluation_grades').select('evaluation_id, nota').eq('course_id', courseId),
    supabase.from('course_tasks').select('*').eq('course_id', courseId).order('semana'),
    supabase.from('course_threads').select('*').eq('course_id', courseId).order('semana', { nullsFirst: true }),
    supabase
      .from('forum_posts')
      .select('id, thread_id, autor, rol, texto, cuando_demo, parent_id, created_at, course_threads!inner(course_id)')
      .eq('course_threads.course_id', courseId)
      .order('orden')
      .order('created_at'),
    supabase.from('announcements').select('*').eq('course_id', courseId).order('orden'),
  ])
  for (const r of [det, mat, ev, gr, tk, th, po, an]) if (r.error) throw r.error

  const d = det.data!
  const notas = new Map((gr.data ?? []).map((g) => [g.evaluation_id as string, g.nota as number]))
  const meta: Meta = {
    codigo: d.codigo,
    horas: d.horas,
    sumilla: d.sumilla,
    logro: d.logro,
    metodologia: d.metodologia,
    temas: d.temas,
    proyecto: d.proyecto,
    bibBase: d.bib_base,
    bibComp: d.bib_comp,
    zoom: d.zoom_sesiones,
  }

  return {
    id: courseId,
    meta,
    zoom: { meetingId: d.zoom_meeting_id, passcode: d.zoom_passcode, url: d.zoom_url },
    materials: mat.data!.map((m) => ({ id: m.id, semana: m.semana, tipo: m.tipo, titulo: m.titulo, detalle: m.detalle })),
    evaluations: ev.data!.map((e) => ({
      id: e.id,
      clave: e.clave,
      nombre: e.nombre,
      semana: e.semana,
      peso: e.peso,
      nota: notas.get(e.id) ?? null,
    })),
    tasks: tk.data!.map((t) => ({ id: t.id, titulo: t.titulo, semana: t.semana })),
    threads: th.data!.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      semana: t.semana,
      tipo: t.tipo,
      descripcion: t.descripcion,
    })),
    posts: po.data!.map((p) => ({
      id: p.id,
      thread_id: p.thread_id,
      autor: p.autor,
      rol: p.rol,
      texto: p.texto,
      cuando_demo: p.cuando_demo,
      parent_id: p.parent_id,
      created_at: p.created_at,
    })),
    announcements: an.data!.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      texto: a.texto,
      hace_dias: a.hace_dias,
      semana: a.semana,
      dia: a.dia,
      nuevo: a.nuevo,
    })),
  }
}

/** Contenido del curso (Supabase) unido a los datos del ciclo. */
export function useCourseRaw(courseId: string, cycle: Cycle | undefined) {
  const q = useQuery({ queryKey: courseKey(courseId), queryFn: () => fetchRaw(courseId), staleTime: 60_000, enabled: !!courseId })
  const raw = useMemo<RawCourse | undefined>(
    () =>
      q.data && cycle
        ? { ...q.data, term: { nombre: cycle.nombre, semanaActual: cycle.semanaActual, semanasTotal: cycle.semanasTotal } }
        : undefined,
    [q.data, cycle],
  )
  return { raw, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch }
}

export const CourseRawContext = createContext<RawCourse | null>(null)

/** Contenido del curso abierto (solo dentro de CourseDetailPage). */
export function useRaw(): RawCourse {
  const raw = useContext(CourseRawContext)
  if (!raw) throw new Error('useRaw debe usarse dentro de la pantalla de detalle del curso')
  return raw
}
