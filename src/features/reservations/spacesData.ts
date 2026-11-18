export type SpaceType = 'sala_grupal' | 'pc' | 'cubiculo'
export type EquipKey =
  | 'tv'
  | 'pizarra'
  | 'enchufes'
  | 'wifi'
  | 'ac'
  | 'software'
  | 'impresion'
  | 'escaner'
  | 'silencio'
  | 'lampara'

export const SEDES = ['Lima Centro', 'Lima Norte'] as const
export type Sede = (typeof SEDES)[number]

export interface Space {
  id: string
  tipo: SpaceType
  nombre: string
  sede: Sede
  edificio: string
  piso: number
  capMin: number
  capMax: number
  equip: EquipKey[]
  descripcion: string
}

export const EQUIPMENT: Record<EquipKey, { label: string; icon: string }> = {
  tv: { label: 'Pantalla 55"', icon: 'tv' },
  pizarra: { label: 'Pizarra', icon: 'co_present' },
  enchufes: { label: 'Enchufes', icon: 'power' },
  wifi: { label: 'Wi-Fi', icon: 'wifi' },
  ac: { label: 'Aire acondicionado', icon: 'ac_unit' },
  software: { label: 'Software académico', icon: 'apps' },
  impresion: { label: 'Impresión', icon: 'print' },
  escaner: { label: 'Escáner', icon: 'scanner' },
  silencio: { label: 'Silencio total', icon: 'volume_off' },
  lampara: { label: 'Lámpara de escritorio', icon: 'lightbulb' },
}

export const TYPE_INFO: Record<
  SpaceType,
  { slug: 'salas' | 'pcs' | 'cubiculos'; titulo: string; descripcion: string; icon: string; singular: string }
> = {
  sala_grupal: {
    slug: 'salas',
    titulo: 'Salas grupales',
    descripcion: 'De 3 a 8 personas · TV y pizarra',
    icon: 'groups',
    singular: 'sala',
  },
  pc: {
    slug: 'pcs',
    titulo: 'PCs de biblioteca',
    descripcion: 'Software académico e impresión',
    icon: 'desktop_windows',
    singular: 'PC',
  },
  cubiculo: {
    slug: 'cubiculos',
    titulo: 'Cubículos de estudio',
    descripcion: 'Espacios individuales en silencio',
    icon: 'menu_book',
    singular: 'cubículo',
  },
}

export const typeFromSlug = (slug?: string): SpaceType | null =>
  (Object.keys(TYPE_INFO) as SpaceType[]).find((t) => TYPE_INFO[t].slug === slug) ?? null

/** "Biblioteca P3" */
export const shortPlace = (s: Space) => `${s.edificio} P${s.piso}`
/** "Biblioteca · Piso 3" */
export const longPlace = (s: Space) => `${s.edificio} · Piso ${s.piso}`

const sala = (
  id: string,
  nombre: string,
  edificio: string,
  piso: number,
  capMax: number,
  equip: EquipKey[],
  sede: Sede = 'Lima Centro',
): Space => ({
  id,
  tipo: 'sala_grupal',
  nombre,
  sede,
  edificio,
  piso,
  capMin: 3,
  capMax,
  equip,
  descripcion: 'Sala cerrada para trabajo en equipo, ideal para preparar exposiciones y proyectos grupales.',
})

const pc = (sede: Sede, prefix: string, n: number, edificio = 'Biblioteca', piso = 2): Space => {
  const equip: EquipKey[] = ['software', 'wifi']
  if (n <= 12) equip.push('impresion')
  if (n % 6 === 0) equip.push('escaner')
  return {
    id: `${prefix}-pc${n}`,
    tipo: 'pc',
    nombre: `PC ${n} · Zona de cómputo`,
    sede,
    edificio,
    piso,
    capMin: 1,
    capMax: 1,
    equip,
    descripcion: 'Equipo con software académico, acceso a impresión y red de la universidad.',
  }
}

const cubiculo = (sede: Sede, prefix: string, n: number, edificio = 'Pabellón C', piso = 1): Space => {
  const equip: EquipKey[] = ['silencio', 'enchufes', 'wifi', 'lampara']
  if (n % 2 === 0) equip.push('pizarra')
  return {
    id: `${prefix}-c0${n}`,
    tipo: 'cubiculo',
    nombre: `Cubículo de estudio C-0${n}`,
    sede,
    edificio,
    piso,
    capMin: 1,
    capMax: 1,
    equip,
    descripcion: 'Espacio individual en silencio para estudiar o preparar una evaluación.',
  }
}

function build(): Space[] {
  const out: Space[] = [
    sala('lc-b201', 'Sala Grupal B-201', 'Biblioteca', 3, 6, ['tv', 'pizarra', 'enchufes', 'wifi', 'ac']),
    sala('lc-b204', 'Sala Grupal B-204', 'Biblioteca', 3, 4, ['pizarra', 'enchufes', 'wifi']),
    sala('lc-b202', 'Sala Grupal B-202', 'Biblioteca', 3, 6, ['tv', 'enchufes', 'wifi', 'ac']),
    sala('lc-b203', 'Sala Grupal B-203', 'Biblioteca', 3, 5, ['tv', 'enchufes', 'wifi']),
    sala('lc-a110', 'Sala de Estudio A-110', 'Pabellón A', 1, 8, ['tv', 'pizarra', 'enchufes', 'wifi', 'ac']),
    sala('lc-a112', 'Sala de Estudio A-112', 'Pabellón A', 1, 8, ['pizarra', 'enchufes', 'wifi']),
    sala('lc-c305', 'Sala Grupal C-305', 'Pabellón C', 3, 6, ['tv', 'pizarra', 'enchufes', 'wifi']),
    sala('lc-c301', 'Sala Grupal C-301', 'Pabellón C', 3, 6, ['pizarra', 'enchufes', 'wifi', 'ac']),
  ]
  for (let n = 1; n <= 24; n++) out.push(pc('Lima Centro', 'lc', n))
  for (let n = 1; n <= 6; n++) out.push(cubiculo('Lima Centro', 'lc', n))

  // Lima Norte: una sede más pequeña
  out.push(
    sala('ln-n101', 'Sala Grupal N-101', 'Edificio Principal', 1, 6, ['tv', 'pizarra', 'enchufes', 'wifi'], 'Lima Norte'),
    sala('ln-n102', 'Sala Grupal N-102', 'Edificio Principal', 1, 4, ['pizarra', 'enchufes', 'wifi'], 'Lima Norte'),
    sala('ln-n201', 'Sala de Estudio N-201', 'Edificio Principal', 2, 8, ['tv', 'pizarra', 'enchufes', 'wifi', 'ac'], 'Lima Norte'),
    sala('ln-n202', 'Sala Grupal N-202', 'Edificio Principal', 2, 6, ['tv', 'enchufes', 'wifi'], 'Lima Norte'),
  )
  for (let n = 1; n <= 10; n++) out.push(pc('Lima Norte', 'ln', n, 'Edificio Principal', 1))
  for (let n = 1; n <= 3; n++) out.push(cubiculo('Lima Norte', 'ln', n, 'Edificio Principal', 2))
  return out
}

export const SPACES: Space[] = build()
export const getSpace = (id?: string) => SPACES.find((s) => s.id === id)

/** Directorio de alumnos de demostración (para agregar integrantes por código). */
export const STUDENTS: Record<string, string> = {
  U22265137: 'Isabel Aldara',
  U22209574: 'Mateo Soto',
  U22693560: 'Rocío Paredes',
  U22104588: 'Diego Fernández',
  U22311902: 'Valeria Quispe',
  U21987430: 'Andrés Huamán',
  U22450071: 'Camila Rojas',
  U22380145: 'Luis Mendoza',
  U22519933: 'Sofía Vargas',
  U22077214: 'Jorge Castillo',
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
