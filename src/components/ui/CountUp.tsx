import { useEffect, useState } from 'react'

interface CountUpProps {
  value: number
  decimals?: number
  duration?: number
}

/** Cuenta de 0 al valor. Sin animación si el usuario prefiere menos movimiento. */
export default function CountUp({ value, decimals = 0, duration = 800 }: CountUpProps) {
  const reduce =
    typeof document !== 'undefined' && document.documentElement.dataset.reduceMotion === 'true'
  const [n, setN] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setN(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, reduce])

  return <>{n.toFixed(decimals)}</>
}
