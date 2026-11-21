import { Navigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import QrCode from '@/components/ui/QrCode'
import { useToast } from '@/components/ui/Toast'
import { fechaHora } from '@/features/tramites/tramitesData'
import { BENEFICIOS, useCupones } from './beneficiosData'

export default function CuponGeneradoPage() {
  const { id } = useParams<{ id: string }>()
  const { de } = useCupones()
  const { show } = useToast()
  const b = BENEFICIOS.find((x) => x.id === id)
  const cupon = b ? de(b.id) : undefined
  if (!b) return <Navigate to="/beneficios/catalogo" replace />
  if (!cupon) return <Navigate to={`/beneficios/${b.id}`} replace />

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cupon.codigo)
      show('Código copiado', 'content_copy')
    } catch {
      show('No se pudo copiar', 'error')
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <FlowHeader title="Tu cupón" back={`/beneficios/${b.id}`} backLabel="Volver al beneficio" subtitle={`${b.empresa} · ${b.descuento}`} />

      <div className="mt-4 px-5">
        <div className="flex flex-col items-center rounded-card bg-card px-5 py-6 text-center shadow-card">
          <QrCode value={`${cupon.codigo}|UTP+`} size={176} label={`Código QR del cupón ${cupon.codigo}`} />
          <p className="mt-4 text-[0.6875rem] text-ink-muted">Código promocional</p>
          <button
            type="button"
            onClick={copiar}
            aria-label={`Copiar código ${cupon.codigo}`}
            className="pressable mt-1 flex min-h-11 items-center gap-2 rounded-full bg-fill/5 px-4 text-base font-bold tracking-wider text-ink"
          >
            {cupon.codigo}
            <Icon name="content_copy" size={16} className="text-ink-muted" />
          </button>
          <p className="mt-3 text-[0.6875rem] text-ink-muted">
            Válido hasta el {b.vigencia} · Generado el {fechaHora(cupon.generado)}
          </p>
        </div>
      </div>

      <section aria-labelledby="como" className="mt-5 px-5">
        <h2 id="como" className="mb-2 px-1 text-sm font-bold text-ink">
          Cómo usarlo
        </h2>
        <ol className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {b.pasos.map((p, i) => (
            <li key={p} className="flex gap-3 px-3.5 py-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.6875rem] font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-xs leading-relaxed text-ink">{p}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
