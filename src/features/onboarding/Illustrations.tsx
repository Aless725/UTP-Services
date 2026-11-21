import Icon from '@/components/ui/Icon'
import type { OnboardingSlide } from './slides'

const Bar = ({ w, dark }: { w: string; dark?: boolean }) => (
  <div className={`h-2 rounded-full ${dark ? 'bg-fill/20' : 'bg-fill/10'} ${w}`} />
)

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[206px] w-[156px] rounded-[20px] bg-card p-3.5 shadow-card">{children}</div>
)

const Chip = ({ tone, icon }: { tone: string; icon: string }) => (
  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
    <Icon name={icon} size={18} />
  </div>
)

function Academica() {
  return (
    <Card>
      <Chip tone="bg-primary-soft text-primary" icon="calendar_view_day" />
      <div className="mt-3 space-y-2">
        <Bar w="w-24" dark />
        <Bar w="w-20" />
        <Bar w="w-12" />
      </div>
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-2 text-ink-muted">
        <Icon name="schedule" size={14} />
        <div className="h-4 flex-1 rounded-full bg-fill/5" />
      </div>
      <div className="absolute -right-10 top-[112px] flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-float">
        <Icon name="check_circle" size={20} className="text-success" />
        <div className="leading-tight">
          <p className="text-[0.5rem] text-ink-muted">Matrícula</p>
          <p className="text-[0.6875rem] font-semibold">Pagado</p>
        </div>
      </div>
    </Card>
  )
}

function Reservas() {
  return (
    <Card>
      <Chip tone="bg-info-soft text-info" icon="laptop_mac" />
      <div className="mt-3 space-y-2">
        <Bar w="w-24" dark />
        <Bar w="w-16" />
      </div>
      <div className="absolute -left-10 top-[98px] flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-float">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon name="location_on" size={16} />
        </div>
        <div className="leading-tight">
          <p className="text-[0.5rem] text-ink-muted">Ubicación</p>
          <p className="text-[0.6875rem] font-semibold">Pabellón A</p>
        </div>
      </div>
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-2 rounded-xl bg-card p-2 shadow-card">
        <div className="h-6 w-6 rounded-full bg-fill/10" />
        <div className="h-2 flex-1 rounded-full bg-fill/10" />
      </div>
    </Card>
  )
}

function Comunidad() {
  return (
    <Card>
      <div className="flex items-center -space-x-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-primary ring-2 ring-card">
          <Icon name="person" size={14} />
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info-soft text-info ring-2 ring-card">
          <Icon name="person" size={14} />
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-2 ring-card">
          <Icon name="add" size={14} />
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <Bar w="w-24" dark />
        <Bar w="w-20" />
        <Bar w="w-14" />
      </div>
      <div className="absolute right-3.5 top-[108px] flex h-8 w-8 items-center justify-center rounded-full bg-card text-primary shadow-float">
        <Icon name="chat_bubble" size={15} />
      </div>
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-2 rounded-xl bg-card p-2 shadow-card">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-info-soft text-info">
          <Icon name="videocam" size={15} />
        </div>
        <div className="h-2 flex-1 rounded-full bg-fill/10" />
      </div>
    </Card>
  )
}

export default function Illustration({ id }: { id: OnboardingSlide['id'] }) {
  return (
    <div aria-hidden="true" className="flex h-full items-center justify-center">
      {id === 'academica' && <Academica />}
      {id === 'reservas' && <Reservas />}
      {id === 'comunidad' && <Comunidad />}
    </div>
  )
}
