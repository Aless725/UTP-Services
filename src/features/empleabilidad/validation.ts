export interface PostulacionValues {
  nombre: string
  correo: string
}

export type PostulacionErrors = Partial<Record<keyof PostulacionValues, string>>

export const normalizarPostulacion = ({ nombre, correo }: PostulacionValues): PostulacionValues => ({
  nombre: nombre.trim().replace(/\s+/g, ' '),
  correo: correo.trim().toLowerCase(),
})

/** Misma validación básica y límites que la función SQL; el servidor vuelve a comprobarlos. */
export function validarPostulacion(values: PostulacionValues): PostulacionErrors {
  const { nombre, correo } = normalizarPostulacion(values)
  const errors: PostulacionErrors = {}
  if (Array.from(nombre).length < 2 || Array.from(nombre).length > 120) {
    errors.nombre = 'Escribe tu nombre completo (entre 2 y 120 caracteres).'
  }
  if (Array.from(correo).length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errors.correo = 'Ingresa un correo con el formato nombre@dominio.com.'
  }
  return errors
}

export interface ProgramaValues extends PostulacionValues {
  campus: string
  ciclo: string
  acepta: boolean
}
export type ProgramaErrors = Partial<Record<keyof ProgramaValues, string>>

export function validarPrograma(values: ProgramaValues): ProgramaErrors {
  const errors: ProgramaErrors = validarPostulacion(values)
  if (!/^[^\s@]+@utp\.edu\.pe$/i.test(values.correo.trim())) errors.correo = 'Usa tu correo institucional @utp.edu.pe.'
  const campus = values.campus.trim().replace(/\s+/g, ' ')
  if (Array.from(campus).length < 2 || Array.from(campus).length > 120)
    errors.campus = 'Ingresa tu campus (entre 2 y 120 caracteres).'
  if (!/^(?:[1-9]|1[0-2])$/.test(values.ciclo)) errors.ciclo = 'Selecciona tu ciclo actual, del 1 al 12.'
  if (!values.acepta) errors.acepta = 'Confirma que revisaste los requisitos y que tus datos son correctos.'
  return errors
}
