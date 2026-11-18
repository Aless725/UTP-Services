import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import Presence from '@/components/ui/Presence'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { genero } from '@/features/profile/profileData'
import GroupInfoCard from './GroupInfoCard'
import { addGroupToCalendar, shareGroup } from './groupActions'
import PageLoading from '@/components/ui/PageLoading'
import { JoinError, joinGroup, useGroups, useGroupsLoaded, type GroupView } from './groupsStore'
import SeatBar from './SeatBar'

export default function GroupDetailPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const g = useGroups(codigo).find((x) => x.id === id)
  const loaded = useGroupsLoaded()

  if (!g && !loaded) return <PageLoading />
  if (!g) {
    return (
      <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
        <BackButton to="/grupos" label="Volver a grupos" />
        <div className="mt-24 flex flex-col items-center text-center">
          <Icon name="search_off" size={36} className="text-ink-faint" />
          <h1 className="mt-3 text-base font-bold text-ink">No encontramos este grupo</h1>
          <p className="mt-1 text-xs text-ink-muted">Puede que ya no esté disponible.</p>
          <Link to="/grupos" className="mt-4 text-sm font-semibold text-primary">
            Volver a grupos
          </Link>
        </div>
      </div>
    )
  }
  return g.esMiembro ? <MyGroup g={g} /> : <JoinGroup g={g} />
}

function Seats({ g }: { g: GroupView }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink">
          {g.integrantes}/{g.cupos} integrantes
        </span>
        <span className="text-ink-muted">
          {g.libres === 0 ? 'Sin cupos' : `${g.libres} ${g.libres === 1 ? 'cupo libre' : 'cupos libres'}`}
        </span>
      </div>
      <SeatBar total={g.cupos} taken={g.integrantes} />
    </div>
  )
}

function Note({ icon, children }: { icon: string; children: string }) {
  return (
    <p className="flex items-start gap-2 text-xs text-ink-muted">
      <Icon name={icon} size={16} className="mt-px shrink-0" />
      {children}
    </p>
  )
}

type JoinStatus = 'idle' | 'joining' | 'offline' | 'full'

/** Detalle de un grupo al que todavía no perteneces. */
function JoinGroup({ g }: { g: GroupView }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<JoinStatus>('idle')

  const join = async () => {
    setStatus('joining')
    try {
      await joinGroup(g.id)
      navigate(`/grupos/${g.id}`, { replace: true, state: { fresh: true } })
    } catch (e) {
      setStatus(e instanceof JoinError && e.reason === 'full' ? 'full' : 'offline')
    }
  }

  const full = g.libres <= 0

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <BackButton to="/grupos" label="Volver a grupos" />
      <h1 className="mt-4 text-title text-ink">Detalle del grupo</h1>

      <div className="stagger mt-4 space-y-4">
        <GroupInfoCard
          group={g}
          topRight={<span className="text-xs text-ink-muted">{g.periodo}</span>}
          footer={<Seats g={g} />}
        />

        <section aria-labelledby="antes">
          <h2 id="antes" className="mb-2 text-[0.9375rem] font-bold text-ink">
            Antes de unirte
          </h2>
          <div className="space-y-2.5 rounded-card bg-card p-3.5 shadow-card">
            <Note icon="edit_note">{`Trae tus apuntes y ejercicios de ${g.curso}.`}</Note>
            <Note icon="schedule">Confirma solo si puedes asistir.</Note>
          </div>
        </section>

        <p className="px-1 text-xs text-ink-muted">
          {full
            ? 'Este grupo ya no tiene cupos libres.'
            : `Al unirte, ocuparás uno de los ${g.libres} ${g.libres === 1 ? 'cupo libre' : 'cupos libres'}.`}
        </p>

        <div>
          <button
            type="button"
            onClick={join}
            disabled={full || status === 'joining'}
            className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-50"
          >
            {full ? 'Grupo lleno' : 'Confirmar y unirme'}
          </button>
          <Link
            to="/grupos"
            className="mx-auto mt-1 flex min-h-11 items-center justify-center text-xs font-medium text-primary"
          >
            Volver a grupos
          </Link>
        </div>
      </div>

      <Presence show={status === 'joining'}>
        <Modal
          icon="progress_activity"
          spinning
          title="Uniéndote al grupo"
          description={`Estamos confirmando tu cupo en ${g.curso}.`}
        >
          <p className="mt-3 text-[0.6875rem] leading-snug text-ink-muted">
            Tu lugar aún no está confirmado. Esto puede tardar unos segundos.
          </p>
        </Modal>
      </Presence>

      <Presence show={status === 'offline' || status === 'full'}>
        <Modal
          icon={status === 'offline' ? 'wifi_off' : 'group_off'}
          title={status === 'offline' ? 'No pudimos confirmar tu cupo' : 'Este grupo ya se llenó'}
          description={
            status === 'offline'
              ? 'La conexión se interrumpió. Revisa tu internet e inténtalo de nuevo.'
              : 'Otro compañero ocupó el último cupo. Explora otros grupos disponibles.'
          }
          actionLabel={status === 'offline' ? 'Reintentar' : 'Volver a grupos'}
          actionIcon={status === 'offline' ? 'refresh' : undefined}
          onAction={status === 'offline' ? join : () => navigate('/grupos')}
          secondaryLabel={status === 'offline' ? 'Volver a grupos' : undefined}
          onSecondary={() => navigate('/grupos')}
        >
          {status === 'offline' && (
            <div className="mt-3 rounded-xl bg-surface p-3">
              <p className="text-xs font-bold text-ink">
                {g.curso} · {g.tema}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
                Tu cupo aún no está confirmado. Los datos del grupo se mantienen.
              </p>
            </div>
          )}
        </Modal>
      </Presence>
    </div>
  )
}

/** Vista de un grupo del que ya eres integrante. */
function MyGroup({ g }: { g: GroupView }) {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const location = useLocation()
  const { show } = useToast()
  const fresh = (location.state as { fresh?: boolean } | null)?.fresh

  const share = async () => {
    const r = await shareGroup(g)
    if (r === 'copied') show('Invitación copiada', 'content_copy')
    if (r === 'error') show('No se pudo compartir', 'error')
  }

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <BackButton to="/grupos?tab=mis" label="Volver a mis grupos" />
      <h1 className="mt-4 text-title text-ink">Mi grupo</h1>

      <div className="stagger mt-4 space-y-3">
        {fresh && (
          <div className="flex items-center gap-3 rounded-card bg-success-soft p-3">
            <span className="animate-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <Icon name="check" size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-success">¡Ya eres parte del grupo!</p>
              <p className="text-xs text-success">Tu cupo está confirmado.</p>
            </div>
          </div>
        )}

        <GroupInfoCard
          group={g}
          showLink
          topRight={<span className="text-xs text-ink-muted">{g.periodo}</span>}
          footer={
            <>
              <Seats g={g} />
              <p className="mt-2 text-xs font-medium text-success">
                {session?.nombre}, ya estás {genero(codigo, 'incluida', 'incluido')} en el grupo.
              </p>
            </>
          }
        />

        <Note icon="edit_note">{`Trae tus apuntes y ejercicios de ${g.curso}.`}</Note>

        <button
          type="button"
          onClick={() => {
            addGroupToCalendar(g)
            show('Evento descargado', 'event_available')
          }}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white"
        >
          <Icon name="event_available" size={18} />
          Agregar al calendario
        </button>
        <button
          type="button"
          onClick={share}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold text-primary shadow-card"
        >
          <Icon name="share" size={18} />
          Compartir grupo
        </button>
      </div>
    </div>
  )
}
