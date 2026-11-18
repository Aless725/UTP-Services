import { useCallback, useState } from 'react'
import { codigoToEmail } from '@/features/auth/validation'

export interface ProfileData {
  nombreCompleto: string
  dni: string
  carrera: string
  modalidad: string
  campus: string
}

const BASE: Record<string, ProfileData> = {
  U22265137: {
    nombreCompleto: 'Isabel Kiara Aldara Cruz',
    dni: '74581236',
    carrera: 'Ing. Sistemas e Informática',
    modalidad: 'Presencial',
    campus: 'Lima Centro',
  },
  U22209574: {
    nombreCompleto: 'Mateo Rafael Soto Quispe',
    dni: '72113498',
    carrera: 'Ing. Sistemas e Informática',
    modalidad: 'Presencial',
    campus: 'Lima Centro',
  },
  U22693560: {
    nombreCompleto: 'Rocío Fernanda Paredes Lima',
    dni: '70458812',
    carrera: 'Ing. Sistemas e Informática',
    modalidad: 'Presencial',
    campus: 'Lima Centro',
  },
}

const FALLBACK: ProfileData = {
  nombreCompleto: 'Alumno UTP',
  dni: '00000000',
  carrera: 'Ing. Sistemas e Informática',
  modalidad: 'Presencial',
  campus: 'Lima Centro',
}

const pKey = (c: string) => `utp.perfil.${c}`
const aKey = (c: string) => `utp.avatar.${c}`

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** "Isabel Kiara Aldara Cruz" → "Isabel Aldara" */
export function displayName(full: string): string {
  const t = full.trim().split(/\s+/)
  return t.length >= 3 ? `${t[0]} ${t[t.length - 2]}` : full
}

export const emailOf = codigoToEmail

/** Perfil del alumno con edición local (nombre y DNI) y foto. */
export function useProfile(codigo: string) {
  const [data, setData] = useState<ProfileData>(() => ({
    ...(BASE[codigo] ?? FALLBACK),
    ...(read<Partial<ProfileData>>(pKey(codigo)) ?? {}),
  }))
  const [avatar, setAvatarState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(aKey(codigo))
    } catch {
      return null
    }
  })

  const save = useCallback(
    (patch: Pick<ProfileData, 'nombreCompleto' | 'dni'>) => {
      setData((d) => ({ ...d, ...patch }))
      try {
        localStorage.setItem(pKey(codigo), JSON.stringify(patch))
      } catch {
        /* noop */
      }
    },
    [codigo],
  )

  const setAvatar = useCallback(
    (url: string) => {
      setAvatarState(url)
      try {
        localStorage.setItem(aKey(codigo), url)
      } catch {
        /* noop */
      }
    },
    [codigo],
  )

  return { data, avatar, save, setAvatar }
}

/** Reduce la imagen a 192×192 (recorte centrado) y devuelve un data URL JPEG. */
export function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const size = 192
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('imagen'))
    }
    img.src = url
  })
}

/** Cuentas de demo con tratamiento femenino (para "organizadora", "incluida"). */
const FEMENINO = new Set(['U22265137', 'U22693560'])

/** Devuelve la palabra en femenino o masculino según la cuenta. */
export function genero(codigo: string, f: string, m: string): string {
  return FEMENINO.has(codigo) ? f : m
}
