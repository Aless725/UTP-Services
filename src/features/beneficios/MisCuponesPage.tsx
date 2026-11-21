import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import Foto from './Foto'
import { BENEFICIOS, useCupones } from './beneficiosData'

export default function MisCuponesPage() {
  const { cupones } = useCupones()
  const items = cupones.flatMap((c) => {
    const b = BENEFICIOS.find((x) => x.id === c.beneficioId)
    return b ? [{ c, b }] : []
  })

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader title="Mis cupones" back="/beneficios" backLabel="Volver a Beneficios+" subtitle="Los cupones que generaste en este dispositivo." />
      <section aria-label="Cupones" className="mt-4 px-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="sell" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">Aún no tienes cupones</p>
            <Link to="/beneficios/catalogo" className="pressable mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
              Explorar el catálogo
            </Link>
          </div>
        ) : (
          <ul className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {items.map(({ c, b }) => (
              <li key={c.codigo}>
                <Link to={`/beneficios/${b.id}/cupon`} className="pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3">
                  <Foto src={b.imagen} icon={b.icono} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">{b.empresa}</span>
                    <span className="block text-xs font-semibold tracking-wide text-primary">{c.codigo}</span>
                    <span className="block text-[0.6875rem] text-ink-muted">Hasta el {b.vigencia}</span>
                  </span>
                  <Icon name="qr_code_2" size={22} className="shrink-0 text-ink-faint" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
