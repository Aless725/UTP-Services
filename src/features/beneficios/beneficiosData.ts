import { useCallback, useState } from 'react'

export type CategoriaId = 'prime' | 'gastronomia' | 'moda' | 'entretenimiento' | 'educacion'

export const CATEGORIAS: Record<CategoriaId, { label: string; corto: string; icon: string }> = {
  prime: { label: 'Prime', corto: 'Prime', icon: 'workspace_premium' },
  gastronomia: { label: 'Gastronomía', corto: 'Gastronomía', icon: 'restaurant' },
  moda: { label: 'Moda y estilo', corto: 'Moda', icon: 'checkroom' },
  entretenimiento: { label: 'Entretenimiento', corto: 'Entretenimiento', icon: 'theaters' },
  educacion: { label: 'Educación e idiomas', corto: 'Educación', icon: 'school' },
}

export const CATEGORIA_IDS = Object.keys(CATEGORIAS) as CategoriaId[]

export interface Local {
  sede: string
  lugar: string
  direccion: string
}

export interface Beneficio {
  id: string
  empresa: string
  descuento: string
  categoria: CategoriaId
  modalidad: string
  /** Foto del convenio. Si no carga, se muestra un ícono. Para usar una propia, súbela a `public/beneficios/`. */
  imagen: string
  icono: string
  destacado?: boolean
  descripcion: string
  terminos: string[]
  vigencia: string
  prefijo: string
  pasos: string[]
  locales: Local[]
}

const foto = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

const virtual = (sede: string): Local[] => [{ sede, lugar: 'Disponible desde cualquier dispositivo', direccion: 'Sin necesidad de ir a un local' }]

/** Convenios de demostración (los descuentos y condiciones son ilustrativos). */
export const BENEFICIOS: Beneficio[] = [
  {
    id: 'cineplanet',
    empresa: 'Cineplanet',
    descuento: '2×1 en entradas 2D',
    categoria: 'entretenimiento',
    modalidad: 'Canje en boletería',
    imagen: foto('photo-1517604931442-7e0c8ed2963c'),
    icono: 'theaters',
    destacado: true,
    descripcion: 'Comparte una película y paga solo una entrada con tu beneficio para estudiantes UTP.',
    terminos: [
      'Válido en funciones 2D regulares de los locales participantes.',
      'Una redención por estudiante; ambas entradas son para la misma función.',
      'No aplica en feriados, preestrenos, salas Prime ni formatos especiales.',
      'Presenta tu código y tu identificación UTP antes de pagar. No acumulable.',
    ],
    vigencia: '30 nov. 2026',
    prefijo: 'UTP-CP',
    pasos: [
      'Acércate a la boletería de un local participante.',
      'Muestra tu cupón y tu identificación UTP.',
      'El personal valida tu beneficio antes de que pagues.',
    ],
    locales: [
      { sede: 'Cineplanet · Centro Cívico', lugar: 'Real Plaza Centro Cívico', direccion: 'Av. Garcilaso de la Vega 1337, Lima' },
      { sede: 'Cineplanet · San Miguel', lugar: 'Plaza San Miguel', direccion: 'Av. La Marina 2000, San Miguel' },
      { sede: 'Cineplanet · Mall del Sur', lugar: 'Mall del Sur', direccion: 'Av. Los Lirios 301, San Juan de Miraflores' },
    ],
  },
  {
    id: 'entel',
    empresa: 'Entel',
    descuento: '25% en planes postpago',
    categoria: 'prime',
    modalidad: 'Tienda y web',
    imagen: foto('photo-1511707171634-5f897ff02aa9'),
    icono: 'smartphone',
    destacado: true,
    descripcion: 'Descuento mensual en planes postpago con internet ilimitado para estudiantes activos de la UTP.',
    terminos: [
      'Aplica a planes postpago nuevos o con portabilidad.',
      'El descuento rige durante 12 meses desde la activación.',
      'Requiere matrícula vigente y correo institucional.',
      'No acumulable con otras promociones.',
    ],
    vigencia: '31 dic. 2026',
    prefijo: 'UTP-EN',
    pasos: [
      'Entra a la web de Entel o a una tienda participante.',
      'Elige tu plan y presenta el cupón al asesor.',
      'Valida tu matrícula y se aplica el descuento.',
    ],
    locales: [
      { sede: 'Tienda Entel · Jockey Plaza', lugar: 'Jockey Plaza', direccion: 'Av. Javier Prado Este 4200, Surco' },
      { sede: 'Tienda Entel · Megaplaza', lugar: 'Megaplaza', direccion: 'Av. Alfredo Mendiola 3698, Independencia' },
    ],
  },
  {
    id: 'lenovo',
    empresa: 'Lenovo',
    descuento: 'Hasta 15% en laptops',
    categoria: 'prime',
    modalidad: 'Tienda online',
    imagen: foto('photo-1517336714731-489689fd1ca8'),
    icono: 'laptop_mac',
    descripcion: 'Equípate para tus ciclos con descuentos en laptops IdeaPad, ThinkPad y Legion.',
    terminos: [
      'Válido solo en la tienda online educativa de Lenovo Perú.',
      'Hasta 15% de descuento en modelos seleccionados.',
      'Máximo 2 equipos por estudiante al año.',
      'Requiere registro con tu correo @utp.edu.pe.',
    ],
    vigencia: '15 dic. 2026',
    prefijo: 'UTP-LN',
    pasos: [
      'Ingresa al portal educativo de Lenovo.',
      'Ingresa tu cupón en el carrito antes de pagar.',
      'Valida tu cuenta con tu correo institucional.',
    ],
    locales: virtual('Tienda online oficial · Lenovo Perú'),
  },
  {
    id: 'bembos',
    empresa: 'Bembos',
    descuento: '20% en el combo universitario',
    categoria: 'gastronomia',
    modalidad: 'Canje en caja',
    imagen: foto('photo-1568901346375-23c9450c58cd'),
    icono: 'lunch_dining',
    descripcion: 'Tu hamburguesa favorita con descuento de lunes a jueves.',
    terminos: ['Válido de lunes a jueves.', 'No aplica en delivery.', 'Una redención por día.', 'Presenta tu identificación UTP.'],
    vigencia: '30 nov. 2026',
    prefijo: 'UTP-BE',
    pasos: ['Pide en caja en un local participante.', 'Muestra tu cupón y tu identificación UTP.', 'Se aplica el descuento al pagar.'],
    locales: [
      { sede: 'Bembos · Av. Arequipa', lugar: 'Miraflores', direccion: 'Av. Arequipa 4720, Miraflores' },
      { sede: 'Bembos · Plaza Norte', lugar: 'Plaza Norte', direccion: 'Av. Alfredo Mendiola 1400, Independencia' },
    ],
  },
  {
    id: 'starbucks',
    empresa: 'Starbucks',
    descuento: '15% en bebidas y snacks',
    categoria: 'gastronomia',
    modalidad: 'Canje en caja',
    imagen: foto('photo-1495474472287-4d71bcdd2085'),
    icono: 'local_cafe',
    descripcion: 'Un café para estudiar con descuento en las tiendas cercanas a tus sedes.',
    terminos: ['Aplica a bebidas y snacks.', 'No incluye mercadería.', 'Una redención por día.', 'No acumulable.'],
    vigencia: '15 dic. 2026',
    prefijo: 'UTP-SB',
    pasos: ['Pide en la caja de una tienda participante.', 'Muestra tu cupón y tu identificación UTP.', 'Disfruta tu pedido con descuento.'],
    locales: [
      { sede: 'Starbucks · Real Plaza Salaverry', lugar: 'Real Plaza Salaverry', direccion: 'Av. Gral. Salaverry 2370, Jesús María' },
    ],
  },
  {
    id: 'oechsle',
    empresa: 'Oechsle',
    descuento: '10% en ropa y calzado',
    categoria: 'moda',
    modalidad: 'Tienda y web',
    imagen: foto('photo-1441986300917-64674bd600d8'),
    icono: 'shopping_bag',
    descripcion: 'Renueva tu estilo con descuento en las marcas participantes.',
    terminos: ['Aplica en ropa y calzado de marcas participantes.', 'No acumulable con otras ofertas.', 'Una redención por mes.', 'Válido en tienda y web.'],
    vigencia: '31 dic. 2026',
    prefijo: 'UTP-OE',
    pasos: ['Elige tus prendas en tienda o en la web.', 'Presenta o ingresa tu cupón antes de pagar.', 'Valida tu identificación UTP.'],
    locales: [{ sede: 'Oechsle · Tiendas participantes', lugar: 'Lima y provincias', direccion: 'También disponible en oechsle.pe' }],
  },
  {
    id: 'adidas',
    empresa: 'Adidas',
    descuento: '12% en zapatillas y ropa deportiva',
    categoria: 'moda',
    modalidad: 'Tienda online',
    imagen: foto('photo-1542291026-7eec264c27ff'),
    icono: 'steps',
    descripcion: 'Descuento para estudiantes en la colección vigente.',
    terminos: ['Válido en la tienda online de Adidas Perú.', 'No aplica a productos en liquidación.', 'Una redención por estudiante al mes.'],
    vigencia: '20 dic. 2026',
    prefijo: 'UTP-AD',
    pasos: ['Entra a la tienda online.', 'Ingresa tu cupón en el carrito.', 'Completa tu compra con tu correo institucional.'],
    locales: virtual('Tienda online · Adidas Perú'),
  },
  {
    id: 'teleticket',
    empresa: 'Teleticket',
    descuento: '15% en conciertos y shows',
    categoria: 'entretenimiento',
    modalidad: 'Compra online',
    imagen: foto('photo-1501386761578-eac5c94b800a'),
    icono: 'confirmation_number',
    descripcion: 'Entradas a conciertos y espectáculos con descuento en eventos seleccionados.',
    terminos: ['Aplica en eventos seleccionados.', 'Máximo 2 entradas por compra.', 'Sujeto a disponibilidad.'],
    vigencia: '31 dic. 2026',
    prefijo: 'UTP-TT',
    pasos: ['Elige un evento participante en Teleticket.', 'Ingresa tu cupón al pagar.', 'Recibe tus entradas en tu correo.'],
    locales: virtual('Compra online · Teleticket'),
  },
  {
    id: 'open-english',
    empresa: 'Open English',
    descuento: '40% en tu programa de inglés',
    categoria: 'educacion',
    modalidad: 'Plataforma online',
    imagen: foto('photo-1522202176988-66273c2fd55f'),
    icono: 'translate',
    destacado: true,
    descripcion: 'Clases en vivo ilimitadas las 24 horas y profesores nativos.',
    terminos: [
      'Válido para planes anuales de estudiantes activos UTP.',
      'Incluye clases grupales en vivo ilimitadas.',
      'No acumulable con otras promociones de Open English.',
      'Sujeto a validación de matrícula vigente.',
    ],
    vigencia: '30 dic. 2026',
    prefijo: 'UTP-OP',
    pasos: ['Regístrate en el enlace del convenio con tu correo institucional.', 'Presenta tu cupón al asesor.', 'Se aplica el 40% a tu inscripción.'],
    locales: virtual('Modalidad 100% virtual · Open English'),
  },
  {
    id: 'icpna',
    empresa: 'ICPNA',
    descuento: '25% en matrícula de idiomas',
    categoria: 'educacion',
    modalidad: 'Sede o virtual',
    imagen: foto('photo-1503676260728-1c00da094a0b'),
    icono: 'menu_book',
    descripcion: 'Cursos de inglés y otros idiomas con descuento en la matrícula.',
    terminos: ['Aplica a la matrícula de cursos regulares.', 'Una redención por ciclo.', 'Requiere constancia de matrícula UTP.'],
    vigencia: '31 ene. 2027',
    prefijo: 'UTP-IC',
    pasos: ['Acércate a una sede o inscríbete en línea.', 'Presenta tu cupón y tu constancia.', 'Se aplica el descuento a la matrícula.'],
    locales: [{ sede: 'ICPNA · Sede Lima Centro', lugar: 'Lima Centro', direccion: 'Jr. Cusco 446, Lima' }],
  },
]

export const beneficiosDe = (c: CategoriaId) => BENEFICIOS.filter((b) => b.categoria === c)

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function buscar(lista: Beneficio[], texto: string): Beneficio[] {
  const q = norm(texto.trim())
  if (!q) return lista
  return lista.filter((b) => norm(`${b.empresa} ${b.descuento} ${CATEGORIAS[b.categoria].label}`).includes(q))
}

/* ---------- Cupones generados (se guardan solo en este dispositivo) ---------- */

export interface Cupon {
  beneficioId: string
  codigo: string
  generado: string
}

const KEY = 'utp.cupones'

function leer(): Cupon[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function codigoNuevo(prefijo: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `${prefijo}-${Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('')}`
}

export function useCupones() {
  const [cupones, setCupones] = useState<Cupon[]>(leer)

  const generar = useCallback((b: Beneficio): Cupon => {
    const actual = leer()
    const previo = actual.find((c) => c.beneficioId === b.id)
    if (previo) return previo
    const nuevo: Cupon = { beneficioId: b.id, codigo: codigoNuevo(b.prefijo), generado: new Date().toISOString() }
    const lista = [nuevo, ...actual]
    try {
      localStorage.setItem(KEY, JSON.stringify(lista))
    } catch {
      /* sin almacenamiento: el cupón vive solo en esta sesión */
    }
    setCupones(lista)
    return nuevo
  }, [])

  const de = useCallback((id: string) => cupones.find((c) => c.beneficioId === id), [cupones])

  return { cupones, generar, de }
}

/* ---------- Programa de referidos ---------- */

export const PREMIO_REFERIDO = 50

export function codigoReferido(codigoAlumno: string | undefined): string {
  return `UTP${(codigoAlumno ?? 'ALUMNO').replace(/^U/i, '').toUpperCase().slice(-6)}`
}
