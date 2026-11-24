import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Badge from '@/components/ui/Badge'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Skeleton from '@/components/ui/Skeleton'
import { useNow } from '@/hooks/useNow'
import { dayShort, parseISO } from '@/lib/date'
import { Portada } from './BibliotecaPage'
import { situacionLibro, useLibros, useMisReservasLibros, type SituacionLibro } from './bibliotecaData'

const TEXTO_VACIO: Record<SituacionLibro, { titulo: string; texto: string }> = {
  vigente: { titulo: 'No tienes libros por recoger', texto: 'Reserva una copia impresa para verla aquí.' },
  vencida: { titulo: 'No tienes reservas vencidas', texto: 'Aquí verás las que no recogiste a tiempo.' },
  cancelada: { titulo: 'No tienes reservas canceladas', texto: 'Las que canceles aparecerán aquí.' },
}

export default function MisReservasLibrosPage() {
  const mis = useMisReservasLibros()
  const libros = useLibros()
  const now = useNow(60_000)
  const { detailPath } = useShell()
  const [filtro, setFiltro] = useState<SituacionLibro>('vigente')

  const all = useMemo(() => mis.data ?? [], [mis.data])
  const por = (s: SituacionLibro) => all.filter((r) => situacionLibro(r, now) === s)
  const list = filtro === 'vigente' ? por(filtro) : [...por(filtro)].reverse()

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader title="Mis reservas de libros" back="/biblioteca" backLabel="Volver a la biblioteca" subtitle="Copias impresas que recoges en la sede." />

      <div role="tablist" aria-label="Filtrar reservas" className="mt-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
        <Chip active={filtro === 'vigente'} onClick={() => setFiltro('vigente')}>{`Por recoger (${por('vigente').length})`}</Chip>
        <Chip active={filtro === 'vencida'} onClick={() => setFiltro('vencida')}>{`Vencidas (${por('vencida').length})`}</Chip>
        <Chip active={filtro === 'cancelada'} onClick={() => setFiltro('cancelada')}>{`Canceladas (${por('cancelada').length})`}</Chip>
      </div>

      <section aria-label="Reservas" className="mt-4 px-5">
        {mis.isLoading ? (
          <div role="status" aria-label="Cargando" className="space-y-px overflow-hidden rounded-card">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.5rem] w-full rounded-none" />
            ))}
          </div>
        ) : mis.isError ? (
          <div role="alert" className="rounded-card bg-card p-5 text-center shadow-card">
            <Icon name="cloud_off" size={28} className="text-ink-faint" />
            <p className="mt-1 text-sm font-medium text-ink">No pudimos cargar tus reservas</p>
            <button type="button" onClick={() => mis.refetch()} className="pressable mt-2 min-h-11 text-sm font-semibold text-primary">
              Reintentar
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="menu_book" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">{TEXTO_VACIO[filtro].titulo}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{TEXTO_VACIO[filtro].texto}</p>
            {filtro === 'vigente' && (
              <Link to="/biblioteca" className="pressable mt-2 flex min-h-11 items-center text-sm font-semibold text-primary">
                Ver libros
              </Link>
            )}
          </div>
        ) : (
          <ul key={filtro} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {list.map((r) => {
              const libro = libros.data?.find((l) => l.id === r.libroId)
              const a = `/biblioteca/reserva/${r.codigo}`
              return (
                <li key={r.id}>
                  <Link
                    to={a}
                    aria-current={detailPath === a ? 'page' : undefined}
                    className={`pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3 ${detailPath === a ? 'bg-primary-soft' : ''}`}
                  >
                    <Portada tema={libro?.tema ?? 'otros'} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-snug text-ink">{libro?.titulo ?? 'Libro'}</span>
                      <span className="block text-[0.6875rem] text-ink-muted">
                        {r.sede} · {dayShort(parseISO(r.recojo))}
                      </span>
                      <span className="block text-[0.6875rem] text-ink-faint">{r.codigo}</span>
                    </span>
                    {filtro === 'vigente' ? (
                      <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
                    ) : (
                      <Badge tone="neutral">{filtro === 'cancelada' ? 'Cancelada' : 'Vencida'}</Badge>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
