import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FiltroCategoria = 'Todos' | 'Estudiante' | 'Digital'

interface TramiteItem {
  id: string
  titulo: string
  descripcion: string
  tags: Exclude<FiltroCategoria, 'Todos'>[]
  ruta?: string
}

const CATEGORIAS: TramiteItem[] = [
  {
    id: 'certificado-estudios',
    titulo: 'Certificado de Estudios',
    descripcion: 'Documento oficial de tu trayectoria académica',
    tags: ['Estudiante', 'Digital'],
    ruta: '/tramites/certificado',
  },
  {
    id: 'constancia-matricula',
    titulo: 'Constancia de Matrícula',
    descripcion: 'Comprobante de inscripción vigente',
    tags: ['Estudiante', 'Digital'],
  },
  {
    id: 'carne-universitario',
    titulo: 'Carné Universitario',
    descripcion: 'Identificación oficial para estudiantes',
    tags: ['Estudiante'],
  },
  {
    id: 'mesa-ayuda',
    titulo: 'Mesa de Ayuda',
    descripcion: 'Soporte y orientación para trámites',
    tags: ['Estudiante', 'Digital'],
    ruta: '/soporte',
  },
]

const FILTROS: FiltroCategoria[] = ['Todos', 'Estudiante', 'Digital']

export default function TramitesPage() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroCategoria>('Todos')

  const categoriasFiltradas = CATEGORIAS.filter((item) => {
    const coincideFiltro =
      filtroActivo === 'Todos' || item.tags.includes(filtroActivo)
    const texto = busqueda.trim().toLowerCase()
    const coincideTexto =
      !texto ||
      item.titulo.toLowerCase().includes(texto) ||
      item.descripcion.toLowerCase().includes(texto)

    return coincideFiltro && coincideTexto
  })

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">Tramites UTP</h1>

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
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="¿Qué necesitas?"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-800 placeholder-gray-400 shadow-2xs focus:border-gray-900 focus:outline-none"
        />
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        {FILTROS.map((filtro) => {
          const activo = filtroActivo === filtro
          return (
            <button
              key={filtro}
              type="button"
              onClick={() => setFiltroActivo(filtro)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                activo
                  ? 'bg-[#18181B] text-white'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filtro}
            </button>
          )
        })}
      </div>

      <h2 className="mt-6 text-sm font-bold text-gray-900">Categorías</h2>

      <div className="mt-3 space-y-2.5">
        {categoriasFiltradas.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-center text-xs text-gray-500">
            No encontramos trámites que coincidan con tu búsqueda.
          </p>
        ) : (
          categoriasFiltradas.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.ruta) navigate(item.ruta)
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-2xs transition hover:border-gray-200 hover:shadow-sm active:scale-[0.99]"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900">{item.titulo}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{item.descripcion}</p>
              </div>
              <span className="ml-3 text-base text-gray-400">›</span>
            </button>
          ))
        )}
      </div>

      <h2 className="mt-6 text-sm font-bold text-gray-900">Mis solicitudes</h2>

      <button
        type="button"
        onClick={() => navigate('/tramites/seguimiento')}
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-2xs transition hover:border-gray-200 hover:shadow-sm active:scale-[0.99]"
      >
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Seguimiento de Solicitudes
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Consulta el estado de tus trámites.
          </p>
        </div>
        <span className="ml-3 text-base text-gray-400">›</span>
      </button>
    </div>
  )
}