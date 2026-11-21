import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { money } from '@/lib/date'

// ───────────────────────── Tipos ─────────────────────────

export type Categoria = 'autogestionable' | 'sae'

export const CATEGORIAS: Record<Categoria, { label: string; corto: string }> = {
  autogestionable: { label: 'Trámites autogestionables', corto: 'Autogestionables' },
  sae: { label: 'Solicitudes SAE en línea', corto: 'SAE en línea' },
}

export type CampoTipo = 'select' | 'text' | 'textarea' | 'curso' | 'check'

export interface Campo {
  key: string
  label: string
  type: CampoTipo
  options?: string[]
  required?: boolean
}

export interface TramiteTipo {
  id: string
  categoria: Categoria
  titulo: string
  descripcion: string
  icono: string
  costo: number
  plazo: string
  modalidad: string
  campos: Campo[]
}

export type Estado = 'en_revision' | 'aprobado' | 'rechazado' | 'cancelada'

export const ESTADOS: Record<Estado, { label: string; tone: 'neutral' | 'virtual' | 'presencial'; icon: string }> = {
  en_revision: { label: 'En revisión', tone: 'neutral', icon: 'hourglass_top' },
  aprobado: { label: 'Aprobado', tone: 'virtual', icon: 'check_circle' },
  rechazado: { label: 'Rechazado', tone: 'presencial', icon: 'cancel' },
  cancelada: { label: 'Cancelada', tone: 'neutral', icon: 'do_not_disturb_on' },
}

export interface EventoSolicitud {
  id: string
  estado: Estado
  nota: string
  fecha: string
}

export interface Solicitud {
  id: string
  codigo: string
  tipoId: string
  estado: Estado
  detalle: Record<string, string>
  creada: string
  actualizada: string
}

export const precio = (costo: number) => (costo > 0 ? money(costo) : 'Gratis')

/** "20 nov 2026 · 21:56" */
export function fechaHora(iso: string): string {
  const d = new Date(iso)
  const fecha = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '')
  const hora = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fecha} · ${hora}`
}

// ───────────────────────── Lecturas ─────────────────────────

const typesKey = ['tramites-tipos'] as const
const listKey = ['tramites-solicitudes'] as const
const itemKey = (codigo: string) => ['tramite-solicitud', codigo] as const

/** Catálogo de trámites, agrupado en autogestionables y SAE. Cambia poco: se guarda 10 minutos. */
export function useTramiteTipos() {
  return useQuery({
    queryKey: typesKey,
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<TramiteTipo[]> => {
      const { data, error } = await supabase
        .from('procedure_types')
        .select('id, categoria, titulo, descripcion, icono, costo, plazo, modalidad, campos')
        .order('orden')
      if (error) throw error
      return (data ?? []).map((t) => ({ ...t, costo: Number(t.costo) })) as TramiteTipo[]
    },
  })
}

interface SolicitudRow {
  id: string
  codigo: string
  tipo_id: string
  estado: Estado
  detalle: Record<string, string>
  created_at: string
  actualizado_en: string
}

const fromRow = (r: SolicitudRow): Solicitud => ({
  id: r.id,
  codigo: r.codigo,
  tipoId: r.tipo_id,
  estado: r.estado,
  detalle: r.detalle ?? {},
  creada: r.created_at,
  actualizada: r.actualizado_en,
})

/** Solicitudes del alumno, de la más reciente a la más antigua. */
export function useSolicitudes() {
  return useQuery({
    queryKey: listKey,
    staleTime: 30_000,
    queryFn: async (): Promise<Solicitud[]> => {
      const { data, error } = await supabase
        .from('procedures')
        .select('id, codigo, tipo_id, estado, detalle, created_at, actualizado_en')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as SolicitudRow[]).map(fromRow)
    },
  })
}

/** Una solicitud con su historial. */
export function useSolicitud(codigo: string | undefined) {
  return useQuery({
    queryKey: itemKey(codigo ?? ''),
    enabled: !!codigo,
    staleTime: 15_000,
    queryFn: async (): Promise<{ solicitud: Solicitud; eventos: EventoSolicitud[] } | null> => {
      const { data, error } = await supabase
        .from('procedures')
        .select('id, codigo, tipo_id, estado, detalle, created_at, actualizado_en')
        .eq('codigo', codigo!)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const ev = await supabase
        .from('procedure_events')
        .select('id, estado, nota, created_at')
        .eq('procedure_id', (data as SolicitudRow).id)
        .order('created_at')
      if (ev.error) throw ev.error
      return {
        solicitud: fromRow(data as SolicitudRow),
        eventos: (ev.data ?? []).map((e) => ({ id: e.id, estado: e.estado as Estado, nota: e.nota, fecha: e.created_at })),
      }
    },
  })
}

// ───────────────────────── Acciones ─────────────────────────

export class TramiteError extends Error {
  constructor(
    public reason: 'duplicate' | 'invalid' | 'offline' | 'other',
    message: string,
  ) {
    super(message)
  }
}

/** Solicitar y cancelar: el servidor valida los campos y las reglas. */
export function useTramiteActions() {
  const qc = useQueryClient()

  const refresh = useCallback(
    (codigo?: string) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: listKey }),
        qc.invalidateQueries({ queryKey: ['notificaciones'] }),
        codigo ? qc.invalidateQueries({ queryKey: itemKey(codigo) }) : Promise.resolve(),
      ]),
    [qc],
  )

  const solicitar = useCallback(
    async (tipoId: string, detalle: Record<string, string>): Promise<string> => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new TramiteError('offline', 'Sin conexión.')
      const { data, error } = await supabase.rpc('solicitar_tramite', { p_tipo: tipoId, p_detalle: detalle })
      if (error) {
        if (error.code === 'P0001') {
          throw new TramiteError(error.hint === 'duplicate' ? 'duplicate' : 'invalid', error.message)
        }
        throw new TramiteError('other', 'No pudimos enviar la solicitud.')
      }
      const codigo = (data as { codigo: string }).codigo
      await refresh(codigo)
      return codigo
    },
    [refresh],
  )

  const cancelar = useCallback(
    async (codigo: string): Promise<void> => {
      const { error } = await supabase.rpc('cancelar_tramite', { p_codigo: codigo })
      if (error) {
        throw new TramiteError(error.code === 'P0001' ? 'invalid' : 'other', error.code === 'P0001' ? error.message : 'No pudimos cancelar la solicitud.')
      }
      await refresh(codigo)
    },
    [refresh],
  )

  return { solicitar, cancelar }
}

/** Valor legible de un campo guardado (por ejemplo, el nombre del curso en vez de su sigla). */
export function valorLegible(campo: Campo, valor: string | undefined, cursos: { id: string; nombre: string }[]): string {
  if (!valor) return '—'
  if (campo.type === 'curso') return cursos.find((c) => c.id === valor)?.nombre ?? valor
  if (campo.type === 'check') return 'Sí'
  return valor
}
