import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import { hasSeenOnboarding } from '@/lib/storage'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(
      () => navigate(hasSeenOnboarding() ? '/login' : '/onboarding', { replace: true }),
      1600,
    )
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="flex h-full items-center justify-center bg-surface">
      <Logo />
    </div>
  )
}
