'use client'

import { MapPin } from '@phosphor-icons/react'
import { useT } from '@/lib/i18n'
import type { Place } from '@/lib/places'
import { outlineButton, pageX } from '@/lib/ui'
import { weatherCopy } from '@/lib/weather-copy'
import { WeatherDetails } from './weather-details'
import { WeatherQuestion } from './weather-question'

const hanoi = { id: 'hanoi', name: 'Hà Nội', detail: '', lat: 21.03, lon: 105.85 }

export function AskView({ place, onPick }: { place: Place | null; onPick: () => void }) {
  const { t, lang } = useT()
  const location = place ?? hanoi
  return (
    <section className={`${pageX} flex flex-col gap-5 pb-8 pt-4 sm:pt-6`} aria-labelledby="ask-heading">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
            <MapPin size={17} weight="fill" aria-hidden="true" />
            {place ? [place.name, place.detail].filter(Boolean).join(' · ') : weatherCopy[lang].defaultLocation}
          </p>
          <h2 id="ask-heading" className="font-display text-3xl tracking-tight sm:text-4xl">{t('ask.title')}</h2>
          <p className="max-w-prose text-sm text-ink-muted sm:text-base">{t('ask.p1')}</p>
        </div>
        <button type="button" onClick={onPick} className={`${outlineButton} text-sm`}>{t('nav.changePlace')}</button>
      </header>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <WeatherDetails lat={location.lat} lon={location.lon} />
        <WeatherQuestion key={`${location.id}:${lang}`} lat={location.lat} lon={location.lon} placeName={location.name} />
      </div>
    </section>
  )
}
