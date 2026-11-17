const CODIGO_RE = /^U\d{8}$/

/** Quita espacios y el dominio institucional si el alumno lo escribió. */
export function normalizeCodigo(raw: string): string {
  return raw.trim().replace(/@utp\.edu\.pe$/i, '').toUpperCase()
}

export function validateCodigo(raw: string): string | null {
  if (!raw.trim()) return 'Ingresa tu usuario.'
  if (/@/.test(raw)) return 'No coloques @utp.edu.pe, solo tu código.'
  if (!CODIGO_RE.test(normalizeCodigo(raw))) return 'Formato inválido. Ejemplo: U22693560.'
  return null
}

export function codigoToEmail(codigo: string): string {
  return `${normalizeCodigo(codigo).toLowerCase()}@utp.edu.pe`
}

export const passwordRules = [
  { id: 'len', label: 'Al menos 8 caracteres', test: (p: string) => p.length >= 8 },
  {
    id: 'case',
    label: 'Una mayúscula y una minúscula',
    test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p),
  },
  {
    id: 'num',
    label: 'Un número y un símbolo',
    test: (p: string) => /\d/.test(p) && /[^A-Za-z0-9]/.test(p),
  },
] as const

export function isPasswordValid(p: string): boolean {
  return passwordRules.every((r) => r.test(p))
}
