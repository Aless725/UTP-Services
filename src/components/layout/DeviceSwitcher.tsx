import Icon from '@/components/ui/Icon'
import { useDevice, type DevicePref } from './DeviceContext'

const OPTIONS: { value: Exclude<DevicePref, 'auto'>; label: string; icon: string }[] = [
  { value: 'phone', label: 'Celular', icon: 'smartphone' },
  { value: 'duo', label: 'Doble pantalla', icon: 'devices_fold' },
  { value: 'tablet', label: 'Tableta', icon: 'tablet_mac' },
]

/** Selector para previsualizar la app en otros formatos (solo en escritorio). */
export default function DeviceSwitcher() {
  const { pref, setPref } = useDevice()
  const active = pref === 'auto' ? 'phone' : pref
  return (
    <div
      role="radiogroup"
      aria-label="Vista previa del dispositivo"
      className="fixed left-1/2 top-3 z-[100] flex -translate-x-1/2 gap-1 rounded-full bg-neutral-800 p-1"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={active === o.value}
          onClick={() => setPref(o.value)}
          className={`flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors duration-200 ${
            active === o.value ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
          }`}
        >
          <Icon name={o.icon} size={18} />
          <span className="hidden md:inline">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
