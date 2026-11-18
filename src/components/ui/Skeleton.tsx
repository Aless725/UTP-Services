/** Marcador de carga: parpadeo suave de opacidad (sin degradados ni brillos). */
export default function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse-soft rounded-lg bg-fill/10 ${className}`} />
}
