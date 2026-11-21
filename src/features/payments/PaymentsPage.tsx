import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { money, shortDate } from '@/lib/date'
import CuotaSheet from './CuotaSheet'
import PaySheet from './PaySheet'
import { cuotas, usePagos, venceTexto, type Cuota } from './paymentsData'

const fechaCorta = (iso?: string) => {
  if (!iso) return 'hoy'
  const [y, m, d] = iso.split('-').map(Number)
  return shortDate(new Date(y, m - 1, d))
}

export default function PaymentsPage() {
  const { show } = useToast()
  const { pagada, detallePago, registrar, pendientes } = usePagos()
  const [paying, setPaying] = useState<Cuota | null>(null)
  const [detalle, setDetalle] = useState<Cuota | null>(null)
  const siguiente = pendientes[0]
  const total = pendientes.reduce((s, c) => s + c.monto, 0)

  const onPaid = (c: Cuota) => {
    registrar(c)
    show(`Cuota ${c.numero} pagada`, 'check_circle')
  }

  return (
    <>
      <PageHeader title="Pagos" />

      <section aria-label="Monto pendiente" className="mx-5 mt-4 rounded-card bg-card p-4 shadow-card">
        <p className="text-xs text-ink-muted">Monto pendiente</p>
        <p key={total} className="animate-pop mt-1 text-[1.75rem] font-extrabold leading-none text-ink">
          {money(total)}
        </p>
        {siguiente ? (
          <>
            <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-muted">
              <Icon name="schedule" size={14} className="text-primary" />
              {venceTexto(siguiente)}
            </p>
            <button
              type="button"
              onClick={() => setPaying(siguiente)}
              className="pressable mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-white"
            >
              <Icon name="credit_card" size={18} />
              Pagar cuota · {money(siguiente.monto)}
            </button>
          </>
        ) : (
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
            <Icon name="check_circle" size={16} filled /> Estás al día con tus pagos
          </p>
        )}
      </section>

      <section className="mx-5 mt-5" aria-labelledby="cuotas">
        <div className="flex items-baseline justify-between">
          <h2 id="cuotas" className="text-sm font-bold text-ink">
            Mis cuotas
          </h2>
          <span className="text-[0.6875rem] font-semibold text-primary">Ciclo 2026-2</span>
        </div>
        <ul className="stagger mt-3 divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {cuotas.map((c) => {
            const paga = pagada(c)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setDetalle(c)}
                  aria-label={`Ver detalle de la cuota ${c.numero}, ${c.mes}`}
                  className="pressable flex min-h-14 w-full items-center gap-3 px-3.5 py-3 text-left active:bg-surface"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      paga ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'
                    }`}
                  >
                    <Icon name={paga ? 'check' : 'event'} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-ink">
                      Cuota {c.numero} · {c.mes}
                    </span>
                    <span className="block text-[0.625rem] text-ink-muted">
                      {paga ? `Pagada el ${fechaCorta(detallePago(c)?.fecha)}` : venceTexto(c)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs font-bold text-ink">{money(c.monto)}</span>
                    <span className={`block text-[0.625rem] font-semibold ${paga ? 'text-success' : 'text-primary'}`}>
                      {paga ? 'Pagado' : 'Pendiente'}
                    </span>
                  </span>
                  <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
                </button>
              </li>
            )
          })}
        </ul>

        <Link
          to="/pagos/historial"
          className="pressable mt-4 flex min-h-14 items-center gap-3 rounded-card bg-card p-3.5 shadow-card"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon name="receipt_long" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-ink">Historial y constancias</span>
            <span className="block text-[0.625rem] text-ink-muted">Tus pagos, comprobantes y constancias</span>
          </span>
          <Icon name="chevron_right" size={20} className="text-ink-muted" />
        </Link>
      </section>

      <CuotaSheet
        cuota={detalle}
        pago={detalle ? detallePago(detalle) : null}
        onClose={() => setDetalle(null)}
        onPay={(c) => {
          setDetalle(null)
          setPaying(c)
        }}
      />
      <PaySheet cuota={paying} onClose={() => setPaying(null)} onPaid={onPaid} />
    </>
  )
}
