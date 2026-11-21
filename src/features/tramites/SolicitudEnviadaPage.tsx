import { useLocation, useNavigate } from 'react-router-dom'

interface SolicitudEnviadaState {
  codigo?: string
  fecha?: string
  tipoCertificado?: string
  motivo?: string
  correo?: string
}

export default function SolicitudEnviadaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const datos = (location.state as SolicitudEnviadaState) || {}

  const codigo = datos.codigo ?? 'SOL-2026-0148'
  const fecha = datos.fecha ?? '09 oct 2026 · 10:24'
  const tipoCertificado = datos.tipoCertificado ?? 'General'
  const motivo = datos.motivo ?? 'Trámites académicos'
  const correo = datos.correo ?? 'U24313890@utp.edu.pe'

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold leading-tight text-gray-900">
        Solicitud
        <br />
        Enviada
      </h1>

      <button
        type="button"
        onClick={() => navigate('/tramites')}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> Trámites UTP
      </button>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-[#EBF9F1] p-5 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xs">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-3 text-sm font-bold text-[#065F46]">
          Recibimos tu solicitud
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[#047857]">
          Tu Certificado de Estudios está en revisión.
          <br />
          Puedes consultar su avance.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-bold text-gray-900">{codigo}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            En revisión
          </span>
        </div>

        <div className="mt-3 space-y-3 text-xs">
          <div>
            <p className="text-[11px] text-gray-400">Fecha de solicitud</p>
            <p className="mt-0.5 font-semibold text-gray-900">{fecha}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-gray-400">Tipo</p>
              <p className="mt-0.5 font-semibold text-gray-900">
                {tipoCertificado}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Motivo</p>
              <p className="mt-0.5 font-semibold text-gray-900">{motivo}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-gray-400">Correo institucional</p>
            <p className="mt-0.5 font-semibold text-gray-900">{correo}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        Te notificaremos por correo cuando tu documento esté disponible.
      </p>

      <p className="mt-3 text-[11px] text-gray-400">
        Solicitud y datos personales de ejemplo.
      </p>

      <button
        type="button"
        onClick={() => navigate('/tramites/seguimiento')}
        className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
      >
        Ver seguimiento
      </button>
    </div>
  )
}