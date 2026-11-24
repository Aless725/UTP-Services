import { Link, useLocation, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import { useNow } from '@/hooks/useNow'
import { useOnline } from '@/lib/online'
import EmpleabilidadState, { EmpleoQuery, empleoLink } from './components/EmpleabilidadState'
import { fechaEmpleo, ofertaVigente, TIPOS_OFERTA, useMisPostulaciones, useOferta } from './empleabilidadData'

export default function OfertaDetailPage() {
  const { id } = useParams()
  const { search } = useLocation()
  const oferta = useOferta(id)
  const postulaciones = useMisPostulaciones()
  const now = useNow()
  const online = useOnline()
  const o = oferta.data
  const postulacion = postulaciones.data?.find((p) => p.oferta_id === id)
  const disponible = !!o && ofertaVigente(o, now)
  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader title="Bolsa de trabajo" back={`/empleabilidad/ofertas${search}`} backLabel="Volver a ofertas" />
      <div className="stagger flex-1 space-y-3 px-5 pb-4 pt-4">
        <EmpleoQuery query={oferta}>
          {!o || !disponible ? (
            <EmpleabilidadState
              icon="event_busy"
              title="Esta oferta ya no está disponible"
              description="La convocatoria puede haber cerrado. Tus postulaciones anteriores siguen disponibles en Mis postulaciones."
              action="Explorar otras ofertas"
              to={`/empleabilidad/ofertas${search}`}
              secondary={
                <Link
                  to="/empleabilidad/postulaciones"
                  className="mt-2 flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
                >
                  Ver mis postulaciones
                </Link>
              }
            />
          ) : (
            <>
              <section className="rounded-card bg-card p-4 shadow-card" aria-label="Información de la oferta">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-ink">{o.empresa}</h2>
                  <Badge tone="neutral">{TIPOS_OFERTA[o.tipo]}</Badge>
                </div>
                <p className="mt-1 text-base font-bold text-ink">{o.puesto}</p>
                <dl className="mt-3 divide-y divide-fill/5">
                  {[
                    ['location_on', 'Lugar', o.ubicacion],
                    ['calendar_today', 'Publicado', fechaEmpleo(o.publicado_en)],
                    ['school', 'Nivel académico', o.nivel_academico],
                    ['work', 'Área', o.area],
                    ['menu_book', 'Carreras', o.carreras.length ? o.carreras.join(', ') : 'Cualquier carrera'],
                    ...(o.cierra_en ? [['event_busy', 'Cierre de convocatoria', fechaEmpleo(o.cierra_en)]] : []),
                  ].map(([icon, label, value]) => (
                    <div key={label} className="flex items-start gap-3 py-3">
                      <Icon name={icon} size={19} className="mt-0.5 shrink-0 text-ink-muted" />
                      <div className="min-w-0">
                        <dt className="text-xs text-ink-muted">{label}</dt>
                        <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {o.experiencia && <p className="mt-2 text-xs font-semibold text-primary">{o.experiencia}</p>}
              </section>
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="text-base font-bold text-ink">Descripción del puesto</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{o.descripcion}</p>
              </section>
              {[
                { title: 'Funciones', items: o.funciones },
                { title: 'Requisitos', items: o.requisitos },
                { title: 'Beneficios', items: o.beneficios },
              ].map(({ title, items }) => (
                <section key={title} className="rounded-card bg-card p-4 shadow-card">
                  <h2 className="text-base font-bold text-ink">{title}</h2>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </EmpleoQuery>
      </div>
      {disponible && (
        <StickyCta>
          {postulacion ? (
            <Link className={`${empleoLink} w-full`} to={`/empleabilidad/postulaciones/${postulacion.id}`}>
              <Icon name="check_circle" size={19} />
              Ver mi postulación
            </Link>
          ) : (
            <Link className={`${empleoLink} w-full`} to={`/empleabilidad/ofertas/${id}/postular${search}`}>
              Inscribirme
            </Link>
          )}
          {!online && (
            <p className="mt-2 text-center text-xs text-ink-muted">
              Puedes revisar el formulario; el envío requiere conexión.
            </p>
          )}
        </StickyCta>
      )}
    </div>
  )
}
