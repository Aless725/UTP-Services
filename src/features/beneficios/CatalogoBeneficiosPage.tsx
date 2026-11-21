import { Link, useSearchParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import { useShell } from '@/components/layout/ShellContext'
import Chip from '@/components/ui/Chip'
import Icon from '@/components/ui/Icon'
import Foto from './Foto'
import { BENEFICIOS, CATEGORIAS, CATEGORIA_IDS, buscar, useCupones, type CategoriaId } from './beneficiosData'

export default function CatalogoBeneficiosPage() {
  const [params, setParams] = useSearchParams()
  const { detailPath } = useShell()
  const { de } = useCupones()
  const q = params.get('q') ?? ''
  const raw = params.get('categoria')
  const categoria = (CATEGORIA_IDS as string[]).includes(raw ?? '') ? (raw as CategoriaId) : null

  const cambiar = (c: CategoriaId | null, texto = q) => {
    const p = new URLSearchParams()
    if (c) p.set('categoria', c)
    if (texto) p.set('q', texto)
    setParams(p, { replace: true })
  }

  const lista = buscar(categoria ? BENEFICIOS.filter((b) => b.categoria === categoria) : BENEFICIOS, q)

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Catálogo"
        back="/beneficios"
        backLabel="Volver a Beneficios+"
        subtitle={categoria ? CATEGORIAS[categoria].label : 'Todos los convenios'}
      />

      <div className="mt-4 px-5">
        <label className="flex min-h-11 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={18} className="text-ink-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => cambiar(categoria, e.target.value)}
            placeholder="Busca una marca o descuento"
            aria-label="Buscar beneficios"
            className="h-11 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
      </div>

      <div role="tablist" aria-label="Categorías" className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        <Chip active={!categoria} onClick={() => cambiar(null)}>
          Todos
        </Chip>
        {CATEGORIA_IDS.map((id) => (
          <Chip key={id} active={categoria === id} onClick={() => cambiar(id)}>
            {CATEGORIAS[id].corto}
          </Chip>
        ))}
      </div>

      <section aria-label="Beneficios" className="mt-4 px-5">
        {lista.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center shadow-card">
            <Icon name="search_off" size={32} className="text-ink-faint" />
            <p className="mt-2 text-sm font-medium text-ink">No encontramos beneficios{q ? ` con «${q}»` : ''}</p>
            <p className="mt-0.5 text-xs text-ink-muted">Prueba con otra palabra o categoría.</p>
          </div>
        ) : (
          <ul key={`${categoria}-${q}`} className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {lista.map((b) => (
              <li key={b.id}>
                <Link
                  to={`/beneficios/${b.id}`}
                  aria-current={detailPath === `/beneficios/${b.id}` ? 'page' : undefined}
                  className={`pressable flex min-h-[4.5rem] items-center gap-3 px-3.5 py-3 ${
                    detailPath === `/beneficios/${b.id}` ? 'bg-primary-soft' : ''
                  }`}
                >
                  <Foto src={b.imagen} icon={b.icono} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">{b.empresa}</span>
                    <span className="block text-xs font-semibold text-primary">{b.descuento}</span>
                    <span className="block text-[0.6875rem] text-ink-muted">
                      {CATEGORIAS[b.categoria].corto} · {b.modalidad}
                    </span>
                  </span>
                  {de(b.id) ? (
                    <Icon name="check_circle" size={20} filled className="shrink-0 text-success" label="Cupón generado" />
                  ) : (
                    <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
