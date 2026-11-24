import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Cycle, StatGroup } from './coursesData'

/** Resumen de un curso para la lista: promedio de lo calificado y tareas por entregar. */
export interface CourseSummary {
  /** Promedio ponderado de lo ya calificado, sobre 20 (null si todavía no hay notas). */
  nota: number | null
  /** Tareas que aún no entregaste. */
  pendientes: number
}

export interface CoursesData {
  courses: Course[]
  cycle: Cycle
  summary: Record<string, CourseSummary>
  academicInfo: { label: string; value: string }[]
  progress: StatGroup[]
}

const MONTHS = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']

/** "2026-08-17" → "17 ago. 2026" */
function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** PostgREST devuelve una relación como objeto o como arreglo según la clave; se normaliza. */
function one<T>(rel: unknown): T | null {
  return (Array.isArray(rel) ? rel[0] : rel) ?? null
}

const GROUP_ORDER = ['Avance', 'Créditos', 'Electivos']

async function fetchCourses(): Promise<CoursesData> {
  const [enr, prog, prof, evs, grs, tks, sub] = await Promise.all([
    supabase.from('enrollments').select('orden, courses(*), terms(*)').order('orden'),
    supabase.from('progress_stats').select('grupo, orden, etiqueta, valor, decimales').order('orden'),
    supabase.from('profiles').select('carrera, plan_codigo, modalidad, campuses(nombre)').maybeSingle(),
    supabase.from('course_evaluations').select('id, course_id, peso'),
    supabase.from('evaluation_grades').select('evaluation_id, nota'),
    supabase.from('course_tasks').select('id, course_id'),
    supabase.from('task_submissions').select('task_id'),
  ])
  for (const r of [enr, prog, prof, evs, grs, tks, sub]) if (r.error) throw r.error

  const rows = enr.data ?? []
  const courses = rows.map((r) => one<Course>(r.courses)).filter((c): c is Course => !!c)

  const t = one<{
    nombre: string
    estado: string
    semana_actual: number
    semanas_total: number
    inicio: string
    fin: string
  }>(rows[0]?.terms)
  const cycle: Cycle = t
    ? {
        nombre: t.nombre,
        estado: t.estado,
        // La semana sale de la fecha de hoy y el inicio del ciclo: así no se desfasa con el paso de los días.
        semanaActual: semanaDelCiclo(t.inicio, t.semanas_total, t.semana_actual),
        semanasTotal: t.semanas_total,
        inicio: longDate(t.inicio),
        fin: longDate(t.fin),
      }
    : { nombre: 'Sin ciclo activo', estado: '', semanaActual: 0, semanasTotal: 1, inicio: '', fin: '' }

  // Nota acumulada y tareas pendientes por curso.
  const nota = new Map((grs.data ?? []).map((g) => [g.evaluation_id as string, g.nota as number]))
  const delivered = new Set((sub.data ?? []).map((s) => s.task_id as string))
  const summary: Record<string, CourseSummary> = {}
  for (const c of courses) {
    const mine = (evs.data ?? []).filter((e) => e.course_id === c.id)
    const graded = mine.filter((e) => nota.has(e.id))
    summary[c.id] = {
      nota: graded.length
        ? (graded.reduce((s, e) => s + (nota.get(e.id) as number) * e.peso, 0) / graded.reduce((s, e) => s + e.peso, 0))
        : null,
      pendientes: (tks.data ?? []).filter((x) => x.course_id === c.id && !delivered.has(x.id)).length,
    }
  }

  const campus = one<{ nombre: string }>(prof.data?.campuses)?.nombre ?? ''
  const academicInfo = [
    { label: 'Carrera', value: prof.data?.carrera ?? '' },
    { label: 'Código del plan de estudio', value: prof.data?.plan_codigo ?? '' },
    { label: 'Campus', value: campus },
    { label: 'Modalidad', value: prof.data?.modalidad ?? '' },
  ]

  const progress: StatGroup[] = GROUP_ORDER.map((title) => ({
    title,
    items: (prog.data ?? [])
      .filter((p) => p.grupo === title)
      .map((p) => ({ value: Number(p.valor), label: p.etiqueta, decimals: p.decimales || undefined })),
  })).filter((g) => g.items.length > 0)

  return { courses, cycle, summary, academicInfo, progress }
}

/** Semana del ciclo (1 a total) según la fecha de hoy; si la fecha no es válida usa la guardada en la base. */
export function semanaDelCiclo(inicio: string, total: number, respaldo: number): number {
  const start = new Date(`${inicio}T00:00:00`)
  if (Number.isNaN(start.getTime())) return respaldo
  const dias = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  return Math.min(total, Math.max(1, Math.floor(dias / 7) + 1))
}

/** Cursos matriculados, ciclo y avance del alumno (Supabase, con caché de 5 minutos). */
export function useCourses() {
  return useQuery({ queryKey: ['cursos'], queryFn: fetchCourses, staleTime: 5 * 60_000 })
}

/** Atajo: lista de cursos (vacía mientras carga). */
export function useCourseList(): Course[] {
  return useCourses().data?.courses ?? []
}
