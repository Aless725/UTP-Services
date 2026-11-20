/**
 * Núcleo del asistente UTP+ (sin dependencias de Deno, para poder probarlo con Node).
 *
 * El modelo (Gemini) solo LEE datos y PROPONE acciones. Nunca escribe: la propuesta vuelve a la app,
 * el alumno la confirma y recién entonces la app llama a las funciones validadas del servidor
 * (crear_reserva, cancelar_reserva, unirse_grupo, asistir_anuncio).
 */

// ───────────────────────── Tipos ─────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

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

export interface AgentResult {
  reply: string
  proposal: Proposal | null
  tools: string[]
}

/** Acceso de solo lectura a los datos, con la sesión del alumno. */
export interface Db {
  me(): Promise<{ codigo: string; nombre: string; sede: string }>
  settings(): Promise<Record<string, number>>
  spaces(): Promise<SpaceRow[]>
  students(): Promise<{ codigo: string; nombre: string }[]>
  occupancy(desde: string, hasta: string): Promise<{ space_id: string; fecha: string; inicio: string; fin: string }[]>
  myReservations(): Promise<ReservationRow[]>
  announcements(): Promise<AnnouncementRow[]>
  groups(): Promise<GroupRow[]>
  /** Cursos matriculados y ciclo actual. */
  courses(): Promise<{ courses: CourseRow[]; term: TermRow | null }>
  evaluations(courseIds: string[]): Promise<EvaluationRow[]>
  /** Notas del alumno por evaluación. */
  grades(): Promise<{ evaluation_id: string; nota: number }[]>
  tasks(courseIds: string[]): Promise<TaskRow[]>
  /** Ids de las tareas que el alumno ya entregó. */
  submissions(): Promise<{ task_id: string }[]>
}

export interface CourseRow {
  id: string
  nombre: string
  docente: string
  creditos: number
  modalidad: string
}
export interface TermRow {
  nombre: string
  semana_actual: number
  semanas_total: number
}
export interface EvaluationRow {
  id: string
  course_id: string
  nombre: string
  semana: number
  peso: number
}
export interface TaskRow {
  id: string
  course_id: string
  titulo: string
  semana: number
}

export interface SpaceRow {
  id: string
  tipo: 'sala_grupal' | 'pc' | 'cubiculo'
  nombre: string
  sede: string
  edificio: string
  piso: number
  capacidad_max: number
  equipamiento: string[]
}
export interface ReservationRow {
  id: string
  codigo: string
  space_id: string
  fecha: string
  inicio: string
  fin: string
  estado: string
}
export interface AnnouncementRow {
  id: string
  categoria: string
  titulo: string
  fecha: string
  inicio: string
  lugar: string
  sede: string
  cupos: number | null
  asistentes: number
  asistire: boolean
}
export interface GroupRow {
  id: string
  curso: string
  tema: string
  modalidad: string
  fecha: string
  inicio: string
  cupos: number
  integrantes: number
  es_miembro: boolean
}

export interface GeminiPart {
  text?: string
  functionCall?: { name: string; args?: Record<string, unknown> }
  functionResponse?: { name: string; response: unknown }
  [k: string]: unknown
}
export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}
export interface GeminiResponse {
  candidates?: { content?: GeminiContent; finishReason?: string }[]
  promptFeedback?: { blockReason?: string }
}

export interface AgentDeps {
  db: Db
  /** Llama al modelo con el cuerpo ya armado (el adaptador agrega la llave y el modelo). */
  callModel: (body: Record<string, unknown>) => Promise<GeminiResponse>
  now?: Date
}

export class AgentError extends Error {
  constructor(
    public code: 'model_blocked' | 'model_empty' | 'too_many_steps',
    message: string,
  ) {
    super(message)
  }
}

// ───────────────────────── Fechas (Lima = UTC-5, sin horario de verano) ─────────────────────────

const pad = (n: number) => String(n).padStart(2, '0')

export function limaNow(now: Date): { fecha: string; hora: string; dow: number; min: number } {
  const l = new Date(now.getTime() - 5 * 3600_000)
  return {
    fecha: `${l.getUTCFullYear()}-${pad(l.getUTCMonth() + 1)}-${pad(l.getUTCDate())}`,
    hora: `${pad(l.getUTCHours())}:${pad(l.getUTCMinutes())}`,
    dow: l.getUTCDay(),
    min: l.getUTCHours() * 60 + l.getUTCMinutes(),
  }
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const dowOf = (fecha: string) => new Date(`${fecha}T12:00:00Z`).getUTCDay()
const addDays = (fecha: string, n: number) => {
  const d = new Date(`${fecha}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
const diffDays = (a: string, b: string) =>
  Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 86400000)
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const fromMin = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s))
const isTime = (s: unknown): s is string => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)

// ───────────────────────── Herramientas ─────────────────────────

const str = (description: string, extra: Record<string, unknown> = {}) => ({ type: 'string', description, ...extra })

export const TOOL_DECLARATIONS = [
  {
    name: 'buscar_espacios',
    description:
      'Busca espacios reservables (salas grupales, PCs de biblioteca, cubículos) con sus horarios libres para una fecha. Úsala antes de proponer una reserva.',
    parameters: {
      type: 'object',
      properties: {
        tipo: str('Tipo de espacio.', { enum: ['sala_grupal', 'pc', 'cubiculo'] }),
        fecha: str('Fecha en formato AAAA-MM-DD.'),
        hora_desde: str('Hora mínima de inicio, HH:MM (opcional).'),
        duracion_horas: { type: 'integer', description: 'Duración en horas: 1 o 2. Por defecto 1.' },
        capacidad_min: { type: 'integer', description: 'Cantidad de personas que deben caber (opcional).' },
        sede: str('Sede (opcional).', { enum: ['Lima Centro', 'Lima Norte'] }),
      },
      required: ['fecha'],
    },
  },
  {
    name: 'mis_reservas',
    description: 'Lista las reservas próximas del alumno (código, espacio, fecha y horario).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'listar_anuncios',
    description: 'Lista las próximas actividades y campañas del campus con sus cupos.',
    parameters: {
      type: 'object',
      properties: {
        categoria: str('Categoría (opcional).', {
          enum: ['salud', 'cultura', 'academico', 'deporte', 'empleabilidad'],
        }),
      },
    },
  },
  {
    name: 'buscar_grupos',
    description: 'Lista los próximos grupos de estudio con cupos libres.',
    parameters: { type: 'object', properties: { curso: str('Parte del nombre del curso (opcional).') } },
  },
  {
    name: 'mis_cursos',
    description: 'Lista los cursos que el alumno lleva este ciclo, con docente, créditos y modalidad.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'mis_notas',
    description:
      'Notas del alumno por curso: evaluaciones calificadas, nota acumulada, qué falta y cuánto necesita en lo que falta para aprobar (11).',
    parameters: { type: 'object', properties: { curso: str('Nombre o sigla del curso (opcional; sin él, todos).') } },
  },
  {
    name: 'tareas_pendientes',
    description: 'Tareas aún sin entregar, con su fecha de vencimiento, de la más urgente a la más lejana.',
    parameters: { type: 'object', properties: { curso: str('Nombre o sigla del curso (opcional).') } },
  },
  {
    name: 'proximas_evaluaciones',
    description: 'Próximas evaluaciones (prácticas, parciales, finales) con su fecha y peso.',
    parameters: { type: 'object', properties: { curso: str('Nombre o sigla del curso (opcional).') } },
  },
  {
    name: 'proponer_reserva',
    description:
      'Prepara una reserva para que el alumno la confirme. NO la crea. Solo llámala cuando ya tengas espacio, fecha, hora y (en salas) integrantes.',
    parameters: {
      type: 'object',
      properties: {
        space_id: str('Id del espacio devuelto por buscar_espacios.'),
        fecha: str('AAAA-MM-DD'),
        hora_inicio: str('HH:MM, uno de los horarios libres.'),
        duracion_horas: { type: 'integer', description: '1 o 2.' },
        motivo: str('Motivo breve (solo salas).'),
        integrantes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Códigos de los compañeros (formato U12345678), sin incluir al alumno. Solo salas.',
        },
      },
      required: ['space_id', 'fecha', 'hora_inicio', 'duracion_horas'],
    },
  },
  {
    name: 'proponer_cancelacion',
    description: 'Prepara la cancelación de una reserva para que el alumno la confirme. NO la cancela.',
    parameters: {
      type: 'object',
      properties: { codigo: str('Código de la reserva, por ejemplo RES-2026-0871.') },
      required: ['codigo'],
    },
  },
  {
    name: 'proponer_asistencia',
    description: 'Prepara la confirmación de asistencia a una actividad del campus. NO la confirma.',
    parameters: {
      type: 'object',
      properties: { anuncio_id: str('Id devuelto por listar_anuncios.') },
      required: ['anuncio_id'],
    },
  },
  {
    name: 'proponer_unirse_grupo',
    description: 'Prepara que el alumno se una a un grupo de estudio. NO lo une.',
    parameters: {
      type: 'object',
      properties: { grupo_id: str('Id devuelto por buscar_grupos.') },
      required: ['grupo_id'],
    },
  },
]

interface Ctx {
  deps: AgentDeps
  today: { fecha: string; min: number; dow: number }
  proposal: Proposal | null
  tools: string[]
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Horarios de inicio libres de un espacio, con la misma alineación que la app (cada `dur` horas desde la apertura). */
export function freeStarts(
  space: SpaceRow,
  fecha: string,
  dur: number,
  busy: { space_id: string; fecha: string; inicio: string; fin: string }[],
  cfg: Record<string, number>,
  today: { fecha: string; min: number },
  desde = 0,
): string[] {
  const open = (cfg.openHour ?? 8) * 60
  const close = (cfg.closeHour ?? 20) * 60
  const mine = busy.filter((b) => b.space_id === space.id && b.fecha === fecha)
  const out: string[] = []
  for (let s = open; s + dur * 60 <= close; s += dur * 60) {
    if (s < desde) continue
    if (fecha === today.fecha && s <= today.min) continue
    const e = s + dur * 60
    if (mine.some((b) => s < toMin(b.fin) && toMin(b.inicio) < e)) continue
    out.push(fromMin(s))
  }
  return out
}

/** Motivo por el que no se puede reservar ese día (o null si se puede). */
function dayProblem(space: SpaceRow, fecha: string, ctx: Ctx, cfg: Record<string, number>): string | null {
  const n = diffDays(ctx.today.fecha, fecha)
  if (n < 0) return 'Esa fecha ya pasó.'
  if (n > (cfg.bookingWindowDays ?? 14)) return `Solo se puede reservar hasta ${cfg.bookingWindowDays ?? 14} días por adelantado.`
  if (space.tipo === 'sala_grupal' && dowOf(fecha) === 6) return 'Las salas grupales no se habilitan los sábados.'
  return null
}

/** Elige cursos por sigla (ihm), nombre o iniciales; sin criterio devuelve todos. */
function pickCourses(courses: CourseRow[], q: unknown): CourseRow[] {
  if (typeof q !== 'string' || !q.trim()) return courses
  const n = norm(q).trim()
  const initials = (name: string) =>
    norm(name)
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .map((w) => w[0])
      .join('')
  return courses.filter((c) => c.id === n || norm(c.nombre).includes(n) || initials(c.nombre) === n || n.includes(c.id))
}

async function execTool(name: string, args: Record<string, unknown>, ctx: Ctx): Promise<unknown> {
  const { db } = ctx.deps
  ctx.tools.push(name)

  switch (name) {
    case 'buscar_espacios': {
      const fecha = args.fecha
      if (!isDate(fecha)) return { error: 'La fecha debe tener formato AAAA-MM-DD.' }
      const dur = args.duracion_horas === 2 ? 2 : 1
      const cfg = await db.settings()
      const desde = isTime(args.hora_desde) ? toMin(args.hora_desde) : 0
      const me = await db.me()
      const sede = typeof args.sede === 'string' ? args.sede : null
      const all = await db.spaces()
      let spaces = all.filter((s) => (!args.tipo || s.tipo === args.tipo) && (!sede || s.sede === sede))
      if (typeof args.capacidad_min === 'number') spaces = spaces.filter((s) => s.capacidad_max >= (args.capacidad_min as number))
      if (!spaces.length) return { espacios: [], nota: 'No hay espacios con esas condiciones.' }
      const problem = dayProblem(spaces[0], fecha, ctx, cfg)
      if (problem && spaces[0].tipo !== 'sala_grupal') return { espacios: [], nota: problem }
      const busy = await db.occupancy(fecha, fecha)
      const found = spaces
        .map((s) => ({ s, libres: dayProblem(s, fecha, ctx, cfg) ? [] : freeStarts(s, fecha, dur, busy, cfg, ctx.today, desde) }))
        .filter((x) => x.libres.length > 0)
        // Primero la sede del alumno, luego los que tienen más horarios.
        .sort((a, b) => Number(b.s.sede === me.sede) - Number(a.s.sede === me.sede) || b.libres.length - a.libres.length)
        .slice(0, 5)
      if (!found.length) {
        return { espacios: [], nota: problem ?? 'No hay horarios libres para esa fecha con esas condiciones. Prueba otro día u otra hora.' }
      }
      return {
        fecha,
        dia: DAYS[dowOf(fecha)],
        duracion_horas: dur,
        espacios: found.map(({ s, libres }) => ({
          id: s.id,
          nombre: s.nombre,
          tipo: s.tipo,
          sede: s.sede,
          ubicacion: `${s.edificio}, piso ${s.piso}`,
          capacidad_max: s.capacidad_max,
          equipamiento: s.equipamiento,
          horarios_libres: libres.slice(0, 6),
        })),
      }
    }

    case 'mis_reservas': {
      const [rows, spaces] = await Promise.all([db.myReservations(), db.spaces()])
      const now = ctx.today
      const list = rows
        .filter((r) => r.estado === 'confirmada' && (r.fecha > now.fecha || (r.fecha === now.fecha && toMin(r.fin) > now.min)))
        .map((r) => ({
          codigo: r.codigo,
          espacio: spaces.find((s) => s.id === r.space_id)?.nombre ?? r.space_id,
          fecha: r.fecha,
          dia: DAYS[dowOf(r.fecha)],
          horario: `${r.inicio}-${r.fin}`,
        }))
      return list.length ? { reservas: list } : { reservas: [], nota: 'No tiene reservas próximas.' }
    }

    case 'listar_anuncios': {
      const rows = await db.announcements()
      const list = rows
        .filter((a) => a.fecha >= ctx.today.fecha && (!args.categoria || a.categoria === args.categoria))
        .slice(0, 8)
        .map((a) => ({
          id: a.id,
          titulo: a.titulo,
          categoria: a.categoria,
          fecha: a.fecha,
          dia: DAYS[dowOf(a.fecha)],
          hora: a.inicio,
          lugar: `${a.lugar} · ${a.sede}`,
          cupos_libres: a.cupos === null ? 'entrada libre' : Math.max(0, a.cupos - a.asistentes),
          ya_asistira: a.asistire,
        }))
      return { anuncios: list }
    }

    case 'buscar_grupos': {
      const q = typeof args.curso === 'string' ? norm(args.curso) : ''
      const rows = await db.groups()
      const list = rows
        .filter((g) => g.fecha >= ctx.today.fecha && (!q || norm(g.curso).includes(q)))
        .slice(0, 8)
        .map((g) => ({
          id: g.id,
          curso: g.curso,
          tema: g.tema,
          modalidad: g.modalidad,
          fecha: g.fecha,
          dia: DAYS[dowOf(g.fecha)],
          hora: g.inicio,
          cupos_libres: Math.max(0, g.cupos - g.integrantes),
          ya_es_miembro: g.es_miembro,
        }))
      return { grupos: list }
    }

    case 'mis_cursos': {
      const { courses, term } = await db.courses()
      return {
        ciclo: term ? `${term.nombre}, semana ${term.semana_actual} de ${term.semanas_total}` : null,
        cursos: courses.map((c) => ({ sigla: c.id, nombre: c.nombre, docente: c.docente, creditos: c.creditos, modalidad: c.modalidad })),
      }
    }

    case 'mis_notas':
    case 'tareas_pendientes':
    case 'proximas_evaluaciones': {
      const { courses, term } = await db.courses()
      if (!term || !courses.length) return { error: 'El alumno no tiene cursos matriculados este ciclo.' }
      const picked = pickCourses(courses, args.curso)
      if (!picked.length) {
        return { error: `No encontré ese curso. Sus cursos son: ${courses.map((c) => c.nombre).join(', ')}.` }
      }
      const ids = picked.map((c) => c.id)
      const nameOf = (id: string) => courses.find((c) => c.id === id)?.nombre ?? id
      const weekStart = (n: number) => addDays(ctx.today.fecha, -((ctx.today.dow + 6) % 7) + (n - term.semana_actual) * 7)

      if (name === 'tareas_pendientes') {
        const [tasks, subs] = await Promise.all([db.tasks(ids), db.submissions()])
        const done = new Set(subs.map((x) => x.task_id))
        const list = tasks
          .filter((t) => !done.has(t.id))
          .map((t) => ({ t, vence: addDays(weekStart(t.semana), 6) }))
          .sort((a, b) => a.vence.localeCompare(b.vence))
          .slice(0, 10)
          .map(({ t, vence }) => ({
            curso: nameOf(t.course_id),
            tarea: t.titulo,
            vence,
            dia: DAYS[dowOf(vence)],
            estado: vence < ctx.today.fecha ? 'vencida' : diffDays(ctx.today.fecha, vence) <= 2 ? 'por vencer' : 'pendiente',
          }))
        return list.length ? { pendientes: list } : { pendientes: [], nota: 'No tiene tareas pendientes.' }
      }

      const [evals, grades] = await Promise.all([db.evaluations(ids), db.grades()])
      const nota = new Map(grades.map((g) => [g.evaluation_id, g.nota]))

      if (name === 'proximas_evaluaciones') {
        const list = evals
          .filter((e) => e.semana >= term.semana_actual && !nota.has(e.id))
          .map((e) => ({ e, fecha: addDays(weekStart(e.semana), 3) }))
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .slice(0, 8)
          .map(({ e, fecha }) => ({ curso: nameOf(e.course_id), evaluacion: e.nombre, fecha, dia: DAYS[dowOf(fecha)], peso: `${e.peso}%` }))
        return list.length ? { evaluaciones: list } : { evaluaciones: [], nota: 'No hay evaluaciones próximas.' }
      }

      // mis_notas
      return {
        notas: picked.map((c) => {
          const mine = evals.filter((e) => e.course_id === c.id)
          const graded = mine.filter((e) => nota.has(e.id))
          const acumulado = graded.reduce((sum, e) => sum + (nota.get(e.id) as number) * (e.peso / 100), 0)
          const restante = 100 - graded.reduce((sum, e) => sum + e.peso, 0)
          const pasar = 11
          const necesario = restante > 0 ? (pasar - acumulado) / (restante / 100) : null
          return {
            curso: c.nombre,
            calificadas: graded.map((e) => ({ evaluacion: e.nombre, nota: nota.get(e.id), peso: `${e.peso}%` })),
            acumulado: Number(acumulado.toFixed(2)),
            peso_pendiente: `${restante}%`,
            promedio_necesario_en_lo_que_falta: necesario === null ? null : Number(Math.max(0, necesario).toFixed(1)),
            ya_aprobado: acumulado >= pasar,
            imposible_aprobar: necesario === null ? acumulado < pasar : necesario > 20,
          }
        }),
      }
    }

    case 'proponer_reserva': {
      const { space_id, fecha, hora_inicio } = args
      if (typeof space_id !== 'string' || !isDate(fecha) || !isTime(hora_inicio)) {
        return { ok: false, error: 'Faltan datos válidos: espacio, fecha (AAAA-MM-DD) y hora (HH:MM).' }
      }
      const dur = args.duracion_horas === 2 ? 2 : 1
      const [cfg, spaces, me] = await Promise.all([db.settings(), db.spaces(), db.me()])
      const space = spaces.find((s) => s.id === space_id)
      if (!space) return { ok: false, error: 'Ese espacio no existe. Usa un id de buscar_espacios.' }
      const problem = dayProblem(space, fecha, ctx, cfg)
      if (problem) return { ok: false, error: problem }

      const start = toMin(hora_inicio)
      if (start < (cfg.openHour ?? 8) * 60 || start + dur * 60 > (cfg.closeHour ?? 20) * 60) {
        return { ok: false, error: `El horario debe estar entre las ${cfg.openHour ?? 8}:00 y las ${cfg.closeHour ?? 20}:00.` }
      }
      const busy = await db.occupancy(fecha, fecha)
      const libres = freeStarts(space, fecha, dur, busy, cfg, ctx.today)
      if (!libres.includes(hora_inicio)) {
        return {
          ok: false,
          error: 'Ese horario no está libre.',
          horarios_libres: libres.slice(0, 6),
        }
      }

      let integrantes: string[] = [me.codigo]
      if (space.tipo === 'sala_grupal') {
        const dir = await db.students()
        const asked = Array.isArray(args.integrantes) ? (args.integrantes as unknown[]).map((c) => String(c).trim().toUpperCase()) : []
        const unknown = asked.filter((c) => !dir.some((d) => d.codigo.toUpperCase() === c))
        if (unknown.length) return { ok: false, error: `Estos códigos no corresponden a alumnos: ${unknown.join(', ')}.` }
        integrantes = Array.from(new Set([me.codigo.toUpperCase(), ...asked]))
        const min = cfg.minMembers ?? 3
        if (integrantes.length < min) {
          return { ok: false, error: `La sala requiere mínimo ${min} integrantes contando al alumno. Faltan ${min - integrantes.length}. Pide los códigos de sus compañeros.` }
        }
        if (integrantes.length > space.capacidad_max) {
          return { ok: false, error: `Esta sala admite hasta ${space.capacidad_max} personas.` }
        }
      }

      const fin = fromMin(start + dur * 60)
      const motivo = space.tipo === 'sala_grupal' ? (typeof args.motivo === 'string' && args.motivo.trim() ? args.motivo.trim().slice(0, 80) : 'Trabajo en equipo') : 'Uso individual'
      ctx.proposal = {
        kind: 'reserva',
        spaceId: space.id,
        spaceNombre: space.nombre,
        fecha,
        inicio: hora_inicio,
        fin,
        motivo,
        integrantes,
        resumen: `${space.nombre} · ${space.edificio}, ${space.sede} · ${DAYS[dowOf(fecha)]} ${fecha} de ${hora_inicio} a ${fin}${space.tipo === 'sala_grupal' ? ` · ${integrantes.length} personas` : ''}`,
      }
      return { ok: true, mensaje: 'Propuesta lista. La app mostrará un botón de confirmación al alumno; pídele que confirme.' }
    }

    case 'proponer_cancelacion': {
      const codigo = typeof args.codigo === 'string' ? args.codigo.trim().toUpperCase() : ''
      const rows = await db.myReservations()
      const r = rows.find((x) => x.codigo.toUpperCase() === codigo && x.estado === 'confirmada')
      if (!r) return { ok: false, error: 'No encontré una reserva activa con ese código. Usa mis_reservas para ver las disponibles.' }
      const cfg = await db.settings()
      // Minutos hasta el inicio, en hora de Lima.
      const minsToStart = diffDays(ctx.today.fecha, r.fecha) * 1440 + toMin(r.inicio) - ctx.today.min
      if (minsToStart <= 0) return { ok: false, error: 'Esa reserva ya empezó y no se puede cancelar.' }
      const penal = minsToStart < (cfg.freeCancelMinutes ?? 60)
      ctx.proposal = {
        kind: 'cancelar',
        reservaId: r.id,
        codigo: r.codigo,
        penalizacion: penal,
        resumen: `Cancelar la reserva ${r.codigo} del ${r.fecha} a las ${r.inicio}.${penal ? ` Faltan menos de ${cfg.freeCancelMinutes ?? 60} minutos: habrá ${cfg.penaltyDays ?? 7} días de penalidad.` : ''}`,
      }
      return { ok: true, penalidad: penal, mensaje: 'Propuesta lista. Avisa si hay penalidad y pide confirmación.' }
    }

    case 'proponer_asistencia': {
      const rows = await db.announcements()
      const a = rows.find((x) => x.id === args.anuncio_id)
      if (!a) return { ok: false, error: 'No encontré esa actividad. Usa listar_anuncios.' }
      if (a.fecha < ctx.today.fecha) return { ok: false, error: 'Esa actividad ya terminó.' }
      if (a.asistire) return { ok: false, error: 'El alumno ya confirmó su asistencia a esa actividad.' }
      if (a.cupos !== null && a.asistentes >= a.cupos) return { ok: false, error: 'Ya no quedan cupos.' }
      ctx.proposal = {
        kind: 'asistencia',
        anuncioId: a.id,
        titulo: a.titulo,
        resumen: `Confirmar asistencia a «${a.titulo}» · ${a.lugar}, ${a.sede} · ${DAYS[dowOf(a.fecha)]} ${a.fecha} a las ${a.inicio}`,
      }
      return { ok: true, mensaje: 'Propuesta lista. Pide confirmación.' }
    }

    case 'proponer_unirse_grupo': {
      const rows = await db.groups()
      const g = rows.find((x) => x.id === args.grupo_id)
      if (!g) return { ok: false, error: 'No encontré ese grupo. Usa buscar_grupos.' }
      if (g.es_miembro) return { ok: false, error: 'El alumno ya es integrante de ese grupo.' }
      if (g.integrantes >= g.cupos) return { ok: false, error: 'El grupo ya está completo.' }
      ctx.proposal = {
        kind: 'unirse_grupo',
        grupoId: g.id,
        titulo: `${g.curso}: ${g.tema}`,
        resumen: `Unirte al grupo de ${g.curso} («${g.tema}») · ${DAYS[dowOf(g.fecha)]} ${g.fecha} a las ${g.inicio} · ${g.modalidad}`,
      }
      return { ok: true, mensaje: 'Propuesta lista. Pide confirmación.' }
    }

    default:
      return { error: `Herramienta desconocida: ${name}` }
  }
}

// ───────────────────────── Instrucciones del modelo ─────────────────────────

export function systemPrompt(me: { codigo: string; nombre: string; sede: string }, cfg: Record<string, number>, now: Date): string {
  const t = limaNow(now)
  return [
    'Eres el asistente de UTP+ Service, la app de servicios de la Universidad Tecnológica del Perú (UTP).',
    `Hablas con ${me.nombre} (código ${me.codigo}), cuya sede habitual es ${me.sede}.`,
    `Ahora son las ${t.hora} del ${DAYS[t.dow]} ${t.fecha} en Lima (zona America/Lima).`,
    '',
    'Cómo responder:',
    '- Español claro y cercano, en 1 a 3 frases cortas: tus respuestas se leen en voz alta. Sin listas largas, sin emojis, sin markdown.',
    '- Usa SIEMPRE las herramientas para consultar datos reales. Nunca inventes espacios, horarios, códigos ni cupos.',
    '- Si falta un dato imprescindible (fecha, hora, cuántas personas, códigos de compañeros), pregunta solo eso, de a una cosa a la vez.',
    '- Interpreta fechas relativas ("mañana", "el viernes", "a las 3 de la tarde" = 15:00) con la fecha y hora de arriba.',
    '- Para reservar: busca con buscar_espacios, elige la mejor opción (prioriza la sede habitual) y llama a proponer_reserva. Para cancelar, unirse a un grupo o asistir a una actividad usa su herramienta proponer_*.',
    '- Las herramientas proponer_* NO ejecutan nada: la app muestra una tarjeta y el alumno confirma. Después de proponer, di en una frase qué propones y pide que confirme con el botón. Nunca digas que ya está hecho.',
    '- Si una herramienta devuelve error, explícalo en palabras simples y ofrece una alternativa (por ejemplo, otros horarios libres).',
    '- También ayudas con la vida de estudiante: cursos que lleva, notas y cuánto necesita para aprobar, tareas pendientes y próximas evaluaciones (herramientas mis_cursos, mis_notas, tareas_pendientes y proximas_evaluaciones). Da cifras reales de las herramientas, con pocas palabras, y menciona primero lo más urgente.',
    '- Si piden algo fuera de reservas, grupos, actividades del campus, cursos o ayuda de la app, di amablemente qué sí puedes hacer.',
    '',
    'Reglas de la universidad:',
    `- Salas grupales: mínimo ${cfg.minMembers ?? 3} personas (incluido el alumno), cerradas los sábados. PCs y cubículos: 1 persona.`,
    `- Máximo ${cfg.maxHours ?? 2} horas por reserva, de ${cfg.openHour ?? 8}:00 a ${cfg.closeHour ?? 20}:00, con hasta ${cfg.bookingWindowDays ?? 14} días de anticipación.`,
    '- Una reserva activa por tipo de espacio.',
    `- Cancelar sin penalidad hasta ${cfg.freeCancelMinutes ?? 60} minutos antes; después, ${cfg.penaltyDays ?? 7} días sin reservar.`,
    '- El ingreso se registra con el QR hasta 15 minutos después del inicio.',
  ].join('\n')
}

// ───────────────────────── Bucle del agente ─────────────────────────

const MAX_STEPS = 6
const MAX_HISTORY = 12

export async function runAgent(messages: ChatMessage[], deps: AgentDeps): Promise<AgentResult> {
  const now = deps.now ?? new Date()
  const lima = limaNow(now)
  const [me, cfg] = await Promise.all([deps.db.me(), deps.db.settings()])
  const ctx: Ctx = { deps, today: { fecha: lima.fecha, min: lima.min, dow: lima.dow }, proposal: null, tools: [] }

  const contents: GeminiContent[] = messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }))

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await deps.callModel({
      systemInstruction: { parts: [{ text: systemPrompt(me, cfg, now) }] },
      contents,
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
      generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
    })

    if (res.promptFeedback?.blockReason) throw new AgentError('model_blocked', res.promptFeedback.blockReason)
    const content = res.candidates?.[0]?.content
    const parts = content?.parts ?? []
    const calls = parts.filter((p) => p.functionCall)

    if (!calls.length) {
      const text = parts.map((p) => p.text ?? '').join('').trim()
      if (!text) throw new AgentError('model_empty', 'El modelo no devolvió texto.')
      return { reply: text, proposal: ctx.proposal, tools: ctx.tools }
    }

    // Se conserva la respuesta del modelo tal cual (incluye firmas internas que algunos modelos exigen).
    contents.push({ role: 'model', parts })
    const responses: GeminiPart[] = []
    for (const p of calls) {
      const { name, args } = p.functionCall!
      let result: unknown
      try {
        result = await execTool(name, args ?? {}, ctx)
      } catch (e) {
        result = { error: `No se pudo consultar: ${e instanceof Error ? e.message : 'error desconocido'}` }
      }
      responses.push({ functionResponse: { name, response: { result } } })
    }
    contents.push({ role: 'user', parts: responses })
  }

  throw new AgentError('too_many_steps', 'El asistente dio demasiadas vueltas.')
}

// ───────────────────────── Voz: transcripción ─────────────────────────

export interface AudioInput {
  mimeType: string
  /** Audio en base64. */
  data: string
}

export const AUDIO_MIME = ['audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg', 'audio/flac']
/** Tope del audio en base64 (unos 60 s de voz en WAV de 16 kHz mono). */
export const MAX_AUDIO_B64 = 2_600_000

const NO_SPEECH = '[SIN_VOZ]'

/**
 * Convierte la voz del alumno en texto con el mismo modelo. Devuelve null si no se entiende nada.
 * Se hace en un paso aparte para mostrar al alumno lo que se entendió y guardarlo en el historial.
 */
export async function transcribeAudio(
  audio: AudioInput,
  callModel: AgentDeps['callModel'],
): Promise<string | null> {
  const res = await callModel({
    systemInstruction: {
      parts: [
        {
          text:
            'Transcribes audio en español peruano de un alumno universitario que le habla a un asistente de reservas. ' +
            'Responde SOLO con lo que dice la persona, sin comillas, sin comentarios y sin traducir. ' +
            'Escribe las horas y fechas como se dicen ("a las tres de la tarde", "el viernes"). ' +
            `Si no hay voz clara o no se entiende, responde exactamente: ${NO_SPEECH}`,
        },
      ],
    },
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: audio.mimeType, data: audio.data } }, { text: 'Transcribe el audio.' }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 300 },
  })
  if (res.promptFeedback?.blockReason) throw new AgentError('model_blocked', res.promptFeedback.blockReason)
  const text = (res.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim()
  if (!text || text.includes(NO_SPEECH)) return null
  return text.slice(0, 600)
}
