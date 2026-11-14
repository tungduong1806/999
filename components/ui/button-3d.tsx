import type { ButtonHTMLAttributes } from 'react'

type Button3DProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
}

const base =
  'inline-flex min-h-11 items-center justify-center rounded-popup px-5 font-medium transition-[transform,box-shadow] duration-100 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none'

const variants = {
  primary:
    'bg-accent text-surface shadow-press-accent motion-safe:active:translate-y-[3px] motion-safe:active:shadow-none disabled:bg-line disabled:text-ink-muted',
  outline:
    'border border-ink bg-surface text-ink shadow-press-ink motion-safe:active:translate-y-[3px] motion-safe:active:shadow-none disabled:border-line disabled:text-ink-muted',
} as const

export function Button3D({ variant = 'primary', className = '', type = 'button', ...props }: Button3DProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />
}
