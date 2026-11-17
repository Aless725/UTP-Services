import { addDays, shortDate, startOfDay } from '@/lib/date'

export interface Cuota {
  id: string
  numero: number
  mes: string
  monto: number
  /** Texto fijo para cuotas ya vencidas/pagadas del demo. */
  detalleFijo?: string
  /** Días desde hoy hasta el vencimiento (cuotas pendientes). */
  venceEnDias?: number
}

export const MONTO_CUOTA = 820

export const cuotas: Cuota[] = [
  { id: 'c1', numero: 1, mes: 'Agosto', monto: MONTO_CUOTA, detalleFijo: 'Pagada el 28 ago. 2026' },
  { id: 'c2', numero: 2, mes: 'Septiembre', monto: MONTO_CUOTA, detalleFijo: 'Pagada el 14 sep. 2026' },
  { id: 'c3', numero: 3, mes: 'Octubre', monto: MONTO_CUOTA, detalleFijo: 'Pagada el 13 oct. 2026' },
  { id: 'c4', numero: 4, mes: 'Noviembre', monto: MONTO_CUOTA, venceEnDias: 7 },
  { id: 'c5', numero: 5, mes: 'Diciembre', monto: MONTO_CUOTA, venceEnDias: 37 },
]

/** Cuotas pagadas por defecto en el demo. */
export const PAGADAS_INICIAL = ['c1', 'c2', 'c3']

export function venceTexto(c: Cuota): string {
  return `Vence el ${shortDate(addDays(startOfDay(new Date()), c.venceEnDias ?? 0))}`
}
