import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Guarda en este dispositivo lo último que se consultó (cursos, trámites, notificaciones…)
 * para poder mostrarlo sin conexión. Los datos son del alumno que inició sesión: se borran al cerrar sesión.
 */

const KEY = 'utp.cache'
/** Tope aproximado de lo que se guarda (el almacenamiento del navegador es limitado). */
const MAX_CHARS = 1_500_000
/** Datos con más de este tiempo ya no se muestran sin conexión. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

interface Entry {
  key: QueryKey
  data: unknown
  at: number
}
interface Saved {
  owner: string
  entries: Entry[]
}

let owner: string | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let unsubscribe: (() => void) | undefined

function read(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

export function clearPersistedCache(): void {
  owner = null
  clearTimeout(timer)
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}

function save(qc: QueryClient) {
  if (!owner) return
  const entries: Entry[] = qc
    .getQueryCache()
    .getAll()
    .filter((q) => q.state.status === 'success' && q.state.data !== undefined)
    .map((q) => ({ key: q.queryKey, data: q.state.data, at: q.state.dataUpdatedAt }))
  let json = JSON.stringify({ owner, entries } satisfies Saved)
  // Si no cabe, se conserva lo más reciente.
  if (json.length > MAX_CHARS) {
    const recent = [...entries].sort((a, b) => b.at - a.at)
    while (recent.length && json.length > MAX_CHARS) {
      recent.pop()
      json = JSON.stringify({ owner, entries: recent } satisfies Saved)
    }
  }
  try {
    localStorage.setItem(KEY, json)
  } catch {
    /* sin espacio: se sigue sin guardar */
  }
}

/**
 * Carga lo guardado del alumno y empieza a guardar los cambios.
 * Si lo guardado es de otra persona, se descarta.
 */
export function startPersisting(qc: QueryClient, codigo: string): void {
  const saved = read()
  if (saved && saved.owner !== codigo) clearPersistedCache()
  else if (saved) {
    const now = Date.now()
    for (const e of saved.entries) {
      if (now - e.at > MAX_AGE_MS) continue
      // No pisa datos que ya llegaron de la red.
      if (qc.getQueryData(e.key) === undefined) qc.setQueryData(e.key, e.data, { updatedAt: e.at })
    }
  }
  owner = codigo
  unsubscribe?.()
  unsubscribe = qc.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || event.action.type !== 'success') return
    clearTimeout(timer)
    timer = setTimeout(() => save(qc), 800)
  })
}
