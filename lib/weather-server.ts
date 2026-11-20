import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { forecastGrid, type Forecast, type ForecastHour } from './weather-contract'

const HOUR = 60 * 60 * 1000
const FRESH_FOR = 3 * HOUR
const STALE_FOR = 9 * HOUR

export const coordinatesSchema = z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) })

const metResponse = z.object({
  properties: z.object({
    meta: z.object({ updated_at: z.iso.datetime() }),
    timeseries: z.array(z.object({
      time: z.iso.datetime(),
      data: z.object({
        instant: z.object({ details: z.object({
          air_temperature: z.number(),
          apparent_air_temperature: z.number().optional(),
          relative_humidity: z.number().optional(),
          wind_speed: z.number().optional(),
          ultraviolet_index_clear_sky: z.number().optional(),
        }) }),
        next_1_hours: z.object({ details: z.object({
          precipitation_amount: z.number().optional(),
          probability_of_precipitation: z.number().optional(),
        }) }).optional(),
      }),
    })).nonempty(),
  }),
})

const snapshotSchema = z.object({
  modelUpdatedAt: z.iso.datetime(),
  hours: z.array(z.object({
    time: z.iso.datetime(),
    temperature: z.number(),
    feelsLike: z.number().nullable(),
    humidity: z.number().nullable(),
    windKmh: z.number().nullable(),
    rainMm: z.number().nullable(),
    rainChance: z.number().nullable(),
    clearSkyUv: z.number().nullable(),
  })).nonempty(),
})
type Snapshot = z.infer<typeof snapshotSchema>

type ForecastRow = { grid_key: string; payload: Snapshot; fetched_at: string }
type WeatherDatabase = {
  public: {
    Tables: {
      weather_forecast_cache: {
        Row: ForecastRow
        Insert: ForecastRow
        Update: Partial<ForecastRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: { take_weather_ai_slot: { Args: never; Returns: boolean } }
  }
}

let db: ReturnType<typeof createClient<WeatherDatabase>> | undefined
function weatherDatabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  db ??= createClient<WeatherDatabase>(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  return db
}

export async function takeWeatherAiSlot(signal: AbortSignal) {
  const client = weatherDatabase()
  if (!client) throw new Error('Forecast quota unavailable')
  const { data, error } = await client.rpc('take_weather_ai_slot').abortSignal(signal)
  if (error || typeof data !== 'boolean') throw new Error('Forecast quota unavailable')
  return data
}

async function requestForecast(lat: number, lon: number): Promise<Snapshot> {
  const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/complete')
  url.search = new URLSearchParams({ lat: lat.toFixed(2), lon: lon.toFixed(2) }).toString()
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ThoSach/1.0 (https://github.com/tungduong1806/999)', Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
    // Deduplicate requests when the database is cold or unavailable.
    next: { revalidate: FRESH_FOR / 1000 },
  })
  if (!response.ok) throw new Error(`MET Norway API returned ${response.status}`)
  const { properties } = metResponse.parse(await response.json())
  const hours = properties.timeseries.slice(0, 72).map(({ time, data }): ForecastHour => {
    const current = data.instant.details
    const next = data.next_1_hours?.details
    return {
      time,
      temperature: current.air_temperature,
      feelsLike: current.apparent_air_temperature ?? null,
      humidity: current.relative_humidity ?? null,
      windKmh: current.wind_speed == null ? null : Math.round(current.wind_speed * 36) / 10,
      rainMm: next?.precipitation_amount ?? null,
      rainChance: next?.probability_of_precipitation ?? null,
      clearSkyUv: current.ultraviolet_index_clear_sky ?? null,
    }
  })
  return { modelUpdatedAt: properties.meta.updated_at, hours }
}

function projectForecast(snapshot: Snapshot, now: number, cached: boolean, stale: boolean): Forecast | null {
  const start = Math.floor(now / HOUR) * HOUR
  const hours = snapshot.hours.filter(({ time }) => {
    const timestamp = Date.parse(time)
    return timestamp >= start && timestamp < start + 24 * HOUR
  })
  return hours.length && Date.parse(hours[0].time) <= start + HOUR
    ? { modelUpdatedAt: snapshot.modelUpdatedAt, hours, cached, stale }
    : null
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const grid = forecastGrid(lat, lon)
  const gridKey = `${grid.lat.toFixed(2)},${grid.lon.toFixed(2)}`
  const client = weatherDatabase()
  const now = Date.now()
  let fallback: Forecast | null = null
  if (client) {
    const { data, error } = await client.from('weather_forecast_cache').select('payload, fetched_at')
      .eq('grid_key', gridKey).abortSignal(AbortSignal.timeout(2_500)).maybeSingle()
    if (error) console.warn('Weather cache read unavailable', error.code)
    if (data) {
      const snapshot = snapshotSchema.safeParse(data.payload)
      const age = now - Date.parse(data.fetched_at)
      if (snapshot.success && age < STALE_FOR) {
        const forecast = projectForecast(snapshot.data, now, true, age >= FRESH_FOR)
        if (forecast && !forecast.stale) return forecast
        fallback = forecast
      }
    }
  }

  try {
    const snapshot = await requestForecast(grid.lat, grid.lon)
    const forecast = projectForecast(snapshot, now, false, false)
    if (!forecast) throw new Error('Forecast has no upcoming hours')
    if (client) {
      const { error } = await client.from('weather_forecast_cache')
        .upsert({ grid_key: gridKey, payload: snapshot, fetched_at: new Date(now).toISOString() })
        .abortSignal(AbortSignal.timeout(2_500))
      if (error) console.warn('Weather cache write unavailable', error.code)
    }
    return forecast
  } catch (error) {
    if (fallback) return fallback
    throw error
  }
}
