'use client'

import { CloudSun, Drop, ThermometerSimple, Wind } from '@phosphor-icons/react'
import useSWR from 'swr'
import { localeOf, useT } from '@/lib/i18n'
import { linkClass } from '@/lib/ui'
import { forecastGrid, WEATHER_SOURCE, WEATHER_SOURCE_URL, WEATHER_ZONE, type Forecast } from '@/lib/weather-contract'
import { weatherCopy } from '@/lib/weather-copy'
import { LoadingNote, SectionError, SectionTitle } from './states'

async function fetchForecast(url: string): Promise<Forecast> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Forecast unavailable')
  return response.json()
}

export function WeatherDetails({ lat, lon }: { lat: number; lon: number }) {
  const { lang } = useT()
  const copy = weatherCopy[lang]
  const grid = forecastGrid(lat, lon)
  const { data, error, mutate } = useSWR(`/api/weather?lat=${grid.lat}&lon=${grid.lon}`, fetchForecast, {
    refreshInterval: 15 * 60 * 1000,
    shouldRetryOnError: false,
  })
  const head = data?.hours[0]
  const locale = localeOf(lang)
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const date = new Intl.DateTimeFormat(locale, { timeZone: WEATHER_ZONE, dateStyle: 'short', timeStyle: 'short' })
  const clock = new Intl.DateTimeFormat(locale, { timeZone: WEATHER_ZONE, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const measure = (value: number | null, unit: string) => value == null ? '—' : `${number.format(value)} ${unit}`

  return (
    <section aria-labelledby="weather-forecast" className="flex min-w-0 flex-col gap-4 rounded-sheet border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <SectionTitle id="weather-forecast" icon={<CloudSun size={20} weight="duotone" />}>{copy.forecast}</SectionTitle>
        <p className="text-sm text-ink-muted">{copy.modelNote}</p>
      </div>
      {error ? <SectionError source={WEATHER_SOURCE} onRetry={() => void mutate()} /> : null}
      {!error && !head ? <LoadingNote>{copy.loading}</LoadingNote> : null}
      {head && data ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-ink-muted"><time dateTime={head.time}>{date.format(new Date(head.time))}</time> · UTC+7</p>
              <p className="font-display text-5xl tabular-nums tracking-tight">{measure(head.temperature, '°C')}</p>
            </div>
            {data.stale || error ? <p role="status" className="text-sm text-ink-muted">{copy.stale}</p> : null}
          </div>
          <dl className="grid grid-cols-2 gap-2">
            {[
              { icon: ThermometerSimple, label: copy.feelsLike, value: measure(head.feelsLike, '°C') },
              { icon: Drop, label: copy.humidity, value: measure(head.humidity, '%') },
              { icon: Wind, label: copy.wind, value: measure(head.windKmh, 'km/h') },
              { icon: CloudSun, label: copy.uv, value: head.clearSkyUv == null ? '—' : number.format(head.clearSkyUv) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1 rounded-popup bg-line/40 px-3 py-2">
                <dt className="flex items-center gap-1.5 text-sm text-ink-muted"><Icon size={16} aria-hidden="true" className="shrink-0 text-accent" />{label}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <details className="rounded-popup border border-line px-3">
            <summary className="cursor-pointer py-3 text-sm font-medium">{copy.hourly}</summary>
            <table className="mb-3 w-full text-sm tabular-nums">
              <caption className="sr-only">{copy.hourly} (UTC+7)</caption>
              <thead className="text-ink-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="pb-2 text-left font-medium">{copy.time}</th>
                  <th scope="col" className="pb-2 text-right font-medium">°C</th>
                  <th scope="col" className="pb-2 text-right font-medium">{copy.rain}</th>
                </tr>
              </thead>
              <tbody>
                {data.hours.map((hour) => (
                  <tr key={hour.time} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="py-1.5 text-left font-normal">
                      <time dateTime={hour.time}>{clock.format(new Date(hour.time))}</time>
                    </th>
                    <td className="py-1.5 text-right">{number.format(hour.temperature)}</td>
                    <td className="py-1.5 text-right">{measure(hour.rainMm, 'mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pb-3 text-xs text-ink-muted">{copy.rainNote}</p>
          </details>
          <p className="text-xs leading-relaxed text-ink-muted">
            <a href={WEATHER_SOURCE_URL} className={linkClass}>{WEATHER_SOURCE}</a> · {copy.updated}{' '}
            <time dateTime={data.modelUpdatedAt}>{date.format(new Date(data.modelUpdatedAt))}</time> (UTC+7)
          </p>
        </>
      ) : null}
    </section>
  )
}
