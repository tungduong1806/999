import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'

export const metadata: Metadata = {
  title: 'Thở Sạch: chất lượng không khí và cảnh báo lũ',
  description: 'Xem nhanh hôm nay có cần đeo khẩu trang không và quê nhà có nguy cơ mưa lũ không. Số liệu mô hình từ Open-Meteo.',
}

export default function Page() {
  return <AppShell />
}
