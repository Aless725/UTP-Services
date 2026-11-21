import { useState } from 'react'
import Icon from '@/components/ui/Icon'

/** Foto del convenio con respaldo: si no carga (sin conexión), muestra el ícono de la marca. */
export default function Foto({ src, icon, alt, className = '' }: { src: string; icon: string; alt: string; className?: string }) {
  const [fallo, setFallo] = useState(false)
  if (fallo) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-primary-soft text-primary ${className}`}>
        <Icon name={icon} size={32} filled />
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className}`} />
}
