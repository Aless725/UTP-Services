import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BackButton from '@/components/ui/BackButton'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import PlusIcon from '@/components/ui/PlusIcon'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { useAuth } from '@/features/auth/AuthContext'
import { genero } from '@/features/profile/profileData'
import GroupCard from './GroupCard'
import { useGroups } from './groupsStore'

type Tab = 'explorar' | 'mis'
type Filter = 'todas' | 'Presencial' | 'Virtual'

export default function GroupsPage() {
  const { session } = useAuth()
  const codigo = session?.codigo ?? ''
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'mis' ? 'mis' : 'explorar'
  const setTab = (t: Tab) => setParams(t === 'mis' ? { tab: 'mis' } : {}, { replace: true })
  const groups = useGroups(codigo)

  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <BackButton to="/inicio" label="Regresar" />
      <header className="mt-4">
        <h1 className="text-title text-ink">{tab === 'mis' ? 'Mis grupos' : 'Grupos de estudio'}</h1>
        <p className="mt-1 text-xs text-ink-muted">
          {tab === 'mis' ? 'Tus próximos encuentros, en un solo lugar.' : 'Aprende mejor, en compañía.'}
        </p>
      </header>

      <div className="mt-4">
        <SegmentedControl<Tab>
          label="Secciones de grupos"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'explorar', label: 'Explorar' },
            { value: 'mis', label: 'Mis grupos' },
          ]}
        />
      </div>

      <div key={tab} className="animate-page-in">
        {tab === 'explorar' ? (
          <Explore groups={groups} />
        ) : (
          <Mine groups={groups} codigo={codigo} onExplore={() => setTab('explorar')} />
        )}
      </div>
    </div>
  )
}

function Explore({ groups }: { groups: ReturnType<typeof useGroups> }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todas')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return groups.filter(
      (g) =>
        (filter === 'todas' || g.modalidad === filter) &&
        (!q || g.curso.toLowerCase().includes(q) || g.tema.toLowerCase().includes(q)),
    )
  }, [groups, query, filter])

  return (
    <>
      <label className="mt-3 flex min-h-11 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
        <Icon name="search" size={18} className="text-ink-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por curso"
          aria-label="Buscar por curso"
          className="h-11 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      <div role="tablist" aria-label="Filtrar por modalidad" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {(['todas', 'Presencial', 'Virtual'] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'todas' ? 'Todas' : f}
          </Chip>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[0.9375rem] font-bold text-ink">Grupos disponibles</h2>
        <button
          type="button"
          onClick={() => navigate('/grupos/nuevo')}
          className="pressable flex min-h-9 items-center gap-1 rounded-full bg-primary pl-2.5 pr-3.5 text-xs font-semibold text-white"
        >
          <PlusIcon size={14} />
          Crear grupo
        </button>
      </div>

      {list.length === 0 ? (
        <Empty
          icon="search_off"
          title="No hay grupos con esos filtros"
          text="Prueba con otro curso o crea tu propio grupo."
        />
      ) : (
        <ul key={filter} className="stagger mt-3 space-y-3" aria-live="polite">
          {list.map((g) => (
            <li key={g.id}>
              <GroupCard group={g} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Mine({
  groups,
  codigo,
  onExplore,
}: {
  groups: ReturnType<typeof useGroups>
  codigo: string
  onExplore: () => void
}) {
  const mine = groups.filter((g) => g.esMiembro)
  return (
    <>
      <div className="mt-5 flex items-baseline justify-between">
        <h2 className="text-[0.9375rem] font-bold text-ink">Próximas sesiones</h2>
        <span className="text-xs text-ink-muted">
          {mine.length} {mine.length === 1 ? 'grupo' : 'grupos'}
        </span>
      </div>

      {mine.length === 0 ? (
        <div className="mt-3">
          <Empty
            icon="groups"
            title="Aún no estás en ningún grupo"
            text="Explora los grupos disponibles o crea el tuyo."
          />
          <button
            type="button"
            onClick={onExplore}
            className="pressable mt-3 min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white"
          >
            Explorar grupos
          </button>
        </div>
      ) : (
        <ul className="stagger mt-3 space-y-3">
          {mine.map((g) => (
            <li key={g.id}>
              <GroupCard
                group={g}
                showDetails
                role={g.esOrganizador ? genero(codigo, 'Organizadora', 'Organizador') : 'Miembro'}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs text-ink-muted">
        <Icon name="info" size={16} className="mt-px shrink-0" />
        Desde los detalles puedes revisar la sesión y compartir tu grupo.
      </p>
    </>
  )
}

function Empty({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="animate-rise mt-3 flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
      <Icon name={icon} size={32} className="text-ink-faint" />
      <p className="mt-2 text-sm font-medium text-ink">{title}</p>
      <p className="text-xs text-ink-muted">{text}</p>
      <Link to="/grupos/nuevo" className="mt-3 text-xs font-semibold text-primary">
        Crear grupo
      </Link>
    </div>
  )
}
