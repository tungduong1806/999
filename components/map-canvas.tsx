'use client'

import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent, RasterTileSource } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { dateTimeFromMs, formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { Quake } from '@/lib/data'

type Props = {
  /** Tile URL template of the selected radar frame, or null when the layer is off. */
  radarTiles: string | null
  /** Quakes to draw, or null when the layer is off. */
  quakes: Quake[] | null
  onFailed: () => void
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const RADAR_SOURCE = 'radar'
const QUAKE_SOURCE = 'quakes'

export default function MapCanvas({ radarTiles, quakes, onFailed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const onFailedRef = useRef(onFailed)
  const [ready, setReady] = useState(false)
  const { t } = useT()
  const tRef = useRef(t)

  useEffect(() => {
    onFailedRef.current = onFailed
    tRef.current = t
  }, [onFailed, t])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let loaded = false
    // Turbopack cannot bundle the MapLibre worker, so serve it from /public.
    maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
    const narrow = window.matchMedia('(max-width: 767px)').matches
    let map: MapLibreMap
    try {
      map = new maplibregl.Map({
        container,
        style: STYLE_URL,
        center: [106.2, 16.2],
        zoom: narrow ? 4.2 : 5,
        minZoom: 3,
        maxZoom: 12,
        attributionControl: { compact: true },
        cooperativeGestures: false,
      })
    } catch {
      onFailedRef.current()
      return
    }
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      loaded = true
      map.addSource(QUAKE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: QUAKE_SOURCE,
        type: 'circle',
        source: QUAKE_SOURCE,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 3, 6, 5, 12, 7, 24],
          'circle-color': '#c2412d',
          'circle-opacity': 0.7,
          'circle-stroke-color': '#161b1f',
          'circle-stroke-width': 1.5,
        },
      })

      map.on('mouseenter', QUAKE_SOURCE, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', QUAKE_SOURCE, () => {
        map.getCanvas().style.cursor = ''
      })
      map.on('click', QUAKE_SOURCE, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return
        const { mag, place, time, url } = feature.properties as {
          mag: number
          place: string
          time: number
          url: string
        }
        const root = document.createElement('div')
        const title = document.createElement('p')
        title.className = 'font-medium'
        title.textContent = tRef.current('quake.popup', { mag: formatNumber(mag, 1) })
        const where = document.createElement('p')
        where.textContent = place || tRef.current('quake.unknown')
        const when = document.createElement('p')
        when.className = 'font-mono text-ink-muted'
        when.textContent = dateTimeFromMs(time)
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.className = 'underline underline-offset-4'
        link.textContent = `${tRef.current('quake.view')} ${tRef.current('common.newTab')}`
        root.append(title, where, when, link)
        new maplibregl.Popup({ offset: 12, maxWidth: '280px' })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setDOMContent(root)
          .addTo(map)
      })

      setReady(true)
    })

    map.on('error', () => {
      if (!loaded) onFailedRef.current()
    })

    return () => {
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    if (!radarTiles) {
      if (map.getLayer(RADAR_SOURCE)) map.setLayoutProperty(RADAR_SOURCE, 'visibility', 'none')
      return
    }
    const existing = map.getSource(RADAR_SOURCE) as RasterTileSource | undefined
    if (existing) {
      existing.setTiles([radarTiles])
    } else {
      map.addSource(RADAR_SOURCE, {
        type: 'raster',
        tiles: [radarTiles],
        tileSize: 256,
        maxzoom: 7,
      })
      const firstLabel = map.getStyle().layers.find((l) => l.type === 'symbol')?.id
      map.addLayer(
        {
          id: RADAR_SOURCE,
          type: 'raster',
          source: RADAR_SOURCE,
          paint: { 'raster-opacity': 0.7 },
        },
        firstLabel,
      )
    }
    map.setLayoutProperty(RADAR_SOURCE, 'visibility', 'visible')
  }, [radarTiles, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const source = map.getSource(QUAKE_SOURCE) as GeoJSONSource | undefined
    if (!source) return
    source.setData({
      type: 'FeatureCollection',
      features: (quakes ?? []).map((q) => ({
        type: 'Feature',
        properties: { mag: q.mag, place: q.place, time: q.time, url: q.url },
        geometry: { type: 'Point', coordinates: [q.lon, q.lat] },
      })),
    })
    map.setLayoutProperty(QUAKE_SOURCE, 'visibility', quakes ? 'visible' : 'none')
  }, [quakes, ready])

  return (
    <div className="absolute inset-0" role="region" aria-label={t('map.region')}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
