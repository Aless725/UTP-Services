import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  normalizarPostulacion,
  validarPostulacion,
  validarPrograma,
  type PostulacionValues,
  type ProgramaValues,
} from './validation'

export type OfertaTipo = 'full_time' | 'part_time' | 'practica'
export const TIPOS_OFERTA: Record<OfertaTipo, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  practica: 'Prácticas',
}

export interface Programa {
  id: string
  titulo: string
  descripcion: string
  ciclos: string
  frecuencia: string
  requisitos: string[]
  icono: string
  lema: string
  formato: string
  beneficios: string[]
  nota: string
  url_oficial: string
}

export interface Oferta {
  id: string
  empresa: string
  puesto: string
  tipo: OfertaTipo
  ciudad: string
  ubicacion: string
  area: string
  nivel_academico: string
  carreras: string[]
  descripcion: string
  funciones: string[]
  requisitos: string[]
  beneficios: string[]
  experiencia: string
  publicado_en: string
  cierra_en: string | null
  estado: 'publicada' | 'cerrada' | 'archivada'
}

export type PostulacionEstado = 'enviada' | 'en_revision' | 'seleccionada' | 'no_seleccionada'
export const ESTADOS_POSTULACION: Record<
  PostulacionEstado,
  { label: string; icon: string; tone: string; descripcion: string }
> = {
  enviada: {
    label: 'Enviada',
    icon: 'mark_email_read',
    tone: 'bg-info-soft text-info',
    descripcion: 'Tu postulación quedó registrada. Puedes consultar sus novedades aquí.',
  },
  en_revision: {
    label: 'En revisión',
    icon: 'hourglass_top',
    tone: 'bg-fill/5 text-ink-muted',
    descripcion: 'Tu información está siendo revisada. Mantente atento a tu correo de contacto.',
  },
  seleccionada: {
    label: 'Seleccionada',
    icon: 'check_circle',
    tone: 'bg-success-soft text-success',
    descripcion: 'Tu perfil fue seleccionado para continuar. Revisa tu correo para conocer los siguientes pasos.',
  },
  no_seleccionada: {
    label: 'No seleccionada',
    icon: 'info',
    tone: 'bg-fill/5 text-ink-muted',
    descripcion: 'Esta vez el proceso no continuará con tu perfil. Puedes explorar otras oportunidades.',
  },
}

export interface Postulacion {
  id: string
  codigo: string
  oferta_id: string | null
  programa_id?: string | null
  codigo_estudiante?: string | null
  campus?: string | null
  ciclo?: number | null
  acepta_requisitos?: boolean | null
  nombre_contacto: string
  correo_contacto: string
  puesto_snapshot: string
  empresa_snapshot: string
  estado: PostulacionEstado
  created_at: string
  actualizado_en: string
}

export interface OfertaFiltros {
  q: string
  tipo: string
  ciudad: string
}
const tipos = Object.keys(TIPOS_OFERTA)
export function leerFiltros(params: URLSearchParams): OfertaFiltros {
  const tipo = params.get('tipo') ?? ''
  return {
    q: (params.get('q') ?? '').slice(0, 120),
    tipo: tipos.includes(tipo) ? tipo : '',
    ciudad: (params.get('ciudad') ?? '').slice(0, 80),
  }
}

const normalizarBusqueda = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-PE')
export function filtrarOfertas(ofertas: Oferta[], filtros: OfertaFiltros, ahora = new Date()): Oferta[] {
  const q = normalizarBusqueda(filtros.q.trim())
  return ofertas.filter(
    (o) =>
      ofertaVigente(o, ahora) &&
      (!filtros.tipo || o.tipo === filtros.tipo) &&
      (!filtros.ciudad || o.ciudad === filtros.ciudad) &&
      (!q ||
        normalizarBusqueda(
          [o.empresa, o.puesto, o.descripcion, o.area, o.ciudad, ...o.requisitos, ...o.carreras].join(' '),
        ).includes(q)),
  )
}

export const ofertaVigente = (o: Oferta, ahora = new Date()) =>
  o.estado === 'publicada' && new Date(o.publicado_en) <= ahora && (!o.cierra_en || new Date(o.cierra_en) > ahora)

export const fechaEmpleo = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Lima',
  })

const ofertaColumns =
  'id, empresa, puesto, tipo, ciudad, ubicacion, area, nivel_academico, carreras, descripcion, funciones, requisitos, beneficios, experiencia, publicado_en, cierra_en, estado'
const postulacionColumns =
  'id, codigo, oferta_id, programa_id, codigo_estudiante, campus, ciclo, acepta_requisitos, nombre_contacto, correo_contacto, puesto_snapshot, empresa_snapshot, estado, created_at, actualizado_en'
const uuidValido = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export const empleoKeys = {
  programas: ['empleabilidad', 'programas', 2] as const,
  ofertas: ['empleabilidad', 'ofertas'] as const,
  oferta: (id: string) => ['empleabilidad', 'oferta', id] as const,
  postulaciones: (codigo: string) => ['empleabilidad', 'postulaciones', codigo] as const,
  postulacion: (codigo: string, id: string) => ['empleabilidad', 'postulacion', codigo, id] as const,
}

export function useProgramas() {
  return useQuery({
    queryKey: empleoKeys.programas,
    staleTime: 10 * 60_000,
    retry: 1,
    queryFn: async ({ signal }): Promise<Programa[]> => {
      const { data, error } = await supabase
        .from('employment_programs')
        .select(
          'id, titulo, descripcion, ciclos, frecuencia, requisitos, icono, lema, formato, beneficios, nota, url_oficial',
        )
        .order('orden')
        .abortSignal(signal)
      if (error) throw error
      return data as Programa[]
    },
  })
}

/** Un catálogo compartido mantiene lista y detalle sincronizados, también sin conexión. */
export function usePrograma(id: string | undefined) {
  const query = useProgramas()
  return { ...query, data: query.data === undefined ? undefined : (query.data.find((p) => p.id === id) ?? null) }
}

/** Catálogo compartido: filtros locales sobre todas las páginas, incluida la copia sin conexión. */
export function useOfertas() {
  return useQuery({
    queryKey: empleoKeys.ofertas,
    staleTime: 60_000,
    retry: 1,
    queryFn: async ({ signal }): Promise<Oferta[]> => {
      const all: Oferta[] = []
      const pageSize = 100
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabase
          .from('job_offers')
          .select(ofertaColumns)
          .order('publicado_en', { ascending: false })
          .order('id')
          .range(offset, offset + pageSize - 1)
          .abortSignal(signal)
        if (error) throw error
        all.push(...(data as Oferta[]))
        if (data.length < pageSize) return all
      }
    },
  })
}

export function useOferta(id: string | undefined) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: empleoKeys.oferta(id ?? ''),
    enabled: !!id,
    staleTime: 30_000,
    retry: 1,
    initialData: () => qc.getQueryData<Oferta[]>(empleoKeys.ofertas)?.find((o) => o.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(empleoKeys.ofertas)?.dataUpdatedAt,
    queryFn: async ({ signal }): Promise<Oferta | null> => {
      const { data, error } = await supabase
        .from('job_offers')
        .select(ofertaColumns)
        .eq('id', id!)
        .abortSignal(signal)
        .maybeSingle()
      if (error) throw error
      return data as Oferta | null
    },
  })
}

export function useMisPostulaciones() {
  const { session } = useAuth()
  return useQuery({
    queryKey: empleoKeys.postulaciones(session?.codigo ?? ''),
    enabled: !!session,
    staleTime: 30_000,
    // Al recargar puede existir una copia guardada justo antes del último envío.
    refetchOnMount: 'always',
    retry: 1,
    queryFn: async ({ signal }): Promise<Postulacion[]> => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(postulacionColumns)
        .order('created_at', { ascending: false })
        .abortSignal(signal)
      if (error) throw error
      return data as Postulacion[]
    },
  })
}

export function usePostulacion(id: string | undefined) {
  const { session } = useAuth()
  const qc = useQueryClient()
  const codigo = session?.codigo ?? ''
  return useQuery({
    queryKey: empleoKeys.postulacion(codigo, id ?? ''),
    enabled: !!session && !!id,
    staleTime: 15_000,
    refetchOnMount: 'always',
    retry: 1,
    initialData: () => qc.getQueryData<Postulacion[]>(empleoKeys.postulaciones(codigo))?.find((p) => p.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(empleoKeys.postulaciones(codigo))?.dataUpdatedAt,
    queryFn: async ({ signal }): Promise<Postulacion | null> => {
      if (!uuidValido(id!)) return null
      const { data, error } = await supabase
        .from('job_applications')
        .select(postulacionColumns)
        .eq('id', id!)
        .abortSignal(signal)
        .maybeSingle()
      if (error) throw error
      return data as Postulacion | null
    },
  })
}

type EmpleoErrorReason =
  | 'offline'
  | 'unauthorized'
  | 'unavailable'
  | 'invalid_name'
  | 'invalid_email'
  | 'invalid_campus'
  | 'invalid_cycle'
  | 'invalid_consent'
  | 'other'
export class EmpleoError extends Error {
  constructor(
    public reason: EmpleoErrorReason,
    message: string,
  ) {
    super(message)
  }
}

type OfertaInput = PostulacionValues & { ofertaId: string }
type ProgramaInput = ProgramaValues & { programaId: string }

function useEnviarPostulacion<T extends OfertaInput | ProgramaInput>() {
  const qc = useQueryClient()
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const owner = useRef<string | null>(codigo)
  useEffect(() => {
    owner.current = codigo
    return () => {
      owner.current = null
    }
  }, [codigo])
  return useMutation({
    // No se encolan ni reenvían postulaciones al recuperar la conexión.
    networkMode: 'always',
    retry: false,
    mutationFn: async (values: T): Promise<Postulacion> => {
      if (!session) throw new EmpleoError('unauthorized', 'Inicia sesión para postular.')
      if (!navigator.onLine)
        throw new EmpleoError('offline', 'Revisa tu conexión y vuelve a intentarlo. Tus datos siguen aquí.')
      const errors = validarPostulacion(values)
      if (errors.nombre) throw new EmpleoError('invalid_name', errors.nombre)
      if (errors.correo) throw new EmpleoError('invalid_email', errors.correo)
      const programa = 'programaId' in values ? (values as ProgramaInput) : null
      if (programa) {
        const invalid = validarPrograma(programa)
        if (invalid.correo) throw new EmpleoError('invalid_email', invalid.correo)
        if (invalid.campus) throw new EmpleoError('invalid_campus', invalid.campus)
        if (invalid.ciclo) throw new EmpleoError('invalid_cycle', invalid.ciclo)
        if (invalid.acepta) throw new EmpleoError('invalid_consent', invalid.acepta)
      }
      const clean = normalizarPostulacion(values)
      const contacto = {
        p_nombre_contacto: clean.nombre,
        p_correo_contacto: clean.correo,
      }
      const { data, error } = programa
        ? await supabase.rpc('postular_programa', {
            ...contacto,
            p_programa_id: programa.programaId,
            p_campus: programa.campus.trim().replace(/\s+/g, ' '),
            p_ciclo: Number(programa.ciclo),
            p_acepta_requisitos: programa.acepta,
          })
        : await supabase.rpc('postular_oferta', { ...contacto, p_oferta_id: (values as OfertaInput).ofertaId })
      // Una respuesta tardía no debe repoblar la caché ni navegar después de salir del flujo o de la cuenta.
      if (owner.current !== codigo)
        throw new EmpleoError(
          'unauthorized',
          'La sesión o la pantalla ha cambiado. Consulta Mis postulaciones para comprobar el envío.',
        )
      if (error) {
        const reasons: EmpleoErrorReason[] = [
          'unauthorized',
          'unavailable',
          'invalid_name',
          'invalid_email',
          'invalid_campus',
          'invalid_cycle',
          'invalid_consent',
        ]
        if (error.code === 'P0001' && reasons.includes(error.hint as EmpleoErrorReason)) {
          throw new EmpleoError(error.hint as EmpleoErrorReason, error.message)
        }
        throw new EmpleoError(
          error.code === 'PGRST301' || error.code === '42501' ? 'unauthorized' : 'other',
          'No pudimos confirmar el envío. Tus datos se conservan; puedes reintentar sin duplicar tu postulación.',
        )
      }
      return data as Postulacion
    },
    onSuccess: (p) => {
      if (owner.current !== codigo) return
      qc.setQueryData(empleoKeys.postulacion(codigo, p.id), p)
      qc.setQueryData<Postulacion[]>(empleoKeys.postulaciones(codigo), (old) => [
        p,
        ...(old ?? []).filter((item) => item.id !== p.id),
      ])
      void qc.invalidateQueries({ queryKey: empleoKeys.postulaciones(codigo) })
      void qc.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (error, values) => {
      if (error instanceof EmpleoError && error.reason === 'unavailable') {
        if ('ofertaId' in values) {
          void qc.invalidateQueries({ queryKey: empleoKeys.ofertas })
          void qc.invalidateQueries({ queryKey: empleoKeys.oferta(values.ofertaId) })
        } else void qc.invalidateQueries({ queryKey: empleoKeys.programas })
      }
    },
  })
}

export const usePostularOferta = () => useEnviarPostulacion<OfertaInput>()
export const usePostularPrograma = () => useEnviarPostulacion<ProgramaInput>()
