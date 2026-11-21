import { ArrowDown, ArrowUp, CloudSun, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { coordinateLabel, localTime, metric } from '@/lib/format'
import type { SelectedPlace, WeatherData } from '@/lib/types'
import { WeatherIcon } from './weather-icon'

export function CurrentCard({ place, name, address, data, busy }: { place: SelectedPlace; name: string; address?: string; data?: WeatherData; busy?: boolean }) {
  const current = data?.current
  const updated = data && localTime(data.current.updatedAt, data.timeZone)
  return <Card className="wx-hero" aria-busy={busy || undefined}>
    <CardHeader className="wx-hero-header">
      <span className="wx-eyebrow"><MapPin size={13} /> Điểm đang xem</span>
      <CardTitle as="h2" className="wx-location-title">{name}</CardTitle>
      <span className="wx-coordinates" title={address}>{address || coordinateLabel(place)}</span>
    </CardHeader>
    <CardContent className="wx-hero-body">
      <div className="wx-hero-reading">
        <div>
          <div className="wx-temperature">{metric(current?.temperature ?? null, '', true)}<span>°C</span></div>
          <span className="wx-description">{current?.description ?? (busy ? 'Đang cập nhật thời tiết' : 'Chưa có số liệu hiện tại')}</span>
        </div>
        <div className="wx-weather-emblem">{current ? <WeatherIcon condition={current} size={66} /> : <CloudSun size={47} aria-hidden="true" />}</div>
      </div>
      <div className="wx-hero-stats">
        <span>Cảm giác như <b>{metric(current?.feelsLike ?? null, '°', true)}</b></span>
        <span title="Cao và thấp trong 24 giờ qua"><ArrowUp size={14} aria-label="Cao" />{metric(current?.pastHigh ?? null, '°', true)}<ArrowDown size={14} aria-label="Thấp" />{metric(current?.pastLow ?? null, '°', true)}</span>
      </div>
      {updated && <p className="wx-update-line">Cập nhật {updated} · Giờ địa phương</p>}
    </CardContent>
  </Card>
}
