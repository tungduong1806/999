'use client'

import { ArrowUpRight } from '@phosphor-icons/react'
import { useT } from '@/lib/i18n'
import { textButton } from '@/lib/ui'

type Coordinates = { lat: number; lon: number }

const vietnamCenter: Coordinates = { lat: 16.2, lon: 106.2 }
const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim()
export const hasGoogleMapsEmbed = Boolean(embedKey)

export function GoogleMapsLink({ location }: { location: Coordinates | null }) {
  const { t } = useT()
  const url = new URL(location ? 'https://www.google.com/maps/search/' : 'https://www.google.com/maps/@')
  url.searchParams.set('api', '1')
  if (location) {
    url.searchParams.set('query', `${location.lat},${location.lon}`)
  } else {
    url.searchParams.set('map_action', 'map')
    url.searchParams.set('center', `${vietnamCenter.lat},${vietnamCenter.lon}`)
    url.searchParams.set('zoom', '5')
  }
  return (
    <a href={url.href} target="_blank" rel="noopener noreferrer" className={`${textButton} gap-1.5 text-sm`}>
      {t('map.openGoogle')}
      <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
      <span className="sr-only"> {t('common.newTab')}</span>
    </a>
  )
}

export function GoogleMapsEmbed({ location }: { location: Coordinates | null }) {
  const { t, lang } = useT()
  if (!embedKey) return null
  const center = location ?? vietnamCenter
  const url = new URL('https://www.google.com/maps/embed/v1/view')
  url.search = new URLSearchParams({
    key: embedKey,
    center: `${center.lat},${center.lon}`,
    zoom: location ? '13' : '5',
    language: lang,
  }).toString()
  return (
    <iframe
      src={url.href}
      title={t('map.googleEmbed')}
      className="absolute inset-0 size-full border-0"
      loading="lazy"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}
