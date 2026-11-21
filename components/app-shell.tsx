'use client'

import { GithubLogo, Info, MapPin, ShareNetwork } from '@phosphor-icons/react'
import { LiquidGlass } from '@vepando/liquid-glass-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { dateTimeFromMs } from '@/lib/format'
import { readLastSync } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { usePlaces } from '@/lib/places'
import { GITHUB_URL } from '@/lib/site'
import { pageX } from '@/lib/ui'
import { useMediaQuery, useOnline } from '@/lib/use-browser'
import { AboutSheet } from './about-sheet'
import { AskView } from './ask-view'
import { HomeView } from './home-view'
import { InfoSections } from './info-sections'
import { LanguageMenu } from './language-switcher'
import { Logo } from './logo'
import { MapView } from './map-view'
import { PlaceSheet, type SheetMode } from './place-sheet'
import { SiteFooter } from './site-footer'
import { TABS, type TabId } from './tabs'
import { TodayView } from './today-view'

const railTool =
  'grid size-14 place-items-center rounded-popup text-ink-muted transition-colors hover:bg-line/70 hover:text-accent'

export function AppShell() {
  const { t } = useT()
  const [tab, setTab] = useState<TabId>('today')
  const [sheet, setSheet] = useState<SheetMode>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
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

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const share = useCallback(async () => {
    const data = { title: t('share.title'), text: t('share.text'), url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(data.url)
      setToast(t('share.copied'))
    } catch {
      // The user dismissed the share sheet, or the clipboard is blocked.
    }
  }, [t])

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
    <div className="min-h-dvh pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-32">
      <header className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-30 mx-auto max-w-[1200px] px-3 lg:px-8">
        <LiquidGlass radius={28} tint="dark" className="text-ink">
          <div className="flex min-h-16 items-center justify-between gap-2 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Logo size={44} />
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl leading-tight tracking-tight">
                  {ready && current ? current.name : t('app.name')}
                </h1>
                <p className="truncate text-sm text-ink-muted">
                  {ready && current?.detail ? current.detail : t('app.tagline')}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {ready && current ? (
                <button
                  type="button"
                  onClick={() => setSheet('current')}
                  aria-label={t('nav.changePlace')}
                  className="flex min-h-11 items-center gap-1.5 rounded-popup px-3 text-sm font-medium text-ink transition-colors hover:bg-line/70"
                >
                  <MapPin size={20} weight="duotone" aria-hidden="true" className="text-accent" />
                  <span className="hidden sm:inline">{t('nav.changePlace')}</span>
                </button>
              ) : null}
              <LanguageMenu />
            </div>
          </div>
        </LiquidGlass>
      </header>

      {!online ? (
        <p role="status" className={`${pageX} border-b border-line bg-surface py-3`}>
          {t('offline.banner')}{' '}
          {lastSync ? t('offline.last', { time: dateTimeFromMs(lastSync) }) : t('offline.none')}
        </p>
      ) : null}

      <div className="mx-auto max-w-[1200px] pt-4">
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
            <MapView place={current} />
          ) : (
            ready ? <AskView place={current} onPick={() => setSheet('current')} /> : null
          )}
        </main>
      </div>

      {tab === 'today' ? <InfoSections /> : null}

      <SiteFooter onNavigate={setTab} onAbout={() => setAboutOpen(true)} onShare={share} />

      <LiquidGlass
        render={<nav aria-label={t('nav.label')} />}
        radius={32}
        tint="dark"
        className="!fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-4 lg:w-24 lg:-translate-y-1/2"
      >
        <div
          role="tablist"
          aria-orientation={isRail ? 'vertical' : 'horizontal'}
          className="grid grid-cols-4 lg:flex lg:flex-col lg:gap-1 lg:pt-2"
        >
          {TABS.map(({ id, labelKey, Icon }, index) => {
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
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-sm transition-colors lg:min-h-20 ${
                  selected ? 'font-medium text-accent' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon size={24} weight={selected ? 'fill' : 'duotone'} aria-hidden="true" />
                {t(labelKey)}
              </button>
            )
          })}
        </div>

        <div
          role="group"
          aria-label={t('nav.tools')}
          className="hidden flex-col items-center gap-1 border-t border-line/70 py-2 lg:flex"
        >
          <button type="button" onClick={share} aria-label={t('nav.share')} title={t('nav.share')} className={railTool}>
            <ShareNetwork size={22} weight="duotone" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            aria-label={t('nav.about')}
            title={t('nav.about')}
            className={railTool}
          >
            <Info size={22} weight="duotone" aria-hidden="true" />
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('nav.github')} ${t('common.newTab')}`}
            title={t('nav.github')}
            className={railTool}
          >
            <GithubLogo size={22} weight="fill" aria-hidden="true" />
          </a>
        </div>
      </LiquidGlass>

      {toast ? (
        <p
          role="status"
          className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-popup bg-ink px-4 py-3 text-sm text-surface shadow-float lg:bottom-6"
        >
          {toast}
        </p>
      ) : null}

      <PlaceSheet mode={sheet} onClose={() => setSheet(null)} />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
