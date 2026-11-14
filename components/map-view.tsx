'use client'

import { CaretDown, CaretUp, CloudRain, Pulse } from '@phosphor-icons/react'
import dynamic from 'next/dynamic'
import { useId, useMemo, useState } from 'react'
import { SOURCES } from '@/lib/data'
import { dateTimeFromMs, formatNumber, hhmmFromMs } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useQuakes, useRadar } from '@/lib/queries'
import { linkClass, pageX, textButton } from '@/lib/ui'
import { HourStrip, type StripCell } from './hour-strip'
import { LoadingNote, SectionError, SectionTitle, SkeletonBlock } from './states'

function MapLoading() {
  const { t } = useT()
  return (
    <div className="absolute inset-0 grid place-items-center bg-line">
      <LoadingNote>{t('map.loading')}</LoadingNote>
    </div>
  )
}

const MapCanvas = dynamic(() => import('./map-canvas'), {
  ssr: false,
  loading: () => <MapLoading />,
})

export function MapView() {
  const { t } = useT()
  const [radarOn, setRadarOn] = useState(true)
  const [quakesOn, setQuakesOn] = useState(true)
  const [frameChoice, setFrameChoice] = useState<number | null>(null)
  const [mapFailed, setMapFailed] = useState(false)
  const [mapKey, setMapKey] = useState(0)

  const radar = useRadar(radarOn)
  const quakes = useQuakes(quakesOn)

  const frameIndex = frameChoice ?? radar.data?.nowIndex ?? 0
  const radarTiles = useMemo(() => {
    if (!radarOn || !radar.data) return null
    const frame = radar.data.frames[frameIndex]
    if (!frame) return null
    return `${radar.data.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
  }, [radarOn, radar.data, frameIndex])

  return (
    <>
      <p className={`${pageX} border-b border-line py-3`}>{t('map.disclaimer')}</p>

      <div className="relative h-[calc(100dvh-16rem)] min-h-[420px] overflow-hidden border-b border-line bg-line lg:h-[calc(100dvh-8rem)]">
        {mapFailed ? (
          <div className="absolute inset-0 grid place-items-center p-6">
            <SectionError
              source="OpenFreeMap"
              onRetry={() => {
                setMapFailed(false)
                setMapKey((k) => k + 1)
              }}
            />
          </div>
        ) : (
          <MapCanvas
            key={mapKey}
            radarTiles={radarTiles}
            quakes={quakesOn ? (quakes.data ?? null) : null}
            onFailed={() => setMapFailed(true)}
          />
        )}

        <LayerSheet
          radarOn={radarOn}
          onRadar={setRadarOn}
          quakesOn={quakesOn}
          onQuakes={setQuakesOn}
          radar={radar}
          quakes={quakes}
          frameIndex={frameIndex}
          onFrame={setFrameChoice}
        />
      </div>

      <QuakeList on={quakesOn} quakes={quakes} />
    </>
  )
}

type LayerSheetProps = {
  radarOn: boolean
  onRadar: (on: boolean) => void
  quakesOn: boolean
  onQuakes: (on: boolean) => void
  radar: ReturnType<typeof useRadar>
  quakes: ReturnType<typeof useQuakes>
  frameIndex: number
  onFrame: (index: number) => void
}

function LayerSheet({ radarOn, onRadar, quakesOn, onQuakes, radar, quakes, frameIndex, onFrame }: LayerSheetProps) {
  const { t } = useT()
  const [open, setOpen] = useState(true)
  const bodyId = useId()

  return (
    <section
      aria-label={t('map.layers')}
      className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-h-[70%] w-full flex-col rounded-t-sheet bg-surface shadow-float sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-h-[calc(100%-2rem)] sm:w-[360px] sm:rounded-sheet"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex min-h-12 w-full items-center justify-between gap-4 px-4 text-left"
      >
        <span className="font-display text-lg tracking-tight">{t('map.layers')}</span>
        <span className="flex items-center gap-1 text-sm font-medium">
          {open ? t('map.collapse') : t('map.expand')}
          {open ? (
            <CaretDown size={16} weight="bold" aria-hidden="true" />
          ) : (
            <CaretUp size={16} weight="bold" aria-hidden="true" />
          )}
        </span>
      </button>

      <div id={bodyId} hidden={!open} className="overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          <LayerSwitch label={t('map.radar')} icon={<CloudRain size={20} weight="duotone" />} checked={radarOn} onChange={onRadar} />
          {radarOn ? <RadarControls radar={radar} frameIndex={frameIndex} onFrame={onFrame} /> : null}

          <LayerSwitch label={t('map.quakes')} icon={<Pulse size={20} weight="duotone" />} checked={quakesOn} onChange={onQuakes} />
          {quakesOn ? <QuakeStatus quakes={quakes} /> : null}
        </div>
      </div>
    </section>
  )
}

function LayerSwitch({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  checked: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 border-t border-line pt-1 first:border-t-0 first:pt-0">
      <span className="flex items-center gap-2 font-medium">
        <span aria-hidden="true" className="text-accent">
          {icon}
        </span>
        {label}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 accent-accent"
      />
    </label>
  )
}

function RadarControls({
  radar,
  frameIndex,
  onFrame,
}: {
  radar: ReturnType<typeof useRadar>
  frameIndex: number
  onFrame: (index: number) => void
}) {
  const { t } = useT()
  const { data, error, mutate } = radar

  if (error) return <SectionError source={SOURCES.rainViewer} onRetry={() => mutate()} />
  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <LoadingNote>{t('map.radarLoading')}</LoadingNote>
        <SkeletonBlock className="h-7 w-full" />
      </div>
    )
  }

  const cells: StripCell[] = data.frames.map((frame, i) => {
    const time = hhmmFromMs(frame.time)
    return {
      key: String(frame.time),
      bg: frame.nowcast ? 'var(--color-line)' : 'var(--color-river-normal)',
      label: `${time}${frame.nowcast ? `, ${t('map.forecast')}` : ''}`,
      tick: i % 3 === 0 ? time : undefined,
      tickShort: i % 6 === 0 ? time : undefined,
    }
  })
  const frame = data.frames[frameIndex]

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-ink-muted">{t('map.radarHelp')}</p>
      <HourStrip cells={cells} activeIndex={frameIndex} name={t('map.radarFrame')} onSelect={onFrame} />
      {frame ? (
        <p className="text-sm">
          <span className="font-mono">{t('map.radarAt', { time: hhmmFromMs(frame.time) })}</span>
          {frame.nowcast ? `, ${t('map.forecast')}` : ''}
        </p>
      ) : null}
    </div>
  )
}

function QuakeStatus({ quakes }: { quakes: ReturnType<typeof useQuakes> }) {
  const { t } = useT()
  if (quakes.error) return <SectionError source={SOURCES.usgs} onRetry={() => quakes.mutate()} />
  if (!quakes.data) return <LoadingNote>{t('map.quakeLoading')}</LoadingNote>
  return <p className="text-sm">{t('map.quakeCount', { count: quakes.data.length })}</p>
}

function QuakeList({ on, quakes }: { on: boolean; quakes: ReturnType<typeof useQuakes> }) {
  const { t } = useT()
  return (
    <section aria-labelledby="quake-heading" className={`${pageX} flex flex-col gap-3 py-6`}>
      <SectionTitle id="quake-heading" icon={<Pulse size={20} weight="duotone" />}>
        {t('quake.title')}
      </SectionTitle>
      {!on ? (
        <p className="text-ink-muted">{t('quake.enable')}</p>
      ) : quakes.error ? (
        <SectionError source={SOURCES.usgs} onRetry={() => quakes.mutate()} />
      ) : !quakes.data ? (
        <LoadingNote>{t('map.quakeLoading')}</LoadingNote>
      ) : quakes.data.length === 0 ? (
        <p>{t('quake.none')}</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {quakes.data.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <span className="w-16 font-mono text-lg font-medium">M {formatNumber(q.mag, 1)}</span>
              <span className="font-mono text-ink-muted">{dateTimeFromMs(q.time)}</span>
              <span className="min-w-0 flex-1 basis-60">{q.place || t('quake.unknown')}</span>
              <a href={q.url} target="_blank" rel="noopener noreferrer" className={`${textButton} ${linkClass}`}>
                {t('quake.view')}
                <span className="sr-only"> {t('common.newTab')}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
