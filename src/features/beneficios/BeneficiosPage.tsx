import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BENEFICIOS,
  CATEGORIAS_BENEFICIOS,
  type CategoriaBeneficio,
} from './beneficiosData'

export default function BeneficiosPage() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] =
    useState<CategoriaBeneficio>('Todos')

  const destacado = BENEFICIOS.find((b) => b.destacado) ?? BENEFICIOS[0]
  const paraTi = BENEFICIOS.find((b) => b.paraTi) ?? BENEFICIOS[1]

  const irAlCatalogo = (
    categoria: CategoriaBeneficio = categoriaActiva,
    texto: string = busqueda
  ) => {
    const params = new URLSearchParams()
    if (categoria && categoria !== 'Todos') params.set('categoria', categoria)
    if (texto.trim()) params.set('q', texto.trim())
    const query = params.toString()
    navigate(`/beneficios/catalogo${query ? `?${query}` : ''}`)
  }

  const manejarSubmitBusqueda = (e: FormEvent) => {
    e.preventDefault()
    irAlCatalogo('Todos', busqueda)
  }

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">Beneficios UTP</h1>

      <button
        type="button"
        onClick={() => navigate('/mas')}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> UTP+
      </button>

      {/* Buscador conectado al Catálogo */}
      <form onSubmit={manejarSubmitBusqueda} className="relative mt-4">
        <svg
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
          />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar beneficios o empresas"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-xs text-gray-800 placeholder-gray-400 shadow-2xs focus:border-[#B9001F] focus:outline-none"
        />
        {busqueda.trim() && (
          <button
            type="submit"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg bg-[#B9001F] px-2 py-1 text-[10px] font-semibold text-white"
          >
            Ir
          </button>
        )}
      </form>

      {/* Beneficios destacados */}
      <h2 className="mt-5 text-sm font-bold text-gray-900">
        Beneficios destacados
      </h2>

      <button
        type="button"
        onClick={() => navigate(`/beneficios/${destacado.id}`)}
        className="mt-3 block w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-2xs transition hover:shadow-sm active:scale-[0.99]"
      >
        <div className="h-32 w-full overflow-hidden bg-gray-900">
          <img
            src={destacado.imagen}
            alt={destacado.empresa}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-3.5">
          <h3 className="text-sm font-bold text-gray-900">
            {destacado.empresa}
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-[#B9001F]">
            {destacado.tituloDescuento}
          </p>
        </div>
      </button>

      {/* Categorías (cada chip abre el catálogo filtrado) */}
      <h2 className="mt-5 text-sm font-bold text-gray-900">Categorías</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIAS_BENEFICIOS.map((cat) => {
          const activa = categoriaActiva === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoriaActiva(cat)
                irAlCatalogo(cat, busqueda)
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activa
                  ? 'bg-[#B9001F] text-white'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Para ti + Ver todos -> */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Para ti</h2>
        <button
          type="button"
          onClick={() => irAlCatalogo('Todos', '')}
          className="text-xs font-semibold text-[#B9001F] hover:underline"
        >
          Ver todos →
        </button>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/beneficios/${paraTi.id}`)}
        className="mt-3 block w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-2xs transition hover:border-gray-200 hover:shadow-sm active:scale-[0.99]"
      >
        <h3 className="text-sm font-bold text-gray-900">{paraTi.empresa}</h3>
        <p className="mt-0.5 text-xs font-semibold text-[#B9001F]">
          {paraTi.tituloDescuento}
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          {paraTi.categoria} · {paraTi.modalidad}
        </p>
      </button>

      {/* Aviso inferior rosado */}
      <div className="mt-4 rounded-2xl bg-[#FCE8EC] px-4 py-3">
        <p className="text-[11px] leading-relaxed text-[#7F1D1D]">
          Los beneficios son personales. Consulta las condiciones de cada
          convenio.
        </p>
      </div>
    </div>
  )
}