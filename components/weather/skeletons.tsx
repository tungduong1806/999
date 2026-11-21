import { Skeleton } from '@/components/ui/skeleton'

export function MapSkeleton() {
  return <div className="wx-map-loading" role="status"><Skeleton className="absolute inset-0 rounded-none motion-reduce:animate-none" /><span>Đang tải Google Maps…</span></div>
}

export function ForecastSkeleton({ label }: { label: string }) {
  return <div className="wx-section-loading" role="status" aria-label={label}>
    <Skeleton className="h-4 w-2/5 motion-reduce:animate-none" />
    <Skeleton className="h-10 w-full motion-reduce:animate-none" />
    <Skeleton className="h-10 w-full motion-reduce:animate-none" />
  </div>
}
