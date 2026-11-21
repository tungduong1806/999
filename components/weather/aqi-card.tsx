import { HeartPulse, Wind } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { metric } from '@/lib/format'
import type { AirQualityData, Concentration } from '@/lib/types'

const showConcentration = (measure: Concentration | null) => measure ? metric(measure.value, measure.unit ? ` ${measure.unit}` : '') : '—'

export function AqiCard({ data }: { data: AirQualityData }) {
  return <Card className="wx-module">
    <CardHeader className="wx-module-heading">
      <CardTitle as="h3"><Wind size={17} /> Chất lượng không khí</CardTitle>
    </CardHeader>
    <CardContent className="wx-aqi-card">
      <div className="wx-aqi-header">
        <div className="wx-aqi-score"><strong>{metric(data.aqi, '', true)}</strong><span>{data.index}</span></div>
        {data.category && <Badge variant="secondary" className="wx-aqi-badge"><span aria-hidden="true" style={{ background: data.color ?? undefined }} />{data.category}</Badge>}
      </div>
      {data.pollutant && <p className="wx-muted">Chất ô nhiễm chủ đạo: <b>{data.pollutant}</b></p>}
      <dl className="wx-detail-grid">
        <div><dt>PM2,5</dt><dd>{showConcentration(data.pm25)}</dd></div>
        <div><dt>PM10</dt><dd>{showConcentration(data.pm10)}</dd></div>
      </dl>
      {data.advice && <div className="wx-health"><HeartPulse size={17} aria-hidden="true" /><p>{data.advice}</p></div>}
    </CardContent>
  </Card>
}
