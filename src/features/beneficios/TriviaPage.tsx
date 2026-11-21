import { useState } from 'react'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'

interface Pregunta {
  texto: string
  opciones: string[]
  correcta: number
  dato: string
}

const PREGUNTAS: Pregunta[] = [
  {
    texto: '¿Cuántos días de anticipación puedes reservar una sala de estudio?',
    opciones: ['7 días', '14 días', '30 días'],
    correcta: 1,
    dato: 'Puedes reservar con hasta 14 días de anticipación.',
  },
  {
    texto: '¿Cuántos integrantes necesita como mínimo una sala grupal?',
    opciones: ['2', '3', '5'],
    correcta: 1,
    dato: 'Las salas grupales requieren mínimo 3 integrantes.',
  },
  {
    texto: '¿Hasta cuándo puedes cancelar una reserva sin penalidad?',
    opciones: ['Hasta 1 hora antes', 'Hasta 15 minutos antes', 'Hasta el día anterior'],
    correcta: 0,
    dato: 'Después de ese plazo hay 7 días sin poder reservar.',
  },
  {
    texto: '¿Cuántas semanas dura un ciclo regular?',
    opciones: ['16', '18', '20'],
    correcta: 1,
    dato: 'El ciclo tiene 18 semanas, con evaluaciones a lo largo del ciclo.',
  },
  {
    texto: '¿Cuál es el correo para entrar a Outlook y Microsoft 365?',
    opciones: ['El personal', 'Tu código @utp.edu.pe', 'El de tu colegio'],
    correcta: 1,
    dato: 'Tu correo institucional es tu código seguido de @utp.edu.pe.',
  },
]

export default function TriviaPage() {
  const [i, setI] = useState(0)
  const [elegida, setElegida] = useState<number | null>(null)
  const [aciertos, setAciertos] = useState(0)
  const [fin, setFin] = useState(false)

  const p = PREGUNTAS[i]

  const elegir = (n: number) => {
    if (elegida !== null) return
    setElegida(n)
    if (n === p.correcta) setAciertos((a) => a + 1)
  }

  const siguiente = () => {
    if (i + 1 >= PREGUNTAS.length) setFin(true)
    else {
      setI(i + 1)
      setElegida(null)
    }
  }

  const reiniciar = () => {
    setI(0)
    setElegida(null)
    setAciertos(0)
    setFin(false)
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <FlowHeader title="Trivia" back="/beneficios" backLabel="Volver a Beneficios+" subtitle="Pon a prueba lo que sabes de la UTP." />

      {fin ? (
        <div className="mt-4 px-5">
          <div className="flex flex-col items-center rounded-card bg-card px-5 py-8 text-center shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon name={aciertos >= 4 ? 'emoji_events' : 'sentiment_satisfied'} size={30} filled />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">
              {aciertos} de {PREGUNTAS.length}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {aciertos === PREGUNTAS.length ? '¡Perfecto! Conoces la UTP al detalle.' : aciertos >= 3 ? '¡Muy bien! Casi lo sabes todo.' : 'Buen intento. Vuelve a jugar para mejorar.'}
            </p>
            <button
              type="button"
              onClick={reiniciar}
              className="pressable mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
            >
              <Icon name="replay" size={18} />
              Jugar de nuevo
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 px-5">
          <div
            role="progressbar"
            aria-label="Progreso de la trivia"
            aria-valuemin={1}
            aria-valuemax={PREGUNTAS.length}
            aria-valuenow={i + 1}
            className="h-1.5 overflow-hidden rounded-full bg-fill/[0.08]"
          >
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-smooth"
              style={{ transform: `scaleX(${(i + 1) / PREGUNTAS.length})` }}
            />
          </div>
          <p className="mt-2 px-1 text-[0.6875rem] text-ink-muted">
            Pregunta {i + 1} de {PREGUNTAS.length}
          </p>

          <div key={i} className="animate-fade-in">
            <h2 className="mt-2 px-1 text-base font-bold leading-snug text-ink">{p.texto}</h2>
            <ul className="mt-3 space-y-2" role="radiogroup" aria-label="Opciones">
              {p.opciones.map((o, n) => {
                const resuelta = elegida !== null
                const correcta = resuelta && n === p.correcta
                const incorrecta = resuelta && n === elegida && n !== p.correcta
                return (
                  <li key={o}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={elegida === n}
                      disabled={resuelta}
                      onClick={() => elegir(n)}
                      className={`pressable flex min-h-12 w-full items-center gap-3 rounded-card px-3.5 text-left text-sm font-medium shadow-card ${
                        correcta ? 'bg-success-soft text-success' : incorrecta ? 'bg-primary-soft text-primary' : 'bg-card text-ink'
                      }`}
                    >
                      <span className="flex-1">{o}</span>
                      {correcta && <Icon name="check_circle" size={20} filled label="Correcta" />}
                      {incorrecta && <Icon name="cancel" size={20} filled label="Incorrecta" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            {elegida !== null && (
              <>
                <p role="status" className="mt-3 px-1 text-xs leading-relaxed text-ink-muted">
                  {p.dato}
                </p>
                <button
                  type="button"
                  onClick={siguiente}
                  className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
                >
                  {i + 1 >= PREGUNTAS.length ? 'Ver resultado' : 'Siguiente'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
