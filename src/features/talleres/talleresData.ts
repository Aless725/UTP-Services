import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { validarDeclaraciones, type DeclaracionesTaller } from './validation'

export type CategoriaTaller = 'cultural' | 'deportivo'
export const CATEGORIAS_TALLER = {
  cultural: {
    label: 'Talleres Culturales',
    ruta: 'culturales',
    icon: 'theater_comedy',
    descripcion: 'Desarrolla tu creatividad y sensibilidad artística a través de diversas expresiones.',
  },
  deportivo: {
    label: 'Talleres Deportivos',
    ruta: 'deportivos',
    icon: 'sports_volleyball',
    descripcion: 'Fortalece tu cuerpo y mente mientras potencias el trabajo en equipo.',
  },
} as const
export const categoriaDeRuta = (ruta: string | undefined): CategoriaTaller | null =>
  ruta === 'culturales' ? 'cultural' : ruta === 'deportivos' ? 'deportivo' : null

export interface HorarioTaller {
  dia: number
  inicio: string
  fin: string
}
export interface GrupoTaller {
  id: string
  term_id: string
  periodo: string
  campus_id: string
  sede: string
  docente: string
  modalidad: 'presencial' | 'virtual'
  lugar: string
  inicio: string
  fin: string
  inscripcion_abre: string
  inscripcion_cierra: string
  estado: 'abierto' | 'cerrado' | 'finalizado' | 'cancelado'
  capacidad: number
  vacantes: number
  horarios: HorarioTaller[]
}
export interface Taller {
  id: string
  categoria: CategoriaTaller
  titulo: string
  descripcion: string
  terminos: string
  version_terminos: string
  declaracion: string
  grupos: GrupoTaller[]
}
export interface TallerSnapshot {
  taller_id: string
  titulo: string
  categoria: CategoriaTaller
  term_id: string
  periodo: string
  sede: string
  docente: string
  modalidad: 'presencial' | 'virtual'
  lugar: string
  inicio: string
  fin: string
  horarios: HorarioTaller[]
  terminos: string
  declaracion: string
}
export interface InscripcionTaller {
  id: string
  codigo: string
  grupo_id: string
  estado: 'inscrita' | 'baja'
  acepta_terminos: boolean
  acepta_declaracion: boolean
  version_terminos: string
  created_at: string
  actualizado_en: string
  snapshot: TallerSnapshot
}

export const tallerPath = (t: Pick<Taller, 'id' | 'categoria'>) =>
  `/talleres/${CATEGORIAS_TALLER[t.categoria].ruta}/${t.id}`
export const fechaTaller = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00-05:00` : iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Lima',
  })
export const grupoAbierto = (g: GrupoTaller, now = new Date()) =>
  g.estado === 'abierto' && new Date(g.inscripcion_abre) <= now && now < new Date(g.inscripcion_cierra)
export const normalizarBusquedaTaller = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-PE')
    .trim()

export const talleresKeys = {
  catalogo: ['talleres', 'catalogo'] as const,
  mis: (codigo: string) => ['talleres', 'mis', codigo] as const,
  inscripcion: (codigo: string, id: string) => ['talleres', 'inscripcion', codigo, id] as const,
}
type TallerErrorReason =
  | 'unauthorized'
  | 'unavailable'
  | 'closed'
  | 'full'
  | 'restricted'
  | 'invalid_terms'
  | 'invalid_declaration'
  | 'invalid'
  | 'offline'
  | 'other'
export class TallerError extends Error {
  constructor(
    public reason: TallerErrorReason,
    message: string,
  ) {
    super(message)
  }
}
function toTallerError(error: { code?: string; hint?: string | null; message?: string }, status?: number): TallerError {
  if (
    status === 401 ||
    ['PGRST301', 'PGRST302', 'PGRST303'].includes(error.code ?? '') ||
    error.hint === 'unauthorized'
  ) {
    return new TallerError('unauthorized', 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.')
  }
  const reasons: TallerErrorReason[] = [
    'unavailable',
    'closed',
    'full',
    'restricted',
    'invalid_terms',
    'invalid_declaration',
    'invalid',
  ]
  if (error.code === 'P0001' && reasons.includes(error.hint as TallerErrorReason)) {
    return new TallerError(error.hint as TallerErrorReason, error.message ?? 'No se pudo completar la inscripción.')
  }
  return new TallerError(
    !navigator.onLine ? 'offline' : 'other',
    'No pudimos confirmar la operación. Puedes reintentar sin duplicar tu inscripción.',
  )
}
const inscriptionColumns =
  'id, codigo, grupo_id, estado, acepta_terminos, acepta_declaracion, version_terminos, created_at, actualizado_en, snapshot'
const uuidValido = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export function useTalleres() {
  return useQuery({
    queryKey: talleresKeys.catalogo,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }): Promise<Taller[]> => {
      const { data, error, status } = await supabase.rpc('listar_talleres').abortSignal(signal)
      if (error) throw toTallerError(error, status)
      return data as Taller[]
    },
  })
}
export function useTaller(id: string | undefined) {
  const catalogo = useTalleres()
  return {
    ...catalogo,
    data: catalogo.data === undefined ? undefined : (catalogo.data.find((t) => t.id === id) ?? null),
  }
}
export function useMisTalleres() {
  const { session } = useAuth()
  return useQuery({
    queryKey: talleresKeys.mis(session?.codigo ?? ''),
    enabled: !!session,
    staleTime: 30_000,
    refetchOnMount: 'always',
    retry: false,
    queryFn: async ({ signal }): Promise<InscripcionTaller[]> => {
      const all: InscripcionTaller[] = []
      for (let offset = 0; ; offset += 100) {
        const { data, error, status } = await supabase
          .from('workshop_enrollments')
          .select(inscriptionColumns)
          .order('created_at', { ascending: false })
          .order('id')
          .range(offset, offset + 99)
          .abortSignal(signal)
        if (error) throw toTallerError(error, status)
        all.push(...(data as InscripcionTaller[]))
        if (data.length < 100) return all
      }
    },
  })
}
export function useInscripcion(id: string | undefined) {
  const { session } = useAuth()
  const qc = useQueryClient()
  const codigo = session?.codigo ?? ''
  return useQuery({
    queryKey: talleresKeys.inscripcion(codigo, id ?? ''),
    enabled: !!session && !!id,
    staleTime: 15_000,
    refetchOnMount: 'always',
    retry: false,
    initialData: () => qc.getQueryData<InscripcionTaller[]>(talleresKeys.mis(codigo))?.find((i) => i.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(talleresKeys.mis(codigo))?.dataUpdatedAt,
    queryFn: async ({ signal }): Promise<InscripcionTaller | null> => {
      if (!uuidValido(id!)) return null
      const { data, error, status } = await supabase
        .from('workshop_enrollments')
        .select(inscriptionColumns)
        .eq('id', id!)
        .abortSignal(signal)
        .maybeSingle()
      if (error) throw toTallerError(error, status)
      return data as InscripcionTaller | null
    },
  })
}
export function useInscribirTaller() {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const owner = useRef<string | null>(codigo)
  const qc = useQueryClient()
  useEffect(() => {
    owner.current = codigo
    return () => {
      owner.current = null
    }
  }, [codigo])
  return useMutation({
    networkMode: 'always',
    retry: false,
    mutationFn: async (
      values: DeclaracionesTaller & { grupoId: string; version: string },
    ): Promise<InscripcionTaller> => {
      if (!session) throw new TallerError('unauthorized', 'Inicia sesión para inscribirte.')
      if (!navigator.onLine)
        throw new TallerError('offline', 'Sin conexión. Tus selecciones siguen aquí; reintenta cuando vuelva internet.')
      const invalid = validarDeclaraciones(values)
      if (invalid.terminos) throw new TallerError('invalid_terms', invalid.terminos)
      if (invalid.declaracion) throw new TallerError('invalid_declaration', invalid.declaracion)
      const { data, error, status } = await supabase.rpc('inscribir_taller', {
        p_grupo_id: values.grupoId,
        p_version_terminos: values.version,
        p_acepta_terminos: values.terminos,
        p_acepta_declaracion: values.declaracion,
      })
      if (owner.current !== codigo)
        throw new TallerError(
          'unauthorized',
          'La cuenta o la pantalla cambió. Consulta Mis talleres para comprobar el resultado.',
        )
      if (error) throw toTallerError(error, status)
      return data as InscripcionTaller
    },
    onSuccess: (inscripcion) => {
      if (owner.current !== codigo) return
      qc.setQueryData(talleresKeys.inscripcion(codigo, inscripcion.id), inscripcion)
      qc.setQueryData<InscripcionTaller[]>(talleresKeys.mis(codigo), (old) => [
        inscripcion,
        ...(old ?? []).filter((i) => i.id !== inscripcion.id),
      ])
      void qc.invalidateQueries({ queryKey: talleresKeys.mis(codigo) })
      void qc.invalidateQueries({ queryKey: talleresKeys.catalogo })
      void qc.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (error) => {
      if (error instanceof TallerError && ['full', 'closed', 'unavailable', 'invalid_terms'].includes(error.reason)) {
        void qc.invalidateQueries({ queryKey: talleresKeys.catalogo })
      }
    },
  })
}
