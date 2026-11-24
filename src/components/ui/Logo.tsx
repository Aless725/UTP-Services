interface LogoProps {
  size?: 'md' | 'lg'
}

/** Logotipo UTP+Service: tres cuadros casi pegados, "+" fino de acento y "Service" en negrita. */
export default function Logo({ size = 'lg' }: LogoProps) {
  const box = size === 'lg' ? 'h-10 w-10 text-2xl' : 'h-8 w-8 text-xl'
  const plus = size === 'lg' ? 'text-[2.5rem]' : 'text-[2rem]'
  const word = size === 'lg' ? 'text-[1.9rem]' : 'text-[1.5rem]'
  return (
    <div className="flex items-center gap-2" role="img" aria-label="UTP+Service">
      <span className="flex gap-0.5" aria-hidden="true">
        {['U', 'T', 'P'].map((l) => (
          <span
            key={l}
            className={`${box} flex items-center justify-center bg-ink font-extrabold leading-none text-surface`}
          >
            {l}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className={`${plus} font-extralight leading-none text-primary/70`}>
        +
      </span>
      <span aria-hidden="true" className={`${word} font-extrabold leading-none tracking-tight text-ink`}>
        Service
      </span>
    </div>
  )
}
