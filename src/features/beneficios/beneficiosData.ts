export type CategoriaBeneficio =
  | 'Todos'
  | 'Entretenimiento'
  | 'Tecnología'
  | 'Idiomas'
  | 'Salud'

export interface LocalParticipante {
  sede: string
  centroComercial: string
  direccion: string
}

export interface BeneficioItem {
  id: string
  empresa: string
  tituloDescuento: string
  categoria: Exclude<CategoriaBeneficio, 'Todos'>
  modalidad: string
  imagen: string
  destacado?: boolean
  paraTi?: boolean
  descripcion: string
  terminos: string[]
  vigencia: string
  tipoCanje: string
  prefijoCodigo: string
  pasosUso: string[]
  locales: LocalParticipante[]
}

export const CATEGORIAS_BENEFICIOS: CategoriaBeneficio[] = [
  'Todos',
  'Entretenimiento',
  'Tecnología',
  'Idiomas',
  'Salud',
]

export const BENEFICIOS: BeneficioItem[] = [
  {
    id: 'cineplanet',
    empresa: 'Cineplanet',
    tituloDescuento: '2×1 en entradas 2D',
    categoria: 'Entretenimiento',
    modalidad: 'Canje en boletería',
    imagen:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    destacado: true,
    descripcion:
      'Comparte una película y paga solo una entrada con tu beneficio para estudiantes UTP.',
    terminos: [
      'Válido en funciones 2D regulares de los locales participantes.',
      'Una redención por estudiante. Ambas entradas deben ser para la misma función.',
      'No aplica en feriados, preestrenos, salas Prime ni formatos especiales.',
      'Presenta tu código y tu identificación UTP antes de pagar. No acumulable.',
    ],
    vigencia: '30 nov. 2026',
    tipoCanje: 'Canje en boletería',
    prefijoCodigo: 'UTP-CP',
    pasosUso: [
      'Acércate a la boletería de un local participante de Cineplanet.',
      'Genera tu cupón y preséntalo junto con tu identificación UTP.',
      'El personal validará tu beneficio antes de realizar el pago.',
    ],
    locales: [
      {
        sede: 'Cineplanet · Centro Cívico',
        centroComercial: 'Real Plaza Centro Cívico',
        direccion: 'Av. Garcilaso de la Vega 1337, Lima',
      },
      {
        sede: 'Cineplanet · San Miguel',
        centroComercial: 'Plaza San Miguel',
        direccion: 'Av. La Marina 2000, San Miguel',
      },
      {
        sede: 'Cineplanet · Mall del Sur',
        centroComercial: 'Mall del Sur',
        direccion: 'Av. Los Lirios 301, San Juan de Miraflores',
      },
    ],
  },
  {
    id: 'lenovo',
    empresa: 'Lenovo',
    tituloDescuento: 'Hasta 15% en laptops',
    categoria: 'Tecnología',
    modalidad: 'Tienda online',
    imagen:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    paraTi: true,
    descripcion:
      'Equípate para tus ciclos universitarios con descuentos exclusivos en laptops IdeaPad, ThinkPad y Legion.',
    terminos: [
      'Válido únicamente en la tienda online educativa de Lenovo Perú.',
      'Aplica hasta 15% de descuento en modelos seleccionados.',
      'Máximo 2 equipos por estudiante al año.',
      'Requiere registro con correo institucional @utp.edu.pe.',
    ],
    vigencia: '15 dic. 2026',
    tipoCanje: 'Canje web',
    prefijoCodigo: 'UTP-LN',
    pasosUso: [
      'Ingresa al portal educativo de Lenovo desde tu navegador.',
      'Genera tu cupón e ingrésalo en el carrito antes de finalizar la compra.',
      'Valida tu cuenta con tu correo institucional UTP.',
    ],
    locales: [
      {
        sede: 'Tienda Online Oficial · Lenovo Perú',
        centroComercial: 'Portal Educativo UTP',
        direccion: 'Entrega a domicilio a nivel nacional',
      },
    ],
  },
  {
    id: 'open-english',
    empresa: 'Open English',
    tituloDescuento: '40% en tu programa de inglés',
    categoria: 'Idiomas',
    modalidad: 'Plataforma online',
    imagen:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Mejora tu nivel de inglés con clases en vivo ilimitadas las 24 horas y profesores nativos.',
    terminos: [
      'Válido para planes anuales de estudiantes activos UTP.',
      'Incluye acceso ilimitado a clases grupales en vivo.',
      'No acumulable con otras promociones vigentes de Open English.',
      'Sujeto a validación de matrícula vigente.',
    ],
    vigencia: '30 dic. 2026',
    tipoCanje: 'Activación online',
    prefijoCodigo: 'UTP-OE',
    pasosUso: [
      'Genera tu cupón promocional en esta pantalla.',
      'Regístrate en el enlace de convenio con tu correo institucional.',
      'Un asesor aplicará el 40% de descuento en tu inscripción.',
    ],
    locales: [
      {
        sede: 'Modalidad 100% Virtual · Open English',
        centroComercial: 'Acceso desde cualquier dispositivo',
        direccion: 'Clases en vivo 24/7',
      },
    ],
  },
]