'use client'

import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ChevronDown, ChevronUp, CloudSun, Compass, Crosshair, Globe2, MapPin, Monitor, Moon, Sun, WifiOff } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useGeolocation } from '@/hooks/use-geolocation'
import { usePlaceName } from '@/hooks/use-place-name'
import { CITIES, DEFAULT_PLACE, DEFAULT_ZOOM, LOCATE_ZOOM, readCoordinates } from '@/lib/constants'
import { coordinateLabel } from '@/lib/format'
import type { Coordinates, SelectedPlace } from '@/lib/types'
import { LayerControls } from './map/layer-controls'
import { LocateButton } from './map/locate-button'
import { PlaceSearch, saveRecent } from './map/place-search'
import type { CameraTarget } from './map/weather-map'
import { ForecastPanel, PanelPeek } from './weather/forecast-panel'
import { MapSkeleton } from './weather/skeletons'

const WeatherMap = dynamic(() => import('./map/weather-map'), { ssr: false, loading: () => <MapSkeleton /> })
const PUBLIC_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
const PEEK = 0.33
const FULL = 1
const mobileMedia = '(max-width: 767px)'

function subscribeMobile(update: () => void) {
  const media = window.matchMedia(mobileMedia)
  media.addEventListener('change', update)
  return () => media.removeEventListener('change', update)
}

function subscribeOnline(update: () => void) {
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
  return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
}

function ThemeControl() {
  const { theme, setTheme } = useTheme()
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const label = next === 'light' ? 'Giao diện sáng' : next === 'dark' ? 'Giao diện tối' : 'Giao diện theo hệ thống'
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  return <Tooltip>
    <TooltipTrigger render={<Button variant="outline" size="icon" className="wx-theme-toggle" onClick={() => setTheme(next)} aria-label={label} />}><Icon /></TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
}

function AtlasHeader({ mapsEnabled, onSelect }: { mapsEnabled: boolean; onSelect: (place: SelectedPlace) => void }) {
  return <header className="wx-header">
    <div className="wx-brand"><span className="wx-brand-mark"><CloudSun size={23} aria-hidden="true" /></span><div><h1>Khí Việt</h1><p>Bản đồ thời tiết &amp; chất lượng không khí</p></div></div>
    <div className="wx-search"><PlaceSearch onSelect={onSelect} mapsEnabled={mapsEnabled} /></div>
    <div className="wx-header-end"><span className="wx-region"><Globe2 size={15} aria-hidden="true" /> Việt Nam</span><ThemeControl /></div>
  </header>
}

function MissingMap({ message, onSelect }: { message: string; onSelect: (place: SelectedPlace) => void }) {
  return <div className="wx-map-fallback">
    <div className="wx-map-grid" aria-hidden="true"><span /><span /><span /><Crosshair size={22} /></div>
    <div className="wx-map-unavailable" role="status">
      <span className="wx-map-symbol"><Compass size={30} aria-hidden="true" /></span>
      <span className="wx-eyebrow">Lớp bản đồ</span>
      <h2>Chưa kết nối Google Maps</h2>
      <p>{message}</p>
      <div className="wx-city-list" aria-label="Chọn thành phố nhanh">
        {CITIES.map(city => <Button key={city.name} variant="outline" onClick={() => { saveRecent(city); onSelect(city) }}><MapPin size={14} />{city.name}</Button>)}
      </div>
    </div>
  </div>
}

function WeatherWorkspace({ mapsError, hasEnvironmentKey }: { mapsError: string | null; hasEnvironmentKey: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const [shared] = useState(() => readCoordinates(params))
  const [place, setPlace] = useState<SelectedPlace>(shared ?? DEFAULT_PLACE)
  const [camera, setCamera] = useState<CameraTarget | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [snap, setSnap] = useState<number | string | null>(PEEK)
  const [showHeatmap, setShowHeatmap] = useState<boolean | null>(null)
  const [opacity, setOpacity] = useState(0.65)
  const [layerError, setLayerError] = useState<string | null>(null)
  const selectionRevision = useRef(0)
  const requestRevision = useRef(0)
  const mobile = useSyncExternalStore(subscribeMobile, () => window.matchMedia(mobileMedia).matches, () => false)
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)
  const mapsEnabled = Boolean(PUBLIC_KEY && !mapsError)
  const layerAvailable = mapsEnabled && hasEnvironmentKey && mapReady
  const heatmap = layerAvailable && (showHeatmap ?? !mobile)
  const name = usePlaceName(place, mapsEnabled)
  const displayName = name?.name ?? coordinateLabel(place)

  const select = useCallback((point: SelectedPlace, move: boolean, zoom = DEFAULT_ZOOM) => {
    selectionRevision.current++
    setPlace(point)
    if (move) setCamera({ point, zoom })
    const next = new URLSearchParams(window.location.search)
    next.set('lat', point.lat.toFixed(5))
    next.set('lng', point.lng.toFixed(5))
    router.replace(`?${next}`, { scroll: false })
  }, [router])

  const onLocate = useCallback((point: Coordinates) => {
    if (requestRevision.current === selectionRevision.current) select(point, true, LOCATE_ZOOM)
  }, [select])
  const location = useGeolocation(!shared, onLocate)
  const locate = () => { requestRevision.current = selectionRevision.current; location.locate() }
  const selectFromSearch = (point: SelectedPlace) => select(point, true, LOCATE_ZOOM)
  const selectFromMap = (point: Coordinates) => { saveRecent(point); select(point, false) }
  const onMapReady = useCallback(() => setMapReady(true), [])
  const locationFailed = ['denied', 'unavailable', 'timeout', 'insecure'].includes(location.status)
  const fallback = !mapsEnabled ? (mapsError ?? 'Chưa có khóa bản đồ. Thêm NEXT_PUBLIC_GOOGLE_MAPS_API_KEY trong Vars để mở bản đồ tương tác.') : null
  const panel = <ForecastPanel place={place} displayName={displayName} address={name?.address} />

  return <main className="wx-app">
    <AtlasHeader mapsEnabled={mapsEnabled} onSelect={selectFromSearch} />
    <section className="wx-workspace" aria-label="Bản đồ và dự báo">
      <div className="wx-map-frame" aria-label="Bản đồ thời tiết">
        {fallback ? <MissingMap message={fallback} onSelect={selectFromSearch} /> : <WeatherMap selected={place} userPosition={location.position} camera={camera} onSelect={selectFromMap} heatmap={heatmap} opacity={opacity} onLayerError={setLayerError} onReady={onMapReady} />}
        {!fallback && !mapReady && <MapSkeleton />}
      </div>
      <div className="wx-map-meta"><span className="wx-meta-dot" />{coordinateLabel(place)}</div>
      <div className="wx-map-actions">
        <LocateButton onLocate={locate} pending={location.status === 'prompting'} />
        <LayerControls enabled={layerAvailable} active={heatmap} opacity={opacity} onChange={value => { setLayerError(null); setShowHeatmap(value) }} onOpacity={setOpacity} error={layerError} />
      </div>
      <div className="wx-banners" aria-live="polite">
        {!online && <p className="wx-status-banner"><WifiOff size={16} /> Đang ngoại tuyến · Tự tải lại khi có mạng</p>}
        {locationFailed && <div className="wx-status-banner"><MapPin size={16} /><span><strong>Chưa lấy được vị trí</strong><small>{location.status === 'denied' ? 'Cho phép vị trí trong trình duyệt hoặc mở trang trực tiếp.' : 'Bạn vẫn có thể tìm và chọn địa điểm.'}</small></span><Button variant="outline" onClick={locate}>Thử lại</Button></div>}
      </div>
      {!mobile && <aside className="wx-panel" aria-label="Thông tin thời tiết"><div className="wx-panel-heading"><span className="wx-eyebrow"><i /> Tổng quan</span><span className="wx-panel-unit">Hệ mét · °C</span></div>{panel}</aside>}
      {mobile && <Drawer open modal={false} disablePointerDismissal snapPoints={[PEEK, FULL]} snapPoint={snap} onSnapPointChange={setSnap} showSwipeHandle>
        <DrawerContent className="wx-mobile-drawer" initialFocus={false} finalFocus={false}>
          <DrawerTitle className="sr-only">Thông tin thời tiết</DrawerTitle>
          <DrawerDescription className="sr-only">Kéo lên hoặc dùng nút mở rộng để xem dự báo chi tiết.</DrawerDescription>
          <div className="wx-drawer-heading"><PanelPeek place={place} displayName={displayName} /><Button variant="outline" size="icon" className="wx-map-icon" onClick={() => setSnap(snap === FULL ? PEEK : FULL)} aria-label={snap === FULL ? 'Thu gọn dự báo' : 'Mở rộng dự báo'}>{snap === FULL ? <ChevronDown /> : <ChevronUp />}</Button></div>
          <div className="wx-drawer-scroll">{panel}</div>
        </DrawerContent>
      </Drawer>}
    </section>
  </main>
}

export function WeatherApp({ hasEnvironmentKey }: { hasEnvironmentKey: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const fail = useCallback(() => setError('Kiểm tra khóa trình duyệt, HTTP referrer, thanh toán và Maps JavaScript API trong Google Cloud Console.'), [])
  useLayoutEffect(() => {
    if (!PUBLIC_KEY) return
    const globals = window as Window & { gm_authFailure?: () => void }
    const previous = globals.gm_authFailure
    globals.gm_authFailure = fail
    return () => { if (globals.gm_authFailure === fail) globals.gm_authFailure = previous }
  }, [fail])

  const workspace = <WeatherWorkspace mapsError={error} hasEnvironmentKey={hasEnvironmentKey} />
  return PUBLIC_KEY ? <APIProvider apiKey={PUBLIC_KEY} language="vi" region="VN" onError={fail}>{workspace}</APIProvider> : workspace
}
