/**
 * Lectura de las respuestas en voz alta con la síntesis de voz del navegador (sin servicio externo).
 */

const KEY = 'utp.asistente.voz'

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function readVoicePref(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function saveVoicePref(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* noop */
  }
}

/** Elige la mejor voz en español disponible (prioriza Perú, Latinoamérica y luego España). */
function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'))
  const order = ['es-pe', 'es-mx', 'es-us', 'es-co', 'es-ar', 'es-es']
  for (const l of order) {
    const v = voices.find((x) => x.lang.toLowerCase().replace('_', '-') === l)
    if (v) return v
  }
  return voices[0]
}

/** iOS solo permite hablar si la síntesis se "desbloquea" dentro de un toque: se llama al empezar a grabar. */
export function unlockSpeech(): void {
  if (!speechSupported()) return
  try {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
  } catch {
    /* noop */
  }
}

export function speak(text: string, onEnd?: () => void): void {
  if (!speechSupported()) return onEnd?.()
  stopSpeaking()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-PE'
  const v = pickVoice()
  if (v) {
    u.voice = v
    u.lang = v.lang
  }
  u.rate = 1.02
  u.onend = () => onEnd?.()
  u.onerror = () => onEnd?.()
  window.speechSynthesis.speak(u)
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel()
}
