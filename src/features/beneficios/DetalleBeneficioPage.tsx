import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import Presence from '@/components/ui/Presence'
import SegmentedControl from '@/components/ui/SegmentedControl'
import Foto from './Foto'
import { BENEFICIOS, CATEGORIAS, useCupones } from './beneficiosData'

type Tab = 'detalle' | 'usar' | 'locales'

export default function DetalleBeneficioPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { de, generar } = useCupones()
  const [tab, setTab] = useState<Tab>('detalle')
  const [confirmar, setConfirmar] = useState(false)
  const [generando, setGenerando] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])

  const b = BENEFICIOS.find((x) => x.id === id)
  if (!b) return <Navigate to="/beneficios/catalogo" replace />
  const cupon = de(b.id)

  const crear = () => {
    setConfirmar(false)
    setGenerando(true)
    timer.current = setTimeout(() => {
      generar(b)
      navigate(`/beneficios/${b.id}/cupon`, { replace: true })
    }, 900)
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title={b.empresa} back="/beneficios/catalogo" backLabel="Volver al catálogo" subtitle={CATEGORIAS[b.categoria].label} />

      <div className="mt-4 px-5">
        <div className="overflow-hidden rounded-card bg-card shadow-card">
          <Foto src={b.imagen} icon={b.icono} alt={b.empresa} className="h-36 w-full" />
          <div className="px-4 py-3.5">
            <p className="text-base font-bold text-primary">{b.descuento}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{b.descripcion}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
              <Icon name="event" size={14} />
              Vigente hasta el {b.vigencia}
              <span aria-hidden="true">·</span>
              {b.modalidad}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 px-5">
        <SegmentedControl<Tab>
          label="Secciones del beneficio"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'detalle', label: 'Condiciones' },
            { value: 'usar', label: 'Cómo usarlo' },
            { value: 'locales', label: 'Dónde' },
          ]}
        />
      </div>

      <div key={tab} className="animate-fade-in mt-4 px-5 pb-6">
        {tab === 'detalle' && (
          <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {b.terminos.map((t) => (
              <li key={t} className="flex gap-3 px-3.5 py-3">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-xs leading-relaxed text-ink">{t}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === 'usar' && (
          <ol className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {b.pasos.map((p, i) => (
              <li key={p} className="flex gap-3 px-3.5 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.6875rem] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed text-ink">{p}</span>
              </li>
            ))}
          </ol>
        )}
        {tab === 'locales' && (
          <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {b.locales.map((l) => (
              <li key={l.sede} className="flex gap-3 px-3.5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="location_on" size={18} filled />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink">{l.sede}</span>
                  <span className="block text-xs text-ink-muted">{l.lugar}</span>
                  <span className="block text-[0.6875rem] text-ink-faint">{l.direccion}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <StickyCta>
        {cupon ? (
          <button
            type="button"
            onClick={() => navigate(`/beneficios/${b.id}/cupon`)}
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark"
          >
            <Icon name="qr_code_2" size={18} />
            Ver mi cupón
          </button>
        ) : (
          <button
            type="button"
            disabled={generando}
            onClick={() => setConfirmar(true)}
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white active:bg-primary-dark disabled:opacity-60"
          >
            <Icon name="sell" size={18} />
            Generar cupón
          </button>
        )}
      </StickyCta>

      <Presence show={confirmar}>
        <Modal
          icon="sell"
          title="¿Generar tu cupón?"
          description={`Obtendrás un código personal de ${b.empresa}. Solo puedes generar uno por beneficio.`}
          actionLabel="Generar cupón"
          onAction={crear}
          secondaryLabel="Ahora no"
          onSecondary={() => setConfirmar(false)}
        />
      </Presence>
      <Presence show={generando}>
        <Modal icon="progress_activity" spinning title="Generando tu cupón…" />
      </Presence>
    </div>
  )
}
