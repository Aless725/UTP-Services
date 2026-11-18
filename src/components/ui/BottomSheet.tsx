import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import Icon from './Icon'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Tarjeta flotante sobre la barra inferior (menú "Más de UTP+"). */
  floating?: boolean
}

const CLOSE_DISTANCE = 90
const CLOSE_VELOCITY = 0.6

/**
 * Hoja modal con animación de entrada y salida.
 * Se cierra con el fondo, la X, Esc o arrastrando el encabezado hacia abajo.
 */
export default function BottomSheet({ open, onClose, title, children, floating }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [leaving, setLeaving] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLElement>(null)
  const skipExit = useRef(false)
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null)

  useEffect(() => {
    if (open) {
      skipExit.current = false
      setMounted(true)
      setLeaving(false)
      return
    }
    if (!mounted) return
    if (skipExit.current) {
      // Ya salió arrastrando: no repetir la animación de salida.
      setMounted(false)
      return
    }
    setLeaving(true)
    const t = setTimeout(() => {
      setMounted(false)
      setLeaving(false)
    }, 220)
    return () => clearTimeout(t)
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // ── Arrastre: solo transform, sin re-render por cada movimiento ──
  const onDown = (e: ReactPointerEvent) => {
    if (floating) return
    drag.current = { y: e.clientY, t: performance.now(), dy: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    if (sheet.current) sheet.current.style.transition = 'none'
  }
  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current
    if (!d || !sheet.current) return
    d.dy = Math.max(0, e.clientY - d.y)
    sheet.current.style.transform = `translate3d(0, ${d.dy}px, 0)`
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    const el = sheet.current
    if (!d || !el) return
    const velocity = d.dy / Math.max(1, performance.now() - d.t)
    el.style.transition = 'transform 0.28s cubic-bezier(0.25, 0.8, 0.25, 1)'
    if (d.dy > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
      skipExit.current = true
      el.style.transform = 'translate3d(0, 110%, 0)'
      setTimeout(onClose, 180)
    } else {
      el.style.transform = 'translate3d(0, 0, 0)'
    }
  }

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-40">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/35 ${leaving ? 'animate-fade-out' : 'animate-fade-in'}`}
      />
      <section
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute z-10 bg-card shadow-float ${
          floating
            ? 'inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+96px)] rounded-[22px]'
            : 'inset-x-0 bottom-0 rounded-t-[28px] pb-[calc(env(safe-area-inset-bottom)+20px)]'
        } ${leaving ? 'animate-sheet-down' : 'animate-sheet-up'}`}
      >
        <header
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={`px-5 pb-2 ${floating ? 'pt-5' : 'touch-none pt-2'}`}
        >
          {!floating && <div aria-hidden="true" className="mx-auto mb-2 h-1 w-9 rounded-full bg-fill/20" />}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            <button
              ref={closeBtn}
              type="button"
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Cerrar"
              className="pressable flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </header>
        <div className="px-5 pb-1">{children}</div>
      </section>
    </div>
  )
}
