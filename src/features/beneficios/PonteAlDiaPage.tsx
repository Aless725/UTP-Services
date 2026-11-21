import { useState } from 'react'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'

interface Nota {
  id: string
  icon: string
  titulo: string
  resumen: string
  detalle: string
}

const NOTAS: Nota[] = [
  {
    id: 'finales',
    icon: 'school',
    titulo: 'Cómo prepararte para los finales',
    resumen: 'Un plan de repaso de 5 días',
    detalle:
      'Empieza por los cursos con menos nota acumulada, repasa en bloques de 45 minutos y reserva una sala de estudio en la biblioteca para trabajar sin distracciones. Duerme bien antes de cada examen.',
  },
  {
    id: 'espacios',
    icon: 'meeting_room',
    titulo: 'Reserva salas y cubículos desde la app',
    resumen: 'Hasta 14 días de anticipación',
    detalle:
      'Desde Más de UTP+ → Espacios eliges sede, fecha y horario. Las salas grupales necesitan mínimo 3 integrantes y duran máximo 2 horas. Recibes un QR para ingresar.',
  },
  {
    id: 'tramites',
    icon: 'description',
    titulo: 'Trámites en línea, sin colas',
    resumen: 'Certificados y constancias desde tu celular',
    detalle:
      'En Trámites encuentras 26 gestiones entre autogestionables y SAE en línea. Cada solicitud tiene un código de seguimiento y puedes cancelarla mientras esté en revisión.',
  },
  {
    id: 'asistente',
    icon: 'auto_awesome',
    titulo: 'Hazlo hablando con el asistente',
    resumen: 'Reserva, consulta tus notas y más',
    detalle:
      'En Soporte puedes escribir o usar el micrófono: «reserva una sala para mañana a las 3». El asistente te propone la acción y solo se ejecuta cuando confirmas.',
  },
]

export default function PonteAlDiaPage() {
  const [abierta, setAbierta] = useState<string | null>(null)

  return (
    <div className="flex flex-1 flex-col pb-6">
      <FlowHeader title="Ponte al día" back="/beneficios" backLabel="Volver a Beneficios+" subtitle="Noticias y consejos para tu ciclo." />
      <section aria-label="Notas" className="mt-4 px-5">
        <ul className="stagger divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {NOTAS.map((n) => {
            const open = abierta === n.id
            return (
              <li key={n.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`nota-${n.id}`}
                  onClick={() => setAbierta(open ? null : n.id)}
                  className="pressable flex min-h-16 w-full items-center gap-3 px-3.5 py-3 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={n.icon} size={20} filled />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-snug text-ink">{n.titulo}</span>
                    <span className="block text-[0.6875rem] text-ink-muted">{n.resumen}</span>
                  </span>
                  <Icon
                    name="expand_more"
                    size={20}
                    className={`shrink-0 text-ink-faint transition-transform duration-200 ease-smooth ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                {open && (
                  <p id={`nota-${n.id}`} className="animate-fade-in px-3.5 pb-4 pl-[4.25rem] text-xs leading-relaxed text-ink-muted">
                    {n.detalle}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
