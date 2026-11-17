import { useEffect, useState } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import { money } from '@/lib/date'
import type { Cuota } from './paymentsData'

interface PaySheetProps {
  cuota: Cuota | null
  onClose: () => void
  onPaid: (cuota: Cuota) => void
}

type Step = 'confirm' | 'processing' | 'done'

/** Pago simulado: confirmar → procesando → listo. */
export default function PaySheet({ cuota, onClose, onPaid }: PaySheetProps) {
  const [step, setStep] = useState<Step>('confirm')
  const [last, setLast] = useState<Cuota | null>(cuota)

  useEffect(() => {
    if (cuota) {
      setLast(cuota)
      setStep('confirm')
    }
  }, [cuota])

  const confirm = () => {
    if (!last) return
    setStep('processing')
    setTimeout(() => {
      setStep('done')
      onPaid(last)
    }, 1400)
  }

  const busy = step === 'processing'

  return (
    <BottomSheet open={!!cuota} onClose={() => !busy && onClose()} title="Pagar cuota">
      {last && step !== 'done' && (
        <div>
          <dl className="divide-y divide-black/5 rounded-card bg-surface px-3.5">
            <Row label="Concepto" value={`Cuota ${last.numero} · ${last.mes}`} />
            <Row label="Método" value="Tarjeta •••• 4242" />
            <Row label="Total a pagar" value={money(last.monto)} strong />
          </dl>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-80"
          >
            {busy ? (
              <>
                <Icon name="progress_activity" size={18} className="animate-spin" />
                Procesando pago…
              </>
            ) : (
              `Confirmar pago · ${money(last.monto)}`
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-muted">Pago de demostración, no se realiza ningún cobro.</p>
        </div>
      )}
      {last && step === 'done' && (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="animate-pop flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Icon name="check" size={30} />
          </span>
          <p className="animate-rise mt-3 text-base font-bold text-ink">¡Pago realizado!</p>
          <p className="mt-1 text-xs text-ink-muted">
            Cuota {last.numero} · {last.mes} — {money(last.monto)}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="pressable mt-4 min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
          >
            Listo
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`text-sm ${strong ? 'font-extrabold' : 'font-medium'} text-ink`}>{value}</dd>
    </div>
  )
}
