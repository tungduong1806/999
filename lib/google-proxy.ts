import { gridCoordinates, readCoordinates } from './constants'

export class GoogleServiceError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message) }
}

export function checkOrigin(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site')
  const origin = request.headers.get('origin')
  if ((fetchSite && !['same-origin', 'none'].includes(fetchSite)) || (origin && origin !== new URL(request.url).origin)) {
    throw new GoogleServiceError(403, 'ORIGIN_NOT_ALLOWED', 'Yêu cầu phải đến từ trang này.')
  }
}

export function proxyCoordinates(request: Request) {
  checkOrigin(request)
  const point = readCoordinates(new URL(request.url).searchParams)
  if (!point) throw new GoogleServiceError(400, 'INVALID_LOCATION', 'Tọa độ không hợp lệ.')
  return gridCoordinates(point)
}

export function environmentKey() {
  const key = process.env.GOOGLE_ENV_API_KEY?.trim()
  if (!key) throw new GoogleServiceError(503, 'MISSING_CONFIG', 'Chưa cấu hình GOOGLE_ENV_API_KEY.')
  return key
}

export function checkGoogleResponse(response: Response, api: string, missing: string) {
  if (response.ok) return
  if (response.status === 429) throw new GoogleServiceError(429, 'QUOTA_EXCEEDED', 'Hệ thống đang quá tải, thử lại sau.')
  if (response.status === 401 || response.status === 403) throw new GoogleServiceError(403, 'API_UNAVAILABLE', `Kiểm tra quyền của khóa và bật ${api} trong Google Cloud Console.`)
  if (response.status === 400 || response.status === 404) throw new GoogleServiceError(response.status, 'NO_COVERAGE', missing)
  throw new GoogleServiceError(502, 'UPSTREAM_UNAVAILABLE', 'Nguồn dữ liệu tạm thời không phản hồi. Vui lòng thử lại.')
}

export function proxyError(error: unknown) {
  const safe = error instanceof GoogleServiceError ? error : new GoogleServiceError(502, 'UPSTREAM_UNAVAILABLE', 'Nguồn dữ liệu tạm thời không phản hồi. Vui lòng thử lại.')
  return Response.json({ error: { code: safe.code, message: safe.message } }, { status: safe.status, headers: { 'Cache-Control': 'no-store' } })
}
