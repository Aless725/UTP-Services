const ONBOARDING_KEY = 'utp.onboarding.visto'

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

const CODIGO_KEY = 'utp.login.codigo'

/** Código de alumno recordado en este dispositivo (nunca la contraseña). */
export function getRememberedCode(): string {
  try {
    return localStorage.getItem(CODIGO_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setRememberedCode(codigo: string | null): void {
  try {
    if (codigo) localStorage.setItem(CODIGO_KEY, codigo)
    else localStorage.removeItem(CODIGO_KEY)
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}
