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

/** Pantallas que en dos paneles se abren a la derecha. Se comparten entre ambas vistas. */
const detailRoutes = (
  <>
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
    <Route path="/mas/anuncios" element={<Navigate to="/anuncios" replace />} />
    <Route path="/mas/:slug" element={<ComingSoonPage />} />
  </>
)

function AppRoutes({ location }: { location?: Partial<Location> }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
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
        <Route path="/reservas" element={<ReservationsHome />} />
        <Route path="/reservas/lista/:tipo" element={<SpaceListPage />} />
        <Route path="/reservas/mis" element={<MyReservationsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        {detailRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/** Decide si se muestra un panel o dos, y qué va en cada uno. */
function Panes() {
  const { mode } = useDevice()
  const location = useLocation()
  const lastMaster = useRef<MasterLocation | null>(null)
  const { pathname, search } = location

  const app = isAppPath(pathname)
  const detail = isDetailPath(pathname)
  if (app && !detail) lastMaster.current = { pathname, search }

  // Un panel (celular) y pantalla de inicio (splash) a todo el ancho.
  if (mode === 'phone' || pathname === '/') return <AppRoutes />

  // Acceso y onboarding: formulario a la izquierda, marca a la derecha.
  if (!app) return <TwoPane left={<AppRoutes />} right={<BrandPane />} />

  const master = detail ? masterFor(pathname, lastMaster.current) : { pathname, search }
  const detailPath = detail ? pathname : null
  const companion = detailPath ? null : companionFor(master.pathname)

  const right = detailPath ? (
    <Routes location={{ pathname: detailPath }}>
      <Route element={<DetailLayout />}>{detailRoutes}</Route>
    </Routes>
  ) : companion ? (
    <DetailLayout id={companion}>{companion === 'calendario' ? <CalendarPage /> : <CoursesPage />}</DetailLayout>
  ) : (
    <EmptyDetail />
  )

  return (
    <ShellContext.Provider value={{ detailPath }}>
      <TwoPane left={<AppRoutes location={master} />} right={right} />
    </ShellContext.Provider>
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
