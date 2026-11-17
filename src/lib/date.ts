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
