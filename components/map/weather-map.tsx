'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { AdvancedMarker, AdvancedMarkerAnchorPoint, ControlPosition, Map, useMap } from '@vis.gl/react-google-maps'
import { MapPin } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { Coordinates } from '@/lib/types'
import { DEFAULT_ZOOM } from '@/lib/constants'

const AqiOverlay = dynamic(() => import('./aqi-overlay'), { ssr: false })
export type CameraTarget = { point: Coordinates; zoom: number }

type MapProps = {
  selected: Coordinates
  userPosition: Coordinates | null
  camera: CameraTarget | null
  onSelect: (coords: Coordinates) => void
  heatmap: boolean
  opacity: number
  onLayerError: (message: string) => void
  onReady: () => void
}

function MapCamera({ camera }: { camera: CameraTarget | null }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !camera) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) map.moveCamera({ center: camera.point, zoom: camera.zoom })
    else { map.panTo(camera.point); map.setZoom(camera.zoom) }
  }, [map, camera])
  return null
}

export default function WeatherMap({ selected, userPosition, camera, onSelect, heatmap, opacity, onLayerError, onReady }: MapProps) {
  const { theme } = useTheme()
  const initial = useRef({ point: selected, zoom: camera?.zoom ?? DEFAULT_ZOOM })
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID?.trim() || 'DEMO_MAP_ID'

  return <Map
    defaultCenter={initial.current.point} defaultZoom={initial.current.zoom} mapId={mapId}
    gestureHandling="greedy" disableDefaultUI zoomControl clickableIcons={false} reuseMaps
    zoomControlOptions={{ position: ControlPosition.RIGHT_CENTER }}
    colorScheme={theme === 'dark' ? 'DARK' : theme === 'light' ? 'LIGHT' : 'FOLLOW_SYSTEM'}
    onClick={event => { if (event.detail.latLng) onSelect(event.detail.latLng) }} onTilesLoaded={onReady}
  >
    <MapCamera camera={camera} />
    {heatmap && <AqiOverlay opacity={opacity} onError={onLayerError} />}
    {userPosition && <AdvancedMarker position={userPosition} title="Vị trí của bạn" anchorPoint={AdvancedMarkerAnchorPoint.CENTER} zIndex={1}>
      <span className="wx-user-dot" />
    </AdvancedMarker>}
    <AdvancedMarker position={selected} title="Điểm đang xem · kéo để chọn vị trí khác" draggable zIndex={2}
      onDragEnd={event => { if (event.latLng) onSelect(event.latLng.toJSON()) }}>
      <span className="wx-map-pin"><MapPin aria-hidden="true" size={24} /></span>
    </AdvancedMarker>
  </Map>
}
