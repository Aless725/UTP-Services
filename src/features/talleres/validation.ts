export interface DeclaracionesTaller {
  terminos: boolean
  declaracion: boolean
}
export type ErroresDeclaraciones = Partial<Record<keyof DeclaracionesTaller, string>>

export function validarDeclaraciones(values: DeclaracionesTaller): ErroresDeclaraciones {
  const errors: ErroresDeclaraciones = {}
  if (!values.terminos) errors.terminos = 'Debes aceptar los términos del taller para continuar.'
  if (!values.declaracion) errors.declaracion = 'Debes confirmar la declaración para continuar.'
  return errors
}
