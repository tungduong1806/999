'use client'

import { useMemo } from 'react'
import { adviceFor, aqiLevel } from '@/lib/aqi'
import { SOURCES, type Air, type Weather } from '@/lib/data'
import { currentHourKey, formatNumber, hhmmFromIso } from '@/lib/format'
import { setCurrentPlace, type Place } from '@/lib/places'
import { useAir, useWeather } from '@/lib/queries'
import { pageX } from '@/lib/ui'
import { Credits } from './credits'
import { HourStrip, type StripCell } from './hour-strip'
import { PlacePicker } from './place-picker'
import { LoadingNote, SectionError, SectionTitle, SkeletonBlock } from './states'

export function TodayView({ place }: { place: Place | null }) {
  if (!place) return <FirstRun />
  return <TodayForPlace place={place} />
}

function FirstRun() {
  return (
    <>
      <section className={`${pageX} flex max-w-[560px] flex-col gap-6 py-10`}>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl leading-tight tracking-tight text-balance">
            Bạn đang ở đâu hôm nay?
          </h2>
          <p className="text-ink-muted">
            Chọn nơi bạn đang học hoặc làm việc để xem hôm nay có cần đeo khẩu trang không.
          </p>
        </div>
        <PlacePicker onPick={setCurrentPlace} />
      </section>
      <Credits weather={false} />
    </>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Best two consecutive hours between 05:00 and 22:00 with the lowest total AQI. */
function findCleanestPair(window: Air['hourly']) {
  let best: { index: number; sum: number } | null = null
  for (let i = 0; i < window.length - 1; i++) {
    const a = window[i]
    const b = window[i + 1]
    if (a.aqi == null || b.aqi == null) continue
    const startHour = Number(a.time.slice(11, 13))
    const endHour = Number(b.time.slice(11, 13))
    if (startHour < 5 || endHour > 21 || endHour <= startHour) continue
    const sum = a.aqi + b.aqi
    if (!best || sum < best.sum) best = { index: i, sum }
  }
  if (!best) return null
  const startHour = Number(window[best.index].time.slice(11, 13))
  return { index: best.index, range: `${pad(startHour)}:00–${pad(startHour + 2)}:00` }
}

function TodayForPlace({ place }: { place: Place }) {
  const air = useAir(place.lat, place.lon)
  const weather = useWeather(place.lat, place.lon)

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {air.error ? (
            <div className={`${pageX} py-6`}>
              <SectionError source={SOURCES.openMeteo} onRetry={() => air.mutate()} />
            </div>
          ) : air.data ? (
            <AirContent air={air.data} />
          ) : (
            <AirSkeleton />
          )}
        </div>
        <div className={`${pageX} py-6 lg:pl-0`}>
          <WeatherBlock weather={weather} />
        </div>
      </div>
      <Credits />
    </>
  )
}

function AirSkeleton() {
  return (
    <div>
      <div className="flex min-h-56 flex-col justify-between bg-line px-4 py-6 lg:px-8">
        <LoadingNote>Đang lấy chất lượng không khí…</LoadingNote>
        <SkeletonBlock className="h-16 w-40 bg-surface" />
      </div>
      <div className={`${pageX} py-6`}>
        <SkeletonBlock className="h-7 w-full" />
      </div>
    </div>
  )
}

function AirContent({ air }: { air: Air }) {
  const { level, strip, advice } = useMemo(() => {
    const level = aqiLevel(air.aqi)
    const currentKey = `${air.time.slice(0, 13)}:00`
    const start = Math.max(
      0,
      air.hourly.findIndex((h) => h.time === currentKey),
    )
    const window = air.hourly.slice(start, start + 24)
    const cleanest = findCleanestPair(window)

    const cells: StripCell[] = window.map((h) => {
      const hour = Number(h.time.slice(11, 13))
      const hhmm = hhmmFromIso(h.time)
      if (h.aqi == null) {
        return {
          key: h.time,
          bg: 'var(--color-line)',
          label: `${hhmm}: chưa có số liệu`,
          tick: hour % 3 === 0 ? hhmm : undefined,
          tickShort: hour % 3 === 0 ? pad(hour) : undefined,
        }
      }
      const l = aqiLevel(h.aqi)
      return {
        key: h.time,
        bg: l.bg,
        label: `${hhmm}: AQI ${Math.round(h.aqi)}, ${l.label}`,
        tick: hour % 3 === 0 ? hhmm : undefined,
        tickShort: hour % 3 === 0 ? pad(hour) : undefined,
      }
    })

    return {
      level,
      strip: {
        cells,
        bracket: cleanest
          ? { start: cleanest.index, length: 2, label: `Sạch nhất ${cleanest.range}` }
          : undefined,
      },
      advice: adviceFor(level, cleanest?.range ?? null),
    }
  }, [air])

  return (
    <div>
      <section
        aria-labelledby="aqi-heading"
        className="flex min-h-56 flex-col justify-between gap-6 px-4 py-6 lg:px-8"
        style={{ backgroundColor: level.bg, color: level.fg }}
      >
        <h2 id="aqi-heading" className="text-lg font-medium">
          Chất lượng không khí ngay bây giờ
        </h2>
        <div>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-mono text-[clamp(4.5rem,22vw,8rem)] leading-none font-medium">
              {Math.round(air.aqi)}
            </span>
            <span className="font-display text-3xl leading-tight tracking-tight">{level.label}</span>
          </p>
          <p className="mt-2">
            AQI Mỹ, lúc <span className="font-mono">{hhmmFromIso(air.time)}</span>
          </p>
        </div>
      </section>

      <div className={`${pageX} flex flex-col gap-4 py-6`}>
        <p className="text-ink-muted">Số ước tính từ mô hình, có thể khác trạm đo.</p>
        <p>
          Bụi mịn PM2.5:{' '}
          {air.pm25 != null ? (
            <>
              <span className="font-mono">{formatNumber(air.pm25, 1)}</span> µg/m³
            </>
          ) : (
            'chưa có số liệu'
          )}
        </p>

        <div className="flex flex-col gap-1 pt-2">
          <SectionTitle>24 giờ tới</SectionTitle>
          <HourStrip cells={strip.cells} activeIndex={0} name="Chất lượng không khí 24 giờ tới" bracket={strip.bracket} />
        </div>

        <p className="text-lg text-pretty">{advice}</p>
      </div>
    </div>
  )
}

function WeatherBlock({ weather }: { weather: ReturnType<typeof useWeather> }) {
  const { data, error, mutate } = weather

  return (
    <section aria-labelledby="weather-heading" className="flex flex-col gap-3">
      <SectionTitle id="weather-heading">Thời tiết lúc này</SectionTitle>
      {error ? (
        <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
      ) : data ? (
        <WeatherRows data={data} />
      ) : (
        <div className="flex flex-col gap-2">
          <LoadingNote>Đang lấy thời tiết…</LoadingNote>
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
        </div>
      )}
    </section>
  )
}

function WeatherRows({ data }: { data: Weather }) {
  const key = currentHourKey()
  const hour = data.hourly.find((h) => h.time === key) ?? data.hourly[0]
  const rows: { label: string; value: string | null; unit: string }[] = [
    {
      label: 'Nhiệt độ',
      value: hour?.temperature != null ? formatNumber(hour.temperature, 0) : null,
      unit: '°C',
    },
    {
      label: 'Khả năng mưa',
      value: hour?.rainChance != null ? formatNumber(hour.rainChance, 0) : null,
      unit: '%',
    },
    {
      label: 'Gió',
      value: hour?.wind != null ? formatNumber(hour.wind, 0) : null,
      unit: 'km/h',
    },
  ]
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <div key={row.label} className="flex min-h-11 items-center justify-between gap-4 py-2">
          <dt className="text-ink-muted">{row.label}</dt>
          <dd>
            {row.value != null ? (
              <>
                <span className="font-mono">{row.value}</span> {row.unit}
              </>
            ) : (
              'chưa có số liệu'
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
