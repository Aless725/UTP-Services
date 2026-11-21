import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import Foto from './Foto'
import { BENEFICIOS, CATEGORIAS, CATEGORIA_IDS, PREMIO_REFERIDO, beneficiosDe, useCupones } from './beneficiosData'

interface Seccion {
  to?: string
  icon: string
  titulo: string
  detalle: string
}

const SECCIONES: Seccion[] = [
  { icon: 'person_add', titulo: 'Refiere y gana', detalle: `Gana S/ ${PREMIO_REFERIDO} por cada alumno que traigas`, to: '/beneficios/referir' },
  { icon: 'quiz', titulo: 'Trivia', detalle: '5 preguntas sobre la UTP y la vida universitaria', to: '/beneficios/trivia' },
  { icon: 'forum', titulo: 'Opina', detalle: 'Cuéntanos cómo mejorar tu experiencia', to: '/beneficios/opina' },
  { icon: 'newspaper', titulo: 'Ponte al día', detalle: 'Noticias y consejos para tu ciclo', to: '/beneficios/ponte-al-dia' },
  { icon: 'trending_up', titulo: 'Actualízate', detalle: 'Charlas y novedades de tu carrera' },
  { icon: 'workspace_premium', titulo: 'Capacítate', detalle: 'Cursos y certificaciones con descuento' },
]

export default function BeneficiosPage() {
  const navigate = useNavigate()
  const { cupones } = useCupones()
  const [q, setQ] = useState('')
  const destacados = BENEFICIOS.filter((b) => b.destacado)

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/beneficios/catalogo?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Beneficios+"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Descuentos y experiencias por ser parte de la UTP."
      />

      <form onSubmit={buscar} className="mt-4 px-5">
        <label className="flex min-h-11 items-center gap-2 rounded-card bg-card px-3.5 shadow-card focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={18} className="text-ink-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca una marca o descuento"
            aria-label="Buscar beneficios"
            className="h-11 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
      </form>

      <section aria-labelledby="destacados" className="mt-5">
        <h2 id="destacados" className="mb-2 px-6 text-sm font-bold text-ink">
          Destacados
        </h2>
        <ul className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {destacados.map((b) => (
            <li key={b.id} className="w-[78%] max-w-72 shrink-0 snap-start">
              <Link to={`/beneficios/${b.id}`} className="pressable block overflow-hidden rounded-card bg-card shadow-card">
                <Foto src={b.imagen} icon={b.icono} alt={b.empresa} className="h-28 w-full" />
                <span className="block px-3.5 py-3">
                  <span className="block text-sm font-bold text-ink">{b.empresa}</span>
                  <span className="block text-xs font-semibold text-primary">{b.descuento}</span>
                  <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">{CATEGORIAS[b.categoria].label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categorias" className="mt-5 px-5">
        <h2 id="categorias" className="mb-2 px-1 text-sm font-bold text-ink">
          Categorías
        </h2>
        <ul className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {CATEGORIA_IDS.map((id) => (
            <li key={id}>
              <Link to={`/beneficios/catalogo?categoria=${id}`} className="pressable flex min-h-14 items-center gap-3 px-3.5 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={CATEGORIAS[id].icon} size={20} filled />
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold text-ink">{CATEGORIAS[id].label}</span>
                <span className="text-xs text-ink-muted">{beneficiosDe(id).length}</span>
                <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/beneficios/cupones"
          className="pressable mt-3 flex min-h-14 items-center gap-3 rounded-card bg-card px-3.5 shadow-card"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
            <Icon name="sell" size={18} filled />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">Mis cupones</span>
            <span className="block text-[0.6875rem] text-ink-muted">
              {cupones.length === 0 ? 'Aún no generas ninguno' : `${cupones.length} ${cupones.length === 1 ? 'cupón' : 'cupones'} generados`}
            </span>
          </span>
          <Icon name="chevron_right" size={18} className="shrink-0 text-ink-faint" />
        </Link>
      </section>

      <section aria-labelledby="mas" className="mt-5 px-5">
        <h2 id="mas" className="mb-2 px-1 text-sm font-bold text-ink">
          Más para ti
        </h2>
        <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {SECCIONES.map((s) => {
            const contenido = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={s.icon} size={20} filled />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{s.titulo}</span>
                  <span className="block text-[0.6875rem] leading-snug text-ink-muted">{s.detalle}</span>
                </span>
                {s.to ? <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" /> : <Badge tone="neutral">Pronto</Badge>}
              </>
            )
            return (
              <li key={s.titulo}>
                {s.to ? (
                  <Link to={s.to} className="pressable flex min-h-16 items-center gap-3 px-3.5 py-3">
                    {contenido}
                  </Link>
                ) : (
                  <div aria-disabled="true" className="flex min-h-16 items-center gap-3 px-3.5 py-3 opacity-70">
                    {contenido}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-3 px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
          Los beneficios son personales. Los convenios y descuentos son de demostración.
        </p>
      </section>
    </div>
  )
}
