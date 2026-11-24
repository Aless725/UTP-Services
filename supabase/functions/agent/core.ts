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
  | { kind: 'cupon'; beneficioId: string; empresa: string; resumen: string }
  | { kind: 'cancelar_tramite'; codigo: string; resumen: string }
  | { kind: 'reserva_equipo'; equipoId: string; nombre: string; fecha: string; inicio: string; fin: string; resumen: string }
  | { kind: 'cancelar_equipo'; codigo: string; penalizacion: boolean; resumen: string }
  | { kind: 'inscripcion_taller'; grupoId: string; titulo: string; version: string; resumen: string }
  | { kind: 'postulacion'; ofertaId: string; titulo: string; nombre: string; correo: string; resumen: string }
  | { kind: 'solicitud_tramite'; tipoId: string; titulo: string; detalle: Record<string, string>; resumen: string }

export interface AgentResult {
  reply: string
  proposal: Proposal | null
  tools: string[]
}

/** Acceso de solo lectura a los datos, con la sesión del alumno. */
export interface Db {
  me(): Promise<{ codigo: string; nombre: string; sede: string; nombre_completo?: string }>
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
  /** Solicitudes de trámites del alumno, de la más reciente a la más antigua, con su último evento. */
  procedures(): Promise<ProcedureRow[]>
  procedureTypes(): Promise<ProcedureTypeRow[]>
  /** Clases en vivo, temas y anuncios de un curso. */
  courseInfo(courseId: string): Promise<CourseInfoRow>
  /** Equipos reservables (laptops, computadoras y tablets). */
  equipment(): Promise<EquipmentRow[]>
  /** Franjas ocupadas de los equipos en un rango de fechas (sin datos de quién reservó). */
  equipmentBusy(desde: string, hasta: string): Promise<EquipmentBusyRow[]>
  myEquipmentReservations(): Promise<EquipmentReservationRow[]>
  workshops(): Promise<WorkshopRow[]>
  myWorkshopEnrollments(): Promise<WorkshopEnrollmentRow[]>
  jobOffers(): Promise<JobOfferRow[]>
  myApplications(): Promise<JobApplicationRow[]>
  notifications(): Promise<NotificationRow[]>
}

export interface EquipmentRow {
  id: string
  tipo: 'laptop' | 'computadora' | 'tablet'
  nombre: string
  ubicacion: string
  sede: string
}
export interface EquipmentBusyRow {
  equipment_id: string
  fecha: string
  inicio: string
  fin: string
}
export interface EquipmentReservationRow {
  codigo: string
  equipment_id: string
  fecha: string
  inicio: string
  fin: string
  estado: 'confirmada' | 'cancelada'
}
export interface WorkshopGroupRow {
  id: string
  sede: string
  docente: string
  modalidad: string
  lugar: string
  inicio: string
  fin: string
  inscripcion_abre: string
  inscripcion_cierra: string
  estado: string
  vacantes: number
  horarios: { dia: number; inicio: string; fin: string }[]
}
export interface WorkshopRow {
  id: string
  categoria: 'cultural' | 'deportivo'
  titulo: string
  descripcion: string
  version_terminos: string
  declaracion: string
  grupos: WorkshopGroupRow[]
}
export interface WorkshopEnrollmentRow {
  codigo: string
  estado: string
  grupo_id: string
  snapshot: { titulo?: string; sede?: string; inicio?: string; fin?: string }
}
export interface JobOfferRow {
  id: string
  empresa: string
  puesto: string
  tipo: 'full_time' | 'part_time' | 'practica'
  ciudad: string
  area: string
  experiencia: string
  cierra_en: string | null
}
export interface JobApplicationRow {
  oferta_id: string
  codigo: string
  estado: string
}
export interface NotificationRow {
  titulo: string
  cuerpo: string
  leida: boolean
  created_at: string
}
export interface CampoRow {
  key: string
  label: string
  type: 'select' | 'text' | 'textarea' | 'curso' | 'check'
  options?: string[]
  required?: boolean
}

export interface ProcedureRow {
  codigo: string
  tipo_id: string
  titulo: string
  estado: 'en_revision' | 'aprobado' | 'rechazado' | 'cancelada'
  fecha: string
  ultimo_evento: string
}
export interface ProcedureTypeRow {
  id: string
  categoria: 'autogestionable' | 'sae'
  titulo: string
  descripcion: string
  costo: number
  plazo: string
  modalidad: string
  campos?: CampoRow[]
}
export interface CourseInfoRow {
  sesiones: { dow: number; inicio: string; fin: string; tipo: string }[]
  temas: string[]
  anuncios: { titulo: string; texto: string }[]
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
    name: 'info_curso',
    description:
      'Datos de un curso: docente, créditos, modalidad, horario de las clases en vivo (Zoom), el tema de esta semana y los últimos anuncios del docente.',
    parameters: { type: 'object', properties: { curso: str('Nombre o sigla del curso.') }, required: ['curso'] },
  },
  {
    name: 'mis_tramites',
    description: 'Solicitudes de trámites del alumno con su estado (en revisión, aprobado, rechazado o cancelada) y su último movimiento.',
    parameters: {
      type: 'object',
      properties: { estado: str('Filtra por estado (opcional).', { enum: ['en_revision', 'aprobado', 'rechazado', 'cancelada'] }) },
    },
  },
  {
    name: 'buscar_tramites',
    description: 'Busca en el catálogo de trámites (autogestionables y SAE en línea) y devuelve costo, plazo y modalidad.',
    parameters: { type: 'object', properties: { consulta: str('Palabras del trámite, por ejemplo "constancia" o "retiro".') }, required: ['consulta'] },
  },
  {
    name: 'buscar_beneficios',
    description: 'Cupones y descuentos de Beneficios+ (convenios con marcas). Categorías: Prime, Gastronomía, Moda y estilo, Entretenimiento, Educación e idiomas.',
    parameters: {
      type: 'object',
      properties: {
        categoria: str('Categoría (opcional).', { enum: ['Prime', 'Gastronomía', 'Moda y estilo', 'Entretenimiento', 'Educación e idiomas'] }),
        consulta: str('Marca o palabra clave (opcional).'),
      },
    },
  },
  {
    name: 'proponer_cupon',
    description: 'Propone generar el cupón de un beneficio. No lo genera: el alumno confirma con un botón.',
    parameters: { type: 'object', properties: { beneficio_id: str('Id devuelto por buscar_beneficios.') }, required: ['beneficio_id'] },
  },
  {
    name: 'proponer_cancelar_tramite',
    description: 'Propone cancelar una solicitud de trámite que sigue en revisión. No la cancela: el alumno confirma con un botón.',
    parameters: { type: 'object', properties: { codigo: str('Código de la solicitud, por ejemplo SOL-2026-0148.') }, required: ['codigo'] },
  },
  {
    name: 'buscar_equipos',
    description:
      'Busca equipos reservables (laptops, computadoras y tablets como iPad o Galaxy Tab). Con fecha devuelve los horarios libres de ese día; sin fecha, la próxima disponibilidad de cada equipo. Úsala antes de proponer una reserva de equipo.',
    parameters: {
      type: 'object',
      properties: {
        tipo: str('Tipo de equipo (opcional).', { enum: ['laptop', 'computadora', 'tablet'] }),
        fecha: str('Fecha AAAA-MM-DD (opcional).'),
        hora_desde: str('Hora mínima de inicio, HH:MM (opcional, solo con fecha).'),
        duracion_horas: { type: 'integer', description: 'Duración en horas: 2 o 4. Por defecto 2.' },
      },
    },
  },
  {
    name: 'mis_reservas_equipos',
    description: 'Reservas de equipos del alumno (código, equipo, fecha y horario).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'proponer_reserva_equipo',
    description:
      'Propone reservar un equipo en un día y hora. No reserva: el alumno confirma con un botón. El horario debe estar libre según buscar_equipos.',
    parameters: {
      type: 'object',
      properties: {
        equipo_id: str('Id devuelto por buscar_equipos.'),
        fecha: str('Fecha AAAA-MM-DD.'),
        hora_inicio: str('Hora de inicio en punto, HH:MM (de 08:00 a 18:00).'),
        duracion_horas: { type: 'integer', description: 'Duración en horas: 2 o 4. Por defecto 2.' },
      },
      required: ['equipo_id', 'fecha', 'hora_inicio'],
    },
  },
  {
    name: 'proponer_cancelacion_equipo',
    description: 'Propone cancelar una reserva de equipo. No cancela: el alumno confirma con un botón.',
    parameters: { type: 'object', properties: { codigo: str('Código de la reserva, por ejemplo EQ-2026-0101.') }, required: ['codigo'] },
  },
  {
    name: 'buscar_talleres',
    description: 'Talleres culturales y deportivos con sus grupos abiertos (sede, modalidad, horario, fechas y vacantes).',
    parameters: {
      type: 'object',
      properties: {
        categoria: str('Categoría (opcional).', { enum: ['cultural', 'deportivo'] }),
        consulta: str('Palabra del taller o del docente (opcional).'),
      },
    },
  },
  {
    name: 'mis_talleres',
    description: 'Talleres en los que el alumno está inscrito.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'proponer_inscripcion_taller',
    description: 'Propone inscribir al alumno en un grupo de taller. No inscribe: el alumno confirma con un botón.',
    parameters: { type: 'object', properties: { grupo_id: str('Id de grupo devuelto por buscar_talleres.') }, required: ['grupo_id'] },
  },
  {
    name: 'buscar_ofertas',
    description: 'Ofertas de la bolsa de trabajo de Empleabilidad (prácticas, part-time y full-time).',
    parameters: {
      type: 'object',
      properties: {
        consulta: str('Puesto, empresa o área (opcional).'),
        tipo: str('Tipo de oferta (opcional).', { enum: ['practica', 'part_time', 'full_time'] }),
        ciudad: str('Ciudad (opcional).'),
      },
    },
  },
  {
    name: 'mis_postulaciones',
    description: 'Ofertas a las que el alumno ya postuló, con su estado.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'proponer_postulacion',
    description:
      'Propone postular a una oferta con el nombre y el correo institucional del alumno. No postula: el alumno confirma con un botón.',
    parameters: { type: 'object', properties: { oferta_id: str('Id devuelto por buscar_ofertas.') }, required: ['oferta_id'] },
  },
  {
    name: 'info_tramite',
    description:
      'Campos que pide un trámite (obligatorios, opciones permitidas y, si pide un curso, los cursos del alumno). Úsala antes de proponer una solicitud.',
    parameters: { type: 'object', properties: { tramite_id: str('Id devuelto por buscar_tramites.') }, required: ['tramite_id'] },
  },
  {
    name: 'proponer_solicitud_tramite',
    description:
      'Propone enviar una solicitud de trámite con los datos del alumno. No la envía: el alumno confirma con un botón. Pide al alumno los datos que falten; nunca inventes datos ni marques una aceptación sin que el alumno la diga.',
    parameters: {
      type: 'object',
      properties: {
        tramite_id: str('Id devuelto por buscar_tramites.'),
        datos_json: str('Objeto JSON con los campos del trámite, por ejemplo {"motivo":"Trabajo","curso":"ihm"}.'),
      },
      required: ['tramite_id'],
    },
  },
  {
    name: 'mis_notificaciones',
    description: 'Las últimas notificaciones del alumno (avisos de reservas, tareas, notas, trámites y más).',
    parameters: { type: 'object', properties: {} },
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

/**
 * Convenios de Beneficios+ (espejo reducido de src/features/beneficios/beneficiosData.ts: si cambias uno, cambia el otro).
 * Los cupones se generan en la app, así que aquí solo se consulta el catálogo.
 */
export const BENEFICIOS = [
  { id: 'cineplanet', empresa: 'Cineplanet', descuento: '2×1 en entradas 2D', categoria: 'Entretenimiento', vigencia: '2026-11-30', modalidad: 'Canje en boletería' },
  { id: 'entel', empresa: 'Entel', descuento: '25% en planes postpago', categoria: 'Prime', vigencia: '2026-12-31', modalidad: 'Tienda y web' },
  { id: 'lenovo', empresa: 'Lenovo', descuento: 'Hasta 15% en laptops', categoria: 'Prime', vigencia: '2026-12-15', modalidad: 'Tienda online' },
  { id: 'bembos', empresa: 'Bembos', descuento: '20% en el combo universitario', categoria: 'Gastronomía', vigencia: '2026-11-30', modalidad: 'Canje en caja' },
  { id: 'starbucks', empresa: 'Starbucks', descuento: '15% en bebidas y snacks', categoria: 'Gastronomía', vigencia: '2026-12-15', modalidad: 'Canje en caja' },
  { id: 'oechsle', empresa: 'Oechsle', descuento: '10% en ropa y calzado', categoria: 'Moda y estilo', vigencia: '2026-12-31', modalidad: 'Tienda y web' },
  { id: 'adidas', empresa: 'Adidas', descuento: '12% en zapatillas y ropa deportiva', categoria: 'Moda y estilo', vigencia: '2026-12-20', modalidad: 'Tienda online' },
  { id: 'teleticket', empresa: 'Teleticket', descuento: '15% en conciertos y shows', categoria: 'Entretenimiento', vigencia: '2026-12-31', modalidad: 'Compra online' },
  { id: 'open-english', empresa: 'Open English', descuento: '40% en tu programa de inglés', categoria: 'Educación e idiomas', vigencia: '2026-12-30', modalidad: 'Plataforma online' },
  { id: 'icpna', empresa: 'ICPNA', descuento: '25% en matrícula de idiomas', categoria: 'Educación e idiomas', vigencia: '2027-01-31', modalidad: 'Sede o virtual' },
] as const

const ESTADO_TRAMITE = { en_revision: 'en revisión', aprobado: 'aprobado', rechazado: 'rechazado', cancelada: 'cancelada' } as const

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

const EQUIP_ABRE = 8
const EQUIP_CIERRA = 20
const DIAS_ISO = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const TIPO_EQUIPO = { laptop: 'laptop', computadora: 'computadora', tablet: 'tablet' } as const

/** Horas de inicio (en punto) libres para un equipo un día dado: lunes a viernes, 08:00 a 20:00, hasta 30 días. */
function equipLibres(id: string, fecha: string, horas: number, busy: EquipmentBusyRow[], ctx: Ctx): string[] {
  const dow = dowOf(fecha)
  if (dow === 0 || dow === 6) return []
  if (fecha < ctx.today.fecha || diffDays(ctx.today.fecha, fecha) > 30) return []
  const out: string[] = []
  for (let h = EQUIP_ABRE; h + horas <= EQUIP_CIERRA; h++) {
    const ini = h * 60
    const fin = (h + horas) * 60
    if (fecha === ctx.today.fecha && ini <= ctx.today.min) continue
    if (busy.some((b) => b.equipment_id === id && b.fecha === fecha && toMin(b.inicio) < fin && toMin(b.fin) > ini)) continue
    out.push(fromMin(ini))
  }
  return out
}

const horarioTexto = (hs: { dia: number; inicio: string; fin: string }[]) => {
  if (!hs.length) return 'sin horario confirmado'
  const dias = Array.from(new Set(hs.map((h) => DIAS_ISO[h.dia]))).join(' y ')
  return `${dias} de ${hs[0].inicio.slice(0, 5)} a ${hs[0].fin.slice(0, 5)}`
}

const OFERTA_TIPO = { practica: 'práctica', part_time: 'part-time', full_time: 'full-time' } as const

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

    case 'info_curso': {
      const { courses, term } = await db.courses()
      const picked = pickCourses(courses, args.curso)
      if (!picked.length) return { error: `No encontré ese curso. Sus cursos son: ${courses.map((c) => c.nombre).join(', ')}.` }
      const c = picked[0]
      const info = await db.courseInfo(c.id)
      const week = term?.semana_actual ?? 1
      // Semanas 1-8 y 10-17 tienen tema; la 9 es el parcial y la 18 el final.
      const tema = week === 9 ? 'Examen parcial' : week === 18 ? 'Examen final' : info.temas[week < 9 ? week - 1 : week - 2] ?? null
      return {
        curso: c.nombre,
        sigla: c.id,
        docente: c.docente,
        creditos: c.creditos,
        modalidad: c.modalidad,
        semana: week,
        tema_de_esta_semana: tema,
        clases_en_vivo: info.sesiones.map((x) => ({ dia: DAYS[x.dow], desde: x.inicio, hasta: x.fin, tipo: x.tipo })),
        anuncios_recientes: info.anuncios.slice(0, 3).map((a) => ({ titulo: a.titulo, texto: a.texto.slice(0, 160) })),
      }
    }

    case 'mis_tramites': {
      const rows = await db.procedures()
      const list = rows
        .filter((p) => !args.estado || p.estado === args.estado)
        .slice(0, 8)
        .map((p) => ({ codigo: p.codigo, tramite: p.titulo, estado: ESTADO_TRAMITE[p.estado], fecha: p.fecha.slice(0, 10), ultimo_movimiento: p.ultimo_evento }))
      return list.length ? { solicitudes: list } : { solicitudes: [], nota: 'El alumno no tiene solicitudes de trámites.' }
    }

    case 'buscar_tramites': {
      const q = typeof args.consulta === 'string' ? norm(args.consulta).trim() : ''
      const words = q.split(/\s+/).filter((w) => w.length > 2)
      const all = await db.procedureTypes()
      const list = all
        .filter((t) => {
          const hay = norm(`${t.titulo} ${t.descripcion}`)
          return !words.length || words.some((w) => hay.includes(w))
        })
        .slice(0, 6)
        .map((t) => ({
          id: t.id,
          tramite: t.titulo,
          categoria: t.categoria === 'sae' ? 'SAE en línea' : 'Autogestionable',
          costo: t.costo > 0 ? `S/ ${t.costo}` : 'Gratis',
          plazo: t.plazo,
          modalidad: t.modalidad,
        }))
      return list.length ? { tramites: list, nota: 'Para solicitarlo, el alumno entra a Trámites en la app.' } : { tramites: [], nota: 'No encontré un trámite con esas palabras.' }
    }

    case 'buscar_beneficios': {
      const q = typeof args.consulta === 'string' ? norm(args.consulta).trim() : ''
      const list = BENEFICIOS.filter(
        (b) => (!args.categoria || b.categoria === args.categoria) && (!q || norm(`${b.empresa} ${b.descuento} ${b.categoria}`).includes(q)),
      ).map((b) => ({ id: b.id, marca: b.empresa, descuento: b.descuento, categoria: b.categoria, vigente_hasta: b.vigencia, canje: b.modalidad }))
      return list.length ? { beneficios: list } : { beneficios: [], nota: 'No encontré beneficios con esas condiciones.' }
    }

    case 'proponer_cupon': {
      const b = BENEFICIOS.find((x) => x.id === args.beneficio_id)
      if (!b) return { ok: false, error: 'No encontré ese beneficio. Usa buscar_beneficios.' }
      if (b.vigencia < ctx.today.fecha) return { ok: false, error: 'Ese beneficio ya venció.' }
      ctx.proposal = { kind: 'cupon', beneficioId: b.id, empresa: b.empresa, resumen: `Generar tu cupón de ${b.empresa}: ${b.descuento} · vigente hasta el ${b.vigencia}` }
      return { ok: true, mensaje: 'Propuesta lista. Pide confirmación.' }
    }

    case 'proponer_cancelar_tramite': {
      const codigo = typeof args.codigo === 'string' ? args.codigo.trim().toUpperCase() : ''
      const p = (await db.procedures()).find((x) => x.codigo.toUpperCase() === codigo)
      if (!p) return { ok: false, error: 'No encontré una solicitud con ese código. Usa mis_tramites.' }
      if (p.estado !== 'en_revision') return { ok: false, error: `Esa solicitud está ${ESTADO_TRAMITE[p.estado]} y ya no se puede cancelar.` }
      ctx.proposal = { kind: 'cancelar_tramite', codigo: p.codigo, resumen: `Cancelar la solicitud ${p.codigo}: ${p.titulo}.` }
      return { ok: true, mensaje: 'Propuesta lista. Pide confirmación.' }
    }

    case 'buscar_equipos': {
      const horas = args.duracion_horas === 4 ? 4 : 2
      const todos = await db.equipment()
      const lista = todos.filter((e) => !args.tipo || e.tipo === args.tipo)
      if (!lista.length) return { equipos: [], nota: 'No hay equipos de ese tipo.' }
      if (args.fecha !== undefined && !isDate(args.fecha)) return { error: 'La fecha debe tener formato AAAA-MM-DD.' }

      if (isDate(args.fecha)) {
        const fecha = args.fecha
        const busy = await db.equipmentBusy(fecha, fecha)
        const desde = isTime(args.hora_desde) ? toMin(args.hora_desde) : 0
        const con = lista
          .map((e) => ({ e, libres: equipLibres(e.id, fecha, horas, busy, ctx).filter((h) => toMin(h) >= desde) }))
          .filter((x) => x.libres.length)
        if (!con.length) {
          return {
            equipos: [],
            nota: 'No hay equipos libres ese día. Se reservan de lunes a viernes, de 08:00 a 20:00 y hasta 30 días por adelantado.',
          }
        }
        return {
          fecha,
          dia: DAYS[dowOf(fecha)],
          duracion_horas: horas,
          equipos: con.slice(0, 8).map(({ e, libres }) => ({
            id: e.id,
            nombre: e.nombre,
            tipo: TIPO_EQUIPO[e.tipo],
            ubicacion: `${e.ubicacion} · ${e.sede}`,
            horarios_libres: libres,
          })),
        }
      }

      const hasta = addDays(ctx.today.fecha, 7)
      const busy = await db.equipmentBusy(ctx.today.fecha, hasta)
      const equipos = lista.slice(0, 10).map((e) => {
        for (let i = 0; i <= 7; i++) {
          const f = addDays(ctx.today.fecha, i)
          const libres = equipLibres(e.id, f, horas, busy, ctx)
          if (libres.length) {
            return {
              id: e.id,
              nombre: e.nombre,
              tipo: TIPO_EQUIPO[e.tipo],
              ubicacion: `${e.ubicacion} · ${e.sede}`,
              proxima_disponibilidad: { fecha: f, dia: DAYS[dowOf(f)], desde: libres[0] },
            }
          }
        }
        return { id: e.id, nombre: e.nombre, tipo: TIPO_EQUIPO[e.tipo], ubicacion: `${e.ubicacion} · ${e.sede}`, proxima_disponibilidad: null }
      })
      return { equipos, nota: 'Pregunta al alumno qué equipo, qué día y a qué hora lo quiere.' }
    }

    case 'mis_reservas_equipos': {
      const [rows, equipos] = await Promise.all([db.myEquipmentReservations(), db.equipment()])
      const list = rows
        .filter((r) => r.estado === 'confirmada' && (r.fecha > ctx.today.fecha || (r.fecha === ctx.today.fecha && toMin(r.fin) > ctx.today.min)))
        .map((r) => ({
          codigo: r.codigo,
          equipo: equipos.find((e) => e.id === r.equipment_id)?.nombre ?? r.equipment_id,
          fecha: r.fecha,
          dia: DAYS[dowOf(r.fecha)],
          horario: `${r.inicio} a ${r.fin}`,
        }))
      return list.length ? { reservas: list } : { reservas: [], nota: 'No tiene reservas de equipos próximas.' }
    }

    case 'proponer_reserva_equipo': {
      const { equipo_id, fecha, hora_inicio } = args
      if (typeof equipo_id !== 'string' || !isDate(fecha) || !isTime(hora_inicio)) {
        return { ok: false, error: 'Faltan datos válidos: equipo, fecha (AAAA-MM-DD) y hora (HH:MM).' }
      }
      const horas = args.duracion_horas === 4 ? 4 : 2
      const [equipos, mine] = await Promise.all([db.equipment(), db.myEquipmentReservations()])
      const equipo = equipos.find((e) => e.id === equipo_id)
      if (!equipo) return { ok: false, error: 'Ese equipo no existe. Usa un id de buscar_equipos.' }
      const activa = mine.find(
        (r) => r.estado === 'confirmada' && (r.fecha > ctx.today.fecha || (r.fecha === ctx.today.fecha && toMin(r.fin) > ctx.today.min)),
      )
      if (activa) {
        return { ok: false, error: `Ya tiene una reserva de equipo activa (${activa.codigo}). Solo puede tener una: debe cancelarla antes de reservar otra.` }
      }
      const busy = await db.equipmentBusy(fecha, fecha)
      const libres = equipLibres(equipo.id, fecha, horas, busy, ctx)
      if (!libres.includes(hora_inicio)) {
        return {
          ok: false,
          error: 'Ese horario no está libre (los equipos se reservan de lunes a viernes, de 08:00 a 20:00, hasta 30 días por adelantado y en horas en punto).',
          horarios_libres: libres.slice(0, 8),
        }
      }
      const fin = fromMin(toMin(hora_inicio) + horas * 60)
      ctx.proposal = {
        kind: 'reserva_equipo',
        equipoId: equipo.id,
        nombre: equipo.nombre,
        fecha,
        inicio: hora_inicio,
        fin,
        resumen: `${equipo.nombre} · ${equipo.ubicacion}, ${equipo.sede} · ${DAYS[dowOf(fecha)]} ${fecha} de ${hora_inicio} a ${fin}`,
      }
      return { ok: true, mensaje: 'Propuesta lista. La app mostrará un botón de confirmación al alumno; pídele que confirme.' }
    }

    case 'proponer_cancelacion_equipo': {
      const codigo = typeof args.codigo === 'string' ? args.codigo.trim().toUpperCase() : ''
      const rows = await db.myEquipmentReservations()
      const r = rows.find((x) => x.codigo.toUpperCase() === codigo && x.estado === 'confirmada')
      if (!r) return { ok: false, error: 'No encontré una reserva de equipo activa con ese código. Usa mis_reservas_equipos.' }
      const cfg = await db.settings()
      const minsToStart = diffDays(ctx.today.fecha, r.fecha) * 1440 + toMin(r.inicio) - ctx.today.min
      if (toMin(r.fin) + diffDays(ctx.today.fecha, r.fecha) * 1440 <= ctx.today.min) return { ok: false, error: 'Esa reserva ya terminó.' }
      const penal = minsToStart < (cfg.freeCancelMinutes ?? 60)
      ctx.proposal = {
        kind: 'cancelar_equipo',
        codigo: r.codigo,
        penalizacion: penal,
        resumen: `Cancelar la reserva ${r.codigo} del ${r.fecha} a las ${r.inicio}.${penal ? ` Falta menos de ${cfg.freeCancelMinutes ?? 60} minutos: habrá ${cfg.penaltyDays ?? 7} días de penalidad.` : ''}`,
      }
      return { ok: true, penalidad: penal, mensaje: 'Propuesta lista. Avisa si hay penalidad y pide confirmación.' }
    }

    case 'buscar_talleres': {
      const ahora = (ctx.deps.now ?? new Date()).getTime()
      const q = typeof args.consulta === 'string' ? norm(args.consulta).trim() : ''
      const talleres = await db.workshops()
      const list = talleres
        .filter((t) => !args.categoria || t.categoria === args.categoria)
        .filter((t) => !q || norm(`${t.titulo} ${t.descripcion} ${t.grupos.map((g) => g.docente).join(' ')}`).includes(q))
        .map((t) => ({
          id: t.id,
          taller: t.titulo,
          categoria: t.categoria,
          grupos: t.grupos
            .filter((g) => g.estado === 'abierto' && Date.parse(g.inscripcion_abre) <= ahora && ahora < Date.parse(g.inscripcion_cierra) && g.vacantes > 0)
            .map((g) => ({
              grupo_id: g.id,
              sede: g.sede,
              modalidad: g.modalidad,
              lugar: g.lugar,
              docente: g.docente,
              horario: horarioTexto(g.horarios),
              inicia: g.inicio,
              termina: g.fin,
              vacantes: g.vacantes,
            })),
        }))
        .filter((t) => t.grupos.length)
        .slice(0, 8)
      return list.length ? { talleres: list } : { talleres: [], nota: 'No hay talleres con grupos abiertos y vacantes con esas condiciones.' }
    }

    case 'mis_talleres': {
      const rows = (await db.myWorkshopEnrollments()).filter((r) => r.estado === 'inscrita')
      const list = rows.map((r) => ({
        codigo: r.codigo,
        taller: r.snapshot?.titulo ?? '',
        sede: r.snapshot?.sede ?? '',
        inicia: r.snapshot?.inicio ?? '',
        termina: r.snapshot?.fin ?? '',
      }))
      return list.length ? { inscripciones: list } : { inscripciones: [], nota: 'No está inscrito en ningún taller.' }
    }

    case 'proponer_inscripcion_taller': {
      const ahora = (ctx.deps.now ?? new Date()).getTime()
      const talleres = await db.workshops()
      const w = talleres.find((t) => t.grupos.some((g) => g.id === args.grupo_id))
      const g = w?.grupos.find((x) => x.id === args.grupo_id)
      if (!w || !g) return { ok: false, error: 'No encontré ese grupo. Usa buscar_talleres.' }
      if (g.estado !== 'abierto' || ahora < Date.parse(g.inscripcion_abre) || ahora >= Date.parse(g.inscripcion_cierra)) {
        return { ok: false, error: 'La inscripción a ese grupo no está abierta.' }
      }
      if (g.vacantes <= 0) return { ok: false, error: 'Ese grupo ya no tiene vacantes.' }
      const mine = await db.myWorkshopEnrollments()
      if (mine.some((r) => r.grupo_id === g.id && r.estado === 'inscrita')) {
        return { ok: false, error: 'El alumno ya está inscrito en ese grupo.' }
      }
      ctx.proposal = {
        kind: 'inscripcion_taller',
        grupoId: g.id,
        titulo: w.titulo,
        version: w.version_terminos,
        resumen: `Inscribirte en «${w.titulo}» · ${g.sede} (${g.modalidad}) · ${horarioTexto(g.horarios)} · del ${g.inicio} al ${g.fin}. Al confirmar aceptas los términos del taller y declaras: ${w.declaracion}`,
      }
      return { ok: true, mensaje: 'Propuesta lista. Menciona que al confirmar acepta los términos del taller y pide confirmación.' }
    }

    case 'buscar_ofertas': {
      const q = typeof args.consulta === 'string' ? norm(args.consulta).trim() : ''
      const ciudad = typeof args.ciudad === 'string' ? norm(args.ciudad).trim() : ''
      const [ofertas, apps] = await Promise.all([db.jobOffers(), db.myApplications()])
      const ya = new Set(apps.map((a) => a.oferta_id))
      const list = ofertas
        .filter((o) => !args.tipo || o.tipo === args.tipo)
        .filter((o) => !ciudad || norm(o.ciudad).includes(ciudad))
        .filter((o) => !q || norm(`${o.puesto} ${o.empresa} ${o.area}`).includes(q))
        .slice(0, 8)
        .map((o) => ({
          id: o.id,
          puesto: o.puesto,
          empresa: o.empresa,
          tipo: OFERTA_TIPO[o.tipo],
          ciudad: o.ciudad,
          area: o.area,
          experiencia: o.experiencia || 'No especificada',
          ya_postulaste: ya.has(o.id),
        }))
      return list.length ? { ofertas: list } : { ofertas: [], nota: 'No encontré ofertas con esas condiciones.' }
    }

    case 'mis_postulaciones': {
      const [apps, ofertas] = await Promise.all([db.myApplications(), db.jobOffers()])
      const list = apps.map((a) => ({
        codigo: a.codigo,
        oferta: ofertas.find((o) => o.id === a.oferta_id)?.puesto ?? a.oferta_id,
        estado: a.estado.replace('_', ' '),
      }))
      return list.length ? { postulaciones: list } : { postulaciones: [], nota: 'No tiene postulaciones.' }
    }

    case 'proponer_postulacion': {
      const [ofertas, apps, me] = await Promise.all([db.jobOffers(), db.myApplications(), db.me()])
      const o = ofertas.find((x) => x.id === args.oferta_id)
      if (!o) return { ok: false, error: 'No encontré esa oferta (o ya cerró). Usa buscar_ofertas.' }
      if (apps.some((a) => a.oferta_id === o.id)) return { ok: false, error: 'El alumno ya postuló a esa oferta.' }
      const nombre = me.nombre_completo ?? me.nombre
      const correo = `${me.codigo.toLowerCase()}@utp.edu.pe`
      ctx.proposal = {
        kind: 'postulacion',
        ofertaId: o.id,
        titulo: o.puesto,
        nombre,
        correo,
        resumen: `Postular a «${o.puesto}» en ${o.empresa} (${o.ciudad}) como ${nombre}, con el correo ${correo}.`,
      }
      return { ok: true, mensaje: 'Propuesta lista. Pide confirmación.' }
    }

    case 'info_tramite': {
      const [tipos, cursos] = await Promise.all([db.procedureTypes(), db.courses()])
      const t = tipos.find((x) => x.id === args.tramite_id)
      if (!t) return { error: 'No encontré ese trámite. Usa buscar_tramites.' }
      return {
        tramite: t.titulo,
        costo: t.costo > 0 ? `S/ ${t.costo}` : 'Gratis',
        plazo: t.plazo,
        campos: (t.campos ?? []).map((c) => ({
          clave: c.key,
          etiqueta: c.label,
          tipo: c.type,
          obligatorio: !!c.required,
          ...(c.type === 'select' ? { opciones: c.options } : {}),
          ...(c.type === 'curso' ? { opciones: cursos.courses.map((x) => ({ id: x.id, nombre: x.nombre })) } : {}),
          ...(c.type === 'check' ? { nota: 'El alumno debe aceptarlo expresamente.' } : {}),
        })),
      }
    }

    case 'proponer_solicitud_tramite': {
      const [tipos, cursos, mine] = await Promise.all([db.procedureTypes(), db.courses(), db.procedures()])
      const t = tipos.find((x) => x.id === args.tramite_id)
      if (!t) return { ok: false, error: 'No encontré ese trámite. Usa buscar_tramites.' }
      if (mine.some((p) => p.tipo_id === t.id && p.estado === 'en_revision')) {
        return { ok: false, error: 'Ya tiene una solicitud de este trámite en revisión.' }
      }
      let datos: Record<string, unknown> = {}
      try {
        const v = typeof args.datos_json === 'string' && args.datos_json.trim() ? JSON.parse(args.datos_json) : {}
        if (v && typeof v === 'object' && !Array.isArray(v)) datos = v as Record<string, unknown>
      } catch {
        return { ok: false, error: 'datos_json no es un JSON válido.' }
      }
      const faltan: string[] = []
      const invalidos: string[] = []
      const detalle: Record<string, string> = {}
      const lineas: string[] = []
      for (const c of t.campos ?? []) {
        const raw = String(datos[c.key] ?? '').trim()
        if (!raw) {
          if (c.required) faltan.push(c.label)
          continue
        }
        if (c.type === 'select') {
          const opt = (c.options ?? []).find((o) => norm(o) === norm(raw))
          if (!opt) { invalidos.push(`${c.label} (opciones: ${(c.options ?? []).join(', ')})`); continue }
          detalle[c.key] = opt
          lineas.push(`${c.label}: ${opt}`)
        } else if (c.type === 'curso') {
          const found = pickCourses(cursos.courses, raw)[0]
          if (!found) { invalidos.push(`${c.label} (cursos: ${cursos.courses.map((x) => x.nombre).join(', ')})`); continue }
          detalle[c.key] = found.id
          lineas.push(`${c.label}: ${found.nombre}`)
        } else if (c.type === 'check') {
          if (!['true', 'si', 'sí', 'acepto', '1'].includes(norm(raw))) { invalidos.push(c.label); continue }
          detalle[c.key] = 'true'
          lineas.push(`Aceptas: ${c.label}`)
        } else {
          const max = c.type === 'textarea' ? 400 : 120
          if (raw.length > max) { invalidos.push(`${c.label} (máximo ${max} caracteres)`); continue }
          detalle[c.key] = raw
          lineas.push(`${c.label}: ${raw}`)
        }
      }
      if (faltan.length || invalidos.length) return { ok: false, faltan, invalidos, nota: 'Pide al alumno solo lo que falta o corrige lo inválido.' }
      ctx.proposal = {
        kind: 'solicitud_tramite',
        tipoId: t.id,
        titulo: t.titulo,
        detalle,
        resumen: `Solicitar «${t.titulo}»${lineas.length ? ': ' + lineas.join(' · ') : ''}.`,
      }
      return { ok: true, mensaje: 'Propuesta lista. Pide confirmación.' }
    }

    case 'mis_notificaciones': {
      const rows = await db.notifications()
      return rows.length
        ? { notificaciones: rows.slice(0, 8).map((n) => ({ titulo: n.titulo, detalle: n.cuerpo, sin_leer: !n.leida, cuando: n.created_at.slice(0, 10) })) }
        : { notificaciones: [], nota: 'No tiene notificaciones.' }
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
    '- También consultas el estado de sus trámites (mis_tramites), el costo y plazo de cada trámite (buscar_tramites), los datos de un curso, su horario de clases en vivo y el tema de la semana (info_curso) y los cupones de Beneficios+ (buscar_beneficios). Para generar un cupón o cancelar un trámite usa proponer_cupon o proponer_cancelar_tramite. No puedes crear solicitudes de trámites: indica que lo haga en la sección Trámites.',
    '- Habla como una persona: natural, cálida y directa, con frases cortas y conectores ("vale", "mira", "listo"). Evita sonar a lista o a formulario. Di las fechas como se dicen ("el jueves 27", "mañana"), no como códigos.',
    '- Reserva de equipos (laptops, computadoras y tablets como iPad o Galaxy Tab): si piden "una tablet" o "una laptop" sin más datos, llama a buscar_equipos con el tipo, ofrece en una frase 2 o 3 opciones con su próxima disponibilidad y pregunta cuál, qué día y a qué hora. Cuando elijan, llama a buscar_equipos con esa fecha para ver las horas libres y propón con proponer_reserva_equipo (2 horas si no dicen otra duración; máximo 4). Si dan todo de una vez, busca y propón directo. Solo se puede tener una reserva de equipo activa; si ya tiene una, ofrece cancelarla con proponer_cancelacion_equipo.',
    '- Talleres: busca con buscar_talleres, resume las opciones y propón la inscripción con proponer_inscripcion_taller; al confirmar el alumno acepta los términos del taller. Empleabilidad: busca con buscar_ofertas y propón con proponer_postulacion. Trámites: usa buscar_tramites, luego info_tramite para ver qué datos pide, pregunta al alumno lo que falte (de a una cosa) y propón con proponer_solicitud_tramite; las casillas de aceptación las debe aceptar el alumno de forma expresa.',
    '- Si piden algo fuera de reservas de espacios y equipos, grupos, actividades del campus, cursos, trámites, talleres, empleabilidad, beneficios, notificaciones o ayuda de la app (por ejemplo pagos o el calendario, que aún no consultas), di amablemente qué sí puedes hacer.',
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
