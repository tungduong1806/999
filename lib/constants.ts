export const DEFAULT_PLACE = { lat: 10.7769, lng: 106.7009, name: 'TP. Hồ Chí Minh' }
export const DEFAULT_ZOOM = 11
export const LOCATE_ZOOM = 12
export const VIETNAM_EXTENT: [number, number, number, number] = [101, 7.5, 118, 24]
export const CITIES = [DEFAULT_PLACE, { lat: 21.0285, lng: 105.8542, name: 'Hà Nội' }, { lat: 16.0544, lng: 108.2022, name: 'Đà Nẵng' }]

export function readCoordinates(params: Pick<URLSearchParams, 'get'>) {
  const lat = params.get('lat')?.trim()
  const lng = params.get('lng')?.trim()
  if (!lat || !lng || !/^[+-]?\d+(?:\.\d+)?$/.test(lat) || !/^[+-]?\d+(?:\.\d+)?$/.test(lng)) return null
  const point = { lat: Number(lat), lng: Number(lng) }
  return Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180 ? point : null
}

export function gridCoordinates({ lat, lng }: { lat: number; lng: number }) {
  return { lat: Number(lat.toFixed(2)), lng: Number(lng.toFixed(2)) }
}
