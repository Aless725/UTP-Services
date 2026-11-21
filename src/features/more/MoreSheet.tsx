import { useNavigate } from 'react-router-dom'
import BottomSheet from '@/components/ui/BottomSheet'
import Icon from '@/components/ui/Icon'
import { moreItems } from './items'

export default function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <BottomSheet open={open} onClose={onClose} title="Más de UTP+" floating>
      <ul className="pb-2 short:grid short:grid-cols-2 short:gap-x-4">
        {moreItems.map((item, i) => (
          <li key={item.slug} className="animate-rise" style={{ animationDelay: `${60 + i * 25}ms` }}>
            <button
              type="button"
              onClick={() => {
                onClose()
                navigate(item.to ?? `/mas/${item.slug}`)
              }}
              className="pressable flex min-h-12 w-full items-center gap-3 rounded-xl py-1.5 text-left active:bg-surface"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon name={item.icon} size={18} />
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{item.label}</span>
              <Icon name="chevron_right" size={20} className="text-ink-muted" />
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
