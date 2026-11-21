import { useRef } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { money, shortDate } from '@/lib/date'
import { buildPdf, downloadPdf } from '@/lib/pdf'
import {
  CICLO,
  DESGLOSE,
  comprobantePdf,
  venceTexto,
  type Cuota,
  type PagoHecho,
} from './paymentsData'
import { useAlumno } from './useAlumno'

const fecha = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return shortDate(new Date(y, m - 1, d))
}

interface CuotaSheetProps {
  cuota: Cuota | null
  /** Datos del pago si la cuota ya se pagó. */
  pago: PagoHecho | null
  onClose: () => void
  /** Solo para cuotas pendientes: abre el pago. */
  onPay?: (c: Cuota) => void
}

/** Detalle de una cuota: si está pagada, su comprobante; si no, cuándo vence y cómo se compone. */
export default function CuotaSheet({ cuota: cuotaProp, pago: pagoProp, onClose, onPay }: CuotaSheetProps) {
  const { show } = useToast()
  const alumno = useAlumno()
  // Se conserva el último contenido para que la hoja no se vacíe mientras anima su salida.
  const last = useRef<{ cuota: Cuota; pago: PagoHecho | null } | null>(null)
  if (cuotaProp) last.current = { cuota: cuotaProp, pago: pagoProp }
  const cuota = cuotaProp ?? last.current?.cuota ?? null
  const pago = cuotaProp ? pagoProp : (last.current?.pago ?? null)

  const descargar = () => {
    if (!cuota || !pago) return
    downloadPdf(`comprobante-cuota-${cuota.numero}.pdf`, buildPdf(comprobantePdf(cuota, pago, alumno)))
    show('Comprobante descargado', 'download')
  }

  return (
    <BottomSheet open={!!cuotaProp} onClose={onClose} title={cuota ? `Cuota ${cuota.numero} · ${cuota.mes}` : 'Cuota'}>
      {cuota && (
        <div>
          <div className="flex flex-col items-center py-1 text-center">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                pago ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'
              }`}
            >
              <Icon name={pago ? 'check' : 'schedule'} size={26} />
            </span>
            <p className="mt-2 text-[1.5rem] font-extrabold leading-none text-ink">{money(cuota.monto)}</p>
            <p className={`mt-1 text-xs font-semibold ${pago ? 'text-success' : 'text-primary'}`}>
              {pago ? 'Pagado' : 'Pendiente'}
            </p>
          </div>

          <dl className="mt-3 divide-y divide-fill/5 rounded-card bg-surface px-3.5">
            <Fila label="Ciclo" value={CICLO} />
            {pago ? (
              <>
                <Fila label="Fecha de pago" value={fecha(pago.fecha)} />
                <Fila label="N° de operación" value={pago.operacion} />
                <Fila label="Método" value="Tarjeta •••• 4242" />
              </>
            ) : (
              <Fila label="Vencimiento" value={venceTexto(cuota).replace('Vence el ', '')} />
            )}
          </dl>

          <p className="mb-1 mt-4 px-1 text-xs font-bold text-ink">Detalle del monto</p>
          <dl className="divide-y divide-fill/5 rounded-card bg-surface px-3.5">
            {DESGLOSE.map((d) => (
              <Fila key={d.concepto} label={d.concepto} value={money(d.monto)} />
            ))}
            <Fila label="Total" value={money(cuota.monto)} strong />
          </dl>

          {pago ? (
            <button
              type="button"
              onClick={descargar}
              className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
            >
              <Icon name="download" size={18} />
              Descargar comprobante
            </button>
          ) : (
            onPay && (
              <button
                type="button"
                onClick={() => onPay(cuota)}
                className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
              >
                <Icon name="credit_card" size={18} />
                Pagar cuota · {money(cuota.monto)}
              </button>
            )
          )}
        </div>
      )}
    </BottomSheet>
  )
}

function Fila({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`text-right text-sm ${strong ? 'font-extrabold' : 'font-medium'} text-ink`}>{value}</dd>
    </div>
  )
}
