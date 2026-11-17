import { Navigate, Route, Routes } from 'react-router-dom'
import MobileFrame from '@/components/layout/MobileFrame'
import SplashPage from '@/features/onboarding/SplashPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import LoginPage from '@/features/auth/LoginPage'
import HomePage from '@/features/home/HomePage'

export default function App() {
  return (
    <MobileFrame>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileFrame>
  )
}
