import { Droplet } from 'lucide-react'
import { localTime, metric } from '@/lib/format'
import type { HourForecast } from '@/lib/types'
import { WeatherIcon } from './weather-icon'

export function HourlyStrip({ hours, zone, updatedAt }: { hours: HourForecast[]; zone: string | null; updatedAt: string | null }) {
  return <ul className="wx-hourly" aria-label="Nhiệt độ và xác suất mưa 24 giờ" tabIndex={0}>
    {hours.map((hour, index) => <li key={hour.time}>
      <span className="text-muted-foreground">{index === 0 && updatedAt && Math.abs(Date.parse(updatedAt) - Date.parse(hour.time)) < 3600000 ? 'Bây giờ' : localTime(hour.time, zone) ?? '—'}</span>
      <WeatherIcon condition={hour} />
      <strong>{metric(hour.temperature, '°', true)}</strong>
      <span className="wx-rain"><Droplet size={12} aria-label="Xác suất mưa" />{metric(hour.rain, '%', true)}</span>
    </li>)}
  </ul>
}
