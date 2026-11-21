import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { PREMIO_REFERIDO, codigoReferido } from './beneficiosData'

const PASOS = [
  { icon: 'share', texto: 'Comparte tu código con un amigo que quiera estudiar en la UTP.' },
  { icon: 'how_to_reg', texto: 'Tu amigo lo ingresa al momento de matricularse.' },
  { icon: 'payments', texto: `Cuando paga su primera cuota, ganas S/ ${PREMIO_REFERIDO} de descuento.` },
]

export default function ReferirPage() {
  const { session } = useAuth()
  const { show } = useToast()
  const codigo = codigoReferido(session?.codigo)
  const mensaje = `Estudia en la UTP y usa mi código ${codigo} al matricularte. ¡Yo gano S/ ${PREMIO_REFERIDO} y tú una bienvenida! 🎓`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      show('Código copiado', 'content_copy')
    } catch {
      show('No se pudo copiar', 'error')
    }
  }

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'UTP+ Service', text: mensaje })
      } catch {
        /* el usuario cerró la hoja de compartir */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(mensaje)
      show('Mensaje copiado', 'content_copy')
    } catch {
      show('No se pudo compartir', 'error')
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="Refiere y gana"
        back="/beneficios"
        backLabel="Volver a Beneficios+"
        subtitle={`Gana S/ ${PREMIO_REFERIDO} por cada alumno que refieras.`}
      />

      <div className="mt-4 px-5">
        <div className="flex flex-col items-center rounded-card bg-card px-5 py-6 text-center shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon name="person_add" size={26} filled />
          </span>
          <p className="mt-3 text-[0.6875rem] text-ink-muted">Tu código de referido</p>
          <button
            type="button"
            onClick={copiar}
            aria-label={`Copiar código ${codigo}`}
            className="pressable mt-1 flex min-h-11 items-center gap-2 rounded-full bg-fill/5 px-4 text-lg font-bold tracking-wider text-ink"
          >
            {codigo}
            <Icon name="content_copy" size={16} className="text-ink-muted" />
          </button>
          <div className="mt-4 grid w-full grid-cols-2 divide-x divide-fill/5 border-t border-fill/5 pt-3">
            <div>
              <p className="text-lg font-bold text-ink">0</p>
              <p className="text-[0.6875rem] text-ink-muted">Referidos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-ink">S/ 0</p>
              <p className="text-[0.6875rem] text-ink-muted">Ganado</p>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="pasos" className="mt-5 px-5 pb-6">
        <h2 id="pasos" className="mb-2 px-1 text-sm font-bold text-ink">
          Cómo funciona
        </h2>
        <ol className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {PASOS.map((p) => (
            <li key={p.icon} className="flex items-center gap-3 px-3.5 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon name={p.icon} size={18} filled />
              </span>
              <span className="text-xs leading-relaxed text-ink">{p.texto}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
          El descuento se aplica a tu siguiente cuota. Montos y condiciones de demostración.
        </p>
      </section>

      <StickyCta>
        <button
          type="button"
          onClick={compartir}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
        >
          <Icon name="share" size={18} />
          Compartir mi código
        </button>
      </StickyCta>
    </div>
  )
}
