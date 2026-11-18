/**
 * Servicio de autenticación con Supabase Auth.
 * El alumno escribe solo su código; el correo interno es <codigo>@utp.edu.pe.
 *
 * Cuentas demo (contraseña inicial: Utp2026!):
 *   U22265137 (Isabel), U22209574 (Mateo), U22693560 (Rocío)
 *
 * La recuperación de contraseña sigue simulada: los correos @utp.edu.pe de demostración no existen.
 */
import { supabase } from '@/lib/supabase'
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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Lee el perfil del alumno autenticado (las políticas RLS solo devuelven el suyo). */
export async function fetchSession(): Promise<Session | null> {
  const { data, error } = await supabase.from('profiles').select('codigo, nombre').maybeSingle()
  if (error || !data) return null
  return { codigo: data.codigo, nombre: data.nombre }
}

/** Recupera la sesión guardada por Supabase al abrir la app. */
export async function restoreSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session ? fetchSession() : null
}

export async function signIn(usuario: string, password: string): Promise<Session> {
  const { error } = await supabase.auth.signInWithPassword({ email: codigoToEmail(usuario), password })
  if (error) throw new AuthError(error.status === 400 ? 'invalid_credentials' : 'unknown')
  const session = await fetchSession()
  if (!session) {
    await supabase.auth.signOut()
    throw new AuthError('unknown')
  }
  return session
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/** Siempre responde igual, exista o no el usuario (evita enumerar cuentas). */
export async function requestPasswordReset(usuario: string): Promise<{ email: string }> {
  await wait(900)
  return { email: codigoToEmail(usuario) }
}

/** Simulado: en la demo no hay un correo real con el enlace de recuperación. */
export async function updatePassword(usuario: string, _password: string): Promise<void> {
  await wait(900)
  if (!/^U\d{8}$/.test(normalizeCodigo(usuario))) throw new AuthError('unknown')
}
