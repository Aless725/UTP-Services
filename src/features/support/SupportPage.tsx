import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { useAttendance } from '@/features/announcements/announcementsData'
import {
  AssistantError,
  askAssistant,
  assistantErrorText,
  executeProposal,
  type ChatMsg,
  type Proposal,
} from './assistantApi'
import ProposalCard, { type ProposalState } from './ProposalCard'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  text: string
  proposal?: Proposal
  pstate?: ProposalState
  link?: { to: string; label: string }
  /** Mensaje de error del asistente: no se envía como contexto. */
  error?: boolean
}

const STORE = 'utp.asistente'
const SUGGESTIONS = [
  'Quiero reservar una sala para mañana',
  '¿Qué actividades hay esta semana?',
  'Muéstrame mis reservas',
  'Quiero unirme a un grupo de estudio',
]

const uid = () => Math.random().toString(36).slice(2, 10)

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORE)
    // Una acción que quedó "procesando" al recargar vuelve a estar pendiente, para poder reintentarla.
    return raw ? (JSON.parse(raw) as Msg[]).map((m) => (m.pstate === 'running' ? { ...m, pstate: 'pending' as const } : m)) : []
  } catch {
    return []
  }
}

export default function SupportPage() {
  const { session } = useAuth()
  const attend = useAttendance()
  const [msgs, setMsgs] = useState<Msg[]>(load)
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs))
    } catch {
      /* sin almacenamiento */
    }
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [msgs, thinking])

  const patch = useCallback((id: string, p: Partial<Msg>) => setMsgs((all) => all.map((m) => (m.id === id ? { ...m, ...p } : m))), [])

  /** Contexto para el modelo: solo texto de la conversación, sin errores. */
  const context = (all: Msg[]): ChatMsg[] => all.filter((m) => !m.error).map((m) => ({ role: m.role, text: m.text }))

  const send = useCallback(
    async (raw: string, base: Msg[] = msgs) => {
      const content = raw.trim()
      if (!content || thinking) return
      // Las propuestas pendientes quedan reemplazadas por la nueva conversación.
      const prev = base.map((m) => (m.pstate === 'pending' ? { ...m, pstate: 'expired' as const } : m))
      const next: Msg[] = [...prev, { id: uid(), role: 'user', text: content }]
      setMsgs(next)
      setText('')
      setThinking(true)
      try {
        const res = await askAssistant(context(next))
        setMsgs((all) => [
          ...all,
          { id: uid(), role: 'assistant', text: res.reply, proposal: res.proposal ?? undefined, pstate: res.proposal ? 'pending' : undefined },
        ])
      } catch (e) {
        const code = e instanceof AssistantError ? e.code : 'unavailable'
        setMsgs((all) => [...all, { id: uid(), role: 'assistant', text: assistantErrorText(code), error: true }])
      } finally {
        setThinking(false)
      }
    },
    [msgs, thinking],
  )

  const confirm = async (m: Msg) => {
    if (!m.proposal) return
    patch(m.id, { pstate: 'running' })
    try {
      const out = await executeProposal(m.proposal, attend)
      patch(m.id, { pstate: 'done' })
      setMsgs((all) => [...all, { id: uid(), role: 'assistant', text: out.text, link: out.link }])
    } catch (e) {
      patch(m.id, { pstate: 'pending' })
      setMsgs((all) => [
        ...all,
        { id: uid(), role: 'assistant', text: e instanceof Error ? e.message : 'No pude completar la acción.', error: true },
      ])
    }
  }

  const change = (m: Msg) => {
    patch(m.id, { pstate: 'cancelled' })
    setMsgs((all) => [...all, { id: uid(), role: 'assistant', text: 'Claro, ¿qué quieres cambiar?' }])
    input.current?.focus()
  }

  const reset = () => {
    setMsgs([])
    setText('')
  }

  const empty = msgs.length === 0

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="Soporte"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Pregúntale al asistente de UTP+: reserva espacios, únete a grupos o consulta actividades."
        right={
          empty ? undefined : (
            <button
              type="button"
              onClick={reset}
              aria-label="Nueva conversación"
              className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card"
            >
              <Icon name="refresh" size={20} />
            </button>
          )
        }
      />

      <div role="log" aria-live="polite" aria-label="Conversación con el asistente" className="flex-1 px-5 pt-4">
        {empty ? (
          <div className="animate-rise">
            <div className="flex items-center gap-3 rounded-card bg-card p-4 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon name="smart_toy" size={24} filled />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Hola, {session?.nombre}. ¿En qué te ayudo?</p>
                <p className="text-xs text-ink-muted">Escríbeme lo que necesitas, con tus palabras.</p>
              </div>
            </div>
            <p className="mb-2 mt-5 text-xs font-semibold text-ink-muted">Prueba con</p>
            <ul className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="pressable flex min-h-11 w-full items-center justify-between gap-2 rounded-card bg-card px-3.5 py-2 text-left text-sm text-ink shadow-card"
                  >
                    {s}
                    <Icon name="north_east" size={16} className="shrink-0 text-ink-muted" />
                  </button>
                </li>
              ))}
            </ul>

            <p className="mb-2 mt-6 text-xs font-semibold text-ink-muted">O hazlo tú mismo</p>
            <div className="grid grid-cols-3 gap-2">
              <ShortcutLink to="/reservas" icon="location_on" label="Reservar" />
              <ShortcutLink to="/grupos" icon="group" label="Grupos" />
              <ShortcutLink to="/anuncios" icon="campaign" label="Anuncios" />
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {msgs.map((m) => (
              <li key={m.id} className={`flex animate-rise ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] ${m.role === 'user' ? '' : 'w-full'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-ink text-surface'
                        : m.error
                          ? 'rounded-bl-md bg-primary-soft text-ink'
                          : 'rounded-bl-md bg-card text-ink shadow-card'
                    }`}
                  >
                    {m.error && <Icon name="error" size={16} className="mr-1.5 inline-block align-text-bottom text-primary" />}
                    {m.text}
                  </div>
                  {m.proposal && m.pstate && (
                    <ProposalCard proposal={m.proposal} state={m.pstate} onConfirm={() => confirm(m)} onChange={() => change(m)} />
                  )}
                  {m.link && (
                    <Link to={m.link.to} className="pressable mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary">
                      {m.link.label}
                      <Icon name="chevron_right" size={16} />
                    </Link>
                  )}
                  {m.error && m.role === 'assistant' && <Fallbacks />}
                </div>
              </li>
            ))}
            {thinking && (
              <li className="flex justify-start" aria-label="El asistente está pensando">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-card px-4 py-3.5 shadow-card" role="status">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-pulse-soft rounded-full bg-ink-faint"
                      style={{ animationDelay: `${i * 160}ms` }}
                    />
                  ))}
                </div>
              </li>
            )}
          </ul>
        )}
        <div ref={end} />
      </div>

      <StickyCta>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(text)
          }}
          className="flex items-end gap-2"
        >
          <label className="sr-only" htmlFor="asistente-msg">
            Escribe tu mensaje
          </label>
          <textarea
            id="asistente-msg"
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(text)
              }
            }}
            rows={1}
            maxLength={600}
            placeholder="Escribe aquí…"
            className="max-h-28 min-h-11 flex-1 resize-none rounded-[22px] bg-card px-4 py-3 text-sm text-ink shadow-card outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={thinking || !text.trim()}
            className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
          >
            <Icon name="arrow_upward" size={20} />
          </button>
        </form>
      </StickyCta>
    </div>
  )
}

function ShortcutLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link to={to} className="pressable flex min-h-16 flex-col items-center justify-center gap-1 rounded-card bg-card shadow-card">
      <Icon name={icon} size={20} className="text-primary" />
      <span className="text-xs font-semibold text-ink">{label}</span>
    </Link>
  )
}

/** Caminos manuales cuando el asistente no puede ayudar. */
function Fallbacks() {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {[
        ['/reservas', 'Reservar espacio'],
        ['/grupos', 'Grupos'],
        ['/anuncios', 'Anuncios'],
      ].map(([to, label]) => (
        <Link key={to} to={to} className="pressable flex min-h-11 items-center rounded-full bg-card px-3.5 text-xs font-semibold text-primary shadow-card">
          {label}
        </Link>
      ))}
    </div>
  )
}
