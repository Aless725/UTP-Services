import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SolicitarCertificadoPage() {
  const navigate = useNavigate()

  const [procesando, setProcesando] = useState(false)
  const [esError, setEsError] = useState(false)
  const [simularError, setSimularError] = useState(false)

  const [form, setForm] = useState({
    tipoCertificado: 'General',
    motivo: 'Trámites académicos',
    correo: 'U24313890@utp.edu.pe',
  })

  const formatearFechaActual = () => {
    const ahora = new Date()
    const fecha = ahora.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const hora = ahora.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return `${fecha} · ${hora}`
  }

  const enviarSolicitud = () => {
    if (!form.correo.trim() || !form.correo.toLowerCase().endsWith('@utp.edu.pe')) {
      setEsError(true)
      return
    }

    setProcesando(true)

    setTimeout(() => {
      setProcesando(false)

      if (simularError) {
        setEsError(true)
        return
      }

      const numeroAleatorio = Math.floor(100 + Math.random() * 900)
      navigate('/tramites/certificado/enviada', {
        state: {
          codigo: `SOL-2026-0${numeroAleatorio}`,
          fecha: formatearFechaActual(),
          ...form,
        },
      })
    }, 1400)
  }

  return (
    <div className="relative min-h-full bg-[#F8F9FA] px-5 pt-6 pb-24">
      <h1 className="text-2xl font-bold leading-tight text-gray-900">
        {esError ? (
          <>
            Error al enviar
            <br />
            solicitud
          </>
        ) : (
          <>
            Solicitar
            <br />
            Certificado
          </>
        )}
      </h1>

      <button
        type="button"
        onClick={() => navigate('/tramites/certificado')}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        <span>←</span> Certificado de Estudios
      </button>

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        Completa los datos de tu solicitud. Enviaremos el documento a tu correo
        institucional.
      </p>

      {esError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-[#FEF2F2] p-4">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#B9001F] text-[10px] font-bold text-[#B9001F]">
              !
            </span>
            <div>
              <h2 className="text-xs font-bold text-[#B9001F]">
                No se pudo enviar la solicitud
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-700">
                Ocurrió un problema al enviar. Tus datos se conservan; puedes
                reintentar o volver al formulario.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-gray-900">
            Tipo de certificado
          </label>
          <select
            value={form.tipoCertificado}
            onChange={(e) =>
              setForm({ ...form, tipoCertificado: e.target.value })
            }
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 focus:border-gray-900 focus:outline-none"
          >
            <option value="General">General</option>
            <option value="Por ciclos aprobados">Por ciclos aprobados</option>
            <option value="De egresado">De egresado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900">
            Motivo de solicitud
          </label>
          <select
            value={form.motivo}
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-[#B9001F]/60 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 focus:border-[#B9001F] focus:outline-none"
          >
            <option value="Trámites académicos">Trámites académicos</option>
            <option value="Postulación laboral">Postulación laboral</option>
            <option value="Beca o financiamiento">Beca o financiamiento</option>
            <option value="Uso personal">Uso personal</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900">
            Correo institucional
          </label>
          <input
            type="email"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            placeholder="U24313890@utp.edu.pe"
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-gray-900 focus:outline-none"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Recibirás aquí las novedades de tu trámite.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
        <p className="text-xs font-bold text-gray-900">Resumen del servicio</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">S/ 30.00</span>
          <span className="text-[11px] text-gray-400">
            3 a 5 días hábiles · PDF
          </span>
        </div>
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-gray-400">
        <input
          type="checkbox"
          checked={simularError}
          onChange={(e) => setSimularError(e.target.checked)}
          className="rounded border-gray-300"
        />
        Simular error de red al enviar (modo prueba)
      </label>

      {!esError ? (
        <>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
            El cobro del servicio figurará en la sección de pagos. Tendrás 24
            horas para regularizar el pago. De no realizarse, se cancelará.
          </p>

          <button
            type="button"
            onClick={enviarSolicitud}
            disabled={procesando}
            className="mt-4 w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99] disabled:opacity-60"
          >
            Enviar solicitud
          </button>
        </>
      ) : (
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={enviarSolicitud}
            disabled={procesando}
            className="w-full rounded-xl bg-[#B9001F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9E001A] active:scale-[0.99]"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => {
              setSimularError(false)
              setEsError(false)
            }}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Volver al formulario
          </button>
        </div>
      )}

      {procesando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[1px]">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl">
            {/* Círculo rosado suave + bolita/arco rojo girando como en Figma */}
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
              Procesando tu solicitud
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Estamos validando la información.
              <br />
              Espera un momento mientras completamos tu trámite.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}