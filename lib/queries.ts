'use client'

import useSWR from 'swr'
import {
  fetchAir,
  fetchProvinces,
  fetchQuakes,
  fetchRadar,
  fetchRiver,
  fetchWards,
  fetchWeather,
  searchPlaces,
} from './data'

const options = {
  shouldRetryOnError: false,
  revalidateOnFocus: false,
  revalidateIfStale: true,
} as const

export function useAir(lat: number, lon: number) {
  return useSWR(['air', lat, lon], () => fetchAir(lat, lon), options)
}

export function useWeather(lat: number, lon: number) {
  return useSWR(['weather', lat, lon], () => fetchWeather(lat, lon), options)
}

export function useRiver(lat: number, lon: number) {
  return useSWR(['river', lat, lon], () => fetchRiver(lat, lon), options)
}

export function useRadar(enabled: boolean) {
  return useSWR(enabled ? 'radar' : null, fetchRadar, options)
}

export function useQuakes(enabled: boolean) {
  return useSWR(enabled ? 'quakes' : null, fetchQuakes, options)
}

export function useProvinces() {
  return useSWR('provinces', fetchProvinces, options)
}

export function useWards(provinceCode: number | null) {
  return useSWR(provinceCode ? ['wards', provinceCode] : null, () => fetchWards(provinceCode!), options)
}

export function usePlaceSearch(query: string) {
  return useSWR(query.length >= 2 ? ['geo', query] : null, () => searchPlaces(query), options)
}
