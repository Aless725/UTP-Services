import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { diffDays, startOfDay } from '@/lib/date'

export type NotifTipo = 'reserva' | 'tarea' | 'nota' | 'anuncio' | 'grupo' | 'sistema'

/** Ícono y color de cada tipo (solo los tonos del sistema de diseño). */
export const NOTIF_META: Record<NotifTipo, { icon: string; tone: string; label: string }> = {
  reserva: { icon: 'event_available', tone: 'bg-primary-soft text-primary', label: 'Reserva' },
  tarea: { icon: 'assignment', tone: 'bg-primary-soft text-primary', label: 'Tarea' },
  nota: { icon: 'grade', tone: 'bg-success-soft text-success', label: 'Nota' },
  anuncio: { icon: 'campaign', tone: 'bg-success-soft text-success', label: 'Anuncio' },
  grupo: { icon: 'group', tone: 'bg-fill/5 text-ink', label: 'Grupo' },
  sistema: { icon: 'info', tone: 'bg-fill/5 text-ink', label: 'Aviso' },
}

export interface AppNotification {
  id: string
  tipo: NotifTipo
  titulo: string
  cuerpo: string
  /** Pantalla a la que lleva al tocarla. */
  ruta: string | null
  leida: boolean
  /** ISO */
  creada: string
}

interface Row {
  id: string
  tipo: NotifTipo
  titulo: string
  cuerpo: string
  ruta: string | null
  leida: boolean
  created_at: string
}

const key = ['notificaciones'] as const

/** Últimas notificaciones del alumno. Se actualiza al volver a la app y cada minuto. */
export function useNotifications() {
  return useQuery({
    queryKey: key,
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, tipo, titulo, cuerpo, ruta, leida, created_at')
        .order('created_at', { ascending: false })
        .limit(60)
      if (error) throw error
      return (data as Row[]).map((r) => ({
        id: r.id,
        tipo: r.tipo,
        titulo: r.titulo,
        cuerpo: r.cuerpo,
        ruta: r.ruta,
        leida: r.leida,
        creada: r.created_at,
      }))
    },
  })
}

/** Cantidad de notificaciones sin leer (comparte la consulta de la lista). */
export function useUnreadCount(): number {
  const { data } = useNotifications()
  return data?.filter((n) => !n.leida).length ?? 0
}

/** Marca como leídas: se ve al instante y, si falla, se vuelve a leer lo real. */
export function useMarkRead() {
  const qc = useQueryClient()
  return useCallback(
    async (ids: string[]) => {
      if (!ids.length) return
      qc.setQueryData<AppNotification[]>(key, (all) => all?.map((n) => (ids.includes(n.id) ? { ...n, leida: true } : n)))
      const { error } = await supabase.from('notifications').update({ leida: true }).in('id', ids)
      if (error) {
        await qc.invalidateQueries({ queryKey: key })
        throw error
      }
    },
    [qc],
  )
}

/** "Hace 35 min", "Hace 3 h", "Ayer", "Hace 2 días" o la fecha. */
export function timeAgo(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const mins = Math.max(0, Math.round((now.getTime() - d.getTime()) / 60000))
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const days = diffDays(d, now)
  if (days === 0) return `Hace ${Math.floor(mins / 60)} h`
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

/** Grupo de la lista según el día de la notificación. */
export function dayGroup(iso: string, now = new Date()): 'Hoy' | 'Ayer' | 'Anteriores' {
  const n = diffDays(startOfDay(new Date(iso)), startOfDay(now))
  return n <= 0 ? 'Hoy' : n === 1 ? 'Ayer' : 'Anteriores'
}
