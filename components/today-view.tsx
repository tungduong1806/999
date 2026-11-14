'use client'

import { CloudRain, Thermometer, Wind as WindIcon } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { aqiLevel, worthWaiting } from '@/lib/aqi'
import { SOURCES, type Air, type Weather } from '@/lib/data'
import { currentHourKey, formatNumber, hhmmFromIso } from '@/lib/format'
import { useT, type Translator } from '@/lib/i18n'
import { setCurrentPlace, type Place } from '@/lib/places'
import { useAir, useWeather } from '@/lib/queries'
import { pageX } from '@/lib/ui'
import { HourStrip, type StripCell } from './hour-strip'
import { PlacePicker } from './place-picker'
import { LoadingNote, SectionError, SectionTitle, SkeletonBlock } from './states'

export function TodayView({ place }: { place: Place | null }) {
  if (!place) return <FirstRun />
  return <TodayForPlace place={place} />
}

function FirstRun() {
  const { t } = useT()
  return (
    <section className={`${pageX} flex max-w-[560px] flex-col gap-6 py-10`}>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-3xl leading-tight tracking-tight text-balance">{t('first.title')}</h2>
        <p className="text-ink-muted">{t('first.desc')}</p>
      </div>
      <PlacePicker onPick={setCurrentPlace} />
    </section>
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
  )
}

function AirSkeleton() {
  const { t } = useT()
  return (
    <div>
      <div className={`${pageX} pt-2`}>
        <div className="flex min-h-56 flex-col justify-between rounded-sheet bg-surface p-5 lg:p-8">
          <LoadingNote>{t('air.loading')}</LoadingNote>
          <SkeletonBlock className="h-16 w-40 bg-line" />
        </div>
      </div>
      <div className={`${pageX} py-6`}>
        <SkeletonBlock className="h-7 w-full" />
      </div>
    </div>
  )
}

function buildStrip(air: Air, t: Translator) {
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
    const tick = hour % 3 === 0 ? hhmm : undefined
    const tickShort = hour % 3 === 0 ? pad(hour) : undefined
    if (h.aqi == null) {
      return {
        key: h.time,
        bg: 'var(--color-line)',
        label: t('air.cellNoData', { time: hhmm }),
        tick,
        tickShort,
      }
    }
    const l = aqiLevel(h.aqi)
    return {
      key: h.time,
      bg: l.bg,
      label: t('air.cell', { time: hhmm, aqi: Math.round(h.aqi), level: t(l.labelKey) }),
      tick,
      tickShort,
    }
  })

  return {
    cells,
    cleanestRange: cleanest?.range ?? null,
    bracket: cleanest
      ? { start: cleanest.index, length: 2, label: t('air.cleanest', { range: cleanest.range }) }
      : undefined,
  }
}

function AirContent({ air }: { air: Air }) {
  const { t, lang } = useT()
  const level = aqiLevel(air.aqi)
  // The language is a dependency because the strip labels are translated.
  const strip = useMemo(() => buildStrip(air, t), [air, t, lang])
  const advice =
    t(level.adviceKey) +
    (worthWaiting(level) && strip.cleanestRange ? ` ${t('air.cleanerWindow', { range: strip.cleanestRange })}` : '')

  return (
    <div>
      <div className={`${pageX} pt-2`}>
        <section
          aria-labelledby="aqi-heading"
          className="flex min-h-56 flex-col justify-between gap-6 rounded-sheet p-5 text-ink shadow-card-3d lg:p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${level.bg} 38%, var(--color-surface)) 0%, var(--color-surface) 78%)`,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="aqi-heading" className="text-lg font-medium">
              {t('air.title')}
            </h2>
            <span
              className="inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium"
              style={{ backgroundColor: level.bg, color: level.fg }}
            >
              {t(level.labelKey)}
            </span>
          </div>
          <div>
            <p className="font-mono text-[clamp(4.5rem,22vw,8rem)] leading-none font-medium">
              {Math.round(air.aqi)}
            </p>
            <p className="mt-3 text-ink-muted">{t('air.aqiAt', { time: hhmmFromIso(air.time) })}</p>
          </div>
        </section>
      </div>

      <div className={`${pageX} flex flex-col gap-4 py-6`}>
        <p className="text-ink-muted">{t('air.estimate')}</p>
        <p>
          {t('air.pm25')}{' '}
          {air.pm25 != null ? (
            <>
              <span className="font-mono">{formatNumber(air.pm25, 1)}</span> µg/m³
            </>
          ) : (
            t('common.noData')
          )}
        </p>

        <div className="flex flex-col gap-1 pt-2">
          <SectionTitle>{t('air.next24')}</SectionTitle>
          <HourStrip cells={strip.cells} activeIndex={0} name={t('air.stripName')} bracket={strip.bracket} />
        </div>

        <p className="text-lg text-pretty">{advice}</p>
      </div>
    </div>
  )
}

function WeatherBlock({ weather }: { weather: ReturnType<typeof useWeather> }) {
  const { t } = useT()
  const { data, error, mutate } = weather

  return (
    <section aria-labelledby="weather-heading" className="flex flex-col gap-3">
      <SectionTitle id="weather-heading" icon={<Thermometer size={20} weight="duotone" />}>
        {t('weather.title')}
      </SectionTitle>
      {error ? (
        <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
      ) : data ? (
        <WeatherRows data={data} />
      ) : (
        <div className="flex flex-col gap-2">
          <LoadingNote>{t('weather.loading')}</LoadingNote>
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
        </div>
      )}
    </section>
  )
}

function WeatherRows({ data }: { data: Weather }) {
  const { t } = useT()
  const key = currentHourKey()
  const hour = data.hourly.find((h) => h.time === key) ?? data.hourly[0]
  const rows = [
    {
      label: t('weather.temp'),
      Icon: Thermometer,
      value: hour?.temperature != null ? formatNumber(hour.temperature, 0) : null,
      unit: '°C',
    },
    {
      label: t('weather.rain'),
      Icon: CloudRain,
      value: hour?.rainChance != null ? formatNumber(hour.rainChance, 0) : null,
      unit: '%',
    },
    {
      label: t('weather.wind'),
      Icon: WindIcon,
      value: hour?.wind != null ? formatNumber(hour.wind, 0) : null,
      unit: 'km/h',
    },
  ]
  return (
    <dl className="flex flex-col gap-2">
      {rows.map(({ label, Icon, value, unit }) => (
        <div
          key={label}
          className="flex min-h-14 items-center justify-between gap-4 rounded-popup bg-surface/70 px-3"
        >
          <dt className="flex items-center gap-2 text-ink-muted">
            <Icon size={20} weight="duotone" aria-hidden="true" className="text-accent" />
            {label}
          </dt>
          <dd>
            {value != null ? (
              <>
                <span className="font-mono">{value}</span> {unit}
              </>
            ) : (
              t('common.noData')
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
