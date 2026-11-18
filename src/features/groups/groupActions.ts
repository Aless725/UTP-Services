import { buildIcs, downloadIcs } from '@/lib/ics'
import { parseISO } from '@/lib/date'
import type { Group } from './groupsData'

const at = (fecha: string, hora: string) => {
  const d = parseISO(fecha)
  const [h, m] = hora.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function addGroupToCalendar(g: Group): void {
  downloadIcs(
    `grupo-${g.curso.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`,
    buildIcs({
      uid: g.id,
      title: `Grupo de estudio: ${g.curso}`,
      description: g.tema + (g.enlace ? `\nEnlace: ${g.enlace}` : ''),
      location: g.modalidad === 'Virtual' ? (g.enlace ?? 'Virtual') : (g.sede ?? g.lugar),
      start: at(g.fecha, g.inicio),
      end: at(g.fecha, g.fin),
    }),
  )
}

/** Comparte el enlace de invitación (hoja nativa o portapapeles). Devuelve 'shared' | 'copied' | 'error'. */
export async function shareGroup(g: Group): Promise<'shared' | 'copied' | 'error'> {
  const url = `${window.location.origin}/grupos/${g.id}`
  const text = `Únete a mi grupo de estudio de ${g.curso}: ${g.tema}`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Grupo de estudio UTP+', text, url })
      return 'shared'
    }
    await navigator.clipboard.writeText(`${text} ${url}`)
    return 'copied'
  } catch (e) {
    // El usuario cerró la hoja de compartir: no es un error.
    if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
    return 'error'
  }
}
