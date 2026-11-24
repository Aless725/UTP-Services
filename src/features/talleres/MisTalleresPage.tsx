import FlowHeader from '@/components/layout/FlowHeader'
import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import InscripcionRow from './components/InscripcionRow'
import TalleresState, { TalleresQuery } from './components/TalleresState'
import { useMisTalleres } from './talleresData'

export default function MisTalleresPage() {
  const mis = useMisTalleres()
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Mis talleres"
        back="/talleres"
        backLabel="Volver a talleres"
        subtitle="Tus inscripciones, horarios y detalles."
      />
      <div className="space-y-3 px-5 pt-4">
        <TalleresQuery query={mis}>
          {mis.data?.length === 0 ? (
            <>
              <TalleresState
                title="Aún no tienes talleres inscritos"
                description="Aquí aparecerán los talleres en los que te inscribas, con sus horarios y detalles. Encuentra uno para empezar."
                icon="event_note"
                action="Explorar talleres"
                to="/talleres"
              />
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="text-sm font-bold text-ink">Un espacio para tus intereses</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Explora talleres culturales y deportivos para complementar tu vida universitaria.
                </p>
              </section>
            </>
          ) : (
            <section aria-label="Tus inscripciones" className="space-y-3">
              <p role="status" className="text-xs text-ink-muted">
                {mis.data?.length ?? 0}{' '}
                {(mis.data?.length ?? 0) === 1 ? 'inscripción registrada' : 'inscripciones registradas'}
              </p>
              {mis.data?.map((i) => (
                <InscripcionRow key={i.id} inscripcion={i} />
              ))}
            </section>
          )}
        </TalleresQuery>
        <Link
          to="/talleres"
          className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-primary"
        >
          <Icon name="search" size={19} />
          Explorar más talleres
        </Link>
      </div>
    </div>
  )
}
