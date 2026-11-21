import type { Coordinates, ForecastConditions, WeatherData } from './types'
import { checkGoogleResponse, environmentKey } from './google-proxy'

type Temperature = { degrees?: number }
type Part = {
  weatherCondition?: { iconBaseUri?: string; description?: { text?: string } }
  precipitation?: { probability?: { percent?: number; type?: string }; qpf?: { quantity?: number } }
  isDaytime?: boolean
}
type TimeZone = { timeZone?: { id?: string } }
type Current = TimeZone & Part & {
  currentTime?: string
  temperature?: Temperature
  feelsLikeTemperature?: Temperature
  relativeHumidity?: number
  uvIndex?: number
  cloudCover?: number
  thunderstormProbability?: number
  wind?: { speed?: { value?: number }; gust?: { value?: number }; direction?: { degrees?: number; cardinal?: string } }
  visibility?: { distance?: number }
  airPressure?: { meanSeaLevelMillibars?: number }
  currentConditionsHistory?: { maxTemperature?: Temperature; minTemperature?: Temperature }
}
type Hourly = TimeZone & { forecastHours?: (Part & { interval?: { startTime?: string }; temperature?: Temperature })[] }
type Daily = TimeZone & { forecastDays?: {
  displayDate?: { year: number; month: number; day: number }
  minTemperature?: Temperature; maxTemperature?: Temperature
  daytimeForecast?: Part; nighttimeForecast?: Part; fullDayForecast?: Part
}[] }

function condition(part: Part, isDaytime = part.isDaytime ?? true): ForecastConditions {
  const url = part.weatherCondition?.iconBaseUri
  return {
    icon: url && /^https:\/\/maps\.gstatic\.com\/weather\/[\w/-]+$/.test(url) ? url : null,
    description: part.weatherCondition?.description?.text ?? null,
    isDaytime,
    rain: part.precipitation?.probability?.percent ?? null,
    precipitationType: part.precipitation?.probability?.type ?? null,
  }
}

async function weatherRequest<T>(path: string, coords: Coordinates, key: string, revalidate: number, extra: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ 'location.latitude': String(coords.lat), 'location.longitude': String(coords.lng), unitsSystem: 'METRIC', languageCode: 'vi', ...extra })
  const response = await fetch(`https://weather.googleapis.com/v1/${path}?${query}`, {
    headers: { 'X-Goog-Api-Key': key }, next: { revalidate }, signal: AbortSignal.timeout(8000),
  })
  checkGoogleResponse(response, 'Weather API', 'Chưa có dữ liệu thời tiết cho vị trí này.')
  return response.json()
}

export async function getGoogleWeather(coords: Coordinates): Promise<WeatherData> {
  const key = environmentKey()
  const [current, hourly, daily] = await Promise.all([
    weatherRequest<Current>('currentConditions:lookup', coords, key, 600),
    weatherRequest<Hourly>('forecast/hours:lookup', coords, key, 1800, { hours: '24', pageSize: '24' }),
    weatherRequest<Daily>('forecast/days:lookup', coords, key, 3600, { days: '7', pageSize: '7' }),
  ])

  return {
    timeZone: current.timeZone?.id ?? hourly.timeZone?.id ?? daily.timeZone?.id ?? null,
    current: {
      ...condition(current), updatedAt: current.currentTime ?? null,
      temperature: current.temperature?.degrees ?? null, feelsLike: current.feelsLikeTemperature?.degrees ?? null,
      humidity: current.relativeHumidity ?? null, uv: current.uvIndex ?? null,
      clouds: current.cloudCover ?? null, thunder: current.thunderstormProbability ?? null,
      rainAmount: current.precipitation?.qpf?.quantity ?? null,
      wind: current.wind?.speed?.value ?? null, gust: current.wind?.gust?.value ?? null,
      windCardinal: current.wind?.direction?.cardinal ?? null, windDegrees: current.wind?.direction?.degrees ?? null,
      visibility: current.visibility?.distance ?? null, pressure: current.airPressure?.meanSeaLevelMillibars ?? null,
      pastHigh: current.currentConditionsHistory?.maxTemperature?.degrees ?? null,
      pastLow: current.currentConditionsHistory?.minTemperature?.degrees ?? null,
    },
    hours: (hourly.forecastHours ?? []).flatMap(hour => hour.interval?.startTime ? [{ ...condition(hour), time: hour.interval.startTime, temperature: hour.temperature?.degrees ?? null }] : []),
    days: (daily.forecastDays ?? []).flatMap(day => {
      if (!day.displayDate) return []
      const { year, month, day: dayOfMonth } = day.displayDate
      const daylight = day.daytimeForecast ?? day.fullDayForecast
      return [{
        date: [year, month, dayOfMonth].map(value => String(value).padStart(2, '0')).join('-'),
        high: day.maxTemperature?.degrees ?? null, low: day.minTemperature?.degrees ?? null,
        day: daylight ? condition(daylight, true) : null, night: day.nighttimeForecast ? condition(day.nighttimeForecast, false) : null,
      }]
    }),
  }
}
