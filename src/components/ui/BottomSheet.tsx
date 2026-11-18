import { useEffect, useRef, useState, type ReactNode } from 'react'
import Icon from './Icon'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Tarjeta flotante sobre la barra inferior (menú "Más de UTP+"). */
  floating?: boolean
}

/**
 * Hoja modal con animación de entrada y salida. Se cierra con el fondo, la X o Esc.
 */
export default function BottomSheet({ open, onClose, title, children, floating }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [leaving, setLeaving] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setLeaving(false)
      return
    }
    if (!mounted) return
    setLeaving(true)
    const t = setTimeout(() => {
      setMounted(false)
      setLeaving(false)
    }, 200)
    return () => clearTimeout(t)
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-40">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/35 ${leaving ? 'animate-fade-out' : 'animate-fade-in'}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute z-10 bg-card shadow-float ${
          floating
            ? 'inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+96px)] rounded-[22px]'
            : 'inset-x-0 bottom-0 rounded-t-[28px] pb-[calc(env(safe-area-inset-bottom)+20px)]'
        } ${leaving ? 'animate-sheet-down' : 'animate-sheet-up'}`}
      >
        <header className="flex items-center justify-between px-5 pb-2 pt-5">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="pressable flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="px-5 pb-1">{children}</div>
      </section>
    </div>
  )
}
