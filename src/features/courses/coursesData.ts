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
