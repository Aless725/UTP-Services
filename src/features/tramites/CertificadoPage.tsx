import { useNavigate } from 'react-router-dom'

export default function CertificadoPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold leading-tight text-gray-900">
        Certificado de
        <br />
        Estudios
      </h1>

      <button
        type="button"
        onClick={() => navigate('/tramites')}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> Trámites UTP
      </button>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
        <h2 className="text-xs font-bold text-gray-900">Sobre el certificado</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
          Documento que reúne tus cursos, calificaciones y trayectoria académica.
          Solicítalo en formato digital para tus trámites.
        </p>
      </div>

      <div className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-4 shadow-2xs">
        <div className="flex items-start gap-3 py-3.5">
          <span className="mt-0.5 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] text-gray-400">Tiempo de entrega</p>
            <p className="mt-0.5 text-xs font-bold text-gray-900">
              3 a 5 días hábiles
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              Plazo referencial de ejemplo.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 py-3.5">
          <span className="mt-0.5 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path strokeLinecap="round" d="M3 10h18" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] text-gray-400">Costo</p>
            <p className="mt-0.5 text-xs font-bold text-gray-900">S/ 30.00</p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              Importe ilustrativo, no es una tarifa oficial.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 py-3.5">
          <span className="mt-0.5 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] text-gray-400">Modalidad</p>
            <p className="mt-0.5 text-xs font-bold text-gray-900">Digital · PDF</p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              Envío a tu correo institucional.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
        Información conceptual para este diseño. Los costos y tiempos no
        representan políticas oficiales de UTP.
      </p>

      <button
        type="button"
        onClick={() => navigate('/tramites/certificado/solicitar')}
        className="mt-5 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
      >
        Solicitar certificado
      </button>
    </div>
  )
}