import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Badge from '@/components/ui/Badge'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { ESTADOS, fechaHora, useSolicitudes, useTramiteTipos } from './tramitesData'

type Filtro = 'todas' | 'en_curso' | 'finalizadas'

export default function SeguimientoPage() {
  const solicitudes = useSolicitudes()
  const tipos = useTramiteTipos()
  const { detailPath } = useShell()
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const all = useMemo(() => solicitudes.data ?? [], [solicitudes.data])
  const enCurso = all.filter((s) => s.estado === 'en_revision')
  const finalizadas = all.filter((s) => s.estado !== 'en_revision')
  const list = filtro === 'en_curso' ? enCurso : filtro === 'finalizadas' ? finalizadas : all
  const titulo = (id: string) => tipos.data?.find((t) => t.id === id)

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Seguimiento"
        back="/tramites"
        backLabel="Volver a trámites"
        subtitle="Revisa el estado de tus solicitudes."
      />

      {solicitudes.isLoading ? (
        <div role="status" aria-label="Cargando" className="mt-4 space-y-3 px-5">
          <Skeleton className="h-9 w-2/3 rounded-full" />
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-24 w-full rounded-card" />
        </div>
      ) : solicitudes.isError ? (
        <div role="alert" className="mx-5 mt-6 rounded-card bg-card p-5 text-center shadow-card">
          <Icon name="cloud_off" size={28} className="text-ink-faint" />
          <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar tus solicitudes</p>
          <button type="button" onClick={() => solicitudes.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
            Reintentar
          </button>
        </div>
      ) : all.length === 0 ? (
        <div className="mx-5 mt-6 flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
          <Icon name="pending_actions" size={32} className="text-ink-faint" />
          <p className="mt-2 text-sm font-medium text-ink">Aún no tienes solicitudes</p>
          <Link to="/tramites" className="pressable mt-2 flex min-h-11 items-center text-sm font-semibold text-primary">
            Ver trámites
          </Link>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Filtrar solicitudes" className="mt-4 flex gap-2 px-5">
            <Chip active={filtro === 'todas'} onClick={() => setFiltro('todas')}>{`Todas (${all.length})`}</Chip>
            <Chip active={filtro === 'en_curso'} onClick={() => setFiltro('en_curso')}>{`En curso (${enCurso.length})`}</Chip>
            <Chip active={filtro === 'finalizadas'} onClick={() => setFiltro('finalizadas')}>{`Finalizadas (${finalizadas.length})`}</Chip>
          </div>

          {list.length === 0 ? (
            <p key={filtro} className="animate-rise mx-5 mt-4 rounded-card bg-card p-5 text-center text-xs text-ink-muted shadow-card">
              No hay solicitudes en esta categoría.
            </p>
          ) : (
            <ul key={filtro} className="stagger mt-4 space-y-3 px-5">
              {list.map((s) => {
                const estado = ESTADOS[s.estado]
                const seleccionada = detailPath === `/tramites/solicitud/${s.codigo}`
                return (
                  <li key={s.codigo}>
                    <Link
                      to={`/tramites/solicitud/${s.codigo}`}
                      aria-current={seleccionada ? 'page' : undefined}
                      className={`pressable block rounded-card bg-card p-4 shadow-card ${seleccionada ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.6875rem] font-medium text-ink-muted">{s.codigo}</span>
                        <Badge tone={estado.tone}>{estado.label}</Badge>
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold leading-snug text-ink">{titulo(s.tipoId)?.titulo ?? 'Trámite'}</h3>
                      <p className="mt-1 flex items-center justify-between gap-2 text-[0.6875rem] text-ink-faint">
                        <span className="flex items-center gap-1">
                          <Icon name="schedule" size={12} />
                          {fechaHora(s.creada)}
                        </span>
                        <Icon name="chevron_right" size={18} className="text-ink-faint" />
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
