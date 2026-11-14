import { getLang, localeOf, translate, type TKey } from './i18n'

export const TZ = 'Asia/Ho_Chi_Minh'

const numberFormats = new Map<string, Intl.NumberFormat>()

/** Number format for the active language (vi: decimal comma, en/ja: decimal point). */
export function formatNumber(value: number, fractionDigits = 1): string {
  const locale = localeOf()
  const key = `${locale}:${fractionDigits}`
  let nf = numberFormats.get(key)
  if (!nf) {
    nf = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    })
    numberFormats.set(key, nf)
  }
  return nf.format(value)
}

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function partsOf(ms: number) {
  const parts: Record<string, string> = {}
  for (const p of partsFormatter.formatToParts(new Date(ms))) {
    if (p.type !== 'literal') parts[p.type] = p.value
  }
  return parts
}

/** HH:mm in Asia/Ho_Chi_Minh from epoch milliseconds. */
export function hhmmFromMs(ms: number): string {
  const p = partsOf(ms)
  return `${p.hour}:${p.minute}`
}

/** HH:mm from an Open-Meteo local ISO string such as 2026-11-14T08:00. */
export function hhmmFromIso(iso: string): string {
  return iso.slice(11, 16)
}

/** dd/MM HH:mm in Asia/Ho_Chi_Minh from epoch milliseconds. */
export function dateTimeFromMs(ms: number): string {
  const p = partsOf(ms)
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`
}

/** Local YYYY-MM-DDTHH:00 key for the current hour in Asia/Ho_Chi_Minh. */
export function currentHourKey(nowMs = Date.now()): string {
  const p = partsOf(nowMs)
  return `${p.year}-${p.month}-${p.day}T${p.hour}:00`
}

/** Local YYYY-MM-DD for today in Asia/Ho_Chi_Minh. */
export function todayKey(nowMs = Date.now()): string {
  return currentHourKey(nowMs).slice(0, 10)
}

/** Short weekday in the active language for a YYYY-MM-DD string. */
export function weekdayShort(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`)
  return translate(getLang(), `wd.${d.getUTCDay()}` as TKey)
}

/** dd/MM from a YYYY-MM-DD string. */
export function dayMonth(dateKey: string): string {
  return `${dateKey.slice(8, 10)}/${dateKey.slice(5, 7)}`
}
