import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BENEFICIOS } from './beneficiosData'

type TabDetalle = 'detalles' | 'usar' | 'locales'

export default function DetalleBeneficioPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const tabInicial = (searchParams.get('tab') as TabDetalle) || 'detalles'
  const [tab, setTab] = useState<TabDetalle>(tabInicial)
  const [confirmando, setConfirmando] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const beneficio =
    BENEFICIOS.find((b) => b.id === id) ?? BENEFICIOS[0]

  const tituloEncabezado =
    tab === 'detalles'
      ? 'Detalle del beneficio'
      : tab === 'usar'
        ? 'Usar descuento'
        : 'Locales'

  const textoVolver =
    tab === 'detalles' ? 'Catálogo de beneficios' : 'Detalle del beneficio'

  const manejarVolver = () => {
    if (tab !== 'detalles') {
      setTab('detalles')
      return
    }
    navigate('/beneficios/catalogo')
  }

  const generarCodigoAleatorio = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let sufijo = ''
    for (let i = 0; i < 6; i++) {
      sufijo += chars[Math.floor(Math.random() * chars.length)]
    }
    return `${beneficio.prefijoCodigo}-${sufijo}`
  }

  const confirmarGeneracion = () => {
    setConfirmando(false)
    setProcesando(true)

    setTimeout(() => {
      setProcesando(false)
      const codigo =
        beneficio.id === 'cineplanet'
          ? 'UTP-CP-8K4M2P'
          : generarCodigoAleatorio()

      navigate(`/beneficios/${beneficio.id}/cupon`, {
        state: { codigo },
      })
    }, 1500)
  }

  return (
    <div className="relative min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">{tituloEncabezado}</h1>

      <button
        type="button"
        onClick={manejarVolver}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> {textoVolver}
      </button>

      {/* Tarjeta superior del beneficio */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xs">
        <div className="h-32 w-full overflow-hidden bg-gray-900">
          <img
            src={beneficio.imagen}
            alt={beneficio.empresa}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="px-4 py-3 text-center">
          <h2 className="text-sm font-bold text-gray-900">
            {beneficio.empresa}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#B9001F]">
            {beneficio.tituloDescuento}
          </p>
        </div>
      </div>

      {/* Pestañas tipo pastilla: Detalles | Usar descuento | Locales */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('detalles')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            tab === 'detalles'
              ? 'bg-[#B9001F] text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Detalles
        </button>

        <button
          type="button"
          onClick={() => setTab('usar')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            tab === 'usar'
              ? 'bg-[#B9001F] text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Usar descuento
        </button>

        <button
          type="button"
          onClick={() => setTab('locales')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            tab === 'locales'
              ? 'bg-[#B9001F] text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Locales
        </button>
      </div>

      {/* Contenido de la pestaña Detalles */}
      {tab === 'detalles' && (
        <>
          <p className="mt-4 text-xs leading-relaxed text-gray-600">
            {beneficio.descripcion}
          </p>

          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900">
              Términos y condiciones
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600">
              {beneficio.terminos.map((term, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            Vigente hasta el {beneficio.vigencia} · {beneficio.tipoCanje}
          </p>

          <button
            type="button"
            onClick={() => setTab('usar')}
            className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
          >
            Usar descuento
          </button>
        </>
      )}

      {/* Contenido de la pestaña Usar descuento */}
      {tab === 'usar' && (
        <>
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900">
              ¿Cómo usar tu beneficio?
            </h3>
            <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-gray-600">
              {beneficio.pasosUso.map((paso, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-gray-800">{idx + 1}.</span>
                  <span>{paso}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-3 rounded-2xl bg-[#FCE8EC] px-4 py-3">
            <p className="text-[11px] leading-relaxed text-[#7F1D1D]">
              El cupón es personal y de un solo uso. Generarlo no significa que
              ya lo hayas canjeado.
            </p>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            Vigencia del convenio: {beneficio.vigencia}
          </p>

          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
          >
            Generar Cupón
          </button>
        </>
      )}

      {/* Contenido de la pestaña Locales */}
      {tab === 'locales' && (
        <>
          <h3 className="mt-4 text-xs font-bold text-gray-900">
            Locales participantes
          </h3>

          <div className="mt-2.5 space-y-2.5">
            {beneficio.locales.map((local, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs"
              >
                <h4 className="text-xs font-bold text-gray-900">
                  {local.sede}
                </h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  {local.centroComercial}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {local.direccion}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
            Locales referenciales para este prototipo. Su participación debe
            confirmarse con el convenio.
          </p>

          <button
            type="button"
            onClick={() => setTab('detalles')}
            className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
          >
            Volver al beneficio
          </button>
        </>
      )}

      {/* Pantalla 05: Modal de confirmación Generar Cupón */}
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[1px]">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              Generar Cupón
            </h3>
            <p className="mt-2 text-xs text-gray-500">
              ¿Está seguro que desea generar el cupón?
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarGeneracion}
                className="rounded-xl bg-[#B9001F] py-2.5 text-xs font-semibold text-white hover:bg-[#9E001A]"
              >
                Acepto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 06: Overlay Procesando cupón */}
      {procesando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[1px]">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCE8EC]">
              <svg
                className="h-6 w-6 animate-spin text-[#B9001F]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="42 20"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-sm font-bold text-gray-900">
              Procesando cupón
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Estamos generando tu cupón de {beneficio.empresa}.
              <br />
              Esto tomará unos segundos.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-[#B9001F]">
              Mantén esta pantalla abierta.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}