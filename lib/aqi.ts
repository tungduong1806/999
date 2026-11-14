export type AqiLevel = {
  id: 'tot' | 'trung-binh' | 'kem' | 'xau' | 'rat-xau' | 'nguy-hai'
  label: string
  /** Highest AQI value that still belongs to this level. */
  max: number
  bg: string
  fg: string
}

const INK = 'var(--color-ink)'
const WHITE = 'var(--color-surface)'

export const AQI_LEVELS: AqiLevel[] = [
  { id: 'tot', label: 'Tốt', max: 50, bg: 'var(--color-aqi-tot)', fg: INK },
  { id: 'trung-binh', label: 'Trung bình', max: 100, bg: 'var(--color-aqi-trung-binh)', fg: INK },
  { id: 'kem', label: 'Kém', max: 150, bg: 'var(--color-aqi-kem)', fg: INK },
  { id: 'xau', label: 'Xấu', max: 200, bg: 'var(--color-aqi-xau)', fg: WHITE },
  { id: 'rat-xau', label: 'Rất xấu', max: 300, bg: 'var(--color-aqi-rat-xau)', fg: WHITE },
  { id: 'nguy-hai', label: 'Nguy hại', max: Infinity, bg: 'var(--color-aqi-nguy-hai)', fg: WHITE },
]

export function aqiLevel(value: number): AqiLevel {
  const v = Math.round(value)
  return AQI_LEVELS.find((level) => v <= level.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1]
}

const ADVICE: Record<AqiLevel['id'], string> = {
  tot: 'Không khí tốt. Không cần khẩu trang lọc bụi.',
  'trung-binh':
    'Không khí ở mức chấp nhận được. Người nhạy cảm nên hạn chế ở ngoài trời quá lâu.',
  kem: 'Không khí kém. Đeo khẩu trang lọc bụi mịn nếu đi xe máy lâu.',
  xau: 'Không khí xấu. Đeo khẩu trang lọc bụi mịn khi ra ngoài và tránh tập thể dục ngoài trời.',
  'rat-xau':
    'Không khí rất xấu. Hạn chế ra ngoài. Nếu phải đi, đeo khẩu trang N95 hoặc tương đương.',
  'nguy-hai':
    'Không khí ở mức nguy hại. Ở trong nhà nếu có thể, đóng kín cửa và đeo khẩu trang N95 khi buộc phải ra ngoài.',
}

export function adviceFor(level: AqiLevel, cleanestRange: string | null): string {
  const base = ADVICE[level.id]
  const worthWaiting = level.id !== 'tot' && level.id !== 'trung-binh'
  if (worthWaiting && cleanestRange) {
    return `${base} Khung giờ sạch hơn trong ngày là ${cleanestRange}.`
  }
  return base
}

export type RiverState = {
  id: 'normal' | 'high' | 'extreme'
  label: string
  bg: string
}

export function riverState(ratio: number): RiverState {
  if (ratio > 3) {
    return { id: 'extreme', label: 'Cao bất thường', bg: 'var(--color-river-extreme)' }
  }
  if (ratio >= 1.5) {
    return { id: 'high', label: 'Cao hơn bình thường', bg: 'var(--color-river-high)' }
  }
  return { id: 'normal', label: 'Bình thường', bg: 'var(--color-river-normal)' }
}
