import { useEffect, useState, type ReactNode } from 'react'
import Icon from '@/components/ui/Icon'
import { useLeaving } from '@/components/ui/Presence'

export interface RedProfesional {
  id: string
  nombre: string
  /** Dominio que se muestra en la barra de direcciones simulada. */
  dominio: string
  logo: ReactNode
  /** Qué datos pide la conexión (texto de demostración). */
  permisos: string[]
}

/**
 * Navegador embebido de demostración: simula la pantalla de autorización de LinkedIn o Bumeran.
 * No pide contraseñas ni envía datos a ninguna red: al permitir solo avisa que se conectó.
 * Se renderiza dentro del marco móvil; úsalo dentro de <Presence>.
 */
export default function ConexionWebview({
  red,
  alumno,
  onPermitir,
  onCerrar,
}: {
  red: RedProfesional
  alumno: string
  onPermitir: () => void
  onCerrar: () => void
}) {
  const leaving = useLeaving()
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  // La "página" tarda un momento en abrir, como un sitio real.
  useEffect(() => {
    const t = setTimeout(() => setCargando(false), 1100)
    return () => clearTimeout(t)
  }, [])

  const permitir = () => {
    setEnviando(true)
    setTimeout(onPermitir, 900)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Conectar con ${red.nombre}`}
      className={`absolute inset-0 z-50 flex flex-col bg-card ${leaving ? 'pointer-events-none animate-sheet-down' : 'animate-sheet-up'}`}
    >
      {/* Barra del navegador embebido */}
      <header className="flex min-h-14 items-center gap-2 border-b border-fill/10 bg-surface px-3">
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <Icon name="close" size={22} />
        </button>
        <div className="flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-card px-3 text-xs font-medium text-ink-muted">
          <Icon name="lock" size={14} className="shrink-0" />
          <span className="truncate">{red.dominio}</span>
        </div>
        <span className="w-11 shrink-0" aria-hidden="true" />
      </header>

      {cargando ? (
        <div role="status" aria-label={`Abriendo ${red.nombre}`} className="flex flex-1 flex-col items-center justify-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center">{red.logo}</span>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-fill/10 border-t-primary" />
          <p className="text-xs text-ink-muted">Abriendo {red.nombre}…</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-8">
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="flex h-12 w-12 items-center justify-center">{red.logo}</span>
            <Icon name="sync_alt" size={20} className="text-ink-faint" />
            {/* Logo UTP+ de la app (public/icons), sobre fondo blanco y recortado para que llene el cuadro. */}
            <span className="relative flex h-12 w-[6.5rem] shrink-0 overflow-hidden rounded-xl bg-white">
              <img
                src="/icons/icon-512.png"
                alt=""
                width={135}
                height={135}
                className="absolute max-w-none"
                style={{ width: 135, height: 135, left: -15, top: -43 }}
              />
            </span>
          </div>
          <h1 className="mt-5 text-center text-lg font-bold leading-snug text-ink">UTP+ Service quiere conectarse con tu cuenta de {red.nombre}</h1>

          <p className="mt-6 text-xs font-bold text-ink">Esta app podrá:</p>
          <ul className="mt-2 divide-y divide-fill/5 rounded-card bg-surface">
            {red.permisos.map((p) => (
              <li key={p} className="flex min-h-11 items-center gap-2.5 px-3.5 py-2 text-xs text-ink">
                <Icon name="check_circle" size={18} filled className="shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-ink-faint">
            Simulación de demostración: no se envían datos a {red.nombre} ni se pide tu contraseña.
          </p>

          <div className="mt-auto space-y-2 pt-6">
            <button
              type="button"
              onClick={permitir}
              disabled={enviando}
              className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-70"
            >
              {enviando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Conectando…
                </>
              ) : (
                `Continuar como ${alumno}`
              )}
            </button>
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              className="pressable min-h-12 w-full rounded-full bg-surface text-sm font-semibold text-ink disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
