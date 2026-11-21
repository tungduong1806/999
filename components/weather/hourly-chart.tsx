'use client'

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { localTime } from '@/lib/format'
import type { HourForecast } from '@/lib/types'

const config = { temperature: { label: 'Nhiệt độ (°C)', color: 'var(--chart-1)' }, rain: { label: 'Xác suất mưa (%)', color: 'var(--chart-2)' } }

export default function HourlyChart({ hours, zone }: { hours: HourForecast[]; zone: string | null }) {
  const data = hours.map(hour => ({ ...hour, label: localTime(hour.time, zone) ?? '—' }))
  return <ChartContainer config={config} className="h-[220px] w-full" aria-label="Biểu đồ nhiệt độ và xác suất mưa theo giờ">
    <ComposedChart data={data} accessibilityLayer margin={{ left: -4, right: -6, top: 8 }}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" interval={5} tickLine={false} axisLine={false} />
      <YAxis yAxisId="temperature" domain={['auto', 'auto']} tickFormatter={value => `${value}°`} width={32} />
      <YAxis yAxisId="rain" orientation="right" ticks={[0, 50, 100]} domain={[0, 100]} tickFormatter={value => `${value}%`} width={36} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar yAxisId="rain" dataKey="rain" fill="var(--color-rain)" fillOpacity={0.6} radius={3} isAnimationActive={false} />
      <Line yAxisId="temperature" dataKey="temperature" type="monotone" stroke="var(--color-temperature)" strokeWidth={2} dot={false} isAnimationActive={false} />
    </ComposedChart>
  </ChartContainer>
}
