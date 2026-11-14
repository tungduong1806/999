import type { HTMLAttributes } from 'react'

export function Card3D({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-sheet border border-line bg-surface p-4 shadow-card-3d ${className}`}
      {...props}
    />
  )
}
