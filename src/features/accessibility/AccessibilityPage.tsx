import { useState, type ReactNode } from 'react'
import DarkHeader from '@/components/layout/DarkHeader'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import Switch from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { FONT_STOPS, useAccessibility, type Cvd } from './AccessibilityContext'

const CVD_OPTIONS: { value: Cvd; title: string; desc: string }[] = [
  { value: 'none', title: 'Desactivado', desc: 'Colores originales de UTP' },
  { value: 'protanopia', title: 'Protanopia', desc: 'Dificultad para percibir el rojo' },
  { value: 'deuteranopia', title: 'Deuteranopia', desc: 'Dificultad para percibir el verde' },
  { value: 'tritanopia', title: 'Tritanopia', desc: 'Dificultad para percibir el azul' },
]

export default function AccessibilityPage() {
  const { settings, update, reset } = useAccessibility()
  const { show } = useToast()
  const [confirmReset, setConfirmReset] = useState(false)

  const stopIndex = Math.max(0, FONT_STOPS.indexOf(settings.fontScale as (typeof FONT_STOPS)[number]))
  const p = stopIndex / (FONT_STOPS.length - 1)
  const THUMB = 26

  return (
    <div>
      <DarkHeader title="Accesibilidad" subtitle="Adapta UTP+ a tu forma de ver y leer." />

      <div className="stagger space-y-5 px-5 pb-4 pt-5">
        <section>
          <SectionLabel icon="format_size">Texto y lectura</SectionLabel>
          <div className="overflow-hidden rounded-card bg-card shadow-card">
            <div className="p-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Tamaño de texto</h3>
                <span
                  aria-live="polite"
                  className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[0.6875rem] font-bold text-primary"
                >
                  {settings.fontScale} %
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span aria-hidden="true" className="text-[0.625rem] font-semibold text-ink-muted">
                  A
                </span>
                <div className="relative flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-fill/10" />
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-200"
                    style={{ width: `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${p})` }}
                  />
                  {FONT_STOPS.map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-fill/20"
                      style={{ left: `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${i / (FONT_STOPS.length - 1)})` }}
                    />
                  ))}
                  <input
                    type="range"
                    min={0}
                    max={FONT_STOPS.length - 1}
                    step={1}
                    value={stopIndex}
                    onChange={(e) => update({ fontScale: FONT_STOPS[Number(e.target.value)] })}
                    aria-label="Tamaño de texto"
                    aria-valuetext={`${settings.fontScale} por ciento`}
                    className="slider relative"
                  />
                </div>
                <span aria-hidden="true" className="text-lg font-semibold text-ink-muted">
                  A
                </span>
              </div>
              <div className="mt-1 flex justify-between text-[0.625rem] text-ink-muted">
                <span>85 %</span>
                <span>Normal</span>
                <span>150 %</span>
              </div>

              <div className="mt-3 rounded-xl bg-surface p-3">
                <p className="text-[0.5625rem] font-semibold tracking-wide text-ink-muted">VISTA PREVIA</p>
                <p className="mt-1 text-sm text-ink">Tu próxima clase está por comenzar.</p>
              </div>
            </div>
            <Row
              title="Texto en negrita"
              desc="Resalta los textos de la aplicación."
              checked={settings.bold}
              onChange={(bold) => update({ bold })}
              border
            />
          </div>
        </section>

        <section>
          <SectionLabel icon="visibility">Color y visión</SectionLabel>
          <div className="overflow-hidden rounded-card bg-card shadow-card">
            <div className="p-3.5">
              <h3 className="text-sm font-bold text-ink">Modo para daltonismo</h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                Elige un filtro para distinguir mejor los colores de la interfaz.
              </p>
            </div>
            <div role="radiogroup" aria-label="Modo para daltonismo">
              {CVD_OPTIONS.map((o) => {
                const on = settings.cvd === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => update({ cvd: o.value })}
                    className={`flex min-h-14 w-full items-center gap-3 border-t border-fill/5 px-3.5 py-2.5 text-left transition-colors ${
                      on ? 'bg-primary-soft' : ''
                    }`}
                  >
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">{o.title}</span>
                      <span className="block text-[0.6875rem] text-ink-muted">{o.desc}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        on ? 'border-primary' : 'border-ink-faint'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform duration-200 ${
                          on ? 'scale-100' : 'scale-0'
                        }`}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section>
          <SectionLabel icon="tune">Interfaz y movimiento</SectionLabel>
          <div className="overflow-hidden rounded-card bg-card shadow-card">
            <Row
              title="Alto contraste"
              desc="Aumenta la diferencia entre el texto y el fondo."
              checked={settings.highContrast}
              onChange={(highContrast) => update({ highContrast })}
            />
            <Row
              title="Reducir transparencia"
              desc="Usa fondos sólidos para mejorar la legibilidad."
              checked={settings.reduceTransparency}
              onChange={(reduceTransparency) => update({ reduceTransparency })}
              border
            />
            <Row
              title="Reducir movimiento"
              desc="Limita las animaciones y las transiciones de la interfaz."
              checked={settings.reduceMotion}
              onChange={(reduceMotion) => update({ reduceMotion })}
              border
            />
          </div>
          <p className="mt-2 px-1 text-[0.6875rem] text-ink-muted">Los cambios se aplican en toda la aplicación.</p>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-card bg-card text-sm font-semibold text-primary shadow-card"
          >
            <Icon name="restart_alt" size={18} />
            Restablecer ajustes
          </button>
          <p className="mt-2 px-4 text-center text-[0.6875rem] text-ink-muted">
            Vuelve a los valores predeterminados de accesibilidad. Se pedirá confirmación.
          </p>
        </section>
      </div>

      {confirmReset && (
        <Modal
          icon="restart_alt"
          title="¿Restablecer ajustes?"
          description="Volverás al texto normal, sin filtros de color ni contraste alto."
          actionLabel="Restablecer"
          onAction={() => {
            reset()
            setConfirmReset(false)
            show('Ajustes restablecidos', 'restart_alt')
          }}
          secondaryLabel="Cancelar"
          onSecondary={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}

function SectionLabel({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[0.6875rem] font-bold uppercase tracking-wide text-ink-muted">
      <Icon name={icon} size={14} className="text-primary" />
      {children}
    </h2>
  )
}

function Row({
  title,
  desc,
  checked,
  onChange,
  border,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
  border?: boolean
}) {
  return (
    <div className={`flex min-h-16 items-center gap-3 px-3.5 py-3 ${border ? 'border-t border-fill/5' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-[0.6875rem] text-ink-muted">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  )
}
