// Función de Supabase "agent": asistente UTP+ con Gemini.
// Secretos (Dashboard → Edge Functions → Secrets):
//   GEMINI_API_KEY   (obligatorio)  llave de Google AI Studio
//   GEMINI_MODEL     (opcional)     modelo de Gemini; por defecto "gemini-3.5-flash-lite"
//                                   (nivel gratuito: 15 solicitudes por minuto y 500 por día)
// SUPABASE_URL y SUPABASE_ANON_KEY los inyecta Supabase solos.
//
// Seguridad: la llave de Gemini vive solo aquí. Las consultas se hacen con el JWT del alumno
// (nunca con service_role), así que RLS limita lo que el modelo puede ver.

import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  AUDIO_MIME,
  AgentError,
  MAX_AUDIO_B64,
  runAgent,
  transcribeAudio,
  type AudioInput,
  type ChatMessage,
  type Db,
  type GeminiResponse,
} from './core.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

// Se conserva entre solicitudes mientras la instancia siga viva.
let thinkingSupported = true

const MAX_MESSAGE = 600
const MAX_PER_MINUTE = 12

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const started = Date.now()
  const auth = req.headers.get('Authorization')
  if (!auth) return json({ error: 'unauthorized' }, 401)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  })
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401)

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return json({ error: 'not_configured' }, 503)
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash-lite'

  // Entrada validada: solo roles conocidos, textos acotados y, si hay voz, un audio WAV de tamaño razonable.
  let messages: ChatMessage[]
  let audio: AudioInput | null = null
  try {
    const body = await req.json()
    const history = Array.isArray(body.messages) ? body.messages : []
    messages = history
      .filter((m: ChatMessage) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
      .map((m: ChatMessage) => ({ role: m.role, text: m.text.trim().slice(0, MAX_MESSAGE) }))
    if (body.audio) {
      const { mimeType, data } = body.audio
      if (typeof mimeType !== 'string' || typeof data !== 'string' || !AUDIO_MIME.includes(mimeType) || data.length > MAX_AUDIO_B64 || data.length < 100) {
        throw new Error('audio')
      }
      audio = { mimeType, data }
    } else if (!messages.length || messages[messages.length - 1].role !== 'user') {
      throw new Error('last')
    }
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  let lastUser = audio ? '(mensaje de voz)' : messages[messages.length - 1].text

  // Límite de uso por alumno (se apoya en el registro de conversaciones).
  const since = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase.from('agent_logs').select('id', { count: 'exact', head: true }).gte('created_at', since)
  if ((count ?? 0) >= MAX_PER_MINUTE) return json({ error: 'rate_limited' }, 429)

  const log = (extra: Record<string, unknown>) =>
    supabase.from('agent_logs').insert({ mensaje: lastUser, canal: audio ? 'voz' : 'texto', latencia_ms: Date.now() - started, ...extra }).then(() => undefined)

  const db = makeDb(supabase)

  const callModel = async (body: Record<string, unknown>): Promise<GeminiResponse> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    for (let attempt = 0; attempt < 3; attempt++) {
      // Razonamiento corto: para un asistente importa más la rapidez. Si el modelo no admite el ajuste (400),
      // se recuerda y no se vuelve a enviar, para no gastar solicitudes del nivel gratuito.
      const payload = thinkingSupported
        ? { ...body, generationConfig: { ...(body.generationConfig as object), thinkingConfig: { thinkingLevel: 'low' } } }
        : body
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(payload),
        // Mejor un error claro a los 25 s que dejar al alumno esperando sin respuesta.
        signal: AbortSignal.timeout(25_000),
      })
      if (res.ok) return await res.json()
      if (res.status === 400 && thinkingSupported) {
        thinkingSupported = false
        continue
      }
      // Un reintento ante saturación momentánea del modelo.
      if (res.status === 503 && attempt < 2) {
        await new Promise((r) => setTimeout(r, 700))
        continue
      }
      const detail = await res.text().catch(() => '')
      throw Object.assign(new Error(`gemini_${res.status}`), { status: res.status, detail: detail.slice(0, 300) })
    }
    throw new Error('gemini_unreachable')
  }

  try {
    let transcript: string | null = null
    if (audio) {
      transcript = await transcribeAudio(audio, callModel)
      if (!transcript) {
        await log({ error: 'no_speech' })
        return json({ error: 'no_speech' }, 422)
      }
      lastUser = transcript
      messages.push({ role: 'user', text: transcript })
    }
    const result = await runAgent(messages, { db, callModel })
    await log({ respuesta: result.reply, herramientas: result.tools, propuesta: result.proposal?.kind ?? null })
    return json({ reply: result.reply, proposal: result.proposal, transcript })
  } catch (e) {
    const status = (e as { status?: number }).status
    const code =
      e instanceof AgentError ? e.code : status === 429 ? 'quota' : status === 400 || status === 403 ? 'model_config' : 'unavailable'
    console.error('agent error', code, e instanceof Error ? e.message : e, (e as { detail?: string }).detail ?? '')
    await log({ error: code })
    return json({ error: code }, code === 'quota' ? 429 : 502)
  }
})

// ───────────────────────── Acceso a datos con la sesión del alumno ─────────────────────────

function makeDb(sb: ReturnType<typeof createClient>): Db {
  const must = <T>(r: { data: T | null; error: { message: string } | null }): T => {
    if (r.error) throw new Error(r.error.message)
    return r.data as T
  }
  return {
    async me() {
      const p = must(await sb.from('profiles').select('codigo, nombre, campuses(nombre)').single()) as {
        codigo: string
        nombre: string
        campuses: { nombre: string } | { nombre: string }[] | null
      }
      const campus = Array.isArray(p.campuses) ? p.campuses[0] : p.campuses
      return { codigo: p.codigo, nombre: p.nombre, sede: campus?.nombre ?? 'Lima Centro' }
    },
    async settings() {
      const rows = must(await sb.from('settings').select('clave, valor')) as { clave: string; valor: unknown }[]
      return Object.fromEntries(rows.map((r) => [r.clave, Number(r.valor)]))
    },
    async spaces() {
      const rows = must(
        await sb.from('spaces').select('id, tipo, nombre, edificio, piso, capacidad_max, equipamiento, campuses(nombre)'),
      ) as unknown as (Record<string, unknown> & { campuses: { nombre: string } | { nombre: string }[] | null })[]
      return rows.map((r) => {
        const c = Array.isArray(r.campuses) ? r.campuses[0] : r.campuses
        return { ...r, sede: c?.nombre ?? '' }
      }) as never
    },
    async students() {
      return must(await sb.from('students').select('codigo, nombre'))
    },
    async occupancy(desde, hasta) {
      return must(await sb.rpc('ocupacion_rango', { p_desde: desde, p_hasta: hasta }))
    },
    async myReservations() {
      return must(await sb.rpc('mis_reservas'))
    },
    async announcements() {
      const rows = must(
        await sb
          .from('campus_announcements_view')
          .select('id, categoria, titulo, fecha, hora_inicio, lugar, sede, cupos, asistentes, asistire')
          .order('fecha')
          .order('hora_inicio'),
      ) as (Record<string, unknown> & { hora_inicio: string })[]
      return rows.map((r) => ({ ...r, inicio: r.hora_inicio.slice(0, 5) })) as never
    },
    async courses() {
      const rows = must(await sb.from('enrollments').select('orden, courses(*), terms(*)').order('orden')) as unknown as {
        courses: unknown
        terms: unknown
      }[]
      const one = (x: unknown) => (Array.isArray(x) ? x[0] : x) ?? null
      return {
        courses: rows.map((r) => one(r.courses)).filter(Boolean) as never,
        term: one(rows[0]?.terms) as never,
      }
    },
    async evaluations(ids) {
      return must(await sb.from('course_evaluations').select('id, course_id, nombre, semana, peso').in('course_id', ids))
    },
    async grades() {
      return must(await sb.from('evaluation_grades').select('evaluation_id, nota'))
    },
    async tasks(ids) {
      return must(await sb.from('course_tasks').select('id, course_id, titulo, semana').in('course_id', ids))
    },
    async submissions() {
      return must(await sb.from('task_submissions').select('task_id'))
    },
    async groups() {
      const rows = must(
        await sb.from('groups_view').select('id, curso, tema, modalidad, fecha, inicio, cupos, integrantes, es_miembro').order('fecha'),
      ) as (Record<string, unknown> & { inicio: string })[]
      return rows.map((r) => ({ ...r, inicio: r.inicio.slice(0, 5) })) as never
    },
  }
}
