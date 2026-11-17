import { Navigate, Route, Routes } from 'react-router-dom'
import MobileFrame from '@/components/layout/MobileFrame'
import SplashPage from '@/features/onboarding/SplashPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import LoginPage from '@/features/auth/LoginPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import EmailSentPage from '@/features/auth/EmailSentPage'
import NewPasswordPage from '@/features/auth/NewPasswordPage'
import PasswordUpdatedPage from '@/features/auth/PasswordUpdatedPage'
import RequireAuth from '@/features/auth/RequireAuth'
import HomePage from '@/features/home/HomePage'

export default function App() {
  return (
    <MobileFrame>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar" element={<ForgotPasswordPage />} />
        <Route path="/recuperar/enviado" element={<EmailSentPage />} />
        <Route path="/nueva-contrasena" element={<NewPasswordPage />} />
        <Route path="/contrasena-actualizada" element={<PasswordUpdatedPage />} />
        <Route
          path="/inicio"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileFrame>
  )
}
