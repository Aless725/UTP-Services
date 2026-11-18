export interface Course {
  id: string
  nombre: string
  docente: string
  creditos: number
  modalidad: 'Presencial' | 'Virtual'
}

export interface Cycle {
  nombre: string
  estado: string
  semanaActual: number
  semanasTotal: number
  /** "17 ago. 2026" */
  inicio: string
  fin: string
}

export interface StatGroup {
  title: string
  items: { value: number; label: string; decimals?: number }[]
}

/**
 * Ciclo de respaldo para el contenido de los cursos (semanas, sílabo), que todavía es local.
 * Los cursos, la matrícula y el avance académico ya vienen de Supabase (ver useCourses).
 * TODO fase B: el contenido de los cursos pasa a la base y esto desaparece.
 */
export const cycle: Cycle = {
  nombre: 'Ciclo 2026-2',
  estado: 'En curso',
  semanaActual: 13,
  semanasTotal: 18,
  inicio: '17 ago. 2026',
  fin: '19 dic. 2026',
}
