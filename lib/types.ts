export type Coordinates = { lat: number; lng: number }
export type SelectedPlace = Coordinates & { name?: string; address?: string; placeId?: string }

export type Condition = { icon: string | null; description: string | null; isDaytime: boolean }
export type ForecastConditions = Condition & { rain: number | null; precipitationType: string | null }
export type CurrentWeather = ForecastConditions & {
  updatedAt: string | null
  temperature: number | null
  feelsLike: number | null
  humidity: number | null
  uv: number | null
  clouds: number | null
  thunder: number | null
  rainAmount: number | null
  wind: number | null
  gust: number | null
  windCardinal: string | null
  windDegrees: number | null
  visibility: number | null
  pressure: number | null
  pastHigh: number | null
  pastLow: number | null
}
export type HourForecast = ForecastConditions & { time: string; temperature: number | null }
export type DailyForecast = {
  date: string
  high: number | null
  low: number | null
  day: ForecastConditions | null
  night: ForecastConditions | null
}
export type WeatherData = { timeZone: string | null; current: CurrentWeather; hours: HourForecast[]; days: DailyForecast[] }
export type Concentration = { value: number; unit: string }
export type AirQualityData = {
  updatedAt: string | null
  aqi: number
  index: string
  category: string | null
  color: string | null
  pollutant: string | null
  pm25: Concentration | null
  pm10: Concentration | null
  advice: string | null
}
