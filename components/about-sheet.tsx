'use client'

import { Ambulance, FireTruck, Info, ShieldCheck, Siren, X } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import { useT } from '@/lib/i18n'
import { WEATHER_SOURCE, WEATHER_SOURCE_URL } from '@/lib/weather-contract'

type Props = {
  open: boolean
  onClose: () => void
}

const SOURCES = [
  { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
  { name: WEATHER_SOURCE, href: WEATHER_SOURCE_URL },
  { name: 'OpenFreeMap', href: 'https://openfreemap.org/' },
  { name: 'OpenStreetMap', href: 'https://www.openstreetmap.org/copyright' },
  { name: 'RainViewer', href: 'https://www.rainviewer.com/' },
  { name: 'USGS', href: 'https://earthquake.usgs.gov/' },
] as const

export function AboutSheet({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useT()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const emergency = [
    { number: '113', label: t('about.police'), Icon: Siren },
    { number: '114', label: t('about.fire'), Icon: FireTruck },
    { number: '115', label: t('about.ambulance'), Icon: Ambulance },
  ]

  return (
    <dialog
      ref={ref}
      aria-labelledby="about-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="sheet fixed inset-0 m-0 mx-auto mt-auto h-fit max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-sheet bg-surface p-0 text-ink shadow-float lg:max-w-[720px]"
    >
      {open ? (
        <div className="flex flex-col gap-5 p-4 pb-8 sm:p-6 sm:pb-8">
          <div className="flex items-center justify-between gap-4">
            <h2 id="about-sheet-title" className="flex items-center gap-2 font-display text-xl leading-tight tracking-tight">
              <Info size={24} weight="duotone" aria-hidden="true" className="text-accent" />
              {t('about.title')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="grid size-11 place-items-center rounded-popup text-ink transition-colors hover:bg-line"
            >
              <X size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>

          <p className="text-pretty">{t('about.desc')}</p>

          <section aria-labelledby="about-sources" className="flex flex-col gap-2">
            <h3 id="about-sources" className="font-medium">
              {t('about.sources')}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-popup bg-line/60 px-3 text-sm transition-colors hover:bg-line"
                  >
                    {s.name}
                    <span className="sr-only"> {t('common.newTab')}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="about-emergency" className="flex flex-col gap-2">
            <h3 id="about-emergency" className="font-medium">
              {t('about.emergency')}
            </h3>
            <ul className="grid grid-cols-3 gap-2">
              {emergency.map(({ number, label, Icon }) => (
                <li key={number}>
                  <a
                    href={`tel:${number}`}
                    className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-popup bg-line/60 text-center transition-colors hover:bg-line"
                  >
                    <Icon size={22} weight="duotone" aria-hidden="true" className="text-accent" />
                    <span className="text-lg font-medium leading-none">{number}</span>
                    <span className="text-sm text-ink-muted">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="about-privacy" className="flex flex-col gap-1">
            <h3 id="about-privacy" className="flex items-center gap-2 font-medium">
              <ShieldCheck size={20} weight="duotone" aria-hidden="true" className="text-accent" />
              {t('about.privacy')}
            </h3>
            <p className="text-ink-muted">{t('about.privacyText')}</p>
          </section>

          <p className="text-sm text-ink-muted">{t('about.disclaimer')}</p>
        </div>
      ) : null}
    </dialog>
  )
}
