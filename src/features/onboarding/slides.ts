export interface OnboardingSlide {
  id: 'academica' | 'reservas' | 'comunidad'
  title: string
  description: string
}

export const slides: OnboardingSlide[] = [
  {
    id: 'academica',
    title: 'Gestiona tu vida académica',
    description: 'Revisa tus horarios, cursos y pagos fácilmente en un solo lugar.',
  },
  {
    id: 'reservas',
    title: 'Reserva espacios y equipos',
    description: 'Accede rápidamente a laboratorios y recursos en tu campus.',
  },
  {
    id: 'comunidad',
    title: 'Conecta y aprende',
    description: 'Únete a grupos de estudio y potencia tu aprendizaje en comunidad.',
  },
]
