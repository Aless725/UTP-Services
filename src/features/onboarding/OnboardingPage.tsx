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
  const isLast = index === slides.length - 1

  const finish = () => {
    markOnboardingSeen()
    navigate('/login', { replace: true })
  }
  const next = () => (isLast ? finish() : setIndex((i) => i + 1))
  const prev = () => setIndex((i) => Math.max(0, i - 1))

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (dx < -50) next()
    else if (dx > 50) prev()
  }

  return (
    <section
      className="relative flex h-full flex-col bg-surface"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      <header className="flex justify-end px-6 pt-5">
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
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
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
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 bg-primary' : 'w-1.5 bg-ink-faint'
                }`}
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
