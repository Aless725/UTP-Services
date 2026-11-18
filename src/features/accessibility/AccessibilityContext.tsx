import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'claro' | 'oscuro'
export type Cvd = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'

export interface A11ySettings {
  theme: Theme
  /** Porcentaje de tamaño de texto (85–150). */
  fontScale: number
  bold: boolean
  cvd: Cvd
  highContrast: boolean
  reduceTransparency: boolean
  reduceMotion: boolean
}

/** Posiciones permitidas del control deslizante. */
export const FONT_STOPS = [85, 100, 115, 130, 150] as const

const KEY = 'utp.a11y'

function systemReducesMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function defaultSettings(): A11ySettings {
  return {
    theme: 'claro',
    fontScale: 100,
    bold: false,
    cvd: 'none',
    highContrast: false,
    reduceTransparency: false,
    reduceMotion: systemReducesMotion(),
  }
}

function load(): A11ySettings {
  const base = defaultSettings()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const s = JSON.parse(raw) as Partial<A11ySettings>
    return {
      theme: s.theme === 'oscuro' ? 'oscuro' : 'claro',
      fontScale: FONT_STOPS.includes(s.fontScale as never) ? (s.fontScale as number) : 100,
      bold: !!s.bold,
      cvd: (['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).includes(s.cvd as Cvd)
        ? (s.cvd as Cvd)
        : 'none',
      highContrast: !!s.highContrast,
      reduceTransparency: !!s.reduceTransparency,
      reduceMotion: s.reduceMotion ?? base.reduceMotion,
    }
  } catch {
    return base
  }
}

/** Refleja los ajustes en <html> para que los tokens CSS los apliquen. */
function apply(s: A11ySettings) {
  const root = document.documentElement
  root.dataset.theme = s.theme === 'oscuro' ? 'dark' : 'light'
  root.dataset.cvd = s.cvd
  root.dataset.contrast = s.highContrast ? 'high' : 'normal'
  root.dataset.bold = String(s.bold)
  root.dataset.reduceTransparency = String(s.reduceTransparency)
  root.dataset.reduceMotion = String(s.reduceMotion)
  root.style.setProperty('--font-scale', String(s.fontScale / 100))
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', s.theme === 'oscuro' ? '#141416' : '#F2F2F7')
}

interface A11yApi {
  settings: A11ySettings
  update: (patch: Partial<A11ySettings>) => void
  reset: () => void
}

const Ctx = createContext<A11yApi | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(load)

  useLayoutEffect(() => {
    apply(settings)
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      /* noop */
    }
  }, [settings])

  const update = useCallback((patch: Partial<A11ySettings>) => setSettings((s) => ({ ...s, ...patch })), [])
  // "Restablecer" conserva el tema elegido: solo regresa los ajustes de accesibilidad.
  const reset = useCallback(() => setSettings((s) => ({ ...defaultSettings(), theme: s.theme })), [])

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAccessibility(): A11yApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAccessibility debe usarse dentro de <AccessibilityProvider>')
  return ctx
}
