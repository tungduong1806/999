import { checkGoogleResponse, checkOrigin, environmentKey, GoogleServiceError, proxyError } from '@/lib/google-proxy'

const tileTypes = new Set(['US_AQI', 'UAQI_RED_GREEN'])

export async function GET(request: Request, { params }: { params: Promise<{ type: string; z: string; x: string; y: string }> }) {
  try {
    checkOrigin(request)
    const { type, z, x, y } = await params
    const [zoom, column, row] = [Number(z), Number(x), Number(y)]
    if (!tileTypes.has(type) || ![z, x, y].every(value => /^(0|[1-9]\d{0,4})$/.test(value)) || zoom > 16 || column >= 2 ** zoom || row >= 2 ** zoom) {
      throw new GoogleServiceError(400, 'INVALID_TILE', 'Loại hoặc tọa độ ô bản đồ không hợp lệ.')
    }
    const image = await fetch(`https://airquality.googleapis.com/v1/mapTypes/${type}/heatmapTiles/${zoom}/${column}/${row}`, {
      headers: { 'X-Goog-Api-Key': environmentKey() }, cache: 'no-store', signal: AbortSignal.timeout(8000),
    })
    checkGoogleResponse(image, 'Air Quality API', 'Chưa có lớp AQI tại khu vực này.')
    if (!image.headers.get('content-type')?.startsWith('image/png')) throw new GoogleServiceError(502, 'INVALID_IMAGE', 'Nguồn dữ liệu không trả về ảnh AQI.')
    return new Response(image.body, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } })
  } catch (error) {
    return proxyError(error)
  }
}
