import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { money, shortDate } from '@/lib/date'
import { buildPdf, downloadPdf } from '@/lib/pdf'
import CuotaSheet from './CuotaSheet'
import { CICLO, constanciaNoDeudaPdf, constanciaPagosPdf, cuotas, usePagos, type Cuota } from './paymentsData'
import { useAlumno } from './useAlumno'

const fecha = (iso?: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return shortDate(new Date(y, m - 1, d))
}

/** Historial de pagos y constancias descargables. */
export default function HistorialPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const alumno = useAlumno()
  const { pagadasLista, pendientes, detallePago } = usePagos()
  const [detalle, setDetalle] = useState<Cuota | null>(null)

  const alDia = pendientes.length === 0
  const total = pagadasLista.reduce((s, c) => s + c.monto, 0)

  const constanciaPagos = () => {
    const pagos = pagadasLista.flatMap((c) => {
      const pago = detallePago(c)
      return pago ? [{ c, pago }] : []
    })
    downloadPdf('constancia-de-pagos.pdf', buildPdf(constanciaPagosPdf(pagos, alumno)))
    show('Constancia descargada', 'download')
  }

  const constanciaNoDeuda = () => {
    downloadPdf('constancia-de-no-adeudo.pdf', buildPdf(constanciaNoDeudaPdf(alumno)))
    show('Constancia descargada', 'download')
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <FlowHeader
        title="Historial y constancias"
        back="/pagos"
        backLabel="Volver a Pagos"
        subtitle={`${CICLO} · ${pagadasLista.length} de ${cuotas.length} cuotas pagadas`}
      />

      <section aria-labelledby="pagos" className="mt-4 px-5">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 id="pagos" className="text-sm font-bold text-ink">
            Pagos realizados
          </h2>
          <span className="text-[0.6875rem] font-semibold text-ink-muted">Total {money(total)}</span>
        </div>
        {pagadasLista.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="receipt_long" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">Aún no registras pagos</p>
            <button type="button" onClick={() => navigate('/pagos')} className="pressable mt-1 min-h-11 text-sm font-semibold text-primary">
              Ir a Pagos
            </button>
          </div>
        ) : (
          <ul className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {pagadasLista.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setDetalle(c)}
                  aria-label={`Ver comprobante de la cuota ${c.numero}, ${c.mes}`}
                  className="pressable flex min-h-16 w-full items-center gap-3 px-3.5 py-3 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                    <Icon name="receipt_long" size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">
                      Cuota {c.numero} · {c.mes}
                    </span>
                    <span className="block text-[0.6875rem] text-ink-muted">
                      {fecha(detallePago(c)?.fecha)} · {detallePago(c)?.operacion}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-ink">{money(c.monto)}</span>
                  <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="constancias" className="mt-5 px-5">
        <h2 id="constancias" className="mb-2 px-1 text-sm font-bold text-ink">
          Constancias
        </h2>
        <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          <li>
            <button
              type="button"
              disabled={pagadasLista.length === 0}
              onClick={constanciaPagos}
              className="pressable flex min-h-16 w-full items-center gap-3 px-3.5 py-3 text-left disabled:opacity-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon name="description" size={20} filled />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">Constancia de pagos</span>
                <span className="block text-[0.6875rem] text-ink-muted">Todos tus pagos del ciclo en un documento</span>
              </span>
              <Icon name="download" size={20} className="shrink-0 text-ink-muted" />
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={!alDia}
              onClick={constanciaNoDeuda}
              className="pressable flex min-h-16 w-full items-center gap-3 px-3.5 py-3 text-left disabled:opacity-60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon name="verified" size={20} filled />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">Constancia de no adeudo</span>
                <span className="block text-[0.6875rem] text-ink-muted">
                  {alDia ? 'Estás al día: ya puedes descargarla' : `Disponible cuando pagues ${pendientes.length === 1 ? 'tu cuota pendiente' : `tus ${pendientes.length} cuotas pendientes`}`}
                </span>
              </span>
              <Icon name={alDia ? 'download' : 'lock'} size={20} className="shrink-0 text-ink-muted" />
            </button>
          </li>
        </ul>
        <p className="mt-3 px-1 text-[0.6875rem] leading-relaxed text-ink-faint">Los documentos son de demostración y no tienen validez legal.</p>
      </section>

      <CuotaSheet cuota={detalle} pago={detalle ? detallePago(detalle) : null} onClose={() => setDetalle(null)} />
    </div>
  )
}
