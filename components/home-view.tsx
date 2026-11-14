'use client'

import { riverState } from '@/lib/aqi'
import { SOURCES, type River, type Weather } from '@/lib/data'
import { dayMonth, formatNumber, todayKey, weekdayShort } from '@/lib/format'
import { MAX_HOMES, removeHomePlace, usePlaces, type Place } from '@/lib/places'
import { useRiver, useWeather } from '@/lib/queries'
import { outlineButton, pageX, primaryButton, textButton } from '@/lib/ui'
import { Credits } from './credits'
import { HourStrip, type StripCell } from './hour-strip'
import { LoadingNote, SectionError, SectionTitle, SkeletonBlock } from './states'

export function HomeView({ onAdd }: { onAdd: () => void }) {
  const { homes } = usePlaces()

  return (
    <>
      <section className={`${pageX} flex flex-col gap-6 py-6`} aria-labelledby="home-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionTitle id="home-heading">Quê nhà</SectionTitle>
          {homes.length > 0 && homes.length < MAX_HOMES ? (
            <button type="button" onClick={onAdd} className={outlineButton}>
              Thêm nơi
            </button>
          ) : null}
        </div>

        {homes.length === 0 ? (
          <div className="flex max-w-[560px] flex-col items-start gap-4">
            <p className="text-lg text-pretty">
              Lưu tối đa {MAX_HOMES} nơi ở quê để xem lượng mưa và mực nước sông ở đó, kể cả khi bạn đang ở xa.
            </p>
            <button type="button" onClick={onAdd} className={primaryButton}>
              Thêm nơi ở quê
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
      <Credits />
    </>
  )
}

function HomeRow({ place }: { place: Place }) {
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
            className={outlineButton}
          >
            Soạn tin hỏi thăm
          </button>
          <span id={`ask-${place.id}`} className="text-sm text-ink-muted">
            Có ở phiên bản 2
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => removeHomePlace(place.id)}
            aria-label={`Xóa ${place.name}`}
            className={textButton}
          >
            Xóa
          </button>
        </div>
      </div>

      <RiverBlock river={river} />
    </li>
  )
}

function RainLine({ weather }: { weather: ReturnType<typeof useWeather> }) {
  const { data, error, mutate } = weather
  if (error) return <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
  if (!data) return <LoadingNote>Đang lấy lượng mưa…</LoadingNote>
  const total = threeDayRain(data)
  return (
    <p>
      Mưa 3 ngày tới:{' '}
      {total != null ? (
        <>
          <span className="font-mono">{formatNumber(total, 0)}</span> mm
        </>
      ) : (
        'chưa có số liệu'
      )}
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
  const { data, error, mutate } = river
  if (error) return <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <LoadingNote>Đang lấy số liệu sông…</LoadingNote>
        <SkeletonBlock className="h-7 w-full" />
      </div>
    )
  }
  return <RiverContent river={data} />
}

function RiverContent({ river }: { river: River }) {
  const today = todayKey()
  const found = river.days.findIndex((d) => d.date === today)
  const start = found >= 0 ? found : Math.min(3, Math.max(0, river.days.length - 1))
  const days = river.days.slice(start, start + 7)

  const ratios = days.map((d) =>
    d.discharge != null && d.median != null && d.median > 0 ? d.discharge / d.median : null,
  )
  const known = ratios.filter((r): r is number => r != null)

  if (known.length === 0) {
    return <p className="text-ink-muted">Chưa có số liệu sông cho nơi này.</p>
  }

  const peak = Math.max(...known)
  const peakState = riverState(peak)

  const cells: StripCell[] = days.map((d, i) => {
    const ratio = ratios[i]
    const weekday = weekdayShort(d.date)
    const date = dayMonth(d.date)
    if (ratio == null) {
      return {
        key: d.date,
        bg: 'var(--color-line)',
        label: `${weekday} ${date}: chưa có số liệu`,
        tick: `${weekday}\n${date}`,
      }
    }
    const state = riverState(ratio)
    return {
      key: d.date,
      bg: state.bg,
      label: `${weekday} ${date}: ${state.label}, gấp ${formatNumber(ratio, 1)} lần mức thường`,
      tick: `${weekday}\n${date}`,
    }
  })

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-center gap-x-2">
        <span>Sông, cao nhất trong 7 ngày tới:</span>
        <span className="inline-flex items-center gap-2 font-medium">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-cell"
            style={{ backgroundColor: peakState.bg }}
          />
          {peakState.label}
        </span>
      </p>
      <p className="text-sm text-ink-muted">
        Lưu lượng mô hình so với mức trung vị theo mùa, không phải mực nước đo tại trạm.
      </p>
      <HourStrip cells={cells} activeIndex={0} name="Lưu lượng sông 7 ngày tới" />
    </div>
  )
}

function RiverLegend() {
  const items = [
    { label: 'Bình thường', bg: 'var(--color-river-normal)' },
    { label: 'Cao hơn bình thường', bg: 'var(--color-river-high)' },
    { label: 'Cao bất thường', bg: 'var(--color-river-extreme)' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted" aria-label="Chú giải màu lưu lượng sông">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-3 rounded-cell" style={{ backgroundColor: item.bg }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
