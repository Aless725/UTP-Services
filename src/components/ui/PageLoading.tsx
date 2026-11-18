import Skeleton from './Skeleton'

/** Estado de carga de una pantalla mientras llegan los datos del servidor. */
export default function PageLoading() {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3 px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-40 w-full rounded-card" />
      <Skeleton className="h-24 w-full rounded-card" />
    </div>
  )
}
