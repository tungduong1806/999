'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Activity, CloudOff, Clock3, CalendarDays, Info, List, ChartNoAxesCombined, Wind } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWeather } from '@/hooks/use-weather'
import { useAirQuality } from '@/hooks/use-air-quality'
import { coordinateLabel, localDateKey } from '@/lib/format'
import type { SelectedPlace } from '@/lib/types'
import { AqiCard } from './aqi-card'
import { CurrentCard } from './current-card'
import { DailyList } from './daily-list'
import { DetailGrid } from './detail-grid'
import { HourlyStrip } from './hourly-strip'
import { ForecastSkeleton } from './skeletons'

const HourlyChart = dynamic(() => import('./hourly-chart'), { ssr: false, loading: () => <ForecastSkeleton label="Đang tải biểu đồ" /> })

type Props = { place: SelectedPlace; displayName: string; address?: string }

function useDisplayData<T>(query: { data?: T; isPlaceholderData: boolean; isError: boolean; dataUpdatedAt: number }, name: string) {
  const previous = useRef<{ data: T; name: string; at: number } | null>(null)
  useEffect(() => {
    if (query.data !== undefined && !query.isPlaceholderData) previous.current = { data: query.data, name, at: query.dataUpdatedAt }
  }, [query.data, query.isPlaceholderData, query.dataUpdatedAt, name])
  const last = previous.current
  const fallback = query.isError && query.data === undefined && last && Date.now() - last.at < 3600000 ? last : null
  const data = query.data !== undefined ? query.data : fallback?.data
  return { data, oldLocation: query.isPlaceholderData ? last?.name : fallback?.name }
}

function ForecastAlert({ title, error, onRetry }: { title: string; error: Error; onRetry: () => void }) {
  return <Alert className="wx-notice">
    <Info aria-hidden="true" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{error.message === 'Failed to fetch' ? 'Không kết nối được. Vui lòng kiểm tra mạng.' : error.message}</AlertDescription>
    <Button variant="outline" onClick={onRetry}>Thử lại</Button>
  </Alert>
}

export function ForecastPanel({ place, displayName, address }: Props) {
  const weatherQuery = useWeather(place)
  const aqiQuery = useAirQuality(place)
  const weather = useDisplayData(weatherQuery, displayName)
  const air = useDisplayData(aqiQuery, displayName)
  const forecast = weather.data
  const today = forecast ? localDateKey(forecast.current.updatedAt, forecast.timeZone) : null
  const pending = weatherQuery.isPending && weatherQuery.fetchStatus === 'fetching'
  const shownName = weather.oldLocation ?? displayName
  const forecastsUnavailable = <p className="wx-empty-copy">Dự báo sẽ hiển thị khi nguồn dữ liệu sẵn sàng.</p>

  return <div className="wx-panel-content">
    <CurrentCard place={place} name={shownName} address={weather.oldLocation ? 'Dữ liệu của điểm xem trước đó' : address} data={forecast} busy={pending} />
    {weather.oldLocation && <p className="wx-inline-status" role="status">Đang hiển thị thời tiết cũ của {weather.oldLocation}.</p>}
    {weatherQuery.error && <ForecastAlert title="Chưa tải được thời tiết" error={weatherQuery.error} onRetry={() => void weatherQuery.refetch()} />}
    <Card className="wx-module">
      <CardHeader className="wx-module-heading"><CardTitle as="h3"><Clock3 size={17} /> Dự báo 24 giờ</CardTitle></CardHeader>
      <CardContent>
        {pending ? <ForecastSkeleton label="Đang tải dự báo theo giờ" /> : forecast?.hours.length ? <Tabs defaultValue="list">
          <TabsList aria-label="Hiển thị dự báo 24 giờ">
            <TabsTrigger value="list"><List size={15} /> Theo giờ</TabsTrigger>
            <TabsTrigger value="chart"><ChartNoAxesCombined size={15} /> Biểu đồ</TabsTrigger>
          </TabsList>
          <TabsContent value="list"><HourlyStrip hours={forecast.hours} zone={forecast.timeZone} updatedAt={forecast.current.updatedAt} /></TabsContent>
          <TabsContent value="chart"><HourlyChart hours={forecast.hours} zone={forecast.timeZone} /></TabsContent>
        </Tabs> : forecastsUnavailable}
      </CardContent>
    </Card>
    <Card className="wx-module">
      <CardHeader className="wx-module-heading"><CardTitle as="h3"><CalendarDays size={17} /> Dự báo 7 ngày</CardTitle></CardHeader>
      <CardContent>{pending ? <ForecastSkeleton label="Đang tải dự báo theo ngày" /> : forecast?.days.length ? <DailyList days={forecast.days} today={today} /> : forecastsUnavailable}</CardContent>
    </Card>
    {air.oldLocation && air.data && <p className="wx-inline-status" role="status">Đang hiển thị AQI cũ của {air.oldLocation}.</p>}
    {air.data && <AqiCard data={air.data} />}
    {aqiQuery.isPending && aqiQuery.fetchStatus === 'fetching' && <Card className="wx-module">
      <CardHeader className="wx-module-heading"><CardTitle as="h3"><Wind size={17} /> Chất lượng không khí</CardTitle></CardHeader>
      <CardContent><ForecastSkeleton label="Đang tải chất lượng không khí" /></CardContent>
    </Card>}
    {aqiQuery.error && <ForecastAlert title="Chưa tải được chất lượng không khí" error={aqiQuery.error} onRetry={() => void aqiQuery.refetch()} />}
    <Card className="wx-module">
      <CardHeader className="wx-module-heading"><CardTitle as="h3"><Activity size={17} /> Chi tiết thời tiết</CardTitle></CardHeader>
      <CardContent>{pending ? <ForecastSkeleton label="Đang tải chi tiết thời tiết" /> : <DetailGrid current={forecast?.current} />}</CardContent>
    </Card>
    <footer className="wx-panel-footer">
      <p>Nguồn thời tiết và chất lượng không khí: <span translate="no" className="wx-attribution">Google Maps</span></p>
      <div><Link href="/chinh-sach">Điều khoản &amp; quyền riêng tư</Link><Link href="/tho-sach">Thở Sạch</Link></div>
    </footer>
  </div>
}

export function PanelPeek({ place, displayName }: { place: SelectedPlace; displayName: string }) {
  const { data, isPlaceholderData } = useWeather(place)
  return <div className="wx-peek-label"><strong>{displayName}</strong><span>{data && !isPlaceholderData && data.current.temperature !== null ? `${Math.round(data.current.temperature)}°C` : coordinateLabel(place)}</span></div>
}
