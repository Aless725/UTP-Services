import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import Presence, { useLeaving } from '@/components/ui/Presence'
import Switch from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { displayName, emailOf, useProfile } from '@/features/profile/profileData'
import type { Conversation } from './chatTypes'
import { whenLabel } from './history'
import { VOCES_MODELO, previewVoz, readVozModelo, saveVozModelo, speechSupported, stopSpeaking } from './voice/speech'

/** Panel a pantalla completa (dentro del marco móvil), como el de cuenta de Gemini. Úsalo dentro de <Presence>. */
function Panel({
  title,
  onClose,
  onBack,
  children,
}: {
  title?: string
  onClose: () => void
  onBack?: () => void
  children: ReactNode
}) {
  const leaving = useLeaving()
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Mi cuenta'}
      className={`absolute inset-0 z-50 flex flex-col bg-surface ${leaving ? 'pointer-events-none animate-sheet-down' : 'animate-sheet-up'}`}
    >
      <header className="flex min-h-14 items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),8px)]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          >
            <Icon name="chevron_left" size={24} />
          </button>
        ) : (
          <span className="w-2" aria-hidden="true" />
        )}
        <h2 className="min-w-0 flex-1 truncate text-base font-bold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <Icon name="close" size={24} />
        </button>
      </header>
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-2">{children}</div>
    </div>
  )
}

function Fila({
  icon,
  titulo,
  texto,
  derecha,
  onClick,
}: {
  icon: string
  titulo: string
  texto?: string
  derecha?: ReactNode
  onClick?: () => void
}) {
  const contenido = (
    <>
      <Icon name={icon} size={22} className="shrink-0 text-ink" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-medium text-ink">{titulo}</span>
        {texto && <span className="block text-[0.6875rem] leading-snug text-ink-muted">{texto}</span>}
      </span>
      {derecha}
      {onClick && <Icon name="chevron_right" size={20} className="shrink-0 text-ink-faint" />}
    </>
  )
  const clases = 'flex min-h-14 w-full items-center gap-3.5 px-4 py-2.5'
  return onClick ? (
    <button type="button" onClick={onClick} className={`pressable ${clases}`}>
      {contenido}
    </button>
  ) : (
    <div className={clases}>{contenido}</div>
  )
}

const Grupo = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card [&>li]:list-none">
    {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}
  </ul>
)

/* ───────────────────────── Chats anteriores ───────────────────────── */

export function PanelHistorial({
  chats,
  actualId,
  onAbrir,
  onBorrar,
  onNuevo,
  onClose,
}: {
  chats: Conversation[]
  actualId: string
  onAbrir: (c: Conversation) => void
  onBorrar: (c: Conversation) => void
  onNuevo: () => void
  onClose: () => void
}) {
  return (
    <Panel title="Chats anteriores" onClose={onClose}>
      <button
        type="button"
        onClick={onNuevo}
        className="pressable mb-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-soft text-sm font-semibold text-primary"
      >
        <Icon name="edit_square" size={18} />
        Nuevo chat
      </button>

      {chats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <Icon name="forum" size={34} className="text-ink-faint" />
          <p className="mt-2 text-sm font-medium text-ink">Aún no tienes chats guardados</p>
          <p className="mt-0.5 max-w-[16rem] text-xs leading-relaxed text-ink-muted">
            Tus conversaciones con el asistente aparecerán aquí para retomarlas cuando quieras.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
          {chats.map((c) => (
            <li key={c.id} className="flex items-center">
              <button
                type="button"
                onClick={() => onAbrir(c)}
                aria-current={c.id === actualId ? 'true' : undefined}
                className={`pressable flex min-h-[4rem] min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left ${c.id === actualId ? 'bg-primary-soft' : ''}`}
              >
                <Icon name="chat_bubble" size={20} className="shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">{c.title}</span>
                  <span className="block text-[0.6875rem] text-ink-muted">
                    {whenLabel(c.updatedAt)} · {c.msgs.filter((m) => m.role === 'user').length}{' '}
                    {c.msgs.filter((m) => m.role === 'user').length === 1 ? 'mensaje' : 'mensajes'}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onBorrar(c)}
                aria-label={`Borrar el chat: ${c.title}`}
                className="pressable flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint"
              >
                <Icon name="delete" size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* ───────────────────────── Mi cuenta ───────────────────────── */

type Vista = 'inicio' | 'voz' | 'prefs' | 'comentarios' | 'ayuda'
const TITULOS: Record<Vista, string | undefined> = {
  inicio: undefined,
  voz: 'Voz del modelo',
  prefs: 'Preferencias del asistente',
  comentarios: 'Comentarios',
  ayuda: 'Ayuda',
}

const EJEMPLOS = [
  'Reservar una sala para mañana',
  '¿Qué tareas tengo pendientes?',
  '¿Cómo van mis notas?',
  'Buscar un libro de interacción humano-computador',
  'Reservar una laptop para el jueves',
  '¿Qué talleres deportivos hay?',
]

export function PanelCuenta({
  hablar,
  onHablar,
  guardar,
  onGuardar,
  onBorrarTodo,
  onElegir,
  onClose,
}: {
  hablar: boolean
  onHablar: (v: boolean) => void
  guardar: boolean
  onGuardar: (v: boolean) => void
  onBorrarTodo: () => void
  onElegir: (texto: string) => void
  onClose: () => void
}) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()
  const codigo = session?.codigo ?? ''
  const { data, avatar } = useProfile(codigo)
  const [vista, setVista] = useState<Vista>('inicio')
  const [voz, setVoz] = useState(readVozModelo)
  const [sonando, setSonando] = useState<string | null>(null)
  const [borrar, setBorrar] = useState(false)
  const [tipo, setTipo] = useState('Sugerencia')
  const [comentario, setComentario] = useState('')
  const vozActual = VOCES_MODELO.find((v) => v.id === voz) ?? VOCES_MODELO[0]

  const cerrar = () => {
    stopSpeaking()
    onClose()
  }

  return (
    <Panel title={TITULOS[vista]} onClose={cerrar} onBack={vista === 'inicio' ? undefined : () => setVista('inicio')}>
      {vista === 'inicio' && (
        <div className="stagger space-y-3">
          <section className="flex items-center gap-4 rounded-card bg-card p-4 shadow-card">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <Icon name="person" size={34} filled />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-ink">{displayName(data.nombreCompleto)}</p>
              <p className="truncate text-xs text-ink-muted">{emailOf(codigo)}</p>
              <span className="mt-1.5 inline-block rounded-full bg-primary px-2.5 py-0.5 text-[0.625rem] font-semibold text-white">
                {data.carrera}
              </span>
            </div>
          </section>

          <Grupo>
            <Fila
              icon="school"
              titulo="Administrar tu perfil UTP"
              onClick={() => {
                cerrar()
                navigate('/perfil')
              }}
            />
          </Grupo>

          <Grupo>
            <Fila
              icon="workspace_premium"
              titulo="Servicio de la institución"
              texto="Asistente incluido por la UTP para sus alumnos."
              derecha={<span className="shrink-0 text-xs font-semibold text-ink-muted">UTP</span>}
            />
            <Fila
              icon="record_voice_over"
              titulo="Seleccionar voz del modelo"
              derecha={<span className="shrink-0 text-xs text-ink-muted">{vozActual.nombre}</span>}
              onClick={() => setVista('voz')}
            />
          </Grupo>

          <Grupo>
            <Fila icon="tune" titulo="Preferencias del asistente" onClick={() => setVista('prefs')} />
            <Fila icon="feedback" titulo="Comentarios" onClick={() => setVista('comentarios')} />
            <Fila icon="help" titulo="Ayuda" onClick={() => setVista('ayuda')} />
          </Grupo>

          <p className="px-2 pt-4 text-center text-[0.6875rem] leading-relaxed text-ink-faint">
            Tus conversaciones se guardan solo en este dispositivo. El asistente te pide confirmación antes de reservar o inscribirte.
          </p>
        </div>
      )}

      {vista === 'voz' && (
        <div className="space-y-3">
          <p className="px-1 text-xs leading-relaxed text-ink-muted">
            Elige cómo suena el asistente al leer sus respuestas. Es una función de demostración: cambia el tono y la velocidad de la voz del dispositivo.
          </p>
          <ul role="radiogroup" aria-label="Voz del modelo" className="divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
            {VOCES_MODELO.map((v) => (
              <li key={v.id} className="flex items-center">
                <button
                  type="button"
                  role="radio"
                  aria-checked={voz === v.id}
                  onClick={() => {
                    setVoz(v.id)
                    saveVozModelo(v.id)
                    show(`Voz: ${v.nombre}`, 'record_voice_over')
                  }}
                  className="pressable flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${voz === v.id ? 'bg-primary text-white' : 'bg-fill/10'}`}
                  >
                    {voz === v.id && <Icon name="check" size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{v.nombre}</span>
                    <span className="block text-[0.6875rem] text-ink-muted">{v.descripcion}</span>
                  </span>
                </button>
                {speechSupported() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (sonando === v.id) {
                        stopSpeaking()
                        setSonando(null)
                      } else {
                        setSonando(v.id)
                        previewVoz(v, () => setSonando(null))
                      }
                    }}
                    aria-label={sonando === v.id ? `Detener la muestra de ${v.nombre}` : `Escuchar la voz de ${v.nombre}`}
                    className="pressable flex h-11 w-11 shrink-0 items-center justify-center text-primary"
                  >
                    <Icon name={sonando === v.id ? 'stop_circle' : 'play_circle'} size={26} filled />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {vista === 'prefs' && (
        <div className="space-y-3">
          <Grupo>
            {speechSupported() ? (
              <Fila
                icon="volume_up"
                titulo="Respuestas en voz alta"
                texto="El asistente lee sus respuestas."
                derecha={<Switch checked={hablar} onChange={onHablar} label="Respuestas en voz alta" />}
              />
            ) : (
              <Fila icon="volume_off" titulo="Respuestas en voz alta" texto="Tu navegador no lo permite." />
            )}
            <Fila
              icon="history"
              titulo="Guardar historial de chats"
              texto="Podrás retomar tus conversaciones."
              derecha={<Switch checked={guardar} onChange={onGuardar} label="Guardar historial de chats" />}
            />
          </Grupo>
          <button
            type="button"
            onClick={() => setBorrar(true)}
            className="pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold text-primary shadow-card"
          >
            <Icon name="delete" size={18} />
            Borrar historial de chats
          </button>
        </div>
      )}

      {vista === 'comentarios' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!comentario.trim()) return
            show('Gracias por tus comentarios', 'favorite')
            cerrar()
          }}
        >
          <p className="px-1 text-xs leading-relaxed text-ink-muted">Cuéntanos qué te gustó o qué podemos mejorar del asistente.</p>
          <div role="radiogroup" aria-label="Tipo de comentario" className="flex flex-wrap gap-2">
            {['Sugerencia', 'Problema', 'Me gustó'].map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tipo === t}
                onClick={() => setTipo(t)}
                className={`pressable min-h-11 rounded-full px-4 text-xs font-medium ${tipo === t ? 'bg-ink text-surface' : 'bg-card text-ink-muted shadow-card'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="sr-only">Tu comentario</span>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder="Escribe aquí tu comentario…"
              className="w-full resize-none rounded-card bg-card p-3.5 text-sm text-ink shadow-card outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-primary"
            />
          </label>
          <p className="px-1 text-[0.6875rem] text-ink-faint">Función de demostración: el comentario no se envía a ningún servidor.</p>
          <button
            type="submit"
            disabled={!comentario.trim()}
            className="pressable min-h-12 w-full rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
          >
            Enviar comentario
          </button>
        </form>
      )}

      {vista === 'ayuda' && (
        <div className="space-y-4">
          <section>
            <h3 className="px-1 text-sm font-bold text-ink">Qué puedes pedirme</h3>
            <p className="mt-0.5 px-1 text-xs text-ink-muted">Toca un ejemplo para probarlo.</p>
            <ul className="mt-2 divide-y divide-fill/5 overflow-hidden rounded-card bg-card shadow-card">
              {EJEMPLOS.map((e) => (
                <li key={e}>
                  <button
                    type="button"
                    onClick={() => {
                      cerrar()
                      onElegir(e)
                    }}
                    className="pressable flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm text-ink"
                  >
                    <Icon name="north_east" size={18} className="shrink-0 text-primary" />
                    {e}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-card bg-card p-4 shadow-card">
            <h3 className="text-sm font-bold text-ink">Consejos</h3>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-ink-muted">
              <li>Toca el micrófono para hablar en vez de escribir.</li>
              <li>Antes de reservar o inscribirte, el asistente te muestra una tarjeta para confirmar o cambiar.</li>
              <li>Si no puede ayudarte, usa los accesos directos de Reservas, Grupos y Anuncios.</li>
            </ul>
          </section>
        </div>
      )}

      <Presence show={borrar}>
        <Modal
          icon="delete"
          title="¿Borrar todo el historial?"
          description="Se eliminarán tus chats guardados en este dispositivo. Esta acción no se puede deshacer."
          actionLabel="Sí, borrar"
          onAction={() => {
            onBorrarTodo()
            setBorrar(false)
            show('Historial borrado', 'delete')
          }}
          secondaryLabel="Cancelar"
          onSecondary={() => setBorrar(false)}
        />
      </Presence>
    </Panel>
  )
}
