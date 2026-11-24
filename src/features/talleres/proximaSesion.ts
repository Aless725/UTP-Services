import type { InscripcionTaller } from './talleresData'

const WEEKDAY: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }
const DIA_LARGO = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Fecha AAAA-MM-DD en hora de Lima, venga como fecha o como instante. */
const isoLima = (s: string) =>
  s.length === 10 ? s : new Date(s).toLocaleDateString('en-CA', { timeZone: 'America/Lima' })

const mediodia = (iso: string) => new Date(`${iso}T12:00:00-05:00`)
const diaSemana = (iso: string) =>
  WEEKDAY[mediodia(iso).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Lima' })] ?? 0
const sumarDias = (iso: string, n: number) =>
  isoLima(new Date(mediodia(iso).getTime() + n * 86_400_000).toISOString())

export interface ProximaSesion {
  inscripcion: InscripcionTaller
  inicio: Date
  fin: Date
  /** "Hoy", "Mañana" o "Lun 30 nov". */
  cuando: string
  /** "16:30–18:00" */
  horario: string
}

/**
 * Siguiente sesión de los talleres en los que el alumno está inscrito: recorre los próximos 15 días
 * y toma la primera sesión que aún no terminó y cae dentro de las fechas del taller.
 */
export function proximaSesion(inscripciones: InscripcionTaller[], ahora: Date): ProximaSesion | null {
  const hoy = isoLima(ahora.toISOString())
  let mejor: ProximaSesion | null = null
  for (const ins of inscripciones) {
    if (ins.estado !== 'inscrita') continue
    const s = ins.snapshot
    const desde = isoLima(s.inicio)
    const hasta = isoLima(s.fin)
    for (let i = 0; i <= 15; i++) {
      const dia = sumarDias(hoy, i)
      if (dia < desde || dia > hasta) continue
      for (const h of s.horarios) {
        if (h.dia !== diaSemana(dia)) continue
        const inicio = new Date(`${dia}T${h.inicio.slice(0, 5)}:00-05:00`)
        const fin = new Date(`${dia}T${h.fin.slice(0, 5)}:00-05:00`)
        if (fin <= ahora) continue
        if (!mejor || inicio < mejor.inicio) {
          const cuando =
            i === 0
              ? 'Hoy'
              : i === 1
                ? 'Mañana'
                : `${DIA_LARGO[h.dia]} ${mediodia(dia).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'America/Lima' }).replace('.', '')}`
          mejor = { inscripcion: ins, inicio, fin, cuando, horario: `${h.inicio.slice(0, 5)}–${h.fin.slice(0, 5)}` }
        }
      }
      if (mejor && mejor.inscripcion === ins) break
    }
  }
  return mejor
}

export const DIAS_CORTOS = [
  { n: 1, corto: 'L', largo: 'Lunes' },
  { n: 2, corto: 'M', largo: 'Martes' },
  { n: 3, corto: 'M', largo: 'Miércoles' },
  { n: 4, corto: 'J', largo: 'Jueves' },
  { n: 5, corto: 'V', largo: 'Viernes' },
  { n: 6, corto: 'S', largo: 'Sábado' },
]
