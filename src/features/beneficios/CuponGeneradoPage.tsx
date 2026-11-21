import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { BENEFICIOS } from './beneficiosData'

export default function CuponGeneradoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()

  const [verDetalleQR, setVerDetalleQR] = useState(false)

  const beneficio =
    BENEFICIOS.find((b) => b.id === id) ?? BENEFICIOS[0]

  const codigo =
    (location.state as { codigo?: string } | null)?.codigo ?? 'UTP-CP-8K4M2P'

  if (verDetalleQR) {
    return (
      <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900">Mi cupón</h1>

        <button
          type="button"
          onClick={() => setVerDetalleQR(false)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          <span>←</span> Cupón generado
        </button>

        {/* Tarjeta con QR */}
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900">
            {beneficio.empresa}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#B9001F]">
            {beneficio.tituloDescuento}
          </p>

          {/* QR estilizado */}
          <div className="mx-auto my-4 flex h-32 w-32 items-center justify-center rounded-2xl border border-gray-200 bg-white p-3">
            <svg viewBox="0 0 100 100" className="h-full w-full text-gray-900">
              <rect x="8" y="8" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="7" />
              <rect x="16" y="16" width="12" height="12" fill="currentColor" />
              <rect x="64" y="8" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="7" />
              <rect x="72" y="16" width="12" height="12" fill="currentColor" />
              <rect x="8" y="64" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="7" />
              <rect x="16" y="72" width="12" height="12" fill="currentColor" />
              <rect x="44" y="10" width="8" height="8" fill="currentColor" />
              <rect x="44" y="26" width="8" height="14" fill="currentColor" />
              <rect x="10" y="44" width="14" height="8" fill="currentColor" />
              <rect x="32" y="44" width="18" height="8" fill="currentColor" />
              <rect x="58" y="44" width="10" height="10" fill="currentColor" />
              <rect x="76" y="44" width="16" height="8" fill="currentColor" />
              <rect x="44" y="62" width="10" height="10" fill="currentColor" />
              <rect x="62" y="64" width="12" height="12" fill="currentColor" />
              <rect x="80" y="64" width="12" height="10" fill="currentColor" />
              <rect x="44" y="80" width="16" height="12" fill="currentColor" />
              <rect x="68" y="82" width="24" height="10" fill="currentColor" />
            </svg>
          </div>

          <p className="text-[11px] text-gray-400">Código promocional</p>
          <div className="mt-1.5 rounded-xl bg-gray-100 py-2.5 text-sm font-bold tracking-wider text-gray-900">
            {codigo}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Válido hasta el {beneficio.vigencia}
          </p>
        </div>

        {/* ¿Cómo usar tu beneficio? */}
        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900">
            ¿Cómo usar tu beneficio?
          </h3>
          <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-gray-600">
            <li>
              <strong className="text-gray-800">1.</strong> Acércate a la
              boletería de un local participante de {beneficio.empresa}.
            </li>
            <li>
              <strong className="text-gray-800">2.</strong> Muestra este QR o
              dicta el código junto con tu identificación UTP.
            </li>
            <li>
              <strong className="text-gray-800">3.</strong> El personal
              validará tu beneficio antes de realizar el pago.
            </li>
          </ol>
        </div>

        {/* Aviso rosado */}
        <div className="mt-3 rounded-2xl bg-[#FCE8EC] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-[#7F1D1D]">
            No compartas tu código. Solo puede utilizarse una vez y se validará
            en el establecimiento.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/beneficios/${beneficio.id}?tab=locales`)}
          className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
        >
          Ver locales
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">Cupón generado</h1>

      <button
        type="button"
        onClick={() => navigate('/beneficios')}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> Beneficios UTP
      </button>

      {/* Banner verde de éxito */}
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-[#EBF9F1] p-5 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xs">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-3 text-sm font-bold text-[#065F46]">
          ¡Tu cupón está listo!
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[#047857]">
          Se generó tu cupón de {beneficio.empresa}.
          <br />
          Preséntalo en un local participante.
        </p>
      </div>

      {/* Tarjeta con código promocional */}
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900">
          {beneficio.empresa}
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-[#B9001F]">
          {beneficio.tituloDescuento}
        </p>

        <p className="mt-3 text-[11px] text-gray-400">Código promocional</p>
        <div className="mt-1.5 rounded-xl bg-gray-100 py-3 text-base font-bold tracking-wider text-gray-900">
          {codigo}
        </div>
        <p className="mt-2.5 text-[11px] text-gray-400">
          Válido hasta el {beneficio.vigencia}
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        Cupón disponible. Aún no ha sido canjeado. Úsalo una sola vez antes de
        su vencimiento.
      </p>

      <button
        type="button"
        onClick={() => setVerDetalleQR(true)}
        className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
      >
        Ver cupón
      </button>
    </div>
  )
}