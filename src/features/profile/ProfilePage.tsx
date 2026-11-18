import { useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DarkHeader from '@/components/layout/DarkHeader'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { useAccessibility } from '@/features/accessibility/AccessibilityContext'
import { useAuth } from '@/features/auth/AuthContext'
import { displayName, emailOf, resizeAvatar, useProfile } from './profileData'

export default function ProfilePage() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()
  const { settings, update } = useAccessibility()
  const codigo = session?.codigo ?? ''
  const { data, avatar, save, setAvatar } = useProfile(codigo)

  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(data.nombreCompleto)
  const [dni, setDni] = useState(data.dni)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const dark = settings.theme === 'oscuro'

  const startEdit = () => {
    setNombre(data.nombreCompleto)
    setDni(data.dni)
    setError(null)
    setEditing(true)
  }

  const saveEdit = async () => {
    if (nombre.trim().split(/\s+/).length < 2) return setError('Ingresa tu nombre completo.')
    if (!/^\d{8}$/.test(dni)) return setError('El DNI debe tener 8 dígitos.')
    try {
      await save({ nombreCompleto: nombre.trim(), dni })
      setEditing(false)
      show('Datos actualizados', 'check_circle')
    } catch {
      setError('No pudimos guardar tus datos. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      show('Código copiado', 'content_copy')
    } catch {
      show('No se pudo copiar', 'error')
    }
  }

  const onPhoto = async (file?: File) => {
    if (!file) return
    try {
      setAvatar(await resizeAvatar(file))
      show('Foto actualizada', 'photo_camera')
    } catch {
      show('No se pudo cargar la imagen', 'error')
    }
  }

  return (
    <div>
      <DarkHeader
        title="Mi Perfil"
        overlap
        right={
          <button
            type="button"
            onClick={() => {
              update({ theme: dark ? 'claro' : 'oscuro' })
              show(dark ? 'Modo claro' : 'Modo oscuro', dark ? 'light_mode' : 'dark_mode')
            }}
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
            aria-pressed={dark}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icon name={dark ? 'light_mode' : 'dark_mode'} size={20} />
          </button>
        }
      />

      <div className="stagger -mt-9 space-y-3 px-5">
        <section className="flex items-center gap-3 rounded-card bg-card p-3 shadow-card">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary-soft">
            {avatar ? (
              <img src={avatar} alt="Tu foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-primary">
                <Icon name="person" size={34} filled />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-ink">{displayName(data.nombreCompleto)}</p>
            <span className="mt-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold text-white">
              {data.carrera}
            </span>
            <p className="mt-1 text-[0.6875rem] text-ink-muted">Estudiante</p>
          </div>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            aria-label="Cambiar foto de perfil"
            className="pressable flex h-9 w-9 items-center justify-center self-start rounded-full bg-primary-soft text-primary"
          >
            <Icon name="photo_camera" size={18} />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
        </section>

        <section aria-labelledby="datos" className="overflow-hidden rounded-card bg-card shadow-card">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <h2 id="datos" className="flex items-center gap-2 text-xs font-bold text-ink">
              <Icon name="person" size={16} className="text-primary" />
              DATOS PERSONALES
            </h2>
            {editing ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="pressable min-h-9 rounded-full px-3 text-[0.6875rem] font-semibold text-ink-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="pressable min-h-9 rounded-full bg-primary px-3.5 text-[0.6875rem] font-semibold text-white"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="pressable min-h-9 rounded-full bg-primary px-3.5 text-[0.6875rem] font-semibold text-white"
              >
                Editar
              </button>
            )}
          </div>

          <dl className="divide-y divide-fill/5 border-t border-fill/5">
            <Field label="Nombre completo" editing={editing} value={data.nombreCompleto} trailing="chevron">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                aria-label="Nombre completo"
                className="w-full rounded-md bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Correo institucional" value={emailOf(codigo)} trailing="chevron" />
            <Field
              label="Código universitario"
              value={codigo}
              trailing={
                <button
                  type="button"
                  onClick={copy}
                  className="pressable min-h-8 rounded-full bg-fill/5 px-2.5 text-[0.625rem] font-semibold text-ink-muted"
                >
                  Copiar
                </button>
              }
            />
            <Field label="DNI" editing={editing} value={data.dni} trailing="chevron">
              <input
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                inputMode="numeric"
                aria-label="DNI"
                className="w-full rounded-md bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Modalidad" value={data.modalidad} />
            <Field label="Campus" value={data.campus} trailing="pin" />
          </dl>
          {error && (
            <p role="alert" className="border-t border-fill/5 px-3.5 py-2 text-xs text-primary">
              {error}
            </p>
          )}
        </section>

        <Link
          to="/perfil/accesibilidad"
          className="pressable flex min-h-14 items-center gap-2 rounded-card bg-card px-3.5 shadow-card"
        >
          <Icon name="accessibility_new" size={18} className="text-primary" />
          <span className="flex-1 text-xs font-bold text-ink">ACCESIBILIDAD</span>
          <Icon name="chevron_right" size={18} className="text-ink-muted" />
        </Link>

        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/login', { replace: true })
          }}
          className="pressable min-h-14 w-full rounded-card bg-card text-xs font-bold text-primary shadow-card"
        >
          CERRAR SESIÓN
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  editing,
  trailing,
  children,
}: {
  label: string
  value: string
  editing?: boolean
  trailing?: 'chevron' | 'pin' | ReactNode
  children?: ReactNode
}) {
  const trail =
    trailing === 'chevron' ? (
      <Icon name="chevron_right" size={18} className="text-ink-faint" />
    ) : trailing === 'pin' ? (
      <Icon name="location_on" size={16} className="text-ink-faint" />
    ) : (
      trailing
    )
  return (
    <div className="flex min-h-12 items-center gap-2 px-3.5 py-2">
      <div className="min-w-0 flex-1">
        <dt className="text-[0.625rem] text-ink-muted">{label}</dt>
        <dd className="text-sm font-medium text-ink">{editing && children ? children : value}</dd>
      </div>
      {!editing && trail}
    </div>
  )
}
