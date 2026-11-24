import { useState } from 'react'
import { Link } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import Presence from '@/components/ui/Presence'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { displayName, useProfile } from '@/features/profile/profileData'
import ConexionWebview, { type RedProfesional } from './components/ConexionWebview'

/** Logos oficiales (imágenes en /public/logos); se recorta el margen blanco para que llenen el cuadro. */
function Logo({ src, zoom, size }: { src: string; zoom: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 overflow-hidden bg-white ${size > 30 ? 'rounded-xl' : 'rounded-md'}`}
      style={{ width: size, height: size }}
    >
      <img src={src} alt="" width={size} height={size} className={`h-full w-full object-cover ${zoom}`} />
    </span>
  )
}

const REDES: RedProfesional[] = [
  {
    id: 'linkedin',
    nombre: 'LinkedIn',
    dominio: 'linkedin.com/oauth',
    logo: <Logo src="/logos/linkedin.jpg" zoom="scale-[1.55]" size={48} />,
    permisos: ['Ver tu nombre y tu foto de perfil', 'Ver tu titular y tu experiencia', 'Usar tu perfil para postular más rápido'],
  },
  {
    id: 'bumeran',
    nombre: 'Bumeran',
    dominio: 'bumeran.com.pe/autorizar',
    logo: <Logo src="/logos/bumeran.jpg" zoom="scale-[1.7]" size={48} />,
    permisos: ['Ver tu nombre y tus datos de contacto', 'Ver tu CV y tus postulaciones', 'Usar tu CV para postular más rápido'],
  },
]
const LOGO_BOTON: Record<string, JSX.Element> = {
  linkedin: <Logo src="/logos/linkedin.jpg" zoom="scale-[1.55]" size={24} />,
  bumeran: <Logo src="/logos/bumeran.jpg" zoom="scale-[1.7]" size={24} />,
}
const KEY = 'utp.empleabilidad.conexiones'

function leer(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

const SECCIONES = [
  {
    to: 'ofertas',
    titulo: 'Bolsa de trabajo',
    descripcion: 'Encuentra oportunidades para dar tu siguiente paso.',
    icon: 'work',
  },
  {
    to: 'programas',
    titulo: 'Programas de empleabilidad',
    descripcion: 'Prepárate y fortalece tu perfil profesional.',
    icon: 'school',
  },
]

export default function EmpleabilidadPage() {
  const { show } = useToast()
  const [conectadas, setConectadas] = useState<string[]>(leer)
  // Conexión de demostración: solo se recuerda en este dispositivo, no se envían datos a esas redes.
  const [abierta, setAbierta] = useState<RedProfesional | null>(null)
  const { session } = useAuth()
  const { data: perfil } = useProfile(session?.codigo ?? '')
  const alumno = displayName(perfil.nombreCompleto)
  const alternar = (id: string, nombre: string) => {
    const activa = conectadas.includes(id)
    const next = activa ? conectadas.filter((c) => c !== id) : [...conectadas, id]
    setConectadas(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* sin almacenamiento: queda solo en pantalla */
    }
    show(activa ? `${nombre} desconectado` : `${nombre} conectado`, activa ? 'link_off' : 'check_circle')
  }

  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Empleabilidad"
        back="/inicio"
        backLabel="Volver al inicio"
        subtitle="Tu siguiente oportunidad empieza aquí."
      />
      <div className="stagger space-y-3 px-5 pt-5">
        <section aria-labelledby="conexiones" className="rounded-card bg-card p-4 shadow-card">
          <h2 id="conexiones" className="text-sm font-bold text-ink">
            Conecta tu perfil profesional
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
            Vincula tus cuentas para postular más rápido.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {REDES.map((r) => {
              const activa = conectadas.includes(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => (conectadas.includes(r.id) ? alternar(r.id, r.nombre) : setAbierta(r))}
                  aria-label={activa ? `${r.nombre} conectado. Tocar para desconectar` : `Conectar ${r.nombre}`}
                  className={`pressable flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                    activa ? 'bg-success-soft text-success' : 'bg-surface text-ink'
                  }`}
                >
                  {LOGO_BOTON[r.id]}
                  {r.nombre}
                  {activa && <Icon name="check_circle" size={16} filled />}
                </button>
              )
            })}
          </div>
        </section>
        {SECCIONES.map((s) => (
          <Link
            key={s.to}
            to={`/empleabilidad/${s.to}`}
            className="pressable flex min-h-20 items-center gap-3 rounded-card bg-card p-4 shadow-card"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name={s.icon} size={24} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">{s.titulo}</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{s.descripcion}</span>
            </span>
            <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
          </Link>
        ))}
        <section className="pt-4" aria-labelledby="mis-postulaciones-title">
          <h2 id="mis-postulaciones-title" className="mb-2 px-1 text-base font-bold text-ink">
            Mis postulaciones
          </h2>
          <Link
            to="/empleabilidad/postulaciones"
            className="pressable flex min-h-16 items-center gap-3 rounded-card bg-card p-4 shadow-card"
          >
            <Icon name="assignment_turned_in" size={23} className="text-primary" />
            <span className="flex-1 text-sm font-semibold text-ink">Revisa tus postulaciones</span>
            <Icon name="chevron_right" size={20} className="shrink-0 text-ink-muted" />
          </Link>
        </section>
        <p className="px-1 pt-3 text-xs leading-relaxed text-ink-muted">
          Contenido de demostración. Las ofertas y los programas son ilustrativos; las postulaciones no se envían a
          empresas reales.
        </p>
      </div>
      <Presence show={abierta !== null}>
        {abierta && (
          <ConexionWebview
            red={abierta}
            alumno={alumno}
            onCerrar={() => setAbierta(null)}
            onPermitir={() => {
              alternar(abierta.id, abierta.nombre)
              setAbierta(null)
            }}
          />
        )}
      </Presence>
    </div>
  )
}
