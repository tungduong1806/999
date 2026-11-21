import { getGoogleWeather } from '@/lib/google-weather'
import { proxyCoordinates, proxyError } from '@/lib/google-proxy'
import { coordinatesSchema, getForecast } from '@/lib/weather-server'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  if (params.has('lng') && !params.has('lon')) {
    try {
      const data = await getGoogleWeather(proxyCoordinates(request))
      return Response.json(data, { headers: { 'Cache-Control': 'private, max-age=60' } })
    } catch (error) {
      return proxyError(error)
    }
  }
  const lat = params.get('lat')?.trim()
  const lon = params.get('lon')?.trim()
  const parsed = coordinatesSchema.safeParse({ lat: lat ? Number(lat) : undefined, lon: lon ? Number(lon) : undefined })
  if (!parsed.success) return Response.json({ error: 'invalid_coordinates' }, { status: 400 })

  try {
    const data = await getForecast(parsed.data.lat, parsed.data.lon)
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'forecast_unavailable' }, { status: 503 })
  }
}
