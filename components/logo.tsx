import Image from 'next/image'

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Thở Sạch"
      width={size}
      height={size}
      priority
      className="shrink-0 select-none drop-shadow-logo"
    />
  )
}
