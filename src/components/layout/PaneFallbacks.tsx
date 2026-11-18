import Icon from '@/components/ui/Icon'
import Logo from '@/components/ui/Logo'

/** Panel derecho vacío: invita a elegir algo en el panel izquierdo. */
export function EmptyDetail() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon name="dock_to_right" size={28} />
      </span>
      <p className="mt-4 text-sm font-bold text-ink">Elige algo en el panel izquierdo</p>
      <p className="mt-1 max-w-[16rem] text-xs text-ink-muted">
        Aquí verás el detalle sin perder tu lista.
      </p>
    </div>
  )
}

/** Panel derecho de las pantallas de acceso en modo de dos paneles. */
export function BrandPane() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <Logo />
      <p className="mt-6 max-w-[18rem] text-sm text-ink-muted">
        Tus servicios universitarios, en un solo lugar.
      </p>
    </div>
  )
}
