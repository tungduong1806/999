import type { TKey } from './i18n'

export type AqiLevel = {
  id: 'tot' | 'trung-binh' | 'kem' | 'xau' | 'rat-xau' | 'nguy-hai'
  labelKey: TKey
  adviceKey: TKey
  /** Highest AQI value that still belongs to this level. */
  max: number
  bg: string
  fg: string
}

const INK = 'var(--color-ink)'
const WHITE = 'var(--color-surface)'

export const AQI_LEVELS: AqiLevel[] = [
  { id: 'tot', labelKey: 'aqi.tot', adviceKey: 'advice.tot', max: 50, bg: 'var(--color-aqi-tot)', fg: INK },
  {
    id: 'trung-binh',
    labelKey: 'aqi.trung-binh',
    adviceKey: 'advice.trung-binh',
    max: 100,
    bg: 'var(--color-aqi-trung-binh)',
    fg: INK,
  },
  { id: 'kem', labelKey: 'aqi.kem', adviceKey: 'advice.kem', max: 150, bg: 'var(--color-aqi-kem)', fg: INK },
  { id: 'xau', labelKey: 'aqi.xau', adviceKey: 'advice.xau', max: 200, bg: 'var(--color-aqi-xau)', fg: WHITE },
  {
    id: 'rat-xau',
    labelKey: 'aqi.rat-xau',
    adviceKey: 'advice.rat-xau',
    max: 300,
    bg: 'var(--color-aqi-rat-xau)',
    fg: WHITE,
  },
  {
    id: 'nguy-hai',
    labelKey: 'aqi.nguy-hai',
    adviceKey: 'advice.nguy-hai',
    max: Infinity,
    bg: 'var(--color-aqi-nguy-hai)',
    fg: WHITE,
  },
]

export function aqiLevel(value: number): AqiLevel {
  const v = Math.round(value)
  return AQI_LEVELS.find((level) => v <= level.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1]
}

/** Whether a cleaner time window is worth suggesting for this level. */
export function worthWaiting(level: AqiLevel): boolean {
  return level.id !== 'tot' && level.id !== 'trung-binh'
}

export type RiverState = {
  id: 'normal' | 'high' | 'extreme'
  labelKey: TKey
  bg: string
}

export function riverState(ratio: number): RiverState {
  if (ratio > 3) {
    return { id: 'extreme', labelKey: 'river.extreme', bg: 'var(--color-river-extreme)' }
  }
  if (ratio >= 1.5) {
    return { id: 'high', labelKey: 'river.high', bg: 'var(--color-river-high)' }
  }
  return { id: 'normal', labelKey: 'river.normal', bg: 'var(--color-river-normal)' }
}
