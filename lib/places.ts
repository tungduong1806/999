'use client'

import { useSyncExternalStore } from 'react'

export type Place = {
  id: string
  name: string
  /** Province or district shown under the name. */
  detail: string
  lat: number
  lon: number
}

type PlacesState = { current: Place | null; homes: Place[] }

export const MAX_HOMES = 3
const STORAGE_KEY = 'thosach:places:v1'
const EMPTY: PlacesState = { current: null, homes: [] }

const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cachedState: PlacesState = EMPTY

function read(): PlacesState {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }
  if (raw === cachedRaw) return cachedState
  cachedRaw = raw
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<PlacesState>) : null
    cachedState = {
      current: parsed?.current ?? null,
      homes: Array.isArray(parsed?.homes) ? parsed.homes.slice(0, MAX_HOMES) : [],
    }
  } catch {
    cachedState = EMPTY
  }
  return cachedState
}

function write(next: PlacesState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage blocked: keep working in memory for this session.
    cachedRaw = undefined
    cachedState = next
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function placeId(lat: number, lon: number) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

export function setCurrentPlace(place: Place) {
  write({ ...read(), current: place })
}

export function addHomePlace(place: Place) {
  const state = read()
  if (state.homes.length >= MAX_HOMES || state.homes.some((p) => p.id === place.id)) return
  write({ ...state, homes: [...state.homes, place] })
}

export function removeHomePlace(id: string) {
  const state = read()
  write({ ...state, homes: state.homes.filter((p) => p.id !== id) })
}

const SERVER: PlacesState | null = null

/** `ready` is false until localStorage has been read on the client. */
export function usePlaces(): PlacesState & { ready: boolean } {
  const state = useSyncExternalStore(subscribe, read, () => SERVER)
  if (state === null) return { ...EMPTY, ready: false }
  return { ...state, ready: true }
}
