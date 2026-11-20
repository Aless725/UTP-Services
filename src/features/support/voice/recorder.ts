/**
 * Grabación de voz para el asistente.
 * Se graba con MediaRecorder (funciona en Chrome y en Safari de iPhone) y se convierte a WAV mono de 16 kHz,
 * un formato que Gemini acepta siempre, sin depender del códec que use cada navegador.
 */

export const MAX_RECORDING_MS = 30_000
export const MIN_RECORDING_MS = 800
const TARGET_RATE = 16_000

export type MicErrorCode = 'denied' | 'no_device' | 'unsupported' | 'failed'

export class MicError extends Error {
  constructor(public code: MicErrorCode) {
    super(code)
  }
}

/** ¿Este navegador puede grabar? (requiere HTTPS o localhost). */
export function voiceSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus']

export interface RecordingResult {
  /** WAV en base64 listo para enviar. */
  base64: string
  durationMs: number
}

export class VoiceRecorder {
  private stream: MediaStream | null = null
  private recorder: MediaRecorder | null = null
  private ctx: AudioContext | null = null
  private chunks: BlobPart[] = []
  private startedAt = 0
  private raf = 0
  private onLevel: (level: number) => void

  constructor(onLevel: (level: number) => void = () => undefined) {
    this.onLevel = onLevel
  }

  async start(): Promise<void> {
    if (!voiceSupported()) throw new MicError('unsupported')
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      })
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') throw new MicError('denied')
      if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new MicError('no_device')
      throw new MicError('failed')
    }

    const mime = MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m))
    try {
      this.recorder = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined)
    } catch {
      this.release()
      throw new MicError('failed')
    }
    this.chunks = []
    this.recorder.ondataavailable = (e) => e.data.size > 0 && this.chunks.push(e.data)
    this.recorder.start(250)
    this.startedAt = performance.now()

    // Medidor de nivel (solo para la animación).
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      const src = this.ctx.createMediaStreamSource(this.stream)
      const node = this.ctx.createAnalyser()
      node.fftSize = 512
      src.connect(node)
      const data = new Uint8Array(node.fftSize)
      const tick = () => {
        node.getByteTimeDomainData(data)
        let peak = 0
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128))
        this.onLevel(Math.min(1, peak / 64))
        this.raf = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      /* sin medidor: la grabación sigue funcionando */
    }
  }

  get elapsedMs(): number {
    return this.startedAt ? performance.now() - this.startedAt : 0
  }

  /** Detiene la grabación y devuelve el audio convertido a WAV. */
  async stop(): Promise<RecordingResult> {
    const recorder = this.recorder
    if (!recorder) throw new MicError('failed')
    const durationMs = this.elapsedMs
    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' }))
      if (recorder.state !== 'inactive') recorder.stop()
      else resolve(new Blob(this.chunks, { type: recorder.mimeType }))
    })
    this.release()
    try {
      const wav = await toWav(blob)
      return { base64: toBase64(wav), durationMs }
    } catch {
      throw new MicError('failed')
    }
  }

  /** Descarta la grabación. */
  cancel(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.onstop = null
      this.recorder.stop()
    }
    this.release()
  }

  private release(): void {
    cancelAnimationFrame(this.raf)
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    void this.ctx?.close().catch(() => undefined)
    this.ctx = null
    this.recorder = null
    this.startedAt = 0
    this.onLevel(0)
  }
}

/** Decodifica el audio grabado y lo vuelve a muestrear a mono de 16 kHz en WAV de 16 bits. */
async function toWav(blob: Blob): Promise<ArrayBuffer> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer())
    const length = Math.max(1, Math.ceil(decoded.duration * TARGET_RATE))
    const offline = new OfflineAudioContext(1, length, TARGET_RATE)
    const src = offline.createBufferSource()
    src.buffer = decoded
    src.connect(offline.destination)
    src.start()
    const rendered = await offline.startRendering()
    return encodeWav(rendered.getChannelData(0), TARGET_RATE)
  } finally {
    void ctx.close().catch(() => undefined)
  }
}

export function encodeWav(samples: Float32Array, rate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const text = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

export function micErrorText(code: MicErrorCode): string {
  switch (code) {
    case 'denied':
      return 'No tengo permiso para usar el micrófono. Actívalo en los ajustes del navegador o escribe tu mensaje.'
    case 'no_device':
      return 'No encontré un micrófono. Puedes escribir tu mensaje.'
    case 'unsupported':
      return 'Este navegador no permite grabar voz aquí. Puedes escribir tu mensaje.'
    default:
      return 'No pude grabar tu voz. Inténtalo de nuevo o escribe tu mensaje.'
  }
}
