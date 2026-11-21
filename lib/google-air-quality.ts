import type { AirQualityData, Concentration, Coordinates } from './types'
import { checkGoogleResponse, environmentKey } from './google-proxy'

type GoogleAqi = {
  dateTime?: string
  indexes?: { code?: string; aqi?: number; category?: string; displayName?: string; dominantPollutant?: string; color?: { red?: number; green?: number; blue?: number } }[]
  pollutants?: { code?: string; displayName?: string; concentration?: { value?: number; units?: string } }[]
  healthRecommendations?: { generalPopulation?: string }
}

const units: Record<string, string> = { MICROGRAMS_PER_CUBIC_METER: 'µg/m³', PARTS_PER_BILLION: 'ppb' }

export async function getGoogleAirQuality({ lat, lng }: Coordinates): Promise<AirQualityData | null> {
  const response = await fetch('https://airquality.googleapis.com/v1/currentConditions:lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': environmentKey() },
    body: JSON.stringify({
      location: { latitude: lat, longitude: lng }, languageCode: 'vi', universalAqi: true,
      extraComputations: ['HEALTH_RECOMMENDATIONS', 'DOMINANT_POLLUTANT_CONCENTRATION', 'POLLUTANT_CONCENTRATION', 'LOCAL_AQI'],
    }),
    next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000),
  })
  if (response.status === 404 || response.status === 204) return null
  if (response.status === 400) {
    const body = await response.clone().json().catch(() => null)
    if (typeof body?.error?.message === 'string' && /not supported|no data|not available|coverage/i.test(body.error.message)) return null
  }
  checkGoogleResponse(response, 'Air Quality API', 'Chưa có dữ liệu chất lượng không khí cho vị trí này.')
  const data: GoogleAqi = await response.json()
  const index = data.indexes?.find(item => item.code && item.code !== 'uaqi' && typeof item.aqi === 'number') ?? data.indexes?.find(item => typeof item.aqi === 'number')
  if (typeof index?.aqi !== 'number') return null

  const concentration = (code: string): Concentration | null => {
    const hit = data.pollutants?.find(item => item.code === code)?.concentration
    return typeof hit?.value === 'number' ? { value: hit.value, unit: units[hit.units ?? ''] ?? '' } : null
  }
  const pollutant = data.pollutants?.find(item => item.code === index.dominantPollutant)
  const rgb = index.color && [index.color.red, index.color.green, index.color.blue].map(channel => Math.round(Math.min(1, Math.max(0, channel ?? 0)) * 255))
  return {
    updatedAt: data.dateTime ?? null, aqi: index.aqi,
    index: index.displayName ?? (index.code === 'uaqi' ? 'AQI toàn cầu' : 'AQI địa phương'),
    category: index.category ?? null, color: rgb ? `rgb(${rgb.join(', ')})` : null,
    pollutant: pollutant?.displayName ?? index.dominantPollutant?.toUpperCase() ?? null,
    pm25: concentration('pm25'), pm10: concentration('pm10'), advice: data.healthRecommendations?.generalPopulation ?? null,
  }
}
