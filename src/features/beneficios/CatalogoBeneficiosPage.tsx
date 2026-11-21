import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  BENEFICIOS,
  CATEGORIAS_BENEFICIOS,
  type CategoriaBeneficio,
} from './beneficiosData'

export default function CatalogoBeneficiosPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoriaParam =
    (searchParams.get('categoria') as CategoriaBeneficio) || 'Todos'
  const queryParam = searchParams.get('q') || ''

  const [busqueda, setBusqueda] = useState(queryParam)
  const [categoriaActiva, setCategoriaActiva] =
    useState<CategoriaBeneficio>(categoriaParam)

  useEffect(() => {
    setCategoriaActiva(categoriaParam)
    setBusqueda(queryParam)
  }, [categoriaParam, queryParam])

  const actualizarFiltros = (cat: CategoriaBeneficio, q: string) => {
    setCategoriaActiva(cat)
    setBusqueda(q)
    const params = new URLSearchParams()
    if (cat !== 'Todos') params.set('categoria', cat)
    if (q.trim()) params.set('q', q.trim())
    setSearchParams(params, { replace: true })
  }

  const beneficiosFiltrados = BENEFICIOS.filter((item) => {
    const coincideCategoria =
      categoriaActiva === 'Todos' || item.categoria === categoriaActiva
    const texto = busqueda.trim().toLowerCase()
    const coincideTexto =
      !texto ||
      item.empresa.toLowerCase().includes(texto) ||
      item.tituloDescuento.toLowerCase().includes(texto) ||
      item.categoria.toLowerCase().includes(texto)

    return coincideCategoria && coincideTexto
  })

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">
        Catálogo de beneficios
      </h1>

      <button
        type="button"
        onClick={() => navigate('/beneficios')}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> Beneficios UTP
      </button>

      {/* Buscador */}
      <div className="relative mt-4">
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
          onChange={(e) => actualizarFiltros(categoriaActiva, e.target.value)}
          placeholder="Buscar beneficios o empresas"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-xs text-gray-800 placeholder-gray-400 shadow-2xs focus:border-[#B9001F] focus:outline-none"
        />
      </div>

      {/* Filtros horizontales */}
      <div className="mt-3.5 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIAS_BENEFICIOS.map((cat) => {
          const activa = categoriaActiva === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => actualizarFiltros(cat, busqueda)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
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

      <h2 className="mt-5 text-sm font-bold text-gray-900">
        Beneficios disponibles
      </h2>

      <div className="mt-3 space-y-3">
        {beneficiosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center">
            <p className="text-xs text-gray-500">
              No encontramos beneficios con ese filtro.
            </p>
            <button
              type="button"
              onClick={() => actualizarFiltros('Todos', '')}
              className="mt-2 text-xs font-semibold text-[#B9001F] hover:underline"
            >
              Ver todos los beneficios
            </button>
          </div>
        ) : (
          beneficiosFiltrados.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/beneficios/${item.id}`)}
              className="block w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-2xs transition hover:border-gray-200 hover:shadow-sm active:scale-[0.99]"
            >
              <div className="h-28 w-full overflow-hidden bg-gray-900">
                <img
                  src={item.imagen}
                  alt={item.empresa}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-bold text-gray-900">
                  {item.empresa}
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-[#B9001F]">
                  {item.tituloDescuento}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}