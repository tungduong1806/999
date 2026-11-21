'use client'

import { ChatCircleText, MapPin } from '@phosphor-icons/react'
import { useT } from '@/lib/i18n'
import type { Place } from '@/lib/places'
import { pageX, textButton } from '@/lib/ui'
import { weatherCopy } from '@/lib/weather-copy'
import { SectionTitle } from './states'
import { WeatherDetails } from './weather-details'
import { WeatherQuestion } from './weather-question'

const hanoi = { id: 'hanoi', name: 'Hà Nội', lat: 21.03, lon: 105.85 }

export function AskView({ place, onPick }: { place: Place | null; onPick: () => void }) {
  const { t, lang } = useT()
  const location = place ?? hanoi
  return (
    <section className={`${pageX} flex max-w-[560px] flex-col gap-4 py-10`} aria-labelledby="ask-heading">
      <SectionTitle id="ask-heading" icon={<ChatCircleText size={20} weight="duotone" />}>
        {t('ask.title')}
      </SectionTitle>
      <p className="text-lg text-pretty">{t('ask.p1')}</p>
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin size={17} weight="duotone" aria-hidden="true" className="shrink-0 text-accent" />
          {place ? [place.name, place.detail].filter(Boolean).join(' · ') : weatherCopy[lang].defaultLocation}
        </p>
        <button type="button" onClick={onPick} className={`${textButton} text-sm`}>{t('nav.changePlace')}</button>
      </div>
      <WeatherQuestion key={`${location.id}:${lang}`} lat={location.lat} lon={location.lon} placeName={location.name} />
      <WeatherDetails lat={location.lat} lon={location.lon} />
    </section>
  )
}
