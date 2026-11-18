import { useParams } from 'react-router-dom'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import { moreItems, sectionTitle } from './items'

/** Pantalla provisional para flujos aún no implementados. */
export default function ComingSoonPage() {
  const { slug = '' } = useParams()
  const icon = moreItems.find((i) => i.slug === slug)?.icon ?? 'construction'

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <BackButton />
      <div className="stagger mt-24 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon name={icon} size={32} />
        </span>
        <h1 className="mt-5 text-title text-ink">{sectionTitle(slug)}</h1>
        <p className="mt-2 max-w-[16rem] text-sm text-ink-muted">
          Esta sección estará disponible muy pronto.
        </p>
      </div>
    </div>
  )
}
