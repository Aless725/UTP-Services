import { useId, useState, type InputHTMLAttributes } from 'react'
import Icon from './Icon'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  helper?: string
  error?: string | null
}

export default function TextField({ label, helper, error, type = 'text', ...props }: TextFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const describedBy = error ? `${id}-err` : helper ? `${id}-help` : undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-lg bg-white px-3 text-sm text-ink outline-none ring-1 transition-shadow placeholder:text-ink-faint focus:ring-2 focus:ring-primary ${
            error ? 'ring-primary' : 'ring-transparent'
          } ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-primary"
          >
            <Icon name={visible ? 'visibility' : 'visibility_off'} size={20} />
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-primary">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-ink-muted">
          {helper}
        </p>
      ) : null}
    </div>
  )
}
