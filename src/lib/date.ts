const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** "Noviembre 2026" */
export const monthYear = (d: Date) =>
  cap(new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(d)).replace(' De ', ' ')

/** "Lunes, 9 de noviembre" */
export const longDay = (d: Date) =>
  cap(new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(d))

/** "Lun." */
export const shortWeekday = (d: Date) =>
  cap(new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(d).replace('.', '')) + '.'

/** "15 nov. 2026" */
export const shortDate = (d: Date) =>
  new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(d)
    .replace(/ de /g, ' ')

export const money = (n: number) =>
  'S/ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const MONTH_SHORT = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.']
const MONTH_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const WEEKDAY_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const WEEKDAY_SHORT = ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.']

/** "2026-11-17" → Date local (evita el desfase de zona horaria de new Date(iso)). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** "Mar. 17 nov." */
export const dayShort = (d: Date) => `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`

/** "Martes 17 de noviembre de 2026" */
export const dayFull = (d: Date) =>
  `${WEEKDAY_LONG[d.getDay()]} ${d.getDate()} de ${MONTH_LONG[d.getMonth()]} de ${d.getFullYear()}`

/** "Miércoles, 18 nov. 2026" (campo de formulario) */
export const dayField = (d: Date) =>
  `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
