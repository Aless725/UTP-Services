import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { cancelReservation, createReservation } from '@/features/reservations/reservationsStore'
import { ReservationError } from '@/features/reservations/rules'
import { JoinError, joinGroup } from '@/features/groups/groupsStore'
import { AttendanceError } from '@/features/announcements/announcementsData'
import { BENEFICIOS, crearCupon } from '@/features/beneficios/beneficiosData'

export interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
}

/** Acción que el asistente propone y el alumno confirma con un botón. */
export type Proposal =
  | {
      kind: 'reserva'
      spaceId: string
      spaceNombre: string
      fecha: string
      inicio: string
      fin: string
      motivo: string
      integrantes: string[]
      resumen: string
    }
  | { kind: 'cancelar'; reservaId: string; codigo: string; penalizacion: boolean; resumen: string }
  | { kind: 'asistencia'; anuncioId: string; titulo: string; resumen: string }
  | { kind: 'unirse_grupo'; grupoId: string; titulo: string; resumen: string }
  | { kind: 'cupon'; beneficioId: string; empresa: string; resumen: string }
  | { kind: 'cancelar_tramite'; codigo: string; resumen: string }

export interface AssistantReply {
  reply: string
  proposal: Proposal | null
  /** Lo que se entendió de la voz del alumno (solo en mensajes de voz). */
  transcript?: string | null
}

/** Audio grabado: WAV en base64. */
export interface VoiceClip {
  mimeType: 'audio/wav'
  data: string
}

export type AssistantErrorCode = 'rate' | 'quota' | 'not_configured' | 'not_deployed' | 'offline' | 'no_speech' | 'unavailable'

export class AssistantError extends Error {
  constructor(public code: AssistantErrorCode) {
    super(code)
  }
}

/** Pregunta al asistente (función "agent" de Supabase). */
export async function askAssistant(messages: ChatMsg[], audio?: VoiceClip): Promise<AssistantReply> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new AssistantError('offline')

  const { data, error } = await supabase.functions.invoke('agent', { body: audio ? { messages, audio } : { messages } })
  if (!error) return data as AssistantReply

  if (error instanceof FunctionsFetchError) throw new AssistantError('offline')
  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response
    let code = ''
    try {
      code = ((await res.clone().json()) as { error?: string }).error ?? ''
    } catch {
      /* respuesta sin cuerpo */
    }
    if (res.status === 404) throw new AssistantError('not_deployed')
    if (res.status === 422 || code === 'no_speech') throw new AssistantError('no_speech')
    if (res.status === 503 || code === 'not_configured') throw new AssistantError('not_configured')
    if (code === 'rate_limited') throw new AssistantError('rate')
    if (res.status === 429 || code === 'quota') throw new AssistantError('quota')
  }
  throw new AssistantError('unavailable')
}

/** Mensaje comprensible para cada error del asistente. */
export function assistantErrorText(code: AssistantErrorCode): string {
  switch (code) {
    case 'offline':
      return 'Parece que no hay conexión. Revisa tu internet e inténtalo de nuevo.'
    case 'no_speech':
      return 'No te escuché bien. Acércate al micrófono e inténtalo de nuevo, o escribe tu mensaje.'
    case 'rate':
      return 'Estás escribiendo muy rápido. Espera unos segundos y vuelve a intentarlo.'
    case 'quota':
      return 'El asistente está muy ocupado en este momento. Inténtalo en unos minutos o usa las opciones de abajo.'
    case 'not_deployed':
    case 'not_configured':
      return 'El asistente todavía no está activo. Mientras tanto puedes usar las opciones de abajo.'
    default:
      return 'No pude responder ahora. Inténtalo de nuevo o usa las opciones de abajo.'
  }
}

export interface Outcome {
  text: string
  /** Enlace para ver el resultado (por ejemplo, la reserva confirmada). */
  link?: { to: string; label: string }
}

/**
 * Ejecuta la propuesta confirmada con las mismas funciones de siempre: las reglas se validan en el servidor.
 * Lanza un Error con un mensaje listo para mostrar si algo falla.
 */
export async function executeProposal(p: Proposal, attend: (id: string, asistir: boolean) => Promise<void>): Promise<Outcome> {
  try {
    switch (p.kind) {
      case 'reserva': {
        const r = await createReservation({
          spaceId: p.spaceId,
          fecha: p.fecha,
          inicio: p.inicio,
          fin: p.fin,
          motivo: p.motivo,
          miembros: p.integrantes,
        })
        return {
          text: `Listo, tu reserva quedó confirmada con el código ${r.codigo}.`,
          link: { to: `/reservas/confirmada/${r.codigo}`, label: 'Ver reserva y QR' },
        }
      }
      case 'cancelar': {
        const res = await cancelReservation(p.reservaId)
        return {
          text: res.penalty
            ? `Cancelé la reserva ${p.codigo}. Como faltaba poco, tendrás una penalidad de 7 días sin reservar.`
            : `Cancelé la reserva ${p.codigo} sin penalidad.`,
          link: { to: '/reservas/mis', label: 'Ver mis reservas' },
        }
      }
      case 'asistencia':
        await attend(p.anuncioId, true)
        return { text: `Listo, confirmé tu asistencia a «${p.titulo}».`, link: { to: `/anuncios/${p.anuncioId}`, label: 'Ver actividad' } }
      case 'unirse_grupo':
        await joinGroup(p.grupoId)
        return { text: `Listo, ya eres parte del grupo.`, link: { to: `/grupos/${p.grupoId}`, label: 'Ver grupo' } }
      case 'cupon': {
        const b = BENEFICIOS.find((x) => x.id === p.beneficioId)
        if (!b) throw new Error('Ese beneficio ya no está disponible.')
        const { cupon, nuevo } = crearCupon(b)
        return {
          text: nuevo ? `Listo, generé tu cupón de ${b.empresa}: ${cupon.codigo}.` : `Ya tenías tu cupón de ${b.empresa}: ${cupon.codigo}.`,
          link: { to: `/beneficios/${b.id}/cupon`, label: 'Ver cupón y QR' },
        }
      }
      case 'cancelar_tramite': {
        const { error } = await supabase.rpc('cancelar_tramite', { p_codigo: p.codigo })
        if (error) throw new Error(error.message.includes('ya no se puede') ? 'Esa solicitud ya no se puede cancelar.' : 'No pude cancelar la solicitud.')
        return { text: `Listo, cancelé la solicitud ${p.codigo}.`, link: { to: `/tramites/solicitud/${p.codigo}`, label: 'Ver solicitud' } }
      }
    }
  } catch (e) {
    if (e instanceof ReservationError) throw new Error(e.message)
    if (e instanceof JoinError) {
      throw new Error(e.reason === 'full' ? 'Ese grupo ya se llenó.' : e.reason === 'already' ? 'Ya eres integrante de ese grupo.' : 'No pude unirte. Revisa tu conexión.')
    }
    if (e instanceof AttendanceError) {
      throw new Error(e.reason === 'full' ? 'Ya no quedan cupos.' : e.reason === 'past' ? 'Esa actividad ya terminó.' : 'No pude confirmar tu asistencia.')
    }
    throw new Error('No pude completar la acción. Inténtalo de nuevo.')
  }
}
