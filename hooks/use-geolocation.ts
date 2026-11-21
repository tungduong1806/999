'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Coordinates } from '@/lib/types'

export type LocationStatus = 'idle' | 'prompting' | 'granted' | 'denied' | 'unavailable' | 'timeout' | 'insecure'

export function useGeolocation(autoLocate: boolean, onLocate: (coords: Coordinates) => void) {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [position, setPosition] = useState<Coordinates | null>(null)
  const requestVersion = useRef(0)
  const didRequest = useRef(false)

  const locate = useCallback((onResult = onLocate) => {
    const version = ++requestVersion.current
    if (!window.isSecureContext) { setStatus('insecure'); return }
    if (!navigator.geolocation) { setStatus('unavailable'); return }
    const policy = (document as Document & { featurePolicy?: { allowsFeature: (feature: string) => boolean } }).featurePolicy
    if (policy?.allowsFeature('geolocation') === false) { setStatus('denied'); return }
    setStatus('prompting')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (version !== requestVersion.current) return
      const point = { lat: coords.latitude, lng: coords.longitude }
      setPosition(point)
      setStatus('granted')
      onResult(point)
    }, error => {
      if (version !== requestVersion.current) return
      if (error.code === 1) setPosition(null)
      setStatus(error.code === 1 ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable')
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 })
  }, [onLocate])

  useEffect(() => {
    if (!autoLocate || didRequest.current) return
    didRequest.current = true
    locate()
  }, [autoLocate, locate])

  useEffect(() => {
    if (!navigator.permissions || !window.isSecureContext) return
    let subscription: PermissionStatus | undefined
    let disposed = false
    const onChange = () => {
      if (subscription?.state === 'denied') {
        setStatus('denied')
        setPosition(null)
      } else {
        setStatus(previous => previous === 'denied' ? 'idle' : previous)
      }
    }
    navigator.permissions.query({ name: 'geolocation' }).then(permission => {
      if (disposed) return
      subscription = permission
      if (permission.state === 'denied' && autoLocate) onChange()
      permission.addEventListener('change', onChange)
    }).catch(() => {})
    return () => { disposed = true; subscription?.removeEventListener('change', onChange) }
  }, [autoLocate])

  return { status, position, locate }
}
