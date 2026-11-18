import { createContext, useContext } from 'react'

interface ShellState {
  /** Ruta abierta en el panel derecho (null si no hay detalle o es un solo panel). */
  detailPath: string | null
}

export const ShellContext = createContext<ShellState>({ detailPath: null })
export const useShell = () => useContext(ShellContext)
