import { useSyncExternalStore } from 'react'
import { addDays, money, shortDate, startOfDay } from '@/lib/date'
import type { PdfLine } from '@/lib/pdf'

export interface Cuota {
  id: string
  numero: number
  mes: string
  monto: number
  /** Fecha de pago (AAAA-MM-DD) y N.º de operación de las cuotas ya pagadas en el demo. */
  pagadaEl?: string
  operacion?: string
  /** Días desde hoy hasta el vencimiento (cuotas pendientes). */
  venceEnDias?: number
}

export const MONTO_CUOTA = 820
/** Cómo se compone cada cuota (suma MONTO_CUOTA). */
export const DESGLOSE = [
  { concepto: 'Pensión de enseñanza', monto: 780 },
  { concepto: 'Derechos académicos y servicios', monto: 40 },
]
export const CICLO = 'Ciclo 2026-2'

export const cuotas: Cuota[] = [
  { id: 'c1', numero: 1, mes: 'Agosto', monto: MONTO_CUOTA, pagadaEl: '2026-08-28', operacion: 'OP-30481726' },
  { id: 'c2', numero: 2, mes: 'Septiembre', monto: MONTO_CUOTA, pagadaEl: '2026-09-14', operacion: 'OP-30592814' },
  { id: 'c3', numero: 3, mes: 'Octubre', monto: MONTO_CUOTA, pagadaEl: '2026-10-13', operacion: 'OP-30710953' },
  { id: 'c4', numero: 4, mes: 'Noviembre', monto: MONTO_CUOTA, venceEnDias: 7 },
  { id: 'c5', numero: 5, mes: 'Diciembre', monto: MONTO_CUOTA, venceEnDias: 37 },
]

/** Cuotas pagadas por defecto en el demo. */
export const PAGADAS_INICIAL = ['c1', 'c2', 'c3']

export function venceTexto(c: Cuota): string {
  return `Vence el ${shortDate(addDays(startOfDay(new Date()), c.venceEnDias ?? 0))}`
}

/* ---------- Pagos hechos en este dispositivo (simulados) ---------- */

export interface PagoHecho {
  fecha: string
  operacion: string
}

interface Estado {
  pagadas: string[]
  hechos: Record<string, PagoHecho>
}

const K_PAGADAS = 'utp.demo.cuotasPagadas'
const K_HECHOS = 'utp.demo.pagosHechos'

function leer<T>(key: string, inicial: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : inicial
  } catch {
    return inicial
  }
}

let estado: Estado = { pagadas: leer(K_PAGADAS, PAGADAS_INICIAL), hechos: leer(K_HECHOS, {}) }
const oyentes = new Set<() => void>()

function guardar(next: Estado) {
  estado = next
  try {
    localStorage.setItem(K_PAGADAS, JSON.stringify(next.pagadas))
    localStorage.setItem(K_HECHOS, JSON.stringify(next.hechos))
  } catch {
    /* sin almacenamiento: vive solo en esta sesión */
  }
  oyentes.forEach((f) => f())
}

const suscribir = (f: () => void) => {
  oyentes.add(f)
  return () => oyentes.delete(f)
}

/** Estado de las cuotas compartido entre la lista de pagos y el historial (también en dos paneles). */
export function usePagos() {
  const s = useSyncExternalStore(suscribir, () => estado)

  const registrar = (c: Cuota) => {
    if (estado.pagadas.includes(c.id)) return
    const operacion = `OP-${String(Math.floor(Math.random() * 90_000_000) + 10_000_000)}`
    guardar({
      pagadas: [...estado.pagadas, c.id],
      hechos: { ...estado.hechos, [c.id]: { fecha: new Date().toISOString().slice(0, 10), operacion } },
    })
  }

  const pagada = (c: Cuota) => s.pagadas.includes(c.id)
  /** Fecha (AAAA-MM-DD) y operación de una cuota pagada. */
  const detallePago = (c: Cuota): PagoHecho | null =>
    !pagada(c) ? null : c.pagadaEl && c.operacion ? { fecha: c.pagadaEl, operacion: c.operacion } : (s.hechos[c.id] ?? null)

  const pagadasLista = cuotas.filter(pagada).sort((a, b) => (detallePago(b)?.fecha ?? '').localeCompare(detallePago(a)?.fecha ?? ''))
  const pendientes = cuotas.filter((c) => !pagada(c))

  return { pagada, detallePago, registrar, pagadasLista, pendientes }
}

/* ---------- Constancias (PDF) ---------- */

const fechaLarga = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return shortDate(new Date(y, m - 1, d))
}

const cabecera = (titulo: string, alumno: { nombre: string; codigo: string }): PdfLine[] => [
  { text: 'Universidad Tecnológica del Perú', size: 18, bold: true },
  { text: 'UTP+ Service · Documento de demostración', size: 9 },
  { text: titulo, size: 15, bold: true, gap: 26 },
  { text: `Alumno: ${alumno.nombre}`, gap: 14 },
  { text: `Código: ${alumno.codigo}` },
  { text: `${CICLO}`, },
]

export function comprobantePdf(c: Cuota, pago: PagoHecho, alumno: { nombre: string; codigo: string }): PdfLine[] {
  return [
    ...cabecera('Comprobante de pago', alumno),
    { text: `Concepto: Cuota ${c.numero} · ${c.mes}`, gap: 14 },
    ...DESGLOSE.map((d) => ({ text: `   ${d.concepto}: ${money(d.monto)}` })),
    { text: `Total pagado: ${money(c.monto)}`, bold: true, gap: 6 },
    { text: `Fecha de pago: ${fechaLarga(pago.fecha)}`, gap: 10 },
    { text: `N° de operación: ${pago.operacion}` },
    { text: 'Estado: Pagado' },
    { text: 'Este documento es de demostración y no tiene validez legal.', size: 9, gap: 30 },
  ]
}

export function constanciaPagosPdf(pagos: { c: Cuota; pago: PagoHecho }[], alumno: { nombre: string; codigo: string }): PdfLine[] {
  const total = pagos.reduce((s, p) => s + p.c.monto, 0)
  return [
    ...cabecera('Constancia de pagos', alumno),
    { text: 'Se deja constancia de los siguientes pagos registrados:', gap: 14 },
    ...pagos.map(({ c, pago }) => ({ text: `Cuota ${c.numero} · ${c.mes}  -  ${fechaLarga(pago.fecha)}  -  ${pago.operacion}  -  ${money(c.monto)}`, size: 10 })),
    { text: `Total pagado: ${money(total)}`, bold: true, gap: 10 },
    { text: 'Este documento es de demostración y no tiene validez legal.', size: 9, gap: 30 },
  ]
}

export function constanciaNoDeudaPdf(alumno: { nombre: string; codigo: string }): PdfLine[] {
  return [
    ...cabecera('Constancia de no adeudo', alumno),
    { text: 'Se deja constancia de que el alumno no registra cuotas pendientes', gap: 14 },
    { text: `de pago correspondientes al ${CICLO}.` },
    { text: `Emitida el ${shortDate(new Date())}.`, gap: 10 },
    { text: 'Este documento es de demostración y no tiene validez legal.', size: 9, gap: 30 },
  ]
}
