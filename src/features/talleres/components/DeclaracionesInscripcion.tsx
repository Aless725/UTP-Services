import { useId } from 'react'
import type { DeclaracionesTaller, ErroresDeclaraciones } from '../validation'

export default function DeclaracionesInscripcion({
  values,
  errors,
  declaracion,
  disabled,
  onChange,
}: {
  values: DeclaracionesTaller
  errors: ErroresDeclaraciones
  declaracion: string
  disabled: boolean
  onChange: (key: keyof DeclaracionesTaller, value: boolean) => void
}) {
  const id = useId()
  return (
    <fieldset disabled={disabled} className="space-y-2 rounded-card bg-card p-4 shadow-card">
      <legend className="sr-only">Declaraciones para inscribirte</legend>
      {(
        [
          ['terminos', 'He leído y acepto los términos del taller.'],
          ['declaracion', declaracion],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-relaxed text-ink">
            <input
              name={key}
              type="checkbox"
              checked={values[key]}
              onChange={(e) => onChange(key, e.target.checked)}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `${id}-${key}` : undefined}
              className="mt-1 h-5 w-5 shrink-0 accent-primary"
            />
            {label}
          </label>
          {errors[key] && (
            <p id={`${id}-${key}`} role="alert" className="text-xs text-primary">
              {errors[key]}
            </p>
          )}
        </div>
      ))}
    </fieldset>
  )
}
