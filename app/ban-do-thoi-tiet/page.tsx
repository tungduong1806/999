import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { WeatherApp } from '@/components/weather-app'
import { MapSkeleton } from '@/components/weather/skeletons'
import { WeatherProviders } from '../providers'

export const metadata: Metadata = {
  title: 'Khí Việt — Bản đồ thời tiết & chất lượng không khí',
  description: 'Khám phá thời tiết hiện tại, dự báo 24 giờ và 7 ngày, cùng chỉ số chất lượng không khí trên bản đồ tương tác.',
  appleWebApp: {
    capable: true,
    title: 'Khí Việt',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1420' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function Page() {
  return (
    <WeatherProviders>
      <Suspense fallback={<main className="wx-app"><MapSkeleton /></main>}>
        <WeatherApp hasEnvironmentKey={Boolean(process.env.GOOGLE_ENV_API_KEY?.trim())} />
      </Suspense>
    </WeatherProviders>
  )
}
