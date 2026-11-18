import { useMemo } from 'react'
import QRCode from 'qrcode'

interface QrCodeProps {
  value: string
  /** Lado en píxeles. */
  size?: number
  label: string
}

/**
 * Código QR real y escaneable, dibujado como SVG. Siempre oscuro sobre fondo claro
 * (también en modo oscuro) para que los lectores lo reconozcan.
 */
export default function QrCode({ value, size = 220, label }: QrCodeProps) {
  const { path, count } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' })
    const n = qr.modules.size
    let d = ''
    for (let r = 0; r < n; r++) {
      let c = 0
      while (c < n) {
        if (qr.modules.get(r, c)) {
          const start = c
          while (c < n && qr.modules.get(r, c)) c++
          d += `M${start} ${r}h${c - start}v1h-${c - start}z`
        } else c++
      }
    }
    return { path: d, count: n }
  }, [value])

  const quiet = 2
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`${-quiet} ${-quiet} ${count + quiet * 2} ${count + quiet * 2}`}
      shapeRendering="crispEdges"
      className="rounded-lg bg-white"
    >
      <path d={path} fill="#0A0A0A" />
    </svg>
  )
}
