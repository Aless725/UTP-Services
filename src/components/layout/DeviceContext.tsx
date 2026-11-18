import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** Preferencia del usuario para previsualizar la app en distintos dispositivos. */
export type DevicePref = 'auto' | 'phone' | 'duo' | 'tablet'
/** Distribución resultante: un panel, dos paneles con bisagra o dos paneles amplios. */
export type LayoutMode = 'phone' | 'dual' | 'wide'

interface DeviceState {
  pref: DevicePref
  setPref: (p: DevicePref) => void
  mode: LayoutMode
  /** Se dibuja dentro de un marco (vista previa en escritorio). */
  framed: boolean
  /** El navegador reporta dos segmentos de pantalla (equipo plegable/doble pantalla real). */
  realDual: boolean
}

const KEY = 'utp.device'
const COMPACT_MAX = 640
const DESKTOP_MIN = 1024

const Ctx = createContext<DeviceState | null>(null)

function readPref(): DevicePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'phone' || v === 'duo' || v === 'tablet' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function useMedia(query: string): boolean {
  const get = () => {
    try {
      return window.matchMedia(query).matches
    } catch {
      return false
    }
  }
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia(query)
    } catch {
      return
    }
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<DevicePref>(readPref)
  const realDual = useMedia('(horizontal-viewport-segments: 2)')
  const isDesktop = useMedia(`(min-width: ${DESKTOP_MIN}px)`)
  const isCompact = useMedia(`(max-width: ${COMPACT_MAX - 0.02}px)`)

  const setPref = (p: DevicePref) => {
    setPrefState(p)
    try {
      localStorage.setItem(KEY, p)
    } catch {
      /* noop */
    }
  }

  const value = useMemo<DeviceState>(() => {
    if (realDual) return { pref, setPref, mode: 'dual', framed: false, realDual }
    if (pref === 'phone') return { pref, setPref, mode: 'phone', framed: !isCompact, realDual }
    if (pref === 'duo') return { pref, setPref, mode: 'dual', framed: !isCompact, realDual }
    if (pref === 'tablet') return { pref, setPref, mode: 'wide', framed: !isCompact, realDual }
    // Automático: celular a pantalla completa, tableta/plegable abierto con dos paneles
    // y, en escritorio, una vista previa de celular dentro de un marco.
    if (isCompact) return { pref, setPref, mode: 'phone', framed: false, realDual }
    if (!isDesktop) return { pref, setPref, mode: 'wide', framed: false, realDual }
    return { pref, setPref, mode: 'phone', framed: true, realDual }
    // setPref es estable en la práctica (solo cambia estado local)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pref, realDual, isDesktop, isCompact])

  useEffect(() => {
    document.documentElement.dataset.layout = value.mode
  }, [value.mode])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDevice(): DeviceState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDevice debe usarse dentro de <DeviceProvider>')
  return ctx
}
