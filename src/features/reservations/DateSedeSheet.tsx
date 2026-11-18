import { useMemo } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import { addDays, diffDays, parseISO, startOfDay, toISO, weekdayAbbrCap, monthAbbr } from '@/lib/date'
import { SETTINGS } from './rules'
import { useDraft } from './draftStore'
import { SEDES } from './spacesData'

interface DateSedeSheetProps {
  open: boolean
  onClose: () => void
}

/** Hoja para elegir la fecha y la sede con las que se consulta la disponibilidad. */
export default function DateSedeSheet({ open, onClose }: DateSedeSheetProps) {
  const { draft, patch } = useDraft()
  const days = useMemo(() => {
    const today = startOfDay(new Date())
    return Array.from({ length: SETTINGS.bookingWindowDays + 1 }, (_, i) => addDays(today, i))
  }, [])
  const selected = parseISO(draft.fecha)

  return (
    <BottomSheet open={open} onClose={onClose} title="Fecha y sede">
      <p className="mt-1 text-xs font-semibold text-ink-muted">Fecha</p>
      <div role="radiogroup" aria-label="Fecha" className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
        {days.map((d) => {
          const on = diffDays(d, selected) === 0
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${weekdayAbbrCap(d)} ${d.getDate()} ${monthAbbr(d)}`}
              onClick={() => patch({ fecha: toISO(d), inicio: null })}
              className={`pressable flex min-h-[3.75rem] w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs transition-colors ${
                on ? 'bg-primary text-white' : 'bg-surface text-ink'
              }`}
            >
              <span className={on ? 'text-white/80' : 'text-ink-muted'}>{weekdayAbbrCap(d)}</span>
              <span className="text-base font-bold">{d.getDate()}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-xs font-semibold text-ink-muted">Sede</p>
      <div role="radiogroup" aria-label="Sede" className="mt-2 flex gap-2">
        {SEDES.map((s) => {
          const on = draft.sede === s
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => patch({ sede: s, inicio: null })}
              className={`pressable min-h-11 flex-1 rounded-full px-4 text-sm font-medium transition-colors ${
                on ? 'bg-ink text-surface' : 'bg-surface text-ink-muted'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="pressable mt-5 min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
      >
        Aplicar
      </button>
    </BottomSheet>
  )
}
