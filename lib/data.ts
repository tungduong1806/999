/**
 * Every network call of the app lives here, as typed functions, so a backend
 * can replace them later without touching the UI.
 */

export class DataError extends Error {
  source: string
  constructor(source: string) {
    super(`Chưa lấy được dữ liệu từ ${source}`)
    this.name = 'DataError'
    this.source = source
  }
}

export const SOURCES = {
  openMeteo: 'Open-Meteo',
  provinces: 'provinces.open-api.vn',
  rainViewer: 'RainViewer',
  usgs: 'USGS',
} as const

/* ------------------------------------------------------------------ */
/* Offline cache: only used when the browser reports it is offline.    */
/* ------------------------------------------------------------------ */

const CACHE_PREFIX = 'thosach:cache:'
export const LAST_SYNC_KEY = 'thosach:last-sync'

function readCache<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeCache(key: string, data: unknown) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data))
    window.localStorage.setItem(LAST_SYNC_KEY, String(Date.now()))
  } catch {
    // Storage full or blocked: caching is optional.
  }
}

export function readLastSync(): number | null {
  try {
    const raw = window.localStorage.getItem(LAST_SYNC_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

async function getJson<T>(url: string, source: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new DataError(source)
  }
  if (!res.ok) throw new DataError(source)
  try {
    return (await res.json()) as T
  } catch {
    throw new DataError(source)
  }
}

async function withCache<T>(key: string, run: () => Promise<T>): Promise<T> {
  try {
    const data = await run()
    writeCache(key, data)
    return data
  } catch (error) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const cached = readCache<T>(key)
      if (cached) return cached
    }
    throw error
  }
}

/* ------------------------------------------------------------------ */
/* Geocoding and provinces                                             */
/* ------------------------------------------------------------------ */

export type GeoResult = {
  id: number
  name: string
  admin1: string | null
  admin2: string | null
  lat: number
  lon: number
}

type GeocodingResponse = {
  results?: {
    id: number
    name: string
    admin1?: string
    admin2?: string
    latitude: number
    longitude: number
  }[]
}

export async function searchPlaces(query: string, count = 5): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=${count}&language=vi&countryCode=VN`
  const json = await getJson<GeocodingResponse>(url, SOURCES.openMeteo)
  return (json.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1 ?? null,
    admin2: r.admin2 ?? null,
    lat: r.latitude,
    lon: r.longitude,
  }))
}

export type Province = { code: number; name: string }
export type Ward = { code: number; name: string }

export async function fetchProvinces(): Promise<Province[]> {
  const json = await getJson<{ code: number; name: string }[]>(
    'https://provinces.open-api.vn/api/v2/',
    SOURCES.provinces,
  )
  return json
    .map((p) => ({ code: p.code, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

export async function fetchWards(provinceCode: number): Promise<Ward[]> {
  const json = await getJson<{ wards?: { code: number; name: string }[] }>(
    `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`,
    SOURCES.provinces,
  )
  return (json.wards ?? [])
    .map((w) => ({ code: w.code, name: w.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

const ADMIN_PREFIX = /^(Thành phố|Tỉnh|Phường|Xã|Đặc khu|Thị trấn)\s+/i

function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180
  const dLat = (bLat - aLat) * rad
  const dLon = (bLon - aLon) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export type ResolvedWard = { lat: number; lon: number; exact: boolean }

/**
 * The provinces API has no coordinates, so the ward is looked up by name and kept only
 * if it lies near its province. Otherwise the province centre is used and `exact` is false.
 */
export async function resolveWard(provinceName: string, wardName: string): Promise<ResolvedWard | null> {
  const [provinceHits, wardHits] = await Promise.all([
    searchPlaces(provinceName.replace(ADMIN_PREFIX, ''), 1),
    searchPlaces(wardName.replace(ADMIN_PREFIX, ''), 10),
  ])
  const province = provinceHits[0]
  if (!province) return null
  const near = wardHits
    .map((hit) => ({ hit, km: distanceKm(province.lat, province.lon, hit.lat, hit.lon) }))
    .filter((x) => x.km < 150)
    .sort((a, b) => a.km - b.km)[0]
  if (near) return { lat: near.hit.lat, lon: near.hit.lon, exact: true }
  return { lat: province.lat, lon: province.lon, exact: false }
}

/* ------------------------------------------------------------------ */
/* Air quality                                                         */
/* ------------------------------------------------------------------ */

export type AirHour = { time: string; aqi: number | null; pm25: number | null }
export type Air = {
  /** Local ISO time of the current reading, e.g. 2026-11-14T08:00 */
  time: string
  aqi: number
  pm25: number | null
  hourly: AirHour[]
}

type AirResponse = {
  current?: { time: string; us_aqi: number | null; pm2_5: number | null }
  hourly?: { time: string[]; pm2_5: (number | null)[]; us_aqi: (number | null)[] }
}

export function fetchAir(lat: number, lon: number): Promise<Air> {
  return withCache(`air:${lat.toFixed(3)},${lon.toFixed(3)}`, async () => {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,us_aqi&current=us_aqi,pm2_5&timezone=Asia/Ho_Chi_Minh&forecast_days=2`
    const json = await getJson<AirResponse>(url, SOURCES.openMeteo)
    const current = json.current
    const hourly = json.hourly
    if (!current || current.us_aqi == null || !hourly) throw new DataError(SOURCES.openMeteo)
    return {
      time: current.time,
      aqi: current.us_aqi,
      pm25: current.pm2_5,
      hourly: hourly.time.map((time, i) => ({
        time,
        aqi: hourly.us_aqi[i] ?? null,
        pm25: hourly.pm2_5[i] ?? null,
      })),
    }
  })
}

/* ------------------------------------------------------------------ */
/* Weather                                                             */
/* ------------------------------------------------------------------ */

export type WeatherHour = {
  time: string
  temperature: number | null
  rainChance: number | null
  wind: number | null
}
export type WeatherDay = { date: string; precipitation: number | null }
export type Weather = { hourly: WeatherHour[]; daily: WeatherDay[] }

type WeatherResponse = {
  hourly?: {
    time: string[]
    temperature_2m: (number | null)[]
    precipitation_probability: (number | null)[]
    wind_speed_10m: (number | null)[]
  }
  daily?: { time: string[]; precipitation_sum: (number | null)[] }
}

export function fetchWeather(lat: number, lon: number): Promise<Weather> {
  return withCache(`weather:${lat.toFixed(3)},${lon.toFixed(3)}`, async () => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=precipitation_sum&timezone=Asia/Ho_Chi_Minh&forecast_days=3`
    const json = await getJson<WeatherResponse>(url, SOURCES.openMeteo)
    if (!json.hourly || !json.daily) throw new DataError(SOURCES.openMeteo)
    const h = json.hourly
    const d = json.daily
    return {
      hourly: h.time.map((time, i) => ({
        time,
        temperature: h.temperature_2m[i] ?? null,
        rainChance: h.precipitation_probability[i] ?? null,
        wind: h.wind_speed_10m[i] ?? null,
      })),
      daily: d.time.map((date, i) => ({ date, precipitation: d.precipitation_sum[i] ?? null })),
    }
  })
}

/* ------------------------------------------------------------------ */
/* River discharge                                                     */
/* ------------------------------------------------------------------ */

export type RiverDay = { date: string; discharge: number | null; median: number | null }
export type River = { days: RiverDay[] }

type RiverResponse = {
  daily?: {
    time: string[]
    river_discharge: (number | null)[]
    river_discharge_median: (number | null)[]
  }
}

export function fetchRiver(lat: number, lon: number): Promise<River> {
  return withCache(`river:${lat.toFixed(3)},${lon.toFixed(3)}`, async () => {
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_median&past_days=3&forecast_days=7`
    const json = await getJson<RiverResponse>(url, SOURCES.openMeteo)
    const d = json.daily
    if (!d) throw new DataError(SOURCES.openMeteo)
    return {
      days: d.time.map((date, i) => ({
        date,
        discharge: d.river_discharge[i] ?? null,
        median: d.river_discharge_median[i] ?? null,
      })),
    }
  })
}

/* ------------------------------------------------------------------ */
/* Map layers                                                          */
/* ------------------------------------------------------------------ */

export type RadarFrame = { time: number; path: string; nowcast: boolean }
export type Radar = { host: string; frames: RadarFrame[]; nowIndex: number }

type RainViewerResponse = {
  host: string
  radar: {
    past: { time: number; path: string }[]
    nowcast?: { time: number; path: string }[]
  }
}

export async function fetchRadar(): Promise<Radar> {
  const json = await getJson<RainViewerResponse>(
    'https://api.rainviewer.com/public/weather-maps.json',
    SOURCES.rainViewer,
  )
  const past = json.radar?.past ?? []
  const nowcast = json.radar?.nowcast ?? []
  if (past.length === 0) throw new DataError(SOURCES.rainViewer)
  const frames: RadarFrame[] = [
    ...past.map((f) => ({ time: f.time * 1000, path: f.path, nowcast: false })),
    ...nowcast.map((f) => ({ time: f.time * 1000, path: f.path, nowcast: true })),
  ]
  return { host: json.host, frames, nowIndex: past.length - 1 }
}

export type Quake = {
  id: string
  mag: number
  place: string
  time: number
  url: string
  lon: number
  lat: number
}

type UsgsResponse = {
  features: {
    id: string
    properties: { mag: number | null; place: string | null; time: number; url: string }
    geometry: { coordinates: [number, number, number] }
  }[]
}

export async function fetchQuakes(): Promise<Quake[]> {
  return withCache('quakes', async () => {
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=8&maxlatitude=24&minlongitude=102&maxlongitude=110&minmagnitude=3&starttime=${start}`
    const json = await getJson<UsgsResponse>(url, SOURCES.usgs)
    return json.features
      .filter((f) => f.properties.mag != null)
      .map((f) => ({
        id: f.id,
        mag: f.properties.mag as number,
        place: f.properties.place ?? 'Không rõ vị trí',
        time: f.properties.time,
        url: f.properties.url,
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      }))
      .sort((a, b) => b.time - a.time)
  })
}
