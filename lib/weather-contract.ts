export const WEATHER_SOURCE = 'MET Norway'
export const WEATHER_SOURCE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/documentation'
export const WEATHER_ZONE = 'Asia/Ho_Chi_Minh'
export const QUESTION_LIMIT = 350

export type ForecastHour = {
  time: string
  temperature: number
  feelsLike: number | null
  humidity: number | null
  windKmh: number | null
  rainMm: number | null
  rainChance: number | null
  clearSkyUv: number | null
}

export type Forecast = {
  modelUpdatedAt: string
  cached: boolean
  stale: boolean
  hours: ForecastHour[]
}

export type WeatherAnswer = { modelUpdatedAt: string; stale: boolean } & (
  | { mode: 'ai'; answer: string }
  | { mode: 'forecast'; summary: { from: string; to: string; min: number; max: number; rainMm: number | null } }
)

export function forecastGrid(lat: number, lon: number) {
  return { lat: Number(lat.toFixed(2)), lon: Number(lon.toFixed(2)) }
}
