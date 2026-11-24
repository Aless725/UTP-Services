import { useRef } from 'react'
import { Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import AppShell from '@/components/layout/AppShell'
import { DeviceProvider, useDevice } from '@/components/layout/DeviceContext'
import DetailLayout from '@/components/layout/DetailLayout'
import { BrandPane, EmptyDetail } from '@/components/layout/PaneFallbacks'
import { ShellContext } from '@/components/layout/ShellContext'
import TwoPane from '@/components/layout/TwoPane'
import { ToastProvider } from '@/components/ui/Toast'
import { companionFor, isAppPath, isDetailPath, masterFor, type MasterLocation } from '@/lib/routeSplit'
import SplashPage from '@/features/onboarding/SplashPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import LoginPage from '@/features/auth/LoginPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import EmailSentPage from '@/features/auth/EmailSentPage'
import NewPasswordPage from '@/features/auth/NewPasswordPage'
import PasswordUpdatedPage from '@/features/auth/PasswordUpdatedPage'
import RequireAuth from '@/features/auth/RequireAuth'
import HomePage from '@/features/home/HomePage'
import CalendarPage from '@/features/calendar/CalendarPage'
import CoursesPage from '@/features/courses/CoursesPage'
import PaymentsPage from '@/features/payments/PaymentsPage'
import GroupsPage from '@/features/groups/GroupsPage'
import CreateGroupPage from '@/features/groups/CreateGroupPage'
import GroupCreatedPage from '@/features/groups/GroupCreatedPage'
import GroupDetailPage from '@/features/groups/GroupDetailPage'
import AnnouncementsPage from '@/features/announcements/AnnouncementsPage'
import AnnouncementDetailPage from '@/features/announcements/AnnouncementDetailPage'
import ComingSoonPage from '@/features/more/ComingSoonPage'
import SupportPage from '@/features/support/SupportPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import MailPage from '@/features/mail/MailPage'
import ReservationsHome from '@/features/reservations/ReservationsHome'
import SpaceListPage from '@/features/reservations/SpaceListPage'
import SpaceDetailPage from '@/features/reservations/SpaceDetailPage'
import SchedulePage from '@/features/reservations/SchedulePage'
import MembersPage from '@/features/reservations/MembersPage'
import ConfirmPage from '@/features/reservations/ConfirmPage'
import ConfirmedPage from '@/features/reservations/ConfirmedPage'
import MyReservationsPage from '@/features/reservations/MyReservationsPage'
import CourseDetailPage from '@/features/courses/detail/CourseDetailPage'
import ProfilePage from '@/features/profile/ProfilePage'
import AccessibilityPage from '@/features/accessibility/AccessibilityPage'
import TramitesPage from '@/features/tramites/TramitesPage'
import TramiteDetailPage from '@/features/tramites/TramiteDetailPage'
import SolicitarTramitePage from '@/features/tramites/SolicitarTramitePage'
import SolicitudPage from '@/features/tramites/SolicitudPage'
import SeguimientoPage from '@/features/tramites/SeguimientoPage'
import BeneficiosPage from '@/features/beneficios/BeneficiosPage'
import CatalogoBeneficiosPage from '@/features/beneficios/CatalogoBeneficiosPage'
import DetalleBeneficioPage from '@/features/beneficios/DetalleBeneficioPage'
import CuponGeneradoPage from '@/features/beneficios/CuponGeneradoPage'
import HistorialPage from '@/features/payments/HistorialPage'
import MisCuponesPage from '@/features/beneficios/MisCuponesPage'
import ReferirPage from '@/features/beneficios/ReferirPage'
import TriviaPage from '@/features/beneficios/TriviaPage'
import OpinaPage from '@/features/beneficios/OpinaPage'
import PonteAlDiaPage from '@/features/beneficios/PonteAlDiaPage'
import EmpleabilidadPage from '@/features/empleabilidad/EmpleabilidadPage'
import ProgramasPage from '@/features/empleabilidad/ProgramasPage'
import ProgramaDetailPage from '@/features/empleabilidad/ProgramaDetailPage'
import PostularProgramaPage from '@/features/empleabilidad/PostularProgramaPage'
import OfertasPage from '@/features/empleabilidad/OfertasPage'
import OfertaDetailPage from '@/features/empleabilidad/OfertaDetailPage'
import PostularPage from '@/features/empleabilidad/PostularPage'
import MisPostulacionesPage from '@/features/empleabilidad/MisPostulacionesPage'
import PostulacionDetailPage from '@/features/empleabilidad/PostulacionDetailPage'
import PostulacionEnviadaPage from '@/features/empleabilidad/PostulacionEnviadaPage'
import TalleresPage from '@/features/talleres/TalleresPage'
import CatalogoTalleresPage from '@/features/talleres/CatalogoTalleresPage'
import TallerDetailPage from '@/features/talleres/TallerDetailPage'
import MisTalleresPage from '@/features/talleres/MisTalleresPage'
import InscripcionPage from '@/features/talleres/InscripcionPage'
import SessionExpiredPage from '@/features/auth/SessionExpiredPage'

/** Pantallas que en dos paneles se abren a la derecha. Se comparten entre ambas vistas. */
const detailRoutes = (
  <>
    <Route path="/talleres/inscripcion/:id" element={<InscripcionPage />} />
    <Route path="/talleres/:categoria/:tallerId" element={<TallerDetailPage />} />
    <Route path="/empleabilidad/programas/:id" element={<ProgramaDetailPage />} />
    <Route path="/empleabilidad/programas/:id/postular" element={<PostularProgramaPage />} />
    <Route path="/empleabilidad/ofertas/:id" element={<OfertaDetailPage />} />
    <Route path="/empleabilidad/ofertas/:id/postular" element={<PostularPage />} />
    <Route path="/empleabilidad/postulaciones/:id" element={<PostulacionDetailPage />} />
    <Route path="/empleabilidad/postulaciones/:id/confirmacion" element={<PostulacionEnviadaPage />} />
    <Route path="/cursos/:id" element={<CourseDetailPage />} />
    <Route path="/grupos/nuevo" element={<CreateGroupPage />} />
    <Route path="/grupos/creado/:id" element={<GroupCreatedPage />} />
    <Route path="/grupos/:id" element={<GroupDetailPage />} />
    <Route path="/perfil/accesibilidad" element={<AccessibilityPage />} />
    <Route path="/reservas/espacio/:id" element={<SpaceDetailPage />} />
    <Route path="/reservas/espacio/:id/horario" element={<SchedulePage />} />
    <Route path="/reservas/espacio/:id/integrantes" element={<MembersPage />} />
    <Route path="/reservas/espacio/:id/confirmar" element={<ConfirmPage />} />
    <Route path="/reservas/confirmada/:codigo" element={<ConfirmedPage />} />
    <Route path="/anuncios/:id" element={<AnnouncementDetailPage />} />
    <Route path="/tramites/seguimiento" element={<SeguimientoPage />} />
    <Route path="/tramites/solicitud/:codigo" element={<SolicitudPage />} />
    <Route path="/tramites/:id" element={<TramiteDetailPage />} />
    <Route path="/tramites/:id/solicitar" element={<SolicitarTramitePage />} />
    <Route path="/beneficios/catalogo" element={<CatalogoBeneficiosPage />} />
    <Route path="/beneficios/cupones" element={<MisCuponesPage />} />
    <Route path="/beneficios/referir" element={<ReferirPage />} />
    <Route path="/beneficios/trivia" element={<TriviaPage />} />
    <Route path="/beneficios/opina" element={<OpinaPage />} />
    <Route path="/beneficios/ponte-al-dia" element={<PonteAlDiaPage />} />
    <Route path="/beneficios/:id" element={<DetalleBeneficioPage />} />
    <Route path="/beneficios/:id/cupon" element={<CuponGeneradoPage />} />
    <Route path="/pagos/historial" element={<HistorialPage />} />
    <Route path="/mas/historial" element={<Navigate to="/pagos/historial" replace />} />
    <Route path="/mas/anuncios" element={<Navigate to="/anuncios" replace />} />
    <Route path="/mas/soporte" element={<Navigate to="/soporte" replace />} />
    <Route path="/mas/tramites" element={<Navigate to="/tramites" replace />} />
    <Route path="/mas/empleabilidad" element={<Navigate to="/empleabilidad" replace />} />
    <Route path="/mas/talleres" element={<Navigate to="/talleres" replace />} />
    <Route path="/mas/:slug" element={<ComingSoonPage />} />
  </>
)

function AppRoutes({ location }: { location?: Partial<Location> }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sesion-expirada" element={<SessionExpiredPage />} />
      <Route path="/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/recuperar/enviado" element={<EmailSentPage />} />
      <Route path="/nueva-contrasena" element={<NewPasswordPage />} />
      <Route path="/contrasena-actualizada" element={<PasswordUpdatedPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/pagos" element={<PaymentsPage />} />
        <Route path="/grupos" element={<GroupsPage />} />
        <Route path="/anuncios" element={<AnnouncementsPage />} />
        <Route path="/soporte" element={<SupportPage />} />
        <Route path="/notificaciones" element={<NotificationsPage />} />
        <Route path="/correo" element={<MailPage />} />
        <Route path="/reservas" element={<ReservationsHome />} />
        <Route path="/reservas/lista/:tipo" element={<SpaceListPage />} />
        <Route path="/reservas/mis" element={<MyReservationsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/tramites" element={<TramitesPage />} />
        <Route path="/beneficios" element={<BeneficiosPage />} />
        <Route path="/empleabilidad" element={<EmpleabilidadPage />} />
        <Route path="/empleabilidad/programas" element={<ProgramasPage />} />
        <Route path="/empleabilidad/ofertas" element={<OfertasPage />} />
        <Route path="/empleabilidad/postulaciones" element={<MisPostulacionesPage />} />
        <Route path="/talleres" element={<TalleresPage />} />
        <Route path="/talleres/mis" element={<MisTalleresPage />} />
        <Route path="/talleres/:categoria" element={<CatalogoTalleresPage />} />
        {detailRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/** Decide si se muestra un panel o dos, y qué va en cada uno. */
function Panes() {
  const { mode, landscape, stacked } = useDevice()
  const location = useLocation()
  const lastMaster = useRef<MasterLocation | null>(null)
  const { pathname, search } = location

  const app = isAppPath(pathname)
  const detail = isDetailPath(pathname)
  if (app && !detail) lastMaster.current = { pathname, search }

  // Un panel (celular) y pantalla de inicio (splash) a todo el ancho.
  if (mode === 'phone' || pathname === '/') return <AppRoutes />

  // Celular en horizontal: el acceso y el onboarding ocupan toda la pantalla (sin panel de marca).
  if (!app && landscape && !stacked) return <AppRoutes />

  // Acceso y onboarding: formulario a la izquierda, marca a la derecha.
  if (!app) return <TwoPane left={<AppRoutes />} right={<BrandPane />} />

  const master = detail ? masterFor(pathname, lastMaster.current, search) : { pathname, search }
  const detailPath = detail ? pathname : null
  const companion = detailPath ? null : companionFor(master.pathname)

  const right = detailPath ? (
    <Routes location={{ pathname: detailPath, search }}>
      <Route element={<RequireAuth><DetailLayout /></RequireAuth>}>
        {detailRoutes}
      </Route>
    </Routes>
  ) : companion ? (
    <DetailLayout id={companion}>{companion === 'calendario' ? <CalendarPage /> : <CoursesPage />}</DetailLayout>
  ) : (
    <EmptyDetail />
  )

  return (
    <RequireAuth>
      <ShellContext.Provider value={{ detailPath }}>
        <TwoPane left={<AppRoutes location={master} />} right={right} />
      </ShellContext.Provider>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <DeviceProvider>
      <AppShell>
        <ToastProvider>
          <Panes />
        </ToastProvider>
      </AppShell>
    </DeviceProvider>
  )
}
