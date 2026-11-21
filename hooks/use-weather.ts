'use client'

import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { gridCoordinates } from '@/lib/constants'
import type { Coordinates, WeatherData } from '@/lib/types'

export class ForecastRequestError extends Error {
  constructor(readonly code: string, message: string) { super(message) }
}

const TEN_MINUTES = 10 * 60 * 1000
const UNAVAILABLE = 'Không tải được dữ liệu. Vui lòng thử lại.'

export function forecastQuery<T>(kind: 'weather' | 'air-quality', point: Coordinates | null) {
  const coords = point ? gridCoordinates(point) : null
  return queryOptions({
    queryKey: [kind, coords?.lat, coords?.lng],
    queryFn: async ({ signal }): Promise<T> => {
      const response = await fetch(`/api/${kind}?lat=${coords!.lat}&lng=${coords!.lng}`, { signal })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ForecastRequestError(body?.error?.code ?? 'NETWORK', body?.error?.message ?? UNAVAILABLE)
      }
      return response.json()
    },
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES,
    refetchInterval: TEN_MINUTES,
    refetchOnWindowFocus: true,
    refetchOnReconnect: 'always',
    placeholderData: keepPreviousData,
    retry: (attempt, error) => attempt < 1 && !(error instanceof ForecastRequestError && ['INVALID_LOCATION', 'NO_COVERAGE', 'API_UNAVAILABLE', 'MISSING_CONFIG', 'QUOTA_EXCEEDED'].includes(error.code)),
    enabled: !!coords,
  })
}

export function useWeather(point: Coordinates | null) {
  return useQuery(forecastQuery<WeatherData>('weather', point))
}
