/**
 * Lectura de las respuestas en voz alta: voz natural de Gemini (vía la función "agent") y, si falla, la voz del navegador.
 */

import { supabase } from '@/lib/supabase'

const KEY = 'utp.asistente.voz'

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

/** Las respuestas en voz alta empiezan desactivadas; se activan solas la primera vez que el alumno usa la voz. */
export function readVoicePref(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

/** ¿El alumno ya eligió (o se activó sola por usar la voz)? Si ya eligió, se respeta su decisión. */
export function hasVoicePref(): boolean {
  try {
    return localStorage.getItem(KEY) !== null
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

/* ---------- Voz natural (Gemini) con respaldo a la voz del navegador ---------- */

let audioCtx: AudioContext | null = null
let source: AudioBufferSourceNode | null = null
/** Número de la lectura en curso: sirve para ignorar audios que llegan tarde. */
let run = 0
/** Si la voz de Gemini falla (cuota o red), se usa la del navegador un rato para no gastar solicitudes. */
let cloudBlockedUntil = 0

function context(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioCtx ??= new Ctor()
    return audioCtx
  } catch {
    return null
  }
}

/** iOS solo permite hablar si el audio se "desbloquea" dentro de un toque: se llama al enviar o al empezar a grabar. */
export function unlockSpeech(): void {
  try {
    const ctx = context()
    if (ctx) {
      void ctx.resume()
      const b = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = b
      src.connect(ctx.destination)
      src.start(0)
    }
  } catch {
    /* noop */
  }
  if (!speechSupported()) return
  try {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
  } catch {
    /* noop */
  }
}

/** Quita lo que suena mal al leerlo en voz alta. */
const readable = (t: string) => t.replace(/[*_#`>]/g, '').replace(/s+/g, ' ').trim()

function speakBrowser(text: string, onEnd?: () => void): void {
  if (!speechSupported()) return onEnd?.()
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

/** Audio PCM de 16 bits (little endian) en base64 → AudioBuffer. */
function toBuffer(ctx: AudioContext, b64: string, rate: number): AudioBuffer {
  const bin = atob(b64)
  const n = Math.floor(bin.length / 2)
  const buf = ctx.createBuffer(1, n, rate)
  const ch = buf.getChannelData(0)
  for (let i = 0; i < n; i++) {
    let v = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8)
    if (v >= 0x8000) v -= 0x10000
    ch[i] = v / 0x8000
  }
  return buf
}

async function speakCloud(text: string, id: number, onEnd?: () => void): Promise<boolean> {
  const ctx = context()
  if (!ctx || Date.now() < cloudBlockedUntil) return false
  try {
    const { data, error } = await supabase.functions.invoke('agent', { body: { speak: true, text } })
    if (error || !data?.audio) throw error ?? new Error('sin audio')
    if (id !== run) return true // el alumno ya silenció o pidió otra respuesta
    await ctx.resume()
    const src = ctx.createBufferSource()
    src.buffer = toBuffer(ctx, data.audio as string, Number(data.rate) || 24000)
    src.connect(ctx.destination)
    src.onended = () => {
      if (source === src) source = null
      onEnd?.()
    }
    source = src
    src.start(0)
    return true
  } catch (e) {
    const status = (e as { context?: { status?: number } })?.context?.status
    cloudBlockedUntil = Date.now() + (status === 429 ? 5 * 60_000 : 60_000)
    return false
  }
}

export function speak(text: string, onEnd?: () => void): void {
  stopSpeaking()
  const clean = readable(text)
  if (!clean) return onEnd?.()
  const id = run
  void speakCloud(clean, id, onEnd).then((ok) => {
    if (!ok && id === run) speakBrowser(clean, onEnd)
  })
}

export function stopSpeaking(): void {
  run++
  try {
    source?.stop()
  } catch {
    /* ya había terminado */
  }
  source = null
  if (speechSupported()) window.speechSynthesis.cancel()
}
