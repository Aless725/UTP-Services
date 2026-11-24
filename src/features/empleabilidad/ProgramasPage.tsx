import FlowHeader from '@/components/layout/FlowHeader'
import EmpleabilidadState, { EmpleoQuery } from './components/EmpleabilidadState'
import ProgramaCard from './components/ProgramaCard'
import { useProgramas } from './empleabilidadData'

export default function ProgramasPage() {
  const programas = useProgramas()
  return (
    <div className="flex flex-1 flex-col pb-4">
      <FlowHeader
        title="Programas de empleabilidad"
        back="/empleabilidad"
        backLabel="Volver a empleabilidad"
        subtitle="Encuentra el acompañamiento para tu etapa universitaria."
      />
      <div className="stagger space-y-3 px-5 pt-4">
        <EmpleoQuery query={programas}>
          {programas.data?.length === 0 ? (
            <EmpleabilidadState
              icon="school"
              title="Pronto habrá nuevos programas"
              description="Vuelve más adelante para conocer las próximas oportunidades de formación."
            />
          ) : (
            programas.data?.map((p) => <ProgramaCard key={p.id} programa={p} />)
          )}
        </EmpleoQuery>
      </div>
    </div>
  )
}
