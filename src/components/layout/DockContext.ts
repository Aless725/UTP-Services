import { createContext } from 'react'

/**
 * Elemento donde una pantalla puede "teletransportar" su propia barra inferior
 * (por ejemplo, el cuadro de mensaje del asistente en lugar de la navegación).
 * Es null cuando la pantalla no reemplaza la barra.
 */
export const DockContext = createContext<HTMLElement | null>(null)
