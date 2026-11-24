import { useEffect, useMemo, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Reserva de equipos (Flujo 3) · UTP+ Service                        */
/*  6 pantallas: Equipos disponibles → Detalle → Fecha → Horario →     */
/*  Confirmar → Reserva confirmada                                     */
/*  Archivo autónomo: solo usa React + Tailwind + Material Symbols.    */
/* ------------------------------------------------------------------ */

type Paso = 'lista' | 'detalle' | 'fecha' | 'horario' | 'confirmar' | 'listo'
type Filtro = 'Todas' | 'Laptops' | 'Computadoras'

interface Equipo {
  id: string
  nombre: string
  tipo: 'Laptop' | 'Computadora'
  resumen: string
  disponibilidad: string
  descripcion: string
  ubicacion: string
  procesador: string
  ram: string
  almacenamiento: string
  sistema: string
}

// Datos de ejemplo (demostración). Cámbialos si tu equipo usa otros.
const EQUIPOS: Equipo[] = [
  {
    id: 'dell-5420',
    nombre: 'Laptop Dell Latitude 5420',
    tipo: 'Laptop',
    resumen: 'Lab A301 · Pabellón A · Windows 11',
    disponibilidad: 'Disponible hoy',
    descripcion: 'Equipo portátil para uso académico dentro del campus.',
    ubicacion: 'Pabellón A · Lab A301',
    procesador: 'Intel Core i5',
    ram: '16 GB',
    almacenamiento: '512 GB SSD',
    sistema: 'Windows 11',
  },
  {
    id: 'lenovo-e14',
    nombre: 'Laptop Lenovo ThinkPad E14',
    tipo: 'Laptop',
    resumen: 'Biblioteca · Piso 2 · Windows 11',
    disponibilidad: 'Disponible hoy',
    descripcion: 'Equipo portátil para uso académico dentro del campus.',
    ubicacion: 'Biblioteca · Piso 2',
    procesador: 'Intel Core i5',
    ram: '16 GB',
    almacenamiento: '512 GB SSD',
    sistema: 'Windows 11',
  },
  {
    id: 'hp-elitedesk',
    nombre: 'Computadora HP EliteDesk',
    tipo: 'Computadora',
    resumen: 'Lab B205 · Pabellón B · Windows 11',
    disponibilidad: 'Disponible mañana',
    descripcion: 'Computadora de escritorio para uso académico dentro del campus.',
    ubicacion: 'Pabellón B · Lab B205',
    procesador: 'Intel Core i7',
    ram: '16 GB',
    almacenamiento: '512 GB SSD',
    sistema: 'Windows 11',
  },
]

const HORARIOS = [
  '08:00 – 10:00',
  '10:00 – 12:00',
  '12:00 – 14:00',
  '14:00 – 16:00',
  '16:00 – 18:00',
  '18:00 – 20:00',
]

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIAS_CORTOS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DIAS_RESERVABLES = 30 // se puede reservar hasta 30 días adelante

/* ----------------------------- utilidades --------------------------- */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const mismoDia = (a: Date, b: Date) => a.getTime() === b.getTime()

function fechaLarga(d: Date): string {
  return `${cap(DIAS[d.getDay()])} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

function esReservable(d: Date, hoy: Date): boolean {
  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + DIAS_RESERVABLES)
  const finDeSemana = d.getDay() === 0 || d.getDay() === 6
  return d >= hoy && d <= limite && !finDeSemana
}

// Simula que algunos horarios ya están ocupados (determinista, sin backend).
function horarioOcupado(equipo: Equipo, fecha: Date, indice: number, ahora: Date): boolean {
  const horaInicio = 8 + indice * 2
  if (mismoDia(fecha, inicioDelDia(ahora)) && ahora.getHours() >= horaInicio) return true
  return (fecha.getDate() * 7 + indice * 3 + equipo.id.length) % 5 === 0
}

function generarCodigo(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `EQ-${new Date().getFullYear()}-${n}`
}

/* ------------------------------ piezas UI --------------------------- */

function Icono({ nombre, className = '' }: { nombre: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined select-none leading-none ${className}`}>
      {nombre}
    </span>
  )
}

const FOCO =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b50d30]'

function Encabezado({ titulo }: { titulo: string }) {
  return <h1 className="text-[24px] font-extrabold leading-[normal] text-[#1c1c1e]">{titulo}</h1>
}

function Volver({ destino, onClick }: { destino: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Volver a ${destino}`}
      className={`-my-3 flex min-h-[44px] w-full items-center gap-[6px] text-left ${FOCO}`}
    >
      <Icono nombre="arrow_back" className="text-[16px] text-[#1c1c1e]" />
      <span className="text-[12px] font-medium text-[#5e5e62]">{destino}</span>
    </button>
  )
}

function BotonPrimario({
  etiqueta,
  onClick,
  deshabilitado = false,
}: {
  etiqueta: string
  onClick: () => void
  deshabilitado?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      className={`flex min-h-[48px] w-full items-center justify-center rounded-[14px] p-4 text-[14px] font-bold text-white transition-opacity ${
        deshabilitado ? 'cursor-not-allowed bg-[#b50d30] opacity-40' : 'bg-[#b50d30] active:opacity-90'
      } ${FOCO}`}
    >
      {etiqueta}
    </button>
  )
}

function BotonSecundario({ etiqueta, onClick }: { etiqueta: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[48px] w-full items-center justify-center rounded-[14px] border border-[#b50d30] bg-white p-4 text-[14px] font-bold text-[#b50d30] active:opacity-90 ${FOCO}`}
    >
      {etiqueta}
    </button>
  )
}

function Tarjeta({ children, gap = 'gap-3' }: { children: React.ReactNode; gap?: string }) {
  return <div className={`flex w-full flex-col rounded-[14px] bg-white p-4 ${gap}`}>{children}</div>
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
      <span className="text-[12px] text-[#5e5e62]">{etiqueta}</span>
      <span className="text-[14px] font-semibold text-[#1c1c1e]">{valor}</span>
    </div>
  )
}

function Disponible({ texto }: { texto: string }) {
  return (
    <span className="flex items-center gap-1">
      <Icono nombre="check" className="text-[14px] text-[#14532d]" />
      <span className="text-[12px] font-semibold text-[#14532d]">{texto}</span>
    </span>
  )
}

/* ------------------------------ pantallas --------------------------- */

function PantallaLista({
  onVolver,
  onReservar,
}: {
  onVolver: () => void
  onReservar: (e: Equipo) => void
}) {
  const [filtro, setFiltro] = useState<Filtro>('Todas')
  const [cargando, setCargando] = useState(true)

  // Estado de carga (simulado). Cuando haya backend, reemplaza por la consulta real.
  useEffect(() => {
    const t = setTimeout(() => setCargando(false), 600)
    return () => clearTimeout(t)
  }, [])

  const lista = EQUIPOS.filter(
    (e) =>
      filtro === 'Todas' ||
      (filtro === 'Laptops' && e.tipo === 'Laptop') ||
      (filtro === 'Computadoras' && e.tipo === 'Computadora'),
  )

  return (
    <>
      <Encabezado titulo="Reserva de Equipos" />
      <Volver destino="Servicios UTP" onClick={onVolver} />
      <p className="text-[14px] text-[#5e5e62]">Elige una laptop o computadora para reservar.</p>

      <div className="flex gap-2" role="group" aria-label="Filtrar por tipo de equipo">
        {(['Todas', 'Laptops', 'Computadoras'] as Filtro[]).map((f) => {
          const activo = f === filtro
          return (
            <button
              key={f}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(f)}
              className={`min-h-[44px] rounded-[20px] border px-4 text-[13px] font-semibold ${
                activo
                  ? 'border-[#b50d30] bg-[#b50d30] text-white'
                  : 'border-[#d0d0d0] bg-white text-[#1c1c1e]'
              } ${FOCO}`}
            >
              {f}
            </button>
          )
        })}
      </div>

      {cargando ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
          <span className="flex items-center gap-[6px] text-[12px] text-[#5e5e62]">
            <Icono nombre="schedule" className="text-[16px]" />
            Buscando equipos disponibles…
          </span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex h-[88px] items-center gap-3 rounded-[14px] bg-white p-4">
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-[170px] animate-pulse rounded bg-[#e5e5ea]" />
                <div className="h-3 w-[210px] max-w-full animate-pulse rounded bg-[#e5e5ea]" />
                <div className="h-3 w-[100px] animate-pulse rounded bg-[#e5e5ea]" />
              </div>
              <div className="h-10 w-24 animate-pulse rounded-[14px] bg-[#e5e5ea]" />
            </div>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <Tarjeta>
          <p className="text-[15px] font-bold text-[#1c1c1e]">No hay equipos de este tipo</p>
          <p className="text-[13px] text-[#5e5e62]">Prueba con otro filtro.</p>
        </Tarjeta>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-[14px] bg-white p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[15px] font-bold text-[#1c1c1e]">{e.nombre}</p>
                <p className="text-[12px] text-[#5e5e62]">{e.resumen}</p>
                <Disponible texto={e.disponibilidad} />
              </div>
              <button
                type="button"
                onClick={() => onReservar(e)}
                aria-label={`Reservar ${e.nombre}`}
                className={`min-h-[44px] shrink-0 rounded-[14px] bg-[#b50d30] px-[18px] text-[14px] font-bold text-white active:opacity-90 ${FOCO}`}
              >
                Reservar
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function PantallaDetalle({ equipo, onVolver }: { equipo: Equipo; onVolver: () => void }) {
  return (
    <>
      <Encabezado titulo="Detalle del equipo" />
      <Volver destino="Equipos disponibles" onClick={onVolver} />

      <Tarjeta>
        <span className="flex w-fit items-center gap-1 rounded-[20px] bg-[#e7f4ea] px-[10px] py-1">
          <Icono nombre="check" className="text-[12px] text-[#14532d]" />
          <span className="text-[11px] font-bold text-[#14532d]">Disponible</span>
        </span>
        <p className="text-[18px] font-bold text-[#1c1c1e]">{equipo.nombre}</p>
        <p className="text-[13px] text-[#5e5e62]">{equipo.descripcion}</p>
      </Tarjeta>

      <Tarjeta>
        <div className="flex items-start gap-3">
          <Icono nombre="schedule" className="text-[20px] text-[#1c1c1e]" />
          <div className="flex flex-1 flex-col gap-[2px]">
            <span className="text-[12px] text-[#5e5e62]">Duración máxima</span>
            <span className="text-[14px] font-semibold text-[#1c1c1e]">4 horas por reserva</span>
            <span className="text-[12px] text-[#5e5e62]">Puedes extender si no hay otra reserva.</span>
          </div>
        </div>
        <div className="h-px w-full bg-[#ececea]" />
        <div className="flex items-start gap-3">
          <Icono nombre="location_on" className="text-[20px] text-[#1c1c1e]" />
          <div className="flex flex-1 flex-col gap-[2px]">
            <span className="text-[12px] text-[#5e5e62]">Ubicación</span>
            <span className="text-[14px] font-semibold text-[#1c1c1e]">{equipo.ubicacion}</span>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta>
        <p className="text-[14px] font-bold text-[#1c1c1e]">Especificaciones</p>
        <div className="flex gap-3">
          <Dato etiqueta="Procesador" valor={equipo.procesador} />
          <Dato etiqueta="Memoria RAM" valor={equipo.ram} />
        </div>
        <div className="flex gap-3">
          <Dato etiqueta="Almacenamiento" valor={equipo.almacenamiento} />
          <Dato etiqueta="Sistema" valor={equipo.sistema} />
        </div>
      </Tarjeta>
    </>
  )
}

function PantallaFecha({
  equipo,
  hoy,
  fecha,
  onElegir,
  onVolver,
}: {
  equipo: Equipo
  hoy: Date
  fecha: Date | null
  onElegir: (d: Date) => void
  onVolver: () => void
}) {
  const [mes, setMes] = useState(() => new Date((fecha ?? hoy).getFullYear(), (fecha ?? hoy).getMonth(), 1))

  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1)
    const offset = (primero.getDay() + 6) % 7 // semana empieza en lunes
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
    const arr: (Date | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= total; d++) arr.push(new Date(mes.getFullYear(), mes.getMonth(), d))
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [mes])

  const esMesActual = mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth()
  const cambiarMes = (delta: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))

  return (
    <>
      <Encabezado titulo="Seleccionar fecha" />
      <Volver destino="Detalle del equipo" onClick={onVolver} />

      <Tarjeta gap="gap-[6px]">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-[#1c1c1e]">
            {cap(MESES[mes.getMonth()])} {mes.getFullYear()}
          </p>
          <div className="flex">
            {!esMesActual && (
              <button
                type="button"
                aria-label="Mes anterior"
                onClick={() => cambiarMes(-1)}
                className={`flex h-11 w-11 items-center justify-center ${FOCO}`}
              >
                <Icono nombre="chevron_left" className="text-[20px] text-[#1c1c1e]" />
              </button>
            )}
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => cambiarMes(1)}
              className={`flex h-11 w-11 items-center justify-center ${FOCO}`}
            >
              <Icono nombre="chevron_right" className="text-[20px] text-[#1c1c1e]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7">
          {DIAS_CORTOS.map((d, i) => (
            <span key={i} className="py-1 text-center text-[11px] font-semibold text-[#5e5e62]">
              {d}
            </span>
          ))}
          {celdas.map((d, i) => {
            if (!d) return <span key={i} className="h-10" />
            const ok = esReservable(d, hoy)
            const sel = fecha !== null && mismoDia(d, fecha)
            return (
              <div key={i} className="flex h-10 items-center justify-center">
                <button
                  type="button"
                  disabled={!ok}
                  aria-pressed={sel}
                  aria-label={ok ? fechaLarga(d) : `${fechaLarga(d)}, sin equipos disponibles`}
                  onClick={() => onElegir(d)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] ${
                    sel
                      ? 'bg-[#b50d30] font-bold text-white'
                      : ok
                        ? 'font-semibold text-[#1c1c1e]'
                        : 'cursor-not-allowed font-normal text-[#8e8e93]'
                  } ${FOCO}`}
                >
                  {d.getDate()}
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-[12px] text-[#5e5e62]">Los días en gris no tienen equipos disponibles.</p>
      </Tarjeta>

      {fecha && (
        <Tarjeta>
          <p className="text-[16px] font-bold text-[#1c1c1e]">{fechaLarga(fecha)}</p>
          <p className="text-[12px] text-[#5e5e62]">
            {equipo.nombre} · {equipo.ubicacion.split(' · ')[0]}
          </p>
        </Tarjeta>
      )}
    </>
  )
}

function PantallaHorario({
  equipo,
  fecha,
  horario,
  ahora,
  onElegir,
  onVolver,
}: {
  equipo: Equipo
  fecha: Date
  horario: string | null
  ahora: Date
  onElegir: (h: string) => void
  onVolver: () => void
}) {
  return (
    <>
      <Encabezado titulo="Elegir horario" />
      <Volver destino="Seleccionar fecha" onClick={onVolver} />

      <Tarjeta gap="gap-2">
        <p className="text-[16px] font-bold text-[#1c1c1e]">{fechaLarga(fecha)}</p>
        <p className="text-[12px] text-[#5e5e62]">{equipo.nombre}</p>
      </Tarjeta>

      <Tarjeta>
        <p className="text-[14px] font-bold text-[#1c1c1e]">Horarios disponibles</p>
        <div className="grid grid-cols-2 gap-3">
          {HORARIOS.map((h, i) => {
            const ocupado = horarioOcupado(equipo, fecha, i, ahora)
            const sel = horario === h
            return (
              <button
                key={h}
                type="button"
                disabled={ocupado}
                aria-pressed={sel}
                onClick={() => onElegir(h)}
                className={`flex min-h-[54px] flex-col items-start justify-center gap-[2px] rounded-[12px] border px-3 text-left ${
                  sel
                    ? 'border-[#b50d30] bg-[#fdecef]'
                    : ocupado
                      ? 'cursor-not-allowed border-[#e5e5ea] bg-[#f2f2f7]'
                      : 'border-[#d0d0d0] bg-white'
                } ${FOCO}`}
              >
                <span className={`text-[14px] font-semibold ${ocupado ? 'text-[#8e8e93]' : 'text-[#1c1c1e]'}`}>{h}</span>
                <span
                  className={`text-[11px] font-medium ${
                    ocupado ? 'text-[#8e8e93]' : sel ? 'text-[#b50d30]' : 'text-[#14532d]'
                  }`}
                >
                  {ocupado ? 'Ocupado' : sel ? 'Seleccionado' : 'Disponible'}
                </span>
              </button>
            )
          })}
        </div>
      </Tarjeta>

      <p className="text-[12px] text-[#5e5e62]">
        Cada reserva dura hasta 4 horas. Los horarios ocupados no se pueden elegir.
      </p>
    </>
  )
}

function PantallaConfirmar({
  equipo,
  fecha,
  horario,
  onVolver,
}: {
  equipo: Equipo
  fecha: Date
  horario: string
  onVolver: () => void
}) {
  return (
    <>
      <Encabezado titulo="Confirmar reserva" />
      <Volver destino="Elegir horario" onClick={onVolver} />

      <Tarjeta>
        <p className="text-[14px] font-bold text-[#1c1c1e]">Resumen de la reserva</p>
        <div className="h-px w-full bg-[#ececea]" />
        <Dato etiqueta="Equipo" valor={equipo.nombre} />
        <div className="flex gap-3">
          <Dato etiqueta="Fecha" valor={fechaLarga(fecha)} />
          <Dato etiqueta="Horario" valor={horario} />
        </div>
        <Dato etiqueta="Ubicación" valor={equipo.ubicacion} />
        <Dato etiqueta="Uso" valor="Académico, dentro del campus" />
      </Tarjeta>

      <p className="text-[12px] text-[#5e5e62]">
        Revisa los datos antes de confirmar. Podrás ver tu reserva en Mis reservas.
      </p>
    </>
  )
}

function PantallaListo({
  equipo,
  fecha,
  horario,
  codigo,
  onVolver,
}: {
  equipo: Equipo
  fecha: Date
  horario: string
  codigo: string
  onVolver: () => void
}) {
  return (
    <>
      <Encabezado titulo="Reserva confirmada" />
      <Volver destino="Servicios UTP" onClick={onVolver} />

      <div role="status" className="flex w-full flex-col items-center gap-2 rounded-[14px] bg-white p-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f4ea]">
          <Icono nombre="check" className="text-[30px] text-[#14532d]" />
        </span>
        <p className="text-[18px] font-bold text-[#1c1c1e]">¡Tu reserva está lista!</p>
        <p className="text-[13px] text-[#5e5e62]">Guarda tu código y preséntalo al recoger el equipo.</p>
      </div>

      <Tarjeta>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-[#1c1c1e]">{codigo}</p>
          <span className="flex items-center gap-1 rounded-[20px] bg-[#e7f4ea] px-[10px] py-1">
            <Icono nombre="check" className="text-[12px] text-[#14532d]" />
            <span className="text-[11px] font-bold text-[#14532d]">Confirmada</span>
          </span>
        </div>
        <div className="h-px w-full bg-[#ececea]" />
        <Dato etiqueta="Equipo" valor={equipo.nombre} />
        <div className="flex gap-3">
          <Dato etiqueta="Fecha" valor={fechaLarga(fecha)} />
          <Dato etiqueta="Horario" valor={horario} />
        </div>
        <Dato etiqueta="Ubicación" valor={equipo.ubicacion} />
      </Tarjeta>

      <p className="text-[12px] text-[#5e5e62]">
        Puedes cancelar sin penalidad hasta 1 hora antes del inicio.
      </p>
    </>
  )
}

/* --------------------------- componente raíz ------------------------ */

interface Props {
  /** Se llama al tocar "Servicios UTP" o "Volver a Servicios UTP". */
  onSalir?: () => void
  /** Se llama al tocar "Ver mis reservas". */
  onVerMisReservas?: () => void
}

export default function ReservaEquipos({ onSalir, onVerMisReservas }: Props) {
  const [paso, setPaso] = useState<Paso>('lista')
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [fecha, setFecha] = useState<Date | null>(null)
  const [horario, setHorario] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const ahora = useMemo(() => new Date(), [])
  const hoy = useMemo(() => inicioDelDia(ahora), [ahora])
  const salir = () => onSalir?.()

  const confirmar = () => {
    setConfirmando(true)
    // Simulación del guardado. Aquí iría la llamada real (Supabase) cuando exista el backend.
    setTimeout(() => {
      setCodigo(generarCodigo())
      setConfirmando(false)
      setPaso('listo')
    }, 700)
  }

  const reiniciar = () => {
    setEquipo(null)
    setFecha(null)
    setHorario(null)
    setPaso('lista')
  }

  // Botón principal fijo abajo según el paso (la barra de navegación la pone la app).
  let acciones: React.ReactNode = null
  if (paso === 'detalle') {
    acciones = <BotonPrimario etiqueta="Elegir fecha" onClick={() => setPaso('fecha')} />
  } else if (paso === 'fecha') {
    acciones = (
      <BotonPrimario etiqueta="Elegir horario" deshabilitado={!fecha} onClick={() => setPaso('horario')} />
    )
  } else if (paso === 'horario') {
    acciones = <BotonPrimario etiqueta="Continuar" deshabilitado={!horario} onClick={() => setPaso('confirmar')} />
  } else if (paso === 'confirmar') {
    acciones = (
      <>
        <BotonPrimario
          etiqueta={confirmando ? 'Confirmando…' : 'Confirmar reserva'}
          deshabilitado={confirmando}
          onClick={confirmar}
        />
        <BotonSecundario etiqueta="Cambiar horario" onClick={() => setPaso('horario')} />
      </>
    )
  } else if (paso === 'listo') {
    acciones = (
      <>
        <BotonPrimario etiqueta="Ver mis reservas" onClick={() => onVerMisReservas?.()} />
        <BotonSecundario
          etiqueta="Volver a Servicios UTP"
          onClick={() => {
            reiniciar()
            salir()
          }}
        />
      </>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-[#f2f2f7]">
      <div className="flex flex-1 flex-col gap-4 px-5 py-[10px]">
        {paso === 'lista' && (
          <PantallaLista
            onVolver={salir}
            onReservar={(e) => {
              setEquipo(e)
              setFecha(null)
              setHorario(null)
              setPaso('detalle')
            }}
          />
        )}
        {paso === 'detalle' && equipo && <PantallaDetalle equipo={equipo} onVolver={() => setPaso('lista')} />}
        {paso === 'fecha' && equipo && (
          <PantallaFecha
            equipo={equipo}
            hoy={hoy}
            fecha={fecha}
            onElegir={(d) => {
              setFecha(d)
              setHorario(null)
            }}
            onVolver={() => setPaso('detalle')}
          />
        )}
        {paso === 'horario' && equipo && fecha && (
          <PantallaHorario
            equipo={equipo}
            fecha={fecha}
            horario={horario}
            ahora={ahora}
            onElegir={setHorario}
            onVolver={() => setPaso('fecha')}
          />
        )}
        {paso === 'confirmar' && equipo && fecha && horario && (
          <PantallaConfirmar equipo={equipo} fecha={fecha} horario={horario} onVolver={() => setPaso('horario')} />
        )}
        {paso === 'listo' && equipo && fecha && horario && (
          <PantallaListo equipo={equipo} fecha={fecha} horario={horario} codigo={codigo} onVolver={salir} />
        )}
      </div>

      {acciones && <div className="flex flex-col gap-3 px-5 py-4">{acciones}</div>}
    </div>
  )
}
