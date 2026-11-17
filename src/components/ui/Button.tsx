import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'link'
  full?: boolean
}

export default function Button({
  variant = 'primary',
  full,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    variant === 'primary'
      ? 'min-h-12 rounded-full bg-primary px-6 text-sm font-semibold text-white active:bg-primary-dark disabled:opacity-60'
      : 'min-h-11 text-xs font-medium text-primary'
  return <button className={`${base} ${full ? 'w-full' : ''} ${className}`} {...props} />
}
