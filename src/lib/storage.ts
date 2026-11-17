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
