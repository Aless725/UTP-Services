import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { emailOf } from '@/features/profile/profileData'

/** Servicios de Microsoft 365 de la universidad: se abren en el navegador, fuera de UTP+. */
const LINKS = [
  { icon: 'mail', title: 'Outlook', sub: 'Correo y calendario', url: (e: string) => `https://outlook.office.com/mail/?login_hint=${encodeURIComponent(e)}` },
  { icon: 'grid_view', title: 'Microsoft 365', sub: 'Word, Excel, OneDrive y más', url: () => 'https://www.office.com/' },
]

export default function MailPage() {
  const { session } = useAuth()
  const { show } = useToast()
  const email = emailOf(session?.codigo ?? '')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      show('Correo copiado', 'content_copy')
    } catch {
      show('No se pudo copiar', 'error')
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Correo"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Tu correo institucional y tus herramientas de Microsoft."
      />

      <div className="stagger mt-4 space-y-3 px-5">
        <section aria-label="Correo institucional" className="rounded-card bg-card p-4 shadow-card">
          <p className="text-[0.6875rem] text-ink-muted">Tu correo institucional</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-bold text-ink">{email}</p>
            <button
              type="button"
              onClick={copy}
              aria-label="Copiar correo"
              className="pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink"
            >
              <Icon name="content_copy" size={18} />
            </button>
          </div>
          <a
            href={LINKS[0].url(email)}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
          >
            <Icon name="open_in_new" size={18} />
            Abrir Outlook
          </a>
        </section>

        <section aria-labelledby="servicios">
          <h2 id="servicios" className="mb-2 text-[0.9375rem] font-bold text-ink">
            Otros servicios
          </h2>
          <ul className="space-y-3">
            {LINKS.slice(1).map((l) => (
              <li key={l.title}>
                <a
                  href={l.url(email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable flex min-h-14 items-center gap-3 rounded-card bg-card p-3 shadow-card"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={l.icon} size={20} filled />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">{l.title}</span>
                    <span className="block text-[0.6875rem] text-ink-muted">{l.sub}</span>
                  </span>
                  <Icon name="open_in_new" size={18} className="shrink-0 text-ink-muted" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-muted">
          <Icon name="lock" size={16} className="mt-px shrink-0" />
          Se abren fuera de UTP+, con tu cuenta institucional. UTP+ no guarda ni ve tu contraseña.
        </p>
      </div>
    </div>
  )
}
