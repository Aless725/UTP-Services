import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './features/auth/AuthContext'
import { AccessibilityProvider } from './features/accessibility/AccessibilityContext'
import './index.css'

// Retira únicamente el almacenamiento del antiguo modo mock local.
try {
  for (const key of ['utp.demo.auth', 'utp.demo.cache', 'utp.demo.sesion', 'utp.empleabilidad.demo.v1']) {
    localStorage.removeItem(key)
  }
} catch { /* El navegador puede bloquear el almacenamiento local. */ }

const queryClient = new QueryClient()

// Permite abrir la app sin conexión (solo en la versión publicada).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AccessibilityProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
