import { addDays, startOfDay, toISO } from '@/lib/date'
import type { Course } from '../coursesData'

/**
 * Contenido de un curso a partir de los datos de Supabase (RawCourse).
 * Las fechas de semanas, evaluaciones y foros se calculan en relación con la semana actual del ciclo,
 * así la demostración siempre está vigente.
 */

export const PASS_GRADE = 11

// ───────── Datos tal como llegan de la base ─────────

export interface Meta {
  codigo: string
  horas: number
  sumilla: string
  logro: string
  metodologia: string
  /** 16 temas: semanas 1-8 y 10-17 (la 9 es el parcial y la 18 el final). */
  temas: string[]
  proyecto: string
  bibBase: string[]
  bibComp: string[]
  /** Sesiones de Zoom: día de la semana (0 = domingo), horario y tipo. */
  zoom: { dow: number; inicio: string; fin: string; tipo: string }[]
}

export type MaterialKind = 'Presentación' | 'Lectura' | 'Video'
export type ForumKind = 'calificado' | 'no_calificado'
export type ForumStatus = 'abierto' | 'cerrado' | 'proximo'

export interface RawCourse {
  id: string
  term: { nombre: string; semanaActual: number; semanasTotal: number }
  meta: Meta
  zoom: { meetingId: string; passcode: string; url: string }
  materials: { id: string; semana: number; tipo: MaterialKind; titulo: string; detalle: string }[]
  evaluations: { id: string; clave: string; nombre: string; semana: number; peso: number; nota: number | null }[]
  tasks: { id: string; titulo: string; semana: number }[]
  threads: { id: string; titulo: string; semana: number | null; tipo: ForumKind; descripcion: string }[]
  posts: {
    id: string
    thread_id: string
    autor: string
    rol: 'Docente' | 'Estudiante'
    texto: string
    cuando_demo: string | null
    parent_id: string | null
    created_at: string
  }[]
  announcements: {
    id: string
    titulo: string
    texto: string
    hace_dias: number | null
    semana: number | null
    dia: number | null
    nuevo: boolean
  }[]
}

// ───────── Semanas ─────────

/** Lunes de la semana actual: la semana "actual" del ciclo siempre es "esta semana". */
function thisMonday(today: Date): Date {
  const d = startOfDay(today)
  return addDays(d, -((d.getDay() + 6) % 7))
}

export function weekRange(n: number, currentWeek: number, today = new Date()) {
  const start = addDays(thisMonday(today), (n - currentWeek) * 7)
  return { start, end: addDays(start, 6) }
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']

/** "9 – 15 nov" o "30 nov – 6 dic" */
export function rangeLabel(a: Date, b: Date): string {
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} – ${b.getDate()} ${MONTHS[a.getMonth()]}`
    : `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]}`
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const metaOf = (raw: RawCourse): Meta => raw.meta

/** Tema de la semana n. */
export function topicOf(raw: RawCourse, week: number): string {
  if (week === 9) return 'Examen parcial'
  if (week === raw.term.semanasTotal) return 'Examen final'
  return raw.meta.temas[week < 9 ? week - 1 : week - 2] ?? `Semana ${week}`
}

// ───────── Contenido de las semanas ─────────

export interface Material {
  id: string
  kind: MaterialKind
  title: string
  detail: string
}

export interface Week {
  n: number
  tema: string
  inicio: Date
  fin: Date
  actual: boolean
  materiales: Material[]
}

export function weeksOf(raw: RawCourse): Week[] {
  const { semanaActual, semanasTotal } = raw.term
  return Array.from({ length: semanasTotal }, (_, i) => {
    const n = i + 1
    const { start, end } = weekRange(n, semanaActual)
    return {
      n,
      tema: topicOf(raw, n),
      inicio: start,
      fin: end,
      actual: n === semanaActual,
      materiales: raw.materials
        .filter((m) => m.semana === n)
        .map((m) => ({ id: m.id, kind: m.tipo, title: m.titulo, detail: m.detalle })),
    }
  })
}

// ───────── Evaluaciones y notas ─────────

export type EvalState = 'calificada' | 'esta_semana' | 'proxima'
export interface Evaluation {
  id: string
  nombre: string
  semana: number
  fecha: Date
  peso: number
  estado: EvalState
  nota?: number
}

export function evaluationsOf(raw: RawCourse): Evaluation[] {
  const current = raw.term.semanaActual
  return raw.evaluations.map((e) => {
    const estado: EvalState = e.semana < current ? 'calificada' : e.semana === current ? 'esta_semana' : 'proxima'
    return {
      id: e.id,
      nombre: e.nombre,
      semana: e.semana,
      peso: e.peso,
      fecha: addDays(weekRange(e.semana, current).start, 3),
      estado,
      nota: e.nota ?? undefined,
    }
  })
}

export interface GradeSummary {
  /** Aporte acumulado sobre 20. */
  acumulado: number
  /** Promedio ponderado de lo ya calificado. */
  parcial: number | null
  pesoCalificado: number
  /** Nota promedio que se necesita en lo que falta para llegar a PASS_GRADE (null si no queda nada). */
  necesario: number | null
}

export function summarize(evals: Evaluation[]): GradeSummary {
  const graded = evals.filter((e) => e.nota !== undefined)
  const pesoCalificado = graded.reduce((s, e) => s + e.peso, 0)
  const acumulado = graded.reduce((s, e) => s + (e.nota as number) * (e.peso / 100), 0)
  const restante = 100 - pesoCalificado
  return {
    acumulado,
    parcial: pesoCalificado > 0 ? (acumulado * 100) / pesoCalificado : null,
    pesoCalificado,
    necesario: restante > 0 ? (PASS_GRADE - acumulado) / (restante / 100) : null,
  }
}

// ───────── Tareas ─────────

export interface Task {
  id: string
  titulo: string
  semana: number
  vence: Date
}

export function tasksOf(raw: RawCourse): Task[] {
  return raw.tasks.map((t) => {
    const vence = new Date(weekRange(t.semana, raw.term.semanaActual).end)
    vence.setHours(23, 59, 0, 0)
    return { id: t.id, titulo: t.titulo, semana: t.semana, vence }
  })
}

// ───────── Foros ─────────

export interface Post {
  id: string
  autor: string
  rol: 'Docente' | 'Estudiante'
  texto: string
  /** Texto de tiempo ya formateado ("Hace 2 días"). */
  cuando: string
  /** Id del comentario al que responde (si es una respuesta). */
  parent?: string
}

export interface Thread {
  id: string
  titulo: string
  semana: number | null
  tipo: ForumKind
  descripcion: string
  desde: Date | null
  hasta: Date | null
  estado: ForumStatus
  /** Comentarios y respuestas (docente, compañeros y propios). */
  base: Post[]
}

/** Los foros de las semanas 3, 7, 11 y 15 son calificados. */
export const isGradedForum = (week: number) => week % 4 === 3

export const forumTitle = (week: number) =>
  isGradedForum(week) ? `Foro calificado - Semana ${week}` : `Foro de Consultas - Semana ${week}`

function endOfDay(d: Date): Date {
  const e = new Date(d)
  e.setHours(23, 59, 0, 0)
  return e
}

/** Estado del foro según la fecha actual. */
export function forumStatus(t: Pick<Thread, 'desde' | 'hasta'>, now: Date): ForumStatus {
  if (!t.desde || !t.hasta) return 'abierto'
  if (now.getTime() < t.desde.getTime()) return 'proximo'
  if (now.getTime() > t.hasta.getTime()) return 'cerrado'
  return 'abierto'
}

/** "Ahora", "Hoy, 14:05", "Ayer" o "Hace 3 días" a partir de una fecha ISO. */
export function timeAgo(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const days = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / 86400000)
  if (now.getTime() - d.getTime() < 60000) return 'Ahora'
  if (days <= 0) return `Hoy, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

export function threadsOf(raw: RawCourse, now = new Date()): Thread[] {
  const current = raw.term.semanaActual
  return raw.threads.map((t) => {
    let desde: Date | null = null
    let hasta: Date | null = null
    if (t.semana !== null) {
      const { start, end } = weekRange(t.semana, current)
      // Calificados: solo durante su semana. De consultas: hasta el final de la semana siguiente.
      desde = start
      hasta = endOfDay(t.tipo === 'calificado' ? end : addDays(end, 7))
    }
    return {
      id: t.id,
      titulo: t.titulo,
      semana: t.semana,
      tipo: t.tipo,
      descripcion: t.descripcion,
      desde,
      hasta,
      estado: forumStatus({ desde, hasta }, now),
      base: raw.posts
        .filter((p) => p.thread_id === t.id)
        .map((p) => ({
          id: p.id,
          autor: p.autor,
          rol: p.rol,
          texto: p.texto,
          cuando: p.cuando_demo ?? timeAgo(p.created_at, now),
          parent: p.parent_id ?? undefined,
        })),
    }
  })
}

// ───────── Anuncios ─────────

export interface Announcement {
  id: string
  titulo: string
  texto: string
  fecha: Date
  /** Sin leer de forma predeterminada. */
  nuevo: boolean
}

export function announcementsOf(raw: RawCourse): Announcement[] {
  const today = startOfDay(new Date())
  return raw.announcements.map((a) => ({
    id: a.id,
    titulo: a.titulo,
    texto: a.texto,
    nuevo: a.nuevo,
    fecha:
      a.hace_dias !== null
        ? addDays(today, -a.hace_dias)
        : addDays(weekRange(a.semana ?? 1, raw.term.semanaActual).start, a.dia ?? 0),
  }))
}

// ───────── Zoom ─────────

export interface ZoomSession {
  fecha: string
  inicio: string
  fin: string
  tipo: string
}

export function zoomInfo(raw: RawCourse) {
  const id = raw.zoom.meetingId
  return {
    meetingId: id,
    meetingIdSpaced: `${id.slice(0, 3)} ${id.slice(3, 7)} ${id.slice(7)}`,
    passcode: raw.zoom.passcode,
    url: raw.zoom.url,
  }
}

/** Próximas sesiones de Zoom a partir de ahora. */
export function upcomingZoom(raw: RawCourse, now: Date, count = 4): ZoomSession[] {
  const sessions: ZoomSession[] = []
  const start = startOfDay(now)
  for (let i = 0; i < 28 && sessions.length < count; i++) {
    const d = addDays(start, i)
    for (const z of raw.meta.zoom) {
      if (d.getDay() !== z.dow) continue
      const end = new Date(`${toISO(d)}T${z.fin}:00`)
      if (end.getTime() > now.getTime()) sessions.push({ fecha: toISO(d), inicio: z.inicio, fin: z.fin, tipo: z.tipo })
    }
  }
  return sessions.slice(0, count)
}

export function recordingsOf(raw: RawCourse) {
  const current = raw.term.semanaActual
  return [current - 1, current - 2, current - 3].map((n) => ({
    id: `${raw.id}-rec${n}`,
    titulo: `Sesión de la semana ${n} — ${topicOf(raw, n)}`,
    duracion: `${70 + (hash(`${raw.id}rec${n}`) % 35)} min`,
  }))
}

// ───────── Sílabo ─────────

export interface Unit {
  nombre: string
  semanas: string
  temas: string[]
}

export function unitsOf(raw: RawCourse): Unit[] {
  const total = raw.term.semanasTotal
  const range = (a: number, b: number) =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i)
      .filter((n) => n !== 9 && n !== total)
      .map((n) => topicOf(raw, n))
  return [
    { nombre: 'Unidad 1', semanas: 'Semanas 1 a 4', temas: range(1, 4) },
    { nombre: 'Unidad 2', semanas: 'Semanas 5 a 9', temas: [...range(5, 8), 'Examen parcial'] },
    { nombre: 'Unidad 3', semanas: 'Semanas 10 a 13', temas: range(10, 13) },
    { nombre: 'Unidad 4', semanas: 'Semanas 14 a 18', temas: [...range(14, 17), 'Examen final'] },
  ]
}

/** Texto plano del sílabo para descargar. */
export function syllabusText(course: Course, raw: RawCourse): string {
  const m = raw.meta
  const evals = evaluationsOf(raw)
  const lines = [
    `SÍLABO — ${course.nombre.toUpperCase()}`,
    `Código: ${m.codigo} · ${course.creditos} créditos · ${course.modalidad} · Ciclo ${raw.term.nombre.replace('Ciclo ', '')}`,
    `Docente: ${course.docente}`,
    '',
    'SUMILLA',
    m.sumilla,
    '',
    'LOGRO DEL CURSO',
    m.logro,
    '',
    'METODOLOGÍA',
    m.metodologia,
    '',
    'UNIDADES DE APRENDIZAJE',
    ...unitsOf(raw).flatMap((u) => [`${u.nombre} (${u.semanas})`, ...u.temas.map((t) => `  - ${t}`)]),
    '',
    'SISTEMA DE EVALUACIÓN',
    ...evals.map((e) => `  - ${e.nombre} (semana ${e.semana}): ${e.peso}%`),
    '',
    'BIBLIOGRAFÍA BASE',
    ...m.bibBase.map((b) => `  - ${b}`),
    '',
    'BIBLIOGRAFÍA COMPLEMENTARIA',
    ...m.bibComp.map((b) => `  - ${b}`),
    '',
    'Documento de demostración generado por UTP+ Service.',
  ]
  return lines.join('\n')
}
