import { addDays, startOfDay, toISO } from '@/lib/date'
import { STUDENTS } from '@/features/reservations/spacesData'
import { cycle, type Course } from '../coursesData'

export const TOTAL_WEEKS = cycle.semanasTotal
export const CURRENT_WEEK = cycle.semanaActual
export const PASS_GRADE = 11

// ───────── Semanas ─────────

/** Lunes de la semana actual: la semana CURRENT_WEEK siempre es "esta semana". */
function thisMonday(today: Date): Date {
  const d = startOfDay(today)
  return addDays(d, -((d.getDay() + 6) % 7))
}

export function weekRange(n: number, today = new Date()) {
  const start = addDays(thisMonday(today), (n - CURRENT_WEEK) * 7)
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

// ───────── Datos propios de cada curso ─────────

interface Meta {
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

const META: Record<string, Meta> = {
  ihm: {
    codigo: 'ISIS-4521',
    horas: 4,
    sumilla:
      'El curso introduce los principios de la interacción humano-computador y del diseño centrado en el usuario. Aborda la investigación con usuarios, el diseño y prototipado de interfaces, la accesibilidad y la evaluación de usabilidad, incluyendo modalidades emergentes como la voz y los entornos móviles.',
    logro:
      'Al finalizar el curso, el estudiante diseña, implementa y evalúa un producto interactivo funcional, aplicando principios de usabilidad, accesibilidad y diseño inclusivo con evidencia de pruebas con usuarios.',
    metodologia:
      'Aprendizaje basado en proyectos. Cada semana combina una sesión de teoría aplicada, un taller de diseño y un espacio de consulta en el aula virtual. El proyecto se construye de forma incremental y se evalúa con usuarios reales.',
    temas: [
      'Introducción a la IHC y la usabilidad',
      'Factores humanos y percepción',
      'Principios del diseño de interacción',
      'Heurísticas de Nielsen',
      'Investigación con usuarios',
      'Personas y escenarios de uso',
      'Arquitectura de información',
      'Prototipado de baja fidelidad',
      'Prototipado de alta fidelidad',
      'Sistemas de diseño',
      'Accesibilidad e inclusión',
      'Interfaces por voz y multimodales',
      'Evaluación heurística',
      'Pruebas de usabilidad y cuestionario SUS',
      'Inteligencia artificial en la interacción',
      'Presentación de proyectos',
    ],
    proyecto: 'Proyecto final (MVP)',
    bibBase: [
      'Norman, D. (2013). The Design of Everyday Things (ed. revisada). Basic Books.',
      'Preece, J., Sharp, H. y Rogers, Y. (2019). Interaction Design: Beyond Human-Computer Interaction (5.ª ed.). Wiley.',
    ],
    bibComp: [
      'Nielsen, J. (1993). Usability Engineering. Morgan Kaufmann.',
      'Shneiderman, B. et al. (2016). Designing the User Interface (6.ª ed.). Pearson.',
      'Krug, S. (2014). Don’t Make Me Think, Revisited. New Riders.',
    ],
    zoom: [
      { dow: 2, inicio: '10:30', fin: '12:00', tipo: 'Clase virtual' },
      { dow: 4, inicio: '10:30', fin: '12:00', tipo: 'Clase virtual' },
    ],
  },
  gti: {
    codigo: 'ISIS-3310',
    horas: 4,
    sumilla:
      'El curso presenta los fundamentos de la gestión de servicios de tecnologías de la información. Revisa el ciclo de vida del servicio, los procesos de estrategia, diseño, transición y operación, y el gobierno de TI con marcos de referencia como ITIL y COBIT.',
    logro:
      'Al finalizar el curso, el estudiante propone y documenta un modelo de gestión de servicios de TI para una organización, definiendo catálogo, niveles de servicio y procesos de operación y mejora continua.',
    metodologia:
      'Clases con estudio de casos, simulaciones de mesa de servicio y trabajo colaborativo. La evaluación combina prácticas calificadas, tareas académicas y un caso de estudio integrador.',
    temas: [
      'Fundamentos de la gestión de servicios de TI',
      'Ciclo de vida del servicio',
      'Estrategia del servicio',
      'Diseño del servicio',
      'Catálogo y niveles de servicio (SLA)',
      'Gestión de la demanda y la capacidad',
      'Gestión de la disponibilidad',
      'Transición del servicio',
      'Gestión de cambios',
      'Gestión de configuraciones y activos',
      'Operación del servicio',
      'Gestión de incidentes',
      'Gestión de problemas',
      'Mesa de servicio',
      'Mejora continua del servicio',
      'Gobierno de TI y casos integradores',
    ],
    proyecto: 'Caso de estudio',
    bibBase: [
      'AXELOS (2019). ITIL Foundation, ITIL 4 Edition. TSO.',
      'ISACA (2018). COBIT 2019 Framework: Introduction and Methodology. ISACA.',
    ],
    bibComp: [
      'ISO/IEC 20000-1:2018. Information technology — Service management.',
      'Hunnebeck, L. (2011). ITIL Service Design (ed. 2011). TSO.',
    ],
    zoom: [{ dow: 5, inicio: '18:00', fin: '19:00', tipo: 'Asesoría' }],
  },
  dwi: {
    codigo: 'ISIS-3405',
    horas: 5,
    sumilla:
      'El curso desarrolla las competencias para construir aplicaciones web modernas de extremo a extremo. Aborda HTML, CSS y JavaScript, el desarrollo de interfaces con React y TypeScript, el consumo de APIs, la seguridad, las pruebas y el despliegue.',
    logro:
      'Al finalizar el curso, el estudiante desarrolla y despliega una aplicación web completa, responsiva y accesible, integrando un servicio de backend y aplicando buenas prácticas de calidad y seguridad.',
    metodologia:
      'Laboratorios guiados en cada sesión, desarrollo incremental de un proyecto web y revisiones de código entre pares. El avance se verifica en repositorio y en el despliegue.',
    temas: [
      'Fundamentos de la web moderna',
      'HTML5 semántico y accesibilidad',
      'CSS y diseño responsivo',
      'JavaScript moderno (ES6+)',
      'Programación asíncrona y APIs REST',
      'TypeScript esencial',
      'Introducción a React',
      'Estado y eventos en React',
      'Enrutamiento y formularios',
      'Consumo de datos y caché',
      'Autenticación y seguridad web',
      'Backend como servicio (Supabase)',
      'Pruebas y calidad de código',
      'Rendimiento y despliegue',
      'PWA y experiencia móvil',
      'Presentación del proyecto web',
    ],
    proyecto: 'Proyecto web',
    bibBase: [
      'Banks, A. y Porcello, E. (2020). Learning React (2.ª ed.). O’Reilly.',
      'Haverbeke, M. (2018). Eloquent JavaScript (3.ª ed.). No Starch Press.',
    ],
    bibComp: [
      'Flanagan, D. (2020). JavaScript: The Definitive Guide (7.ª ed.). O’Reilly.',
      'Freeman, A. (2019). Pro TypeScript. Apress.',
    ],
    zoom: [{ dow: 3, inicio: '19:00', fin: '20:00', tipo: 'Asesoría' }],
  },
  ci2: {
    codigo: 'ISIS-4610',
    horas: 6,
    sumilla:
      'El curso integra los conocimientos de la carrera en el desarrollo de una solución de software para un problema real. Cubre metodologías ágiles, requerimientos, arquitectura, calidad, integración continua, documentación técnica y la sustentación del producto.',
    logro:
      'Al finalizar el curso, el estudiante gestiona y entrega una solución de software integrada, trabajando en equipo con una metodología ágil, y la sustenta con evidencias técnicas y de calidad.',
    metodologia:
      'Trabajo en equipos por sprints con revisiones quincenales. Cada sprint produce un incremento funcional que se demuestra y se retroalimenta con el docente.',
    temas: [
      'Metodologías ágiles y Scrum',
      'Levantamiento de requerimientos',
      'Historias de usuario y backlog',
      'Arquitectura de software',
      'Modelado y diseño de la solución',
      'Control de versiones y trabajo colaborativo',
      'Integración continua',
      'Planificación del proyecto integrador',
      'Desarrollo incremental',
      'Aseguramiento de la calidad',
      'Pruebas de integración',
      'Gestión de riesgos',
      'Documentación técnica',
      'Despliegue y operación',
      'Sustentación y demostración',
      'Cierre y lecciones aprendidas',
    ],
    proyecto: 'Proyecto integrador',
    bibBase: [
      'Hunt, A. y Thomas, D. (2019). The Pragmatic Programmer (2.ª ed.). Addison-Wesley.',
      'Schwaber, K. y Sutherland, J. (2020). The Scrum Guide. scrumguides.org.',
    ],
    bibComp: [
      'Martin, R. (2017). Clean Architecture. Prentice Hall.',
      'Sommerville, I. (2016). Software Engineering (10.ª ed.). Pearson.',
    ],
    zoom: [{ dow: 4, inicio: '18:30', fin: '19:30', tipo: 'Asesoría' }],
  },
}

// ───────── Utilidades deterministas ─────────

export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const metaOf = (id: string): Meta => META[id] ?? META.ihm

/** Tema de la semana n. */
export function topicOf(id: string, week: number): string {
  if (week === 9) return 'Examen parcial'
  if (week === TOTAL_WEEKS) return 'Examen final'
  const t = metaOf(id).temas
  return t[week < 9 ? week - 1 : week - 2]
}

// ───────── Contenido de las semanas ─────────

export type MaterialKind = 'Presentación' | 'Lectura' | 'Video'
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

export function weeksOf(id: string): Week[] {
  return Array.from({ length: TOTAL_WEEKS }, (_, i) => {
    const n = i + 1
    const { start, end } = weekRange(n)
    const tema = topicOf(id, n)
    const exam = n === 9 || n === TOTAL_WEEKS
    const mats: Material[] = exam
      ? [
          { id: `${id}-s${n}-guia`, kind: 'Lectura', title: `Guía de repaso — ${tema}`, detail: '12 páginas' },
          { id: `${id}-s${n}-pres`, kind: 'Presentación', title: 'Resumen de unidades evaluadas', detail: '18 diapositivas' },
        ]
      : [
          { id: `${id}-s${n}-pres`, kind: 'Presentación', title: `Presentación — ${tema}`, detail: `${14 + (hash(id + n) % 12)} diapositivas` },
          { id: `${id}-s${n}-lect`, kind: 'Lectura', title: `Lectura de la semana ${n}`, detail: `${8 + (hash(id + 'l' + n) % 14)} páginas` },
          { id: `${id}-s${n}-vid`, kind: 'Video', title: `Video — ${tema}`, detail: `${8 + (hash(id + 'v' + n) % 10)} min` },
        ]
    return { n, tema, inicio: start, fin: end, actual: n === CURRENT_WEEK, materiales: mats }
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

export function evaluationsOf(id: string): Evaluation[] {
  const scheme = [
    { id: 'ta1', nombre: 'Tarea académica 1', semana: 3, peso: 5 },
    { id: 'pc1', nombre: 'Práctica calificada 1', semana: 5, peso: 10 },
    { id: 'ep', nombre: 'Examen parcial', semana: 9, peso: 20 },
    { id: 'ta2', nombre: 'Tarea académica 2', semana: 11, peso: 5 },
    { id: 'pc2', nombre: 'Práctica calificada 2', semana: 13, peso: 15 },
    { id: 'pf', nombre: metaOf(id).proyecto, semana: 16, peso: 15 },
    { id: 'ef', nombre: 'Examen final', semana: TOTAL_WEEKS, peso: 30 },
  ]
  return scheme.map((e) => {
    const estado: EvalState =
      e.semana < CURRENT_WEEK ? 'calificada' : e.semana === CURRENT_WEEK ? 'esta_semana' : 'proxima'
    return {
      ...e,
      fecha: addDays(weekRange(e.semana).start, 3),
      estado,
      nota: estado === 'calificada' ? 11 + (hash(`${id}|${e.id}`) % 8) : undefined,
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
  /** Entrega y nota de ejemplo para las tareas ya vencidas. */
  entregadaDemo: boolean
  notaDemo?: number
}

export function tasksOf(id: string): Task[] {
  return [2, 4, 6, 8, 10, 12, 13, 14, 15].map((n, i) => {
    const vence = addDays(weekRange(n).end, 0)
    vence.setHours(23, 59, 0, 0)
    const past = n < CURRENT_WEEK
    return {
      id: `${id}-t${n}`,
      titulo: `Actividad ${i + 1}: ${topicOf(id, n)}`,
      semana: n,
      vence,
      entregadaDemo: past,
      notaDemo: past ? 12 + (hash(`${id}|t${n}`) % 7) : undefined,
    }
  })
}

// ───────── Foros ─────────

export interface Post {
  autor: string
  rol: 'Docente' | 'Estudiante'
  texto: string
  /** Texto de tiempo ya formateado ("Hace 2 días"). */
  cuando: string
}

export interface Thread {
  id: string
  titulo: string
  semana: number | null
  abierto: boolean
  base: Post[]
}

const STUDENT_NAMES = Object.values(STUDENTS)
const REPLIES = [
  'Profesor, ¿podría aclarar el alcance de este punto para la práctica?',
  'Yo lo resolví usando el ejemplo de la clase; si quieren lo comparto.',
  'Gracias por el material, me ayudó a entender mejor el caso.',
  'Tengo una duda sobre cómo se calificará la entrega de esta semana.',
  'Coincido con lo que comentan, sería bueno repasarlo en la próxima sesión.',
]

export function threadsOf(id: string, docente: string): Thread[] {
  const out: Thread[] = [
    {
      id: `${id}-general`,
      titulo: 'Foro general del curso',
      semana: null,
      abierto: true,
      base: [
        {
          autor: docente,
          rol: 'Docente',
          cuando: 'Hace 3 meses',
          texto: 'Bienvenidos. Este es el espacio para dudas generales del curso, coordinación entre compañeros y avisos no urgentes.',
        },
        { autor: STUDENT_NAMES[hash(id) % STUDENT_NAMES.length], rol: 'Estudiante', cuando: 'Hace 2 meses', texto: REPLIES[0] },
      ],
    },
  ]
  for (let n = 1; n <= TOTAL_WEEKS; n++) {
    const tema = topicOf(id, n)
    const open = n <= CURRENT_WEEK + 1
    const k = n <= CURRENT_WEEK ? 1 + (hash(`${id}|f${n}`) % 3) : 0
    const base: Post[] = open
      ? [
          {
            autor: docente,
            rol: 'Docente',
            cuando: n < CURRENT_WEEK ? `Hace ${(CURRENT_WEEK - n) * 7} días` : 'Esta semana',
            texto: `Foro de consultas de la semana ${n}. Comparte aquí tus dudas sobre «${tema}». Responderé durante la semana.`,
          },
          ...Array.from({ length: k }, (_, j): Post => ({
            autor: STUDENT_NAMES[hash(`${id}${n}${j}`) % STUDENT_NAMES.length],
            rol: 'Estudiante',
            cuando: n < CURRENT_WEEK ? `Hace ${(CURRENT_WEEK - n) * 7 - j - 1} días` : 'Hace 1 día',
            texto: REPLIES[hash(`${id}${n}${j}t`) % REPLIES.length],
          })),
        ]
      : []
    out.push({ id: `${id}-f${n}`, titulo: `Foro de Consultas - Semana ${n}`, semana: n, abierto: open, base })
  }
  return out
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

export function announcementsOf(id: string, docente: string): Announcement[] {
  const today = startOfDay(new Date())
  const pc2 = evaluationsOf(id).find((e) => e.id === 'pc2')
  return [
    {
      id: `${id}-a5`,
      titulo: `Recordatorio: ${pc2?.nombre}`,
      texto: `Esta semana se rinde la ${pc2?.nombre?.toLowerCase()}. Revisen el material hasta la semana ${CURRENT_WEEK} y lleguen 10 minutos antes. Pueden consultar sus dudas en el foro de la semana.`,
      fecha: addDays(today, -1),
      nuevo: true,
    },
    {
      id: `${id}-a4`,
      titulo: 'Cambio en el horario de asesoría',
      texto: `Esta semana la asesoría con ${docente} se realizará por Zoom. El enlace y el código de acceso están en la pestaña Zoom del curso.`,
      fecha: addDays(today, -3),
      nuevo: true,
    },
    {
      id: `${id}-a3`,
      titulo: 'Resultados del examen parcial',
      texto: 'Ya están publicadas las notas del examen parcial. Quienes deseen revisar su evaluación pueden solicitar una cita durante la asesoría.',
      fecha: addDays(weekRange(10).start, 2),
      nuevo: false,
    },
    {
      id: `${id}-a2`,
      titulo: 'Material complementario disponible',
      texto: 'Se agregó lectura complementaria a las semanas 4 a 6. No es obligatoria, pero ayuda a profundizar los temas de las prácticas.',
      fecha: addDays(weekRange(5).start, 1),
      nuevo: false,
    },
    {
      id: `${id}-a1`,
      titulo: 'Bienvenida al curso',
      texto: 'Les doy la bienvenida al ciclo. En el sílabo encontrarán la sumilla, el sistema de evaluación y el cronograma. Cualquier duda, escríbanme por el foro general.',
      fecha: addDays(weekRange(1).start, 0),
      nuevo: false,
    },
  ]
}

// ───────── Zoom ─────────

export interface ZoomSession {
  fecha: string
  inicio: string
  fin: string
  tipo: string
}

export function zoomInfo(id: string) {
  const h = hash(`zoom|${id}`)
  const meetingId = `8${String(h % 1_000_000_000).padStart(9, '0')}`
  return {
    meetingId,
    meetingIdSpaced: `${meetingId.slice(0, 3)} ${meetingId.slice(3, 7)} ${meetingId.slice(7)}`,
    passcode: String(100000 + (hash(`pass|${id}`) % 900000)),
    url: `https://utpvirtual.zoom.us/j/${meetingId}`,
  }
}

/** Próximas sesiones de Zoom a partir de ahora. */
export function upcomingZoom(id: string, now: Date, count = 4): ZoomSession[] {
  const sessions: ZoomSession[] = []
  const start = startOfDay(now)
  for (let i = 0; i < 28 && sessions.length < count; i++) {
    const d = addDays(start, i)
    for (const z of metaOf(id).zoom) {
      if (d.getDay() !== z.dow) continue
      const end = new Date(`${toISO(d)}T${z.fin}:00`)
      if (end.getTime() > now.getTime()) sessions.push({ fecha: toISO(d), inicio: z.inicio, fin: z.fin, tipo: z.tipo })
    }
  }
  return sessions.slice(0, count)
}

export function recordingsOf(id: string) {
  return [CURRENT_WEEK - 1, CURRENT_WEEK - 2, CURRENT_WEEK - 3].map((n) => ({
    id: `${id}-rec${n}`,
    titulo: `Sesión de la semana ${n} — ${topicOf(id, n)}`,
    duracion: `${70 + (hash(`${id}rec${n}`) % 35)} min`,
  }))
}

// ───────── Sílabo ─────────

export interface Unit {
  nombre: string
  semanas: string
  temas: string[]
}

export function unitsOf(id: string): Unit[] {
  const range = (a: number, b: number) =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i)
      .filter((n) => n !== 9 && n !== TOTAL_WEEKS)
      .map((n) => topicOf(id, n))
  return [
    { nombre: 'Unidad 1', semanas: 'Semanas 1 a 4', temas: range(1, 4) },
    { nombre: 'Unidad 2', semanas: 'Semanas 5 a 9', temas: [...range(5, 8), 'Examen parcial'] },
    { nombre: 'Unidad 3', semanas: 'Semanas 10 a 13', temas: range(10, 13) },
    { nombre: 'Unidad 4', semanas: 'Semanas 14 a 18', temas: [...range(14, 17), 'Examen final'] },
  ]
}

/** Texto plano del sílabo para descargar. */
export function syllabusText(course: Course): string {
  const m = metaOf(course.id)
  const evals = evaluationsOf(course.id)
  const lines = [
    `SÍLABO — ${course.nombre.toUpperCase()}`,
    `Código: ${m.codigo} · ${course.creditos} créditos · ${course.modalidad} · Ciclo ${cycle.nombre.replace('Ciclo ', '')}`,
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
    ...unitsOf(course.id).flatMap((u) => [`${u.nombre} (${u.semanas})`, ...u.temas.map((t) => `  - ${t}`)]),
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
