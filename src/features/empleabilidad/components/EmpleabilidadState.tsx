import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useOnline } from '@/lib/online'

export const empleoLink =
  'pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white active:bg-primary-dark'

export default function EmpleabilidadState({
  title,
  description,
  icon = 'work',
  action,
  to,
  onAction,
  secondary,
}: {
  title: string
  description: string
  icon?: string
  action?: string
  to?: string
  onAction?: () => void
  secondary?: ReactNode
}) {
  return (
    <section className="rounded-card bg-card p-5 shadow-card">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="text-lg font-extrabold leading-snug text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
      {action &&
        (to ? (
          <Link to={to} className={`${empleoLink} mt-5 w-full`}>
            {action}
          </Link>
        ) : (
          <Button full className="mt-5" onClick={onAction}>
            {action}
          </Button>
        ))}
      {secondary}
    </section>
  )
}

/** Mismos estados para todos los catálogos y detalles. La caché sigue visible si falla el refresco. */
export function EmpleoQuery({
  query,
  children,
}: {
  query: { data: unknown; isError: boolean; isPending: boolean; refetch: () => unknown }
  children: ReactNode
}) {
  const online = useOnline()
  if (query.data === undefined) {
    if (!online || query.isError)
      return (
        <div role="alert">
          <EmpleabilidadState
            icon={online ? 'cloud_off' : 'wifi_off'}
            title={online ? 'El servicio no responde' : 'Se perdió la conexión'}
            description={
              online
                ? 'No pudimos cargar la información en este momento. Vuelve a intentarlo.'
                : 'Revisa tu conexión a internet. Podrás consultar aquí la información que hayas guardado al visitar esta sección.'
            }
            action="Reintentar"
            onAction={() => {
              void query.refetch()
            }}
            secondary={
              <Link
                to="/soporte"
                className="mt-2 flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
              >
                Contactar soporte
              </Link>
            }
          />
        </div>
      )
    if (query.isPending)
      return (
        <div role="status" aria-label="Cargando empleabilidad" className="space-y-3">
          <p className="text-sm text-ink-muted">Cargando información…</p>
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      )
  }
  return (
    <>
      {(!online || query.isError) && (
        <p role="status" className="mb-3 rounded-card bg-card p-3 text-xs leading-relaxed text-ink-muted shadow-card">
          {online
            ? 'No pudimos actualizar la información. Estás viendo los últimos datos guardados.'
            : 'Sin conexión. Estás viendo los últimos datos guardados; para postular necesitas internet.'}
          {online && (
            <button
              type="button"
              className="ml-1 inline-flex min-h-11 items-center font-semibold text-primary"
              onClick={() => {
                void query.refetch()
              }}
            >
              Reintentar
            </button>
          )}
        </p>
      )}
      {children}
    </>
  )
}
