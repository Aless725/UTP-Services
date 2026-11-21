import { useNavigate } from 'react-router-dom'

export default function SeguimientoPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold leading-tight text-gray-900">
        Seguimiento de
        <br />
        Solicitudes
      </h1>

      <button
        type="button"
        onClick={() => navigate('/tramites')}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> Trámites UTP
      </button>

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        Revisa el estado de tus solicitudes y accede a tus documentos aprobados.
      </p>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Mis solicitudes</h2>
        <span className="text-xs text-gray-400">2 solicitudes</span>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">
              SOL-2026-0148
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              En revisión
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold text-gray-900">
            Certificado de Estudios
          </h3>
          <p className="text-xs text-gray-500">General · Trámites académicos</p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Solicitada el 09 oct 2026 · 10:24
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs font-semibold text-gray-800">
            <span>Ver detalle</span>
            <span>›</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">
              SOL-2026-0129
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              ✓ Aprobado
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold text-gray-900">
            Constancia de Matrícula
          </h3>
          <p className="text-xs text-gray-500">
            Periodo 2026-2 · Trámite de beca
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Solicitada el 06 oct 2026 · 10:12
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs font-semibold text-gray-800">
            <span>Ver detalle</span>
            <span>›</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-gray-400">
        Solicitudes, estados y fechas de ejemplo para este diseño.
      </p>
    </div>
  )
}