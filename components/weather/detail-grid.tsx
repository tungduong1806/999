import { ArrowUp, Cloud, CloudLightning, CloudRain, Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react'
import { metric } from '@/lib/format'
import type { CurrentWeather } from '@/lib/types'

function uvLabel(value: number) {
  return value < 3 ? 'Thấp' : value < 6 ? 'Trung bình' : value < 8 ? 'Cao' : value < 11 ? 'Rất cao' : 'Cực cao'
}

const directions: Record<string, string> = { NORTH: 'Bắc', NORTHEAST: 'Đông Bắc', EAST: 'Đông', SOUTHEAST: 'Đông Nam', SOUTH: 'Nam', SOUTHWEST: 'Tây Nam', WEST: 'Tây', NORTHWEST: 'Tây Bắc', NORTH_NORTHEAST: 'Bắc Đông Bắc', EAST_NORTHEAST: 'Đông Đông Bắc', EAST_SOUTHEAST: 'Đông Đông Nam', SOUTH_SOUTHEAST: 'Nam Đông Nam', SOUTH_SOUTHWEST: 'Nam Tây Nam', WEST_SOUTHWEST: 'Tây Tây Nam', WEST_NORTHWEST: 'Tây Tây Bắc', NORTH_NORTHWEST: 'Bắc Tây Bắc' }

export function DetailGrid({ current }: { current?: CurrentWeather }) {
  const rows = [
    { icon: Droplets, label: 'Độ ẩm', value: metric(current?.humidity ?? null, '%') },
    { icon: Wind, label: 'Gió', value: metric(current?.wind ?? null, ' km/h'), detail: current?.gust != null && `Giật ${metric(current.gust, ' km/h')}` },
    { icon: Sun, label: 'Chỉ số UV', value: metric(current?.uv ?? null), detail: current?.uv != null && uvLabel(current.uv) },
    { icon: Eye, label: 'Tầm nhìn', value: metric(current?.visibility ?? null, ' km') },
    { icon: Gauge, label: 'Áp suất', value: metric(current?.pressure ?? null, ' hPa') },
    { icon: Cloud, label: 'Độ che phủ mây', value: metric(current?.clouds ?? null, '%') },
    { icon: CloudRain, label: 'Lượng mưa', value: metric(current?.rainAmount ?? null, ' mm'), detail: current?.rain != null && `Xác suất ${metric(current.rain, '%')}` },
    { icon: CloudLightning, label: 'Xác suất giông', value: metric(current?.thunder ?? null, '%') },
  ]
  return <dl className="wx-detail-grid">{rows.map(({ icon: Icon, label, value, detail }) => <div key={label}>
    <dt><Icon size={15} aria-hidden="true" />{label}</dt>
    <dd>{value}{label === 'Gió' && current?.windDegrees != null && <ArrowUp size={15} style={{ transform: `rotate(${current.windDegrees}deg)` }} aria-label={current.windCardinal && directions[current.windCardinal] || `Hướng ${current.windDegrees} độ`} />}</dd>
    {detail && <dd className="wx-metric-sub">{detail}</dd>}
  </div>)}</dl>
}
