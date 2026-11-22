import { useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/AuthContext'
import { useOnline } from '@/lib/online'
import { TallerError } from '../talleresData'

export const tallerLink =
  'pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white active:bg-primary-dark'

/** Solo un error de autenticación confirmado lleva a renovar la sesión; una caída de red no lo hace. */
export function useTallerSession(error: unknown) {
  const { signOut } = useAuth()
  const { pathname, search } = useLocation()
  // En dos paneles useLocation puede representar el catálogo simulado del panel izquierdo.
  const destination = typeof window === 'undefined' ? pathname + search : window.location.pathname + window.location.search
  const navigate = useNavigate()
  const redirected = useRef(false)
  useEffect(() => {
    if (error instanceof TallerError && error.reason === 'unauthorized' && !redirected.current) {
      redirected.current = true
      signOut()
      navigate(`/sesion-expirada?volver=${encodeURIComponent(destination)}`, { replace: true })
    }
  }, [error, signOut, navigate, destination])
}

export default function TalleresState({
  title,
  description,
  icon = 'event_note',
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
          <Link className={`${tallerLink} mt-5 w-full`} to={to}>
            {action}
          </Link>
        ) : (
          <Button type="button" full className="mt-5" onClick={onAction}>
            {action}
          </Button>
        ))}
      {secondary}
    </section>
  )
}

export function TalleresQuery({
  query,
  children,
}: {
  query: { data: unknown; error: unknown; isError: boolean; isPending: boolean; refetch: () => unknown }
  children: ReactNode
}) {
  const online = useOnline()
  useTallerSession(query.error)
  if (query.error instanceof TallerError && query.error.reason === 'unauthorized') {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Recuperando el acceso…
      </p>
    )
  }
  if (query.data === undefined) {
    if (!online || query.isError)
      return (
        <div role="alert">
          <TalleresState
            title={online ? 'El servicio no responde' : 'Sin conexión'}
            icon={online ? 'cloud_off' : 'wifi_off'}
            description={
              online
                ? 'No pudimos cargar los talleres en este momento. Vuelve a intentarlo.'
                : 'Revisa tu conexión. La información que consultaste antes estará disponible si se guardó en este dispositivo.'
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
        <div role="status" aria-label="Cargando talleres" className="space-y-3">
          <p className="text-sm text-ink-muted">Cargando talleres…</p>
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      )
  }
  return (
    <>
      {(!online || query.isError) && (
        <div role="status" className="mb-3 rounded-card bg-card p-3 text-xs leading-relaxed text-ink-muted shadow-card">
          {online
            ? 'No pudimos actualizar la información. Estás viendo los últimos datos guardados.'
            : 'Sin conexión. Estás viendo los últimos datos guardados; las vacantes pueden cambiar. Para inscribirte necesitas internet.'}
          {online && (
            <button
              type="button"
              onClick={() => {
                void query.refetch()
              }}
              className="ml-1 inline-flex min-h-11 items-center font-semibold text-primary"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
      {children}
    </>
  )
}
