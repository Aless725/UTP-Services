import Logo from '@/components/ui/Logo'

/** Pendiente: se construye en el siguiente paso (Inicio de sesión). */
export default function LoginPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-surface px-6">
      <Logo size="md" />
      <p className="text-sm text-ink-muted">Inicio de sesión — próximamente</p>
    </div>
  )
}
