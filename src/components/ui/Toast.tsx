import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Icon from './Icon'

interface ToastApi {
  show: (message: string, icon?: string) => void
}

const ToastContext = createContext<ToastApi>({ show: () => {} })

export const useToast = () => useContext(ToastContext)

const VISIBLE_MS = 2400
const EXIT_MS = 220

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; icon: string; leaving: boolean } | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const show = useCallback((message: string, icon = 'info') => {
    clear()
    setToast({ id: Date.now(), message, icon, leaving: false })
    timers.current = [
      setTimeout(() => setToast((t) => (t ? { ...t, leaving: true } : t)), VISIBLE_MS),
      setTimeout(() => setToast(null), VISIBLE_MS + EXIT_MS),
    ]
  }, [])

  useEffect(() => clear, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+104px)] z-[60] flex justify-center px-6"
      >
        {toast && (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-surface ${
              toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
            }`}
          >
            <Icon name={toast.icon} size={16} />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
