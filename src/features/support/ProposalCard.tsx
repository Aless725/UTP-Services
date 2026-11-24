import Icon from '@/components/ui/Icon'
import type { Proposal } from './assistantApi'

export type ProposalState = 'pending' | 'running' | 'done' | 'cancelled' | 'expired'

const META: Record<Proposal['kind'], { icon: string; title: string; action: string }> = {
  reserva: { icon: 'event_available', title: 'Confirma tu reserva', action: 'Confirmar reserva' },
  cancelar: { icon: 'event_busy', title: 'Confirma la cancelación', action: 'Cancelar reserva' },
  asistencia: { icon: 'how_to_reg', title: 'Confirma tu asistencia', action: 'Confirmar asistencia' },
  unirse_grupo: { icon: 'group_add', title: 'Confirma tu ingreso al grupo', action: 'Unirme al grupo' },
  cupon: { icon: 'sell', title: 'Confirma tu cupón', action: 'Generar cupón' },
  cancelar_tramite: { icon: 'cancel', title: 'Confirma la cancelación', action: 'Cancelar solicitud' },
  reserva_equipo: { icon: 'devices', title: 'Confirma tu reserva de equipo', action: 'Confirmar reserva' },
  cancelar_equipo: { icon: 'event_busy', title: 'Confirma la cancelación', action: 'Cancelar reserva' },
  inscripcion_taller: { icon: 'sports_handball', title: 'Confirma tu inscripción', action: 'Inscribirme' },
  postulacion: { icon: 'work', title: 'Confirma tu postulación', action: 'Postular' },
  solicitud_tramite: { icon: 'description', title: 'Confirma tu solicitud', action: 'Enviar solicitud' },
}

interface ProposalCardProps {
  proposal: Proposal
  state: ProposalState
  onConfirm: () => void
  onChange: () => void
}

/** Tarjeta con la acción propuesta por el asistente: nada se ejecuta hasta que el alumno confirma. */
export default function ProposalCard({ proposal, state, onConfirm, onChange }: ProposalCardProps) {
  const m = META[proposal.kind]
  const active = state === 'pending' || state === 'running'
  return (
    <section
      aria-label={m.title}
      className={`mt-2 rounded-card border border-fill/5 bg-card p-3.5 shadow-card ${active ? '' : 'opacity-70'}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon name={m.icon} size={18} filled />
        </span>
        <h3 className="text-sm font-bold text-ink">{m.title}</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink">{proposal.resumen}</p>

      {active ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={state === 'running'}
            className="pressable min-h-11 rounded-full bg-primary text-xs font-semibold text-white disabled:opacity-60"
          >
            {state === 'running' ? 'Procesando…' : m.action}
          </button>
          <button
            type="button"
            onClick={onChange}
            disabled={state === 'running'}
            className="pressable min-h-11 rounded-full bg-surface text-xs font-semibold text-ink disabled:opacity-60"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
          <Icon name={state === 'done' ? 'check_circle' : 'do_not_disturb_on'} size={16} />
          {state === 'done' ? 'Confirmada' : state === 'cancelled' ? 'Descartada' : 'Reemplazada por otra propuesta'}
        </p>
      )}
    </section>
  )
}
