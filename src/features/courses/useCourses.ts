import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Cycle, StatGroup } from './coursesData'

export interface CoursesData {
  courses: Course[]
  cycle: Cycle
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
  const [enr, prog, prof] = await Promise.all([
    supabase.from('enrollments').select('orden, courses(*), terms(*)').order('orden'),
    supabase.from('progress_stats').select('grupo, orden, etiqueta, valor, decimales').order('orden'),
    supabase
      .from('profiles')
      .select('carrera, plan_codigo, modalidad, campuses(nombre)')
      .maybeSingle(),
  ])
  if (enr.error) throw enr.error
  if (prog.error) throw prog.error
  if (prof.error) throw prof.error

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
        semanaActual: t.semana_actual,
        semanasTotal: t.semanas_total,
        inicio: longDate(t.inicio),
        fin: longDate(t.fin),
      }
    : { nombre: 'Sin ciclo activo', estado: '', semanaActual: 0, semanasTotal: 1, inicio: '', fin: '' }

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

  return { courses, cycle, academicInfo, progress }
}

/** Cursos matriculados, ciclo y avance del alumno (Supabase, con caché de 5 minutos). */
export function useCourses() {
  return useQuery({ queryKey: ['cursos'], queryFn: fetchCourses, staleTime: 5 * 60_000 })
}

/** Atajo: lista de cursos (vacía mientras carga). */
export function useCourseList(): Course[] {
  return useCourses().data?.courses ?? []
}
