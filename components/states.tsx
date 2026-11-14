'use client'

import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react'
import { useT } from '@/lib/i18n'
import { textButton } from '@/lib/ui'

/** Static placeholder block with the real dimensions of what will load. No spinner, no pulse. */
export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded-cell bg-line ${className}`} />
}

export function LoadingNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="text-ink-muted">
      {children}
    </p>
  )
}

export function SectionError({ source, onRetry }: { source: string; onRetry: () => void }) {
  const { t } = useT()
  return (
    <div role="alert" className="flex flex-wrap items-center gap-x-2 text-ink">
      <WarningCircle size={20} weight="fill" aria-hidden="true" className="shrink-0 text-river-high" />
      <p>{t('error.fetch', { source })}</p>
      <button type="button" onClick={onRetry} className={`${textButton} gap-1.5 no-underline`}>
        <ArrowClockwise size={16} weight="bold" aria-hidden="true" />
        {t('common.retry')}
      </button>
    </div>
  )
}

export function SectionTitle({
  id,
  children,
  icon,
}: {
  id?: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <h2 id={id} className="flex items-center gap-2 font-display text-xl leading-tight tracking-tight text-ink">
      {icon ? (
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-popup bg-accent/15 text-accent">
          {icon}
        </span>
      ) : null}
      {children}
    </h2>
  )
}
