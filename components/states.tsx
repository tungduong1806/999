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
  return (
    <div role="alert" className="flex flex-wrap items-center gap-x-2 text-ink">
      <p>Chưa lấy được dữ liệu từ {source}.</p>
      <button type="button" onClick={onRetry} className={textButton}>
        Thử lại
      </button>
    </div>
  )
}

export function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-xl leading-tight tracking-tight text-ink">
      {children}
    </h2>
  )
}
