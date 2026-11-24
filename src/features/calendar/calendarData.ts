import { toISO } from '@/lib/date'

export type EventKind = 'clase' | 'tutoria' | 'actividad'
export type Modalidad = 'Presencial' | 'Virtual'

export interface CalEvent {
  id: string
  kind: EventKind
  title: string
  start: string
  end: string
  place: string
  modalidad?: Modalidad
  status?: string
}

const KIND_LABEL: Record<EventKind, string> = {
  clase: 'Clase',
  tutoria: 'Tutoría',
  actividad: 'Actividad',
}
export const kindLabel = (k: EventKind) => KIND_LABEL[k]

const clase = (
  id: string,
  title: string,
  start: string,
  end: string,
  place: string,
  modalidad: Modalidad,
): CalEvent => ({ id, kind: 'clase', title, start, end, place, modalidad })

/** Ciclo 2026-2: las clases solo existen entre el inicio y el fin del ciclo (viernes 18 de diciembre). */
const CICLO = { inicio: '2026-08-17', fin: '2026-12-18' }

/** Horario semanal de demostración (clave = Date.getDay(); 0 = domingo). */
const WEEKLY: Record<number, CalEvent[]> = {
  1: [
    clase('gti-lun', 'Gestión del Servicio TI', '08:00', '09:30', 'Aula B-204', 'Presencial'),
    clase('hpr-lun', 'Herramientas de Prototipado', '10:30', '12:00', 'Lab. de Diseño C-204', 'Presencial'),
    {
      id: 'tut-calc',
      kind: 'tutoria',
      title: 'Tutoría de Cálculo III',
      start: '15:00',
      end: '16:00',
      place: 'Aula B-304',
      status: 'Inscrito',
    },
    {
      id: 'taller-emp',
      kind: 'actividad',
      title: 'Taller de empleabilidad',
      start: '17:30',
      end: '19:30',
      place: 'Auditorio A-101',
      status: 'Inscrito',
    },
  ],
  2: [clase('ihm-mar', 'Interacción Hombre Máquina', '10:30', '12:00', 'Aula Virtual · Zoom', 'Virtual')],
  3: [
    clase('dwi-mie', 'Desarrollo Web Integrado', '08:00', '10:00', 'Aula 301', 'Presencial'),
    clase('hpr-mie', 'Herramientas de Prototipado', '10:30', '12:00', 'Lab. de Diseño C-204', 'Presencial'),
    clase('ci2-mie', 'Curso Integrador II', '14:00', '16:00', 'Aula 105', 'Presencial'),
  ],
  4: [
    clase('ihm-jue', 'Interacción Hombre Máquina', '10:30', '12:00', 'Aula Virtual · Zoom', 'Virtual'),
    {
      id: 'hack-lect',
      kind: 'actividad',
      title: 'Hackatón de Lectura',
      start: '14:00',
      end: '18:00',
      place: 'Biblioteca · Lima Centro',
      status: 'Inscrito',
    },
  ],
  5: [
    clase('gti-vie', 'Gestión del Servicio TI', '08:00', '09:30', 'Aula B-204', 'Presencial'),
    clase('dwi-vie', 'Desarrollo Web Integrado', '10:00', '12:00', 'Aula 301', 'Presencial'),
  ],
}

export function eventsFor(date: Date): CalEvent[] {
  const iso = toISO(date)
  if (iso < CICLO.inicio || iso > CICLO.fin) return []
  return WEEKLY[date.getDay()] ?? []
}

/** Marca un punto en el día si tiene tutorías o actividades. */
export function hasHighlights(date: Date): boolean {
  return eventsFor(date).some((e) => e.kind !== 'clase')
}
