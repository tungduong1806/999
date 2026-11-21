import { Droplet } from 'lucide-react'
import { atlasWeekday, dayMonth, metric } from '@/lib/format'
import type { DailyForecast } from '@/lib/types'
import { WeatherIcon } from './weather-icon'

export function DailyList({ days, today }: { days: DailyForecast[]; today: string | null }) {
  const values = days.flatMap(day => [day.low, day.high]).filter(value => value !== null)
  const min = values.length ? Math.min(...values) : 0
  const span = Math.max(1, values.length ? Math.max(...values) - min : 1)

  return <ul className="wx-days" aria-label="Dự báo 7 ngày">{days.map(day => {
    const condition = day.day ?? day.night
    const details = [day.day?.description && `Ngày: ${day.day.description}`, day.night?.description && `Đêm: ${day.night.description}`].filter(Boolean).join(' · ')
    return <li key={day.date}>
      <div className="wx-day-label"><strong>{day.date === today ? 'Hôm nay' : atlasWeekday(day.date)}</strong><small>{dayMonth(day.date)}</small></div>
      <span title={details || undefined}>{condition ? <WeatherIcon condition={condition} size={26} /> : '—'}{details && <span className="sr-only">{details}</span>}</span>
      <span className="wx-rain"><Droplet size={12} aria-label="Xác suất mưa" />{metric(condition?.rain ?? null, '%', true)}</span>
      <span className="text-muted-foreground" aria-label={`Thấp ${metric(day.low, '°C', true)}`}>{metric(day.low, '°', true)}</span>
      <span className="wx-temp-range" aria-hidden="true">{day.low !== null && day.high !== null && <i style={{ left: `${(day.low - min) / span * 100}%`, width: `${Math.max(0, (day.high - day.low) / span * 100)}%` }} />}</span>
      <strong aria-label={`Cao ${metric(day.high, '°C', true)}`}>{metric(day.high, '°', true)}</strong>
    </li>
  })}</ul>
}
