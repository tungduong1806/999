'use client'

import { ChatCircleText, House, MapTrifold, Wind, type Icon } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { dateTimeFromMs } from '@/lib/format'
import { readLastSync } from '@/lib/data'
import { usePlaces } from '@/lib/places'
import { pageX, textButton } from '@/lib/ui'
import { useMediaQuery, useOnline } from '@/lib/use-browser'
import { AskView } from './ask-view'
import { HomeView } from './home-view'
import { Logo } from './logo'
import { MapView } from './map-view'
import { PlaceSheet, type SheetMode } from './place-sheet'
import { TodayView } from './today-view'

type TabId = 'today' | 'home' | 'map' | 'ask'

const TABS: { id: TabId; label: string; Icon: Icon }[] = [
  { id: 'today', label: 'Hôm nay', Icon: Wind },
  { id: 'home', label: 'Quê nhà', Icon: House },
  { id: 'map', label: 'Bản đồ', Icon: MapTrifold },
  { id: 'ask', label: 'Hỏi thăm', Icon: ChatCircleText },
]

export function AppShell() {
  const [tab, setTab] = useState<TabId>('today')
  const [sheet, setSheet] = useState<SheetMode>(null)
  const { current, ready } = usePlaces()
  const online = useOnline()
  const isRail = useMediaQuery('(min-width: 1024px)')
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    today: null,
    home: null,
    map: null,
    ask: null,
  })

  const [lastSync, setLastSync] = useState<number | null>(null)
  useEffect(() => {
    if (!online) setLastSync(readLastSync())
  }, [online])

  function onTabKeyDown(event: KeyboardEvent, index: number) {
    const next = isRail
      ? { ArrowDown: 1, ArrowUp: -1 }[event.key as 'ArrowDown' | 'ArrowUp']
      : { ArrowRight: 1, ArrowLeft: -1 }[event.key as 'ArrowRight' | 'ArrowLeft']
    let target: number | undefined
    if (next !== undefined) target = (index + next + TABS.length) % TABS.length
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = TABS.length - 1
    if (target === undefined) return
    event.preventDefault()
    const id = TABS[target].id
    setTab(id)
    tabRefs.current[id]?.focus()
  }

  return (
    <div className="min-h-dvh pb-20 lg:pb-0 lg:pl-24">
      <header className="sticky top-0 z-30 border-b border-line bg-ground">
        <div className={`${pageX} mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-4`}>
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={44} />
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl leading-tight tracking-tight">
                {ready && current ? current.name : 'Thở Sạch'}
              </h1>
              {ready && current?.detail ? (
                <p className="truncate text-sm text-ink-muted">{current.detail}</p>
              ) : null}
            </div>
          </div>
          {ready && current ? (
            <button type="button" onClick={() => setSheet('current')} className={textButton}>
              Đổi nơi
            </button>
          ) : null}
        </div>
      </header>

      {!online ? (
        <p role="status" className={`${pageX} border-b border-line bg-surface py-3`}>
          Bạn đang ngoại tuyến.{' '}
          {lastSync
            ? `Đang hiển thị số liệu lưu lần cuối lúc ${dateTimeFromMs(lastSync)}.`
            : 'Chưa có số liệu đã lưu để hiển thị.'}
        </p>
      ) : null}

      <div className="mx-auto max-w-[1200px]">
        <main
          key={tab}
          id={`panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="tab-fade"
        >
          {tab === 'today' ? (
            ready ? (
              <TodayView place={current} />
            ) : null
          ) : tab === 'home' ? (
            <HomeView onAdd={() => setSheet('home')} />
          ) : tab === 'map' ? (
            <MapView />
          ) : (
            <AskView />
          )}
        </main>
      </div>

      <nav
        aria-label="Các mục chính"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface lg:inset-y-0 lg:right-auto lg:w-24 lg:border-t-0 lg:border-r lg:bg-ground"
      >
        <div
          role="tablist"
          aria-orientation={isRail ? 'vertical' : 'horizontal'}
          className="grid grid-cols-4 lg:flex lg:flex-col lg:gap-2 lg:pt-20"
        >
          {TABS.map(({ id, label, Icon }, index) => {
            const selected = tab === id
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el
                }}
                id={`tab-${id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-sm lg:min-h-20 ${
                  selected ? 'font-medium text-accent' : 'text-ink-muted'
                }`}
              >
                <Icon size={24} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>
      </nav>

      <PlaceSheet mode={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}
