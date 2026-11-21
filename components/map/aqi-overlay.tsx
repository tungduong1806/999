'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { GoogleMapsOverlay } from '@deck.gl/google-maps'
import { TileLayer } from '@deck.gl/geo-layers'
import { BitmapLayer } from '@deck.gl/layers'
import { VIETNAM_EXTENT } from '@/lib/constants'

export default function AqiOverlay({ opacity, onError }: { opacity: number; onError: (message: string) => void }) {
  const map = useMap()
  const overlay = useRef<GoogleMapsOverlay | null>(null)

  useEffect(() => {
    if (!map) return
    const instance = new GoogleMapsOverlay({ interleaved: false, useDevicePixels: false, layers: [] })
    overlay.current = instance
    instance.setMap(map)
    return () => { overlay.current = null; instance.setMap(null); instance.finalize() }
  }, [map])

  useEffect(() => {
    if (!overlay.current) return
    overlay.current.setProps({ layers: [new TileLayer<ImageBitmap | null>({
      id: 'air-quality-tiles', data: '/api/aqi-tiles/US_AQI/{z}/{x}/{y}',
      tileSize: 256, minZoom: 5, visibleMinZoom: 5, maxZoom: 16, extent: VIETNAM_EXTENT,
      maxRequests: 4, maxCacheSize: 24, debounceTime: 180, refinementStrategy: 'no-overlap',
      getTileData: async ({ url, signal }) => {
        if (!url) return null
        const response = await fetch(url, { signal })
        if (response.status === 404) return null
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error?.message ?? 'Không tải được lớp chất lượng không khí.')
        }
        return createImageBitmap(await response.blob())
      },
      onTileError: error => { if (error.name !== 'AbortError') onError(error.message) },
      onTileUnload: tile => tile.content?.close(),
      renderSubLayers: props => {
        if (!props.data) return null
        const bbox = props.tile.bbox
        if (!('west' in bbox)) return null
        return new BitmapLayer({ ...props, data: undefined, image: props.data, bounds: [bbox.west, bbox.south, bbox.east, bbox.north], opacity })
      },
    })] })
  }, [map, onError, opacity])

  return null
}
