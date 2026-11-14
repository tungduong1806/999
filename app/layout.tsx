import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Google_Sans_Flex, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  axes: ['opsz'],
  variable: '--font-google-sans-flex',
  display: 'swap',
})

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Thở Sạch: chất lượng không khí và cảnh báo lũ',
  description:
    'Xem nhanh hôm nay có cần đeo khẩu trang không và quê nhà có nguy cơ mưa lũ không. Số liệu mô hình từ Open-Meteo.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Thở Sạch',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0F16',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={`${googleSansFlex.variable} ${notoSansJp.variable} bg-ground`}
    >
      <body className="overflow-x-hidden bg-ground text-ink antialiased [-webkit-text-size-adjust:100%] [-webkit-tap-highlight-color:transparent]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
