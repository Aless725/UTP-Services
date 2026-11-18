import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BackButton from '@/components/ui/BackButton'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { genero } from '@/features/profile/profileData'
import GroupInfoCard from './GroupInfoCard'
import { shareGroup } from './groupActions'
import PageLoading from '@/components/ui/PageLoading'
import { useGroups, useGroupsLoaded } from './groupsStore'

export default function GroupCreatedPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const navigate = useNavigate()
  const { show } = useToast()
  const g = useGroups(codigo).find((x) => x.id === id)

  const loaded = useGroupsLoaded()

  if (!g && !loaded) return <PageLoading />
  if (!g || !g.esOrganizador) return <Navigate to="/grupos" replace />

  const share = async () => {
    const r = await shareGroup(g)
    if (r === 'copied') show('Invitación copiada', 'content_copy')
    if (r === 'error') show('No se pudo compartir', 'error')
  }

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <BackButton to="/grupos" label="Volver a grupos" />
      <h1 className="mt-4 text-title text-ink">Grupo creado</h1>

      <div className="stagger mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-card bg-success-soft p-3">
          <span className="animate-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <Icon name="check" size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-success">¡Listo, {session?.nombre}!</p>
            <p className="text-xs text-success">Tu grupo ya está disponible para unirse.</p>
          </div>
        </div>

        <GroupInfoCard
          group={g}
          showLink
          topRight={
            <span className="rounded-full bg-fill/5 px-2.5 py-0.5 text-[0.625rem] font-semibold text-ink-muted">
              {genero(codigo, 'Organizadora', 'Organizador')}
            </span>
          }
          footer={
            <p className="text-xs font-semibold text-ink">
              {g.integrantes}/{g.cupos} integrantes · Tú estás {genero(codigo, 'incluida', 'incluido')}
            </p>
          }
        />

        <p className="flex items-start gap-2 px-1 text-xs text-ink-muted">
          <Icon name="info" size={16} className="mt-px shrink-0" />
          Comparte la invitación para que tus compañeros encuentren el grupo.
        </p>

        <button
          type="button"
          onClick={() => navigate(`/grupos/${g.id}`, { replace: true })}
          className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
        >
          Ver mi grupo
        </button>
        <button
          type="button"
          onClick={share}
          className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold text-primary shadow-card"
        >
          <Icon name="share" size={18} />
          Compartir invitación
        </button>
      </div>
    </div>
  )
}
