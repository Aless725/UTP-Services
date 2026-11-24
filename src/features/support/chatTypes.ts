import type { Proposal } from './assistantApi'
import type { ProposalState } from './ProposalCard'

export interface Msg {
  id: string
  role: 'user' | 'assistant'
  text: string
  proposal?: Proposal
  pstate?: ProposalState
  link?: { to: string; label: string }
  /** Mensaje de error del asistente: no se envía como contexto. */
  error?: boolean
  /** El alumno lo dijo con la voz. */
  voice?: boolean
}

export interface Conversation {
  id: string
  title: string
  updatedAt: number
  msgs: Msg[]
}
