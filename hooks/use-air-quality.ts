'use client'

import { useQuery } from '@tanstack/react-query'
import type { AirQualityData, Coordinates } from '@/lib/types'
import { forecastQuery } from './use-weather'

export function useAirQuality(point: Coordinates | null) {
  return useQuery(forecastQuery<AirQualityData | null>('air-quality', point))
}
