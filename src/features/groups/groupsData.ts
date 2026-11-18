import { addDays, startOfDay, toISO } from '@/lib/date'

export type Modalidad = 'Presencial' | 'Virtual'

export interface Group {
  id: string
  curso: string
  /** Nombre u objetivo del grupo. */
  tema: string
  modalidad: Modalidad
  /** yyyy-mm-dd */
  fecha: string
  inicio: string
  fin: string
  /** Presencial: "Sala 2 · Lima Centro" */
  lugar?: string
  /** Presencial: ubicación extendida ("Lima Centro · Biblioteca") */
  sede?: string
  /** Virtual: enlace de la sesión */
  enlace?: string
  plataforma?: string
  /** Cupos totales (incluye organizador). */
  cupos: number
  /** Integrantes actuales sin contar a quienes se unan en esta app. */
  miembros: number
  /** Código del organizador cuando lo creó un alumno de la app. */
  organizador?: string
  periodo: string
}

export const PERIODO = '2026-2'
export const MIN_CUPOS = 2
export const MAX_CUPOS = 8
export const SALAS = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'] as const

export const GROUP_COURSES = [
  'Cálculo II',
  'Taller de programación',
  'Gestión del Servicio TI',
  'Interacción Hombre Máquina',
  'Desarrollo Web Integrado',
  'Curso Integrador II',
]

/** Grupos de ejemplo con fechas relativas a hoy, para que la demo siempre sea vigente. */
export function seedGroups(): Group[] {
  const today = startOfDay(new Date())
  const day = (n: number) => toISO(addDays(today, n))
  return [
    {
      id: 'g-calc2',
      curso: 'Cálculo II',
      tema: 'Práctica para PC 3',
      modalidad: 'Presencial',
      fecha: day(0),
      inicio: '17:00',
      fin: '18:30',
      lugar: 'Sala 2 · Lima Centro',
      sede: 'Lima Centro · Biblioteca',
      cupos: 6,
      miembros: 4,
      periodo: PERIODO,
    },
    {
      id: 'g-ihm',
      curso: 'Interacción Hombre Máquina',
      tema: 'Evaluación heurística del MVP',
      modalidad: 'Virtual',
      fecha: day(1),
      inicio: '19:00',
      fin: '20:00',
      enlace: 'https://meet.google.com/utp-ihm-demo',
      plataforma: 'Google Meet',
      cupos: 5,
      miembros: 3,
      periodo: PERIODO,
    },
    {
      id: 'g-dwi',
      curso: 'Desarrollo Web Integrado',
      tema: 'Repaso de React y rutas',
      modalidad: 'Presencial',
      fecha: day(2),
      inicio: '15:00',
      fin: '17:00',
      lugar: 'Sala 3 · Lima Centro',
      sede: 'Lima Centro · Biblioteca',
      cupos: 4,
      miembros: 2,
      periodo: PERIODO,
    },
    {
      id: 'g-gti',
      curso: 'Gestión del Servicio TI',
      tema: 'Casos de ITIL para el examen',
      modalidad: 'Virtual',
      fecha: day(3),
      inicio: '18:00',
      fin: '19:30',
      enlace: 'https://utpvirtual.zoom.us/demo-gti',
      plataforma: 'Zoom',
      cupos: 6,
      miembros: 6,
      periodo: PERIODO,
    },
  ]
}
