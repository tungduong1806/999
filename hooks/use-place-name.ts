'use client'

import { useEffect, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import type { SelectedPlace } from '@/lib/types'

export function usePlaceName(place: SelectedPlace, enabled: boolean) {
  const geocoding = useMapsLibrary('geocoding')
  const { lat, lng, name, address } = place
  const key = `${lat},${lng}`
  const [result, setResult] = useState<{ key: string; name: string; address: string } | null>(null)

  useEffect(() => {
    if (!enabled || !geocoding || name) return
    let disposed = false
    const geocoder = new geocoding.Geocoder()
    geocoder.geocode({ location: { lat, lng }, language: 'vi', region: 'VN' }).then(({ results }) => {
      if (disposed || !results[0]) return
      const components = results[0].address_components
      const find = (...priority: string[]) => priority.map(type => components.find(component => component.types.includes(type))?.long_name).find(Boolean)
      const short = [...new Set([
        find('sublocality_level_1', 'administrative_area_level_3', 'sublocality'),
        find('administrative_area_level_2', 'locality'), find('administrative_area_level_1'),
      ].filter(Boolean))].join(', ')
      if (short) setResult({ key, name: short, address: results[0].formatted_address })
    }).catch(() => {})
    return () => { disposed = true }
  }, [enabled, geocoding, name, lat, lng, key])

  return name ? { name, address } : enabled && result?.key === key ? result : null
}
