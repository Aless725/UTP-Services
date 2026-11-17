/**
 * Servicio de autenticación (DEMO).
 * Implementación local con cuentas de demostración; la interfaz pública está
 * pensada para sustituirse por Supabase Auth sin tocar las pantallas.
 *
 * Cuentas demo (contraseña inicial: Utp2026!):
 *   U22265137 (Isabel), U22209574 (Mateo), U22693560 (Rocío)
 */
import { codigoToEmail, normalizeCodigo } from './validation'

export interface Session {
  codigo: string
  nombre: string
}

export class AuthError extends Error {
  constructor(public code: 'invalid_credentials' | 'unknown') {
    super(code)
  }
}

const DEMO_USERS: Record<string, { nombre: string; password: string }> = {
  U22265137: { nombre: 'Isabel', password: 'Utp2026!' },
  U22209574: { nombre: 'Mateo', password: 'Utp2026!' },
  U22693560: { nombre: 'Rocío', password: 'Utp2026!' },
}

const SESSION_KEY = 'utp.session'
const PASSWORDS_KEY = 'utp.demo.passwords'
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function readPasswords(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PASSWORDS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export async function signIn(usuario: string, password: string): Promise<Session> {
  await wait(1300)
  const codigo = normalizeCodigo(usuario)
  const user = DEMO_USERS[codigo]
  const current = readPasswords()[codigo] ?? user?.password
  if (!user || current !== password) throw new AuthError('invalid_credentials')
  const session: Session = { codigo, nombre: user.nombre }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* sin almacenamiento: la sesión vive solo en memoria del contexto */
  }
  return session
}

export function signOut(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* noop */
  }
}

/** Siempre responde igual, exista o no el usuario (evita enumerar cuentas). */
export async function requestPasswordReset(usuario: string): Promise<{ email: string }> {
  await wait(900)
  return { email: codigoToEmail(usuario) }
}

export async function updatePassword(usuario: string, password: string): Promise<void> {
  await wait(900)
  const codigo = normalizeCodigo(usuario)
  if (!DEMO_USERS[codigo]) throw new AuthError('unknown')
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify({ ...readPasswords(), [codigo]: password }))
  } catch {
    /* noop */
  }
}
