import { getGoogleAirQuality } from '@/lib/google-air-quality'
import { proxyCoordinates, proxyError } from '@/lib/google-proxy'

export async function GET(request: Request) {
  try {
    const data = await getGoogleAirQuality(proxyCoordinates(request))
    return Response.json(data, { headers: { 'Cache-Control': 'private, max-age=300' } })
  } catch (error) {
    return proxyError(error)
  }
}
