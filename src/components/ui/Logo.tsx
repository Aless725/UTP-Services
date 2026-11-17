interface LogoProps {
  size?: 'md' | 'lg'
}

/** Logotipo UTP+Service: tres cuadros negros, "+" rojo y "Service". */
export default function Logo({ size = 'lg' }: LogoProps) {
  const box = size === 'lg' ? 'h-10 w-10 text-2xl' : 'h-8 w-8 text-xl'
  const word = size === 'lg' ? 'text-[1.7rem]' : 'text-2xl'
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label="UTP+Service">
      {['U', 'T', 'P'].map((l) => (
        <span
          key={l}
          className={`${box} flex items-center justify-center bg-black font-extrabold leading-none text-white`}
        >
          {l}
        </span>
      ))}
      <span className={`${word} font-extrabold leading-none text-[#E8606F]`}>+</span>
      <span className={`${word} font-bold leading-none text-black`}>Service</span>
    </div>
  )
}
