'use client'

import { useSyncExternalStore } from 'react'

function subscribeOnline(listener: () => void) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  )
}

/** Matches a CSS media query; `serverValue` is used for the first render. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (listener) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', listener)
      return () => mql.removeEventListener('change', listener)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}
