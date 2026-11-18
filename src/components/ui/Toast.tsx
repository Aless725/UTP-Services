import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Icon from './Icon'

interface ToastApi {
  show: (message: string, icon?: string) => void
}

const ToastContext = createContext<ToastApi>({ show: () => {} })

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; icon: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const show = useCallback((message: string, icon = 'info') => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message, icon })
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

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
            className="animate-toast-in flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-surface"
          >
            <Icon name={toast.icon} size={16} />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
