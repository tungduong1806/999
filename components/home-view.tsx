'use client'

import { ChatCircleText, CloudRain, House, Plus, Trash, Waves } from '@phosphor-icons/react'
import { riverState } from '@/lib/aqi'
import { SOURCES, type River, type Weather } from '@/lib/data'
import { dayMonth, formatNumber, todayKey, weekdayShort } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { MAX_HOMES, removeHomePlace, usePlaces, type Place } from '@/lib/places'
import { useRiver, useWeather } from '@/lib/queries'
import { outlineButton, pageX, primaryButton, textButton } from '@/lib/ui'
import { HourStrip, type StripCell } from './hour-strip'
import { LoadingNote, SectionError, SectionTitle, SkeletonBlock } from './states'

export function HomeView({ onAdd }: { onAdd: () => void }) {
  const { t } = useT()
  const { homes } = usePlaces()

  return (
    <section className={`${pageX} flex flex-col gap-6 py-6`} aria-labelledby="home-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle id="home-heading" icon={<House size={20} weight="duotone" />}>
          {t('home.title')}
        </SectionTitle>
        {homes.length > 0 && homes.length < MAX_HOMES ? (
          <button type="button" onClick={onAdd} className={`${outlineButton} gap-2`}>
            <Plus size={18} weight="bold" aria-hidden="true" />
            {t('home.add')}
          </button>
        ) : null}
      </div>

      {homes.length === 0 ? (
        <div className="flex max-w-[560px] flex-col items-start gap-4">
          <p className="text-lg text-pretty">{t('home.empty', { max: MAX_HOMES })}</p>
          <button type="button" onClick={onAdd} className={`${primaryButton} gap-2`}>
            <Plus size={18} weight="bold" aria-hidden="true" />
            {t('home.addFirst')}
          </button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line border-y border-line">
            {homes.map((home) => (
              <HomeRow key={home.id} place={home} />
            ))}
          </ul>
          <RiverLegend />
        </>
      )}
    </section>
  )
}

function HomeRow({ place }: { place: Place }) {
  const { t } = useT()
  const weather = useWeather(place.lat, place.lon)
  const river = useRiver(place.lat, place.lon)

  return (
    <li className="flex flex-col gap-4 py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-10">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-display text-2xl leading-tight tracking-tight">{place.name}</h3>
          {place.detail ? <p className="text-ink-muted">{place.detail}</p> : null}
        </div>

        <RainLine weather={weather} />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled
            aria-describedby={`ask-${place.id}`}
            className={`${outlineButton} gap-2`}
          >
            <ChatCircleText size={18} weight="duotone" aria-hidden="true" />
            {t('home.compose')}
          </button>
          <span id={`ask-${place.id}`} className="text-sm text-ink-muted">
            {t('home.v2')}
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => removeHomePlace(place.id)}
            aria-label={t('home.removeAria', { name: place.name })}
            className={`${textButton} gap-1.5 no-underline`}
          >
            <Trash size={18} weight="duotone" aria-hidden="true" />
            {t('home.remove')}
          </button>
        </div>
      </div>

      <RiverBlock river={river} />
    </li>
  )
}

function RainLine({ weather }: { weather: ReturnType<typeof useWeather> }) {
  const { t } = useT()
  const { data, error, mutate } = weather
  if (error) return <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
  if (!data) return <LoadingNote>{t('home.rainLoading')}</LoadingNote>
  const total = threeDayRain(data)
  return (
    <p className="flex items-center gap-2">
      <CloudRain size={20} weight="duotone" aria-hidden="true" className="text-accent" />
      <span>
        {t('home.rain3')}{' '}
        {total != null ? (
          <>
            <span className="font-mono">{formatNumber(total, 0)}</span> mm
          </>
        ) : (
          t('common.noData')
        )}
      </span>
    </p>
  )
}

function threeDayRain(data: Weather): number | null {
  const values = data.daily.slice(0, 3).map((d) => d.precipitation)
  const known = values.filter((v): v is number => v != null)
  if (known.length === 0) return null
  return known.reduce((a, b) => a + b, 0)
}

function RiverBlock({ river }: { river: ReturnType<typeof useRiver> }) {
  const { t } = useT()
  const { data, error, mutate } = river
  if (error) return <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <LoadingNote>{t('river.loading')}</LoadingNote>
        <SkeletonBlock className="h-7 w-full" />
      </div>
    )
  }
  return <RiverContent river={data} />
}

function RiverContent({ river }: { river: River }) {
  const { t } = useT()
  const today = todayKey()
  const found = river.days.findIndex((d) => d.date === today)
  const start = found >= 0 ? found : Math.min(3, Math.max(0, river.days.length - 1))
  const days = river.days.slice(start, start + 7)

  const ratios = days.map((d) =>
    d.discharge != null && d.median != null && d.median > 0 ? d.discharge / d.median : null,
  )
  const known = ratios.filter((r): r is number => r != null)

  if (known.length === 0) {
    return <p className="text-ink-muted">{t('river.none')}</p>
  }

  const peak = Math.max(...known)
  const peakState = riverState(peak)

  const cells: StripCell[] = days.map((d, i) => {
    const ratio = ratios[i]
    const day = `${weekdayShort(d.date)} ${dayMonth(d.date)}`
    const tick = `${weekdayShort(d.date)}\n${dayMonth(d.date)}`
    if (ratio == null) {
      return { key: d.date, bg: 'var(--color-line)', label: t('river.cellNoData', { day }), tick }
    }
    const state = riverState(ratio)
    return {
      key: d.date,
      bg: state.bg,
      label: t('river.cell', { day, state: t(state.labelKey), ratio: formatNumber(ratio, 1) }),
      tick,
    }
  })

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-center gap-x-2">
        <Waves size={20} weight="duotone" aria-hidden="true" className="text-accent" />
        <span>{t('river.peak')}</span>
        <span className="inline-flex items-center gap-2 font-medium">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-cell"
            style={{ backgroundColor: peakState.bg }}
          />
          {t(peakState.labelKey)}
        </span>
      </p>
      <p className="text-sm text-ink-muted">{t('river.note')}</p>
      <HourStrip cells={cells} activeIndex={0} name={t('river.stripName')} />
    </div>
  )
}

function RiverLegend() {
  const { t } = useT()
  const items = [
    { label: t('river.normal'), bg: 'var(--color-river-normal)' },
    { label: t('river.high'), bg: 'var(--color-river-high)' },
    { label: t('river.extreme'), bg: 'var(--color-river-extreme)' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted" aria-label={t('river.legend')}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-3 rounded-cell" style={{ backgroundColor: item.bg }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
