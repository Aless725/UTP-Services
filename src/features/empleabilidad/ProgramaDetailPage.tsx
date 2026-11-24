import { Link, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import StickyCta from '@/components/layout/StickyCta'
import Icon from '@/components/ui/Icon'
import EmpleabilidadState, { EmpleoQuery, empleoLink } from './components/EmpleabilidadState'
import { useMisPostulaciones, usePrograma } from './empleabilidadData'

export default function ProgramaDetailPage() {
  const { id } = useParams()
  const programa = usePrograma(id)
  const postulaciones = useMisPostulaciones()
  const p = programa.data
  const anterior = postulaciones.data?.find((item) => item.programa_id === id)
  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title={p?.titulo ?? 'Programa de empleabilidad'}
        back="/empleabilidad/programas"
        backLabel="Volver a programas"
      />
      <div className="flex-1 space-y-4 px-5 pb-4 pt-4">
        <EmpleoQuery query={programa}>
          {!p ? (
            <EmpleabilidadState
              icon="school"
              title="Este programa ya no está disponible"
              description="Explora otros programas de empleabilidad. Tus postulaciones registradas siguen disponibles en Mis postulaciones."
              action="Ver programas"
              to="/empleabilidad/programas"
            />
          ) : (
            <>
              <section className="rounded-card bg-card p-4 shadow-card">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={p.icono} size={25} />
                </span>
                <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-wide text-primary">
                  Programa de empleabilidad
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-ink">{p.lema}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.descripcion}</p>
                <dl className="mt-4 flex flex-wrap gap-3 border-t border-fill/5 pt-3 text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <Icon name="school" size={18} />
                    <dt className="sr-only">Dirigido a</dt>
                    <dd>{p.ciclos}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="schedule" size={18} />
                    <dt className="sr-only">Formato</dt>
                    <dd>{p.formato}</dd>
                  </div>
                </dl>
              </section>
              <section aria-labelledby="programa-beneficios">
                <h2 id="programa-beneficios" className="mb-2 text-base font-bold text-ink">
                  ¿Qué te ofrece?
                </h2>
                <ul className="space-y-3 rounded-card bg-card p-4 shadow-card">
                  {p.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                      <Icon name="check_circle" size={20} className="mt-0.5 shrink-0 text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="programa-requisitos">
                <h2 id="programa-requisitos" className="mb-2 text-base font-bold text-ink">
                  Requisitos para participar
                </h2>
                <ul className="list-disc space-y-2 rounded-card bg-card py-4 pl-9 pr-4 text-sm leading-relaxed text-ink-muted shadow-card">
                  {p.requisitos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
              <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-muted">
                <Icon name="schedule" size={18} className="shrink-0" />
                {p.nota}
              </p>
              {p.url_oficial.startsWith('https://') && (
                <a
                  href={p.url_oficial}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary"
                >
                  Consultar información oficial
                  <Icon name="open_in_new" size={17} />
                  <span className="sr-only"> (abre en otra pestaña)</span>
                </a>
              )}
            </>
          )}
        </EmpleoQuery>
      </div>
      {p && (
        <StickyCta>
          <Link
            className={`${empleoLink} w-full`}
            to={anterior ? `/empleabilidad/postulaciones/${anterior.id}` : `/empleabilidad/programas/${p.id}/postular`}
          >
            {anterior ? 'Ver mi postulación' : `Postular a ${p.titulo}`}
            <Icon name={anterior ? 'check_circle' : 'arrow_forward'} size={19} />
          </Link>
        </StickyCta>
      )}
    </div>
  )
}
