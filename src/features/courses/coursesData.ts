export interface Course {
  id: string
  nombre: string
  docente: string
  creditos: number
  modalidad: 'Presencial' | 'Virtual'
}

export const courses: Course[] = [
  { id: 'gti', nombre: 'Gestión del Servicio TI', docente: 'García Flores, Mateo', creditos: 4, modalidad: 'Presencial' },
  { id: 'ihm', nombre: 'Interacción Hombre Máquina', docente: 'Salazar Ruiz, Kevin', creditos: 4, modalidad: 'Virtual' },
  { id: 'dwi', nombre: 'Desarrollo Web Integrado', docente: 'Minaya Castillo, Juan', creditos: 3, modalidad: 'Presencial' },
  { id: 'ci2', nombre: 'Curso Integrador II', docente: 'Álvarez Velasquez, Rocío', creditos: 5, modalidad: 'Presencial' },
]

export const cycle = {
  nombre: 'Ciclo 2026-2',
  estado: 'En curso',
  semanaActual: 13,
  semanasTotal: 18,
  inicio: '17 ago. 2026',
  fin: '19 dic. 2026',
}

export const academicInfo = [
  { label: 'Carrera', value: 'Ing. Sistemas e Informática' },
  { label: 'Código del plan de estudio', value: 'SIST26P2A' },
  { label: 'Campus', value: 'Lima Centro' },
  { label: 'Modalidad', value: 'Presencial' },
]

export interface StatGroup {
  title: string
  items: { value: number; label: string; decimals?: number }[]
}

export const progress: StatGroup[] = [
  {
    title: 'Avance',
    items: [
      { value: 66, label: 'Cursos requeridos' },
      { value: 50, label: 'Aprobados' },
      { value: 16, label: 'Pendientes' },
    ],
  },
  {
    title: 'Créditos',
    items: [
      { value: 197, label: 'Créditos requeridos' },
      { value: 149, label: 'Aprobados' },
      { value: 48, label: 'Pendientes' },
    ],
  },
  {
    title: 'Electivos',
    items: [
      { value: 3, label: 'Créditos requeridos' },
      { value: 0.28, label: 'Aprobados', decimals: 2 },
      { value: 2.72, label: 'Pendientes', decimals: 2 },
    ],
  },
]
