import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { DockContext } from '@/components/layout/DockContext'
import BackButton from '@/components/ui/BackButton'
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
  'Reservar una sala para mañana',
  'Actividades de esta semana',
  'Mis reservas',
  'Unirme a un grupo de estudio',
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

/**
 * Asistente de Soporte: pantalla minimalista. Arriba, el botón de regreso de siempre; abajo,
 * la barra de navegación se transforma en el cuadro de mensaje (se dibuja en el "dock" del layout).
 */
export default function SupportPage() {
  const { session } = useAuth()
  const attend = useAttendance()
  const dock = useContext(DockContext)
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

  // El cuadro crece con lo escrito (hasta 4 líneas).
  useEffect(() => {
    const el = input.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`
  }, [text, dock])

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
    <div className="flex flex-1 flex-col px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <h1 className="sr-only">Soporte: asistente de UTP+</h1>

      <header className="flex items-center justify-between">
        <BackButton to="/inicio" label="Volver al inicio" />
        {!empty && (
          <button
            type="button"
            onClick={reset}
            aria-label="Nueva conversación"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card"
          >
            <Icon name="edit_square" size={20} />
          </button>
        )}
      </header>

      {empty ? (
        <div className="stagger flex flex-1 flex-col items-center justify-center pb-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon name="auto_awesome" size={28} filled />
          </span>
          <p className="mt-5 text-title text-ink">Hola, {session?.nombre}</p>
          <p className="mt-1 text-sm text-ink-muted">¿En qué te ayudo hoy?</p>

          <ul className="mt-7 flex max-w-[22rem] flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => send(s)}
                  className="pressable min-h-11 rounded-full bg-card px-4 text-xs font-medium text-ink shadow-card"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs text-ink-muted">
            ¿Prefieres hacerlo tú?{' '}
            <Link to="/reservas" className="font-semibold text-primary">Reservas</Link>
            {' · '}
            <Link to="/grupos" className="font-semibold text-primary">Grupos</Link>
            {' · '}
            <Link to="/anuncios" className="font-semibold text-primary">Anuncios</Link>
          </p>
        </div>
      ) : (
        <div role="log" aria-live="polite" aria-label="Conversación con el asistente" className="flex-1 pt-6">
          <ul className="space-y-5">
            {msgs.map((m) => (
              <li key={m.id} className={`animate-rise ${m.role === 'user' ? 'flex justify-end' : ''}`}>
                {m.role === 'user' ? (
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-fill/5 px-4 py-2.5 text-sm leading-relaxed text-ink">
                    {m.text}
                  </p>
                ) : (
                  <div className="max-w-[94%]">
                    <p
                      className={`whitespace-pre-wrap text-sm leading-relaxed text-ink ${m.error ? 'flex items-start gap-2' : ''}`}
                    >
                      {m.error && <Icon name="error" size={18} className="mt-0.5 shrink-0 text-primary" />}
                      <span>{m.text}</span>
                    </p>
                    {m.proposal && m.pstate && (
                      <ProposalCard proposal={m.proposal} state={m.pstate} onConfirm={() => confirm(m)} onChange={() => change(m)} />
                    )}
                    {m.link && (
                      <Link to={m.link.to} className="pressable mt-1 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary">
                        {m.link.label}
                        <Icon name="chevron_right" size={16} />
                      </Link>
                    )}
                    {m.error && <Fallbacks />}
                  </div>
                )}
              </li>
            ))}
            {thinking && (
              <li aria-label="El asistente está pensando" role="status" className="flex gap-1.5 px-1 py-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-pulse-soft rounded-full bg-ink-faint" style={{ animationDelay: `${i * 160}ms` }} />
                ))}
              </li>
            )}
          </ul>
        </div>
      )}
      {/* Al desplazarse al final se deja el espacio de la barra inferior. */}
      <div ref={end} aria-hidden="true" className="h-px scroll-mb-[calc(env(safe-area-inset-bottom)+150px)]" />

      {dock &&
        createPortal(
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(text)
            }}
            className="flex min-h-[68px] items-center gap-2 rounded-[26px] glass py-2 pl-5 pr-2 shadow-float"
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
              placeholder="Escribe tu mensaje…"
              className="max-h-28 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={thinking || !text.trim()}
              className="pressable flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-35"
            >
              <Icon name="arrow_upward" size={22} />
            </button>
          </form>,
          dock,
        )}
    </div>
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
