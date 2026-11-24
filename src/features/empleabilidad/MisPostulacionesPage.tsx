import FlowHeader from '@/components/layout/FlowHeader'
import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import EmpleabilidadState, { EmpleoQuery } from './components/EmpleabilidadState'
import PostulacionRow from './components/PostulacionRow'
import { useMisPostulaciones } from './empleabilidadData'

export default function MisPostulacionesPage() {
  const postulaciones = useMisPostulaciones()
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Mis postulaciones"
        back="/empleabilidad"
        backLabel="Volver a empleabilidad"
        subtitle="Tu camino profesional: ofertas laborales y programas de empleabilidad."
      />
      <div className="space-y-3 px-5 pt-4">
        <EmpleoQuery query={postulaciones}>
          {postulaciones.data?.length === 0 ? (
            <>
              <EmpleabilidadState
                icon="work"
                title="Tu primera oportunidad te espera"
                description="Aún no has enviado postulaciones. Cuando postules a una oferta o programa, podrás consultar tu actividad aquí."
                action="Explorar ofertas"
                to="/empleabilidad/ofertas"
              />
              <Link
                to="/empleabilidad/programas"
                className="flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
              >
                Explorar programas
              </Link>
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="text-sm font-bold text-ink">Empieza a tu ritmo</h2>
                <ul className="mt-3 space-y-3 text-xs text-ink-muted">
                  {[
                    'Explora ofertas según tus intereses.',
                    'Revisa los requisitos antes de postular.',
                    'Confirma que tu correo de contacto sea correcto.',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Icon name="check_circle" size={17} className="shrink-0 text-primary" />
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className="space-y-3" aria-label="Postulaciones enviadas">
              <p role="status" className="text-xs text-ink-muted">
                {postulaciones.data?.length ?? 0}{' '}
                {(postulaciones.data?.length ?? 0) === 1 ? 'postulación registrada' : 'postulaciones registradas'}
              </p>
              {postulaciones.data?.map((p) => (
                <PostulacionRow key={p.id} postulacion={p} />
              ))}
            </section>
          )}
        </EmpleoQuery>
      </div>
    </div>
  )
}
