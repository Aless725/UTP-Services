import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { markOnboardingSeen } from '@/lib/storage'
import Illustration from './Illustrations'
import { slides } from './slides'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)
  const [drag, setDrag] = useState(0)
  const dragging = useRef(false)
  const rawDx = useRef(0)
  const isLast = index === slides.length - 1

  const finish = () => {
    markOnboardingSeen()
    navigate('/login', { replace: true })
  }
  const next = () => (isLast ? finish() : setIndex((i) => i + 1))
  const prev = () => setIndex((i) => Math.max(0, i - 1))

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    let dx = e.touches[0].clientX - touchX.current
    rawDx.current = dx
    // Resistencia en los extremos para que no se "escape" la primera ni la última
    if ((index === 0 && dx > 0) || (isLast && dx < 0)) dx *= 0.3
    dragging.current = true
    setDrag(dx)
  }

  const onTouchEnd = () => {
    const dx = rawDx.current
    rawDx.current = 0
    touchX.current = null
    dragging.current = false
    setDrag(0)
    if (dx < -60) next()
    else if (dx > 60) prev()
  }

  return (
    <section
      className="relative flex h-full flex-col bg-surface"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      <header className="flex items-center justify-between px-5 pt-5">
        {/* La primera pantalla no tiene "regresar": se sale con "Saltar". Desde la segunda, vuelve al paso anterior. */}
        {index > 0 ? (
          <button
            key="atras"
            type="button"
            onClick={prev}
            aria-label="Paso anterior"
            className="pressable animate-fade-in flex h-10 w-10 items-center justify-center rounded-full bg-card text-ink shadow-card"
          >
            <Icon name="chevron_left" size={22} />
          </button>
        ) : (
          <span className="h-10 w-10" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={finish}
          className="min-h-11 min-w-11 text-sm font-medium text-ink-faint transition-colors hover:text-ink-muted"
        >
          Saltar
        </button>
      </header>

      <div className="overflow-hidden" aria-live="polite">
        <div
          className={`flex ease-smooth ${dragging.current ? '' : 'transition-transform duration-500'}`}
          style={{ transform: `translate3d(calc(-${index * 100}% + ${drag}px), 0, 0)` }}
        >
          {slides.map((s, i) => (
            <article
              key={s.id}
              className="w-full shrink-0 px-6 pt-16"
              aria-hidden={i !== index}
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <h1 className="text-display text-ink">{s.title}</h1>
              <p className="mt-3 max-w-[16rem] text-sm leading-snug text-ink-muted">{s.description}</p>
              <div className="mt-6 h-[260px]">
                <Illustration id={s.id} />
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer className="mt-auto flex items-center justify-between px-8 pb-10">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Progreso">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir al paso ${i + 1}`}
              onClick={() => setIndex(i)}
              className="flex h-6 items-center px-0.5"
            >
              <span
                className={`block h-1.5 w-5 origin-left rounded-full transition-[transform,background-color] duration-300 ease-smooth ${
                  i === index ? 'bg-primary' : 'bg-ink-faint'
                }`}
                style={{ transform: `scaleX(${i === index ? 1 : 0.3})` }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          aria-label={isLast ? 'Comenzar' : 'Siguiente'}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-ink text-surface transition-transform active:scale-95"
        >
          <Icon name="arrow_forward" size={26} />
        </button>
      </footer>
    </section>
  )
}
