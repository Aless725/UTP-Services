import type { Conversation, Msg } from './chatTypes'

/**
 * Historial de chats del asistente. Se guarda solo en este dispositivo (localStorage), separado por
 * código de alumno, con un máximo de conversaciones para no crecer sin fin.
 */
const MAX_CHATS = 30
const keyOf = (codigo: string) => `utp.asistente.historial.${codigo}`
const PREF_KEY = 'utp.asistente.guardar'

export function readSaveHistoryPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== 'off'
  } catch {
    return true
  }
}

export function saveSaveHistoryPref(on: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, on ? 'on' : 'off')
  } catch {
    /* sin almacenamiento */
  }
}

export function loadHistory(codigo: string): Conversation[] {
  if (!codigo) return []
  try {
    const raw = localStorage.getItem(keyOf(codigo))
    const list = raw ? (JSON.parse(raw) as Conversation[]) : []
    return Array.isArray(list) ? list.sort((a, b) => b.updatedAt - a.updatedAt) : []
  } catch {
    return []
  }
}

const write = (codigo: string, list: Conversation[]) => {
  try {
    localStorage.setItem(keyOf(codigo), JSON.stringify(list.slice(0, MAX_CHATS)))
  } catch {
    /* sin almacenamiento o sin espacio */
  }
}

/** Título de la conversación: el primer mensaje del alumno. */
export const titleOf = (msgs: Msg[]) => {
  const first = msgs.find((m) => m.role === 'user')?.text.trim() ?? 'Conversación'
  return first.length > 60 ? `${first.slice(0, 57)}…` : first
}

/** Guarda o actualiza una conversación (las vacías no se guardan). */
export function saveConversation(codigo: string, id: string, msgs: Msg[]): void {
  if (!codigo || msgs.length === 0 || !msgs.some((m) => m.role === 'user')) return
  const rest = loadHistory(codigo).filter((c) => c.id !== id)
  write(codigo, [{ id, title: titleOf(msgs), updatedAt: Date.now(), msgs }, ...rest])
}

export function deleteConversation(codigo: string, id: string): void {
  write(
    codigo,
    loadHistory(codigo).filter((c) => c.id !== id),
  )
}

export function clearHistory(codigo: string): void {
  try {
    localStorage.removeItem(keyOf(codigo))
  } catch {
    /* sin almacenamiento */
  }
}

/** Una acción que quedó pendiente en un chat guardado ya no se puede confirmar: se marca como vencida. */
export const reopen = (msgs: Msg[]): Msg[] =>
  msgs.map((m) => (m.pstate === 'pending' || m.pstate === 'running' ? { ...m, pstate: 'expired' as const } : m))

/** "Hoy 14:05", "Ayer" o "12 nov". */
export function whenLabel(ts: number, now = new Date()): string {
  const d = new Date(ts)
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((start(now) - start(d)) / 86_400_000)
  if (days === 0) return `Hoy ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  if (days === 1) return 'Ayer'
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '')
}
