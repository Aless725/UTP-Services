import { Link, useParams } from 'react-router-dom'
import FlowHeader from '@/components/layout/FlowHeader'
import Icon from '@/components/ui/Icon'
import EmpleabilidadState, { EmpleoQuery, empleoLink } from './components/EmpleabilidadState'
import { EstadoPostulacion } from './components/PostulacionRow'
import { ESTADOS_POSTULACION, fechaEmpleo, usePostulacion } from './empleabilidadData'

export function PostulacionView({ confirmacion = false }: { confirmacion?: boolean }) {
  const { id } = useParams()
  const postulacion = usePostulacion(id)
  const p = postulacion.data
  const programa = !!p?.programa_id
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title={confirmacion && p ? '¡Postulación enviada!' : 'Mi postulación'}
        back="/empleabilidad/postulaciones"
        backLabel="Volver a mis postulaciones"
      />
      <div className="space-y-3 px-5 pt-4">
        <EmpleoQuery query={postulacion}>
          {!p ? (
            <EmpleabilidadState
              icon="search_off"
              title="No encontramos esta postulación"
              description="Comprueba el enlace o consulta las postulaciones de tu cuenta."
              action="Ver mis postulaciones"
              to="/empleabilidad/postulaciones"
            />
          ) : (
            <>
              {confirmacion && (
                <section role="status" className="rounded-card bg-card p-5 shadow-card">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
                    <Icon name="check_circle" size={30} />
                  </span>
                  <h2 className="mt-3 text-lg font-extrabold text-ink">Tu postulación quedó registrada</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {programa ? `Has completado tu postulación a ${p.puesto_snapshot}. ` : ''}Puedes consultar el estado
                    y tus datos de contacto en Mis postulaciones.
                  </p>
                </section>
              )}
              <section className="rounded-card bg-card p-4 shadow-card" aria-label="Detalle de la postulación">
                <p className="mb-2 text-xs font-semibold text-primary">
                  {programa ? 'Programa de empleabilidad' : 'Oferta laboral'}
                </p>
                <h2 className="text-base font-bold text-ink">{p.puesto_snapshot}</h2>
                <p className="mb-3 mt-1 text-sm text-ink-muted">{p.empresa_snapshot}</p>
                <EstadoPostulacion estado={p.estado} programa={programa} />
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {ESTADOS_POSTULACION[p.estado].descripcion}
                </p>
                <dl className="mt-4 space-y-3 border-t border-fill/5 pt-3 text-sm">
                  {[
                    ['Código', p.codigo],
                    ['Enviada el', fechaEmpleo(p.created_at)],
                    ['Última actualización', fechaEmpleo(p.actualizado_en)],
                    ['Nombre de contacto', p.nombre_contacto],
                    ['Correo de contacto', p.correo_contacto],
                    ...(programa
                      ? [
                          ['Código de estudiante', p.codigo_estudiante ?? ''],
                          ['Campus', p.campus ?? ''],
                          ['Ciclo actual', `${p.ciclo}.º ciclo`],
                          ['Requisitos revisados', p.acepta_requisitos ? 'Confirmado' : 'Pendiente'],
                        ]
                      : []),
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-ink-muted">{label}</dt>
                      <dd className="mt-0.5 break-words font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="rounded-card bg-card p-4 shadow-card">
                <h2 className="text-sm font-bold text-ink">¿Qué sigue ahora?</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {programa
                    ? 'Se revisarán tus datos y requisitos. Consulta tu correo institucional para conocer los siguientes pasos. Este registro es de demostración y no constituye una admisión ni una solicitud enviada a la universidad.'
                    : 'Este registro pertenece a la demostración de UTP+ Service. No se envió una solicitud a la empresa.'}{' '}
                  Los cambios de estado aparecerán aquí y en tus notificaciones.
                </p>
              </section>
              <Link to="/empleabilidad/postulaciones" className={`${empleoLink} w-full`}>
                Ver mis postulaciones
              </Link>
              <Link
                to={programa ? '/empleabilidad/programas' : '/empleabilidad/ofertas'}
                className="flex min-h-12 items-center justify-center text-sm font-semibold text-primary"
              >
                {programa ? 'Ver otros programas' : 'Explorar más ofertas'}
              </Link>
              {programa && (
                <Link
                  to={`/empleabilidad/programas/${p.programa_id}`}
                  className="flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
                >
                  Volver al programa
                </Link>
              )}
            </>
          )}
        </EmpleoQuery>
      </div>
    </div>
  )
}

export default function PostulacionDetailPage() {
  return <PostulacionView />
}
