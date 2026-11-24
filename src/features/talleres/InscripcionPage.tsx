import { Link, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import HorarioTaller from './components/HorarioTaller'
import { EstadoInscripcion } from './components/InscripcionRow'
import TalleresState, { TalleresQuery, tallerLink } from './components/TalleresState'
import { CATEGORIAS_TALLER, fechaTaller, useInscripcion } from './talleresData'

export default function InscripcionPage() {
  const { id } = useParams()
  const query = useInscripcion(id)
  const i = query.data
  const s = i?.snapshot
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title={i?.estado === 'inscrita' ? 'Inscripción completada' : 'Mi inscripción'}
        back="/talleres/mis"
        backLabel="Volver a mis talleres"
      />
      <div className="space-y-3 px-5 pt-4">
        <TalleresQuery query={query}>
          {!i || !s ? (
            <TalleresState
              title="No encontramos esta inscripción"
              description="Comprueba el enlace o consulta las inscripciones de tu cuenta."
              icon="search_off"
              action="Ver mis talleres"
              to="/talleres/mis"
            />
          ) : (
            <>
              {i.estado === 'inscrita' && (
                <section role="status" className="rounded-card bg-card p-4 shadow-card">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success">
                    <Icon name="check_circle" size={22} />
                  </span>
                  <h2 className="mt-3 text-sm font-bold text-ink">Tu inscripción quedó registrada</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Tu vacante en {s.titulo} está confirmada. Los horarios y próximos pasos están disponibles aquí y en
                    Mis talleres.
                  </p>
                </section>
              )}
              <section aria-label="Datos de tu inscripción" className="rounded-card bg-card p-4 shadow-card">
                <p className="text-xs font-semibold text-primary">{CATEGORIAS_TALLER[s.categoria].label}</p>
                <h2 className="mb-3 mt-1 text-sm font-bold text-ink">{s.titulo}</h2>
                <EstadoInscripcion estado={i.estado} />
                <dl className="mt-4 space-y-3 border-t border-fill/5 pt-3">
                  {[
                    ['Código de inscripción', i.codigo],
                    ['Período', s.periodo],
                    ['Docente', s.docente],
                    ['Modalidad', s.modalidad === 'virtual' ? 'Virtual' : 'Presencial'],
                    ['Lugar', `${s.sede} · ${s.lugar}`],
                    ['Inicio del taller', fechaTaller(s.inicio)],
                    ['Fin del taller', fechaTaller(s.fin)],
                    ['Fecha de inscripción', fechaTaller(i.created_at)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-ink-muted">{label}</dt>
                      <dd className="mt-0.5 break-words text-sm font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="mb-3 text-sm font-bold text-ink">Tus horarios</h2>
                <HorarioTaller horarios={s.horarios} />
              </section>
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="text-sm font-bold text-ink">Términos aceptados</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{s.terminos}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.declaracion}</p>
                <p className="mt-3 text-xs text-ink-muted">
                  Versión {i.version_terminos} · Aceptación registrada el {fechaTaller(i.created_at)}.
                </p>
              </section>
              <p className="px-1 text-xs leading-relaxed text-ink-muted">
                Las novedades de tu inscripción aparecerán en las notificaciones de la aplicación. Si tienes consultas
                sobre horarios o una baja administrativa, contacta a soporte.
              </p>
              <Link to="/talleres/mis" className={`${tallerLink} w-full`}>
                Ver mis talleres
              </Link>
              <Link
                to={`/talleres/${CATEGORIAS_TALLER[s.categoria].ruta}`}
                className="flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
              >
                Explorar más talleres
              </Link>
            </>
          )}
        </TalleresQuery>
      </div>
    </div>
  )
}
