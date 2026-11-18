import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import { hasSeenOnboarding } from '@/lib/storage'

const SHOW_MS = 1500
const EXIT_MS = 300

export default function SplashPage() {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const exit = setTimeout(() => setLeaving(true), SHOW_MS)
    const go = setTimeout(
      () => navigate(hasSeenOnboarding() ? '/login' : '/onboarding', { replace: true }),
      SHOW_MS + EXIT_MS,
    )
    return () => {
      clearTimeout(exit)
      clearTimeout(go)
    }
  }, [navigate])

  return (
    <div className="flex h-full items-center justify-center bg-surface">
      <div
        className={`transition-[opacity,transform] duration-300 ease-smooth ${
          leaving ? 'scale-95 opacity-0' : 'animate-pop'
        }`}
      >
        <Logo />
      </div>
    </div>
  )
}
