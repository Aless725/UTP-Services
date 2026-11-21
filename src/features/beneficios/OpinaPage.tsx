import { useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'

const TEMAS = ['La app', 'Cursos', 'Trámites', 'Espacios', 'Beneficios']
const CARAS = [
  { icon: 'sentiment_very_dissatisfied', label: 'Muy mal' },
  { icon: 'sentiment_dissatisfied', label: 'Mal' },
  { icon: 'sentiment_neutral', label: 'Regular' },
  { icon: 'sentiment_satisfied', label: 'Bien' },
  { icon: 'sentiment_very_satisfied', label: 'Muy bien' },
]
const MAX = 300

export default function OpinaPage() {
  const [nota, setNota] = useState(0)
  const [tema, setTema] = useState(TEMAS[0])
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)

  if (enviado) {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader title="Opina" back="/beneficios" backLabel="Volver a Beneficios+" />
        <div className="mt-4 px-5">
          <div role="status" className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
              <Icon name="check" size={30} />
            </span>
            <p className="mt-3 text-base font-bold text-ink">¡Gracias por opinar!</p>
            <p className="mt-1 text-xs text-ink-muted">Tu comentario nos ayuda a mejorar UTP+.</p>
            <Link
              to="/beneficios"
              className="pressable mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
            >
              Volver a Beneficios+
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Opina" back="/beneficios" backLabel="Volver a Beneficios+" subtitle="Tu opinión mejora la experiencia de todos." />

      <div className="mt-4 space-y-5 px-5 pb-6">
        <section aria-labelledby="como">
          <h2 id="como" className="mb-2 px-1 text-sm font-bold text-ink">
            ¿Cómo ha sido tu experiencia?
          </h2>
          <div role="radiogroup" aria-label="Valoración" className="flex justify-between rounded-card bg-card px-2 py-2 shadow-card">
            {CARAS.map((c, i) => (
              <button
                key={c.icon}
                type="button"
                role="radio"
                aria-checked={nota === i + 1}
                aria-label={c.label}
                onClick={() => setNota(i + 1)}
                className={`pressable flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  nota === i + 1 ? 'bg-primary-soft text-primary' : 'text-ink-faint'
                }`}
              >
                <Icon name={c.icon} size={28} filled={nota === i + 1} />
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="tema">
          <h2 id="tema" className="mb-2 px-1 text-sm font-bold text-ink">
            ¿Sobre qué quieres opinar?
          </h2>
          <div role="tablist" aria-label="Tema" className="flex flex-wrap gap-2">
            {TEMAS.map((t) => (
              <Chip key={t} active={tema === t} onClick={() => setTema(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="comentario" className="mb-2 block px-1 text-sm font-bold text-ink">
            Cuéntanos más <span className="font-normal text-ink-muted">(opcional)</span>
          </label>
          <textarea
            id="comentario"
            value={texto}
            maxLength={MAX}
            rows={4}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="¿Qué te gustó o qué mejorarías?"
            className="w-full resize-none rounded-card bg-card px-3.5 py-3 text-xs text-ink shadow-card outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 px-1 text-right text-[0.6875rem] text-ink-faint">
            {texto.length}/{MAX}
          </p>
        </section>
      </div>

      <StickyCta>
        <button
          type="button"
          disabled={nota === 0}
          onClick={() => setEnviado(true)}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark disabled:opacity-50"
        >
          <Icon name="send" size={18} />
          Enviar opinión
        </button>
      </StickyCta>
    </div>
  )
}
