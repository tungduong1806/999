'use client'

import { useState } from 'react'
import { Cloud, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { Condition } from '@/lib/types'

export function WeatherIcon({ condition, size = 32 }: { condition: Condition; size?: number }) {
  const { resolvedTheme } = useTheme()
  const [failed, setFailed] = useState<string>()
  const src = condition.icon ? `${condition.icon}${resolvedTheme === 'dark' ? '_dark' : ''}.svg` : null
  const alt = condition.description ?? 'Trạng thái thời tiết'
  const Fallback = condition.description ? Cloud : condition.isDaytime ? Sun : Moon
  if (!src || failed === src) return <Fallback size={size} role="img" aria-label={alt} className="wx-weather-icon" />
  return <img src={src} alt={alt} width={size} height={size} onError={() => setFailed(src)} className="wx-weather-icon" />
}
