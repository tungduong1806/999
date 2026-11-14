'use client'

import { CaretDown, MagnifyingGlass, MapPin } from '@phosphor-icons/react'
import { useEffect, useId, useState } from 'react'
import { resolveWard, SOURCES } from '@/lib/data'
import { useT } from '@/lib/i18n'
import { placeId, type Place } from '@/lib/places'
import { usePlaceSearch, useProvinces, useWards } from '@/lib/queries'
import { fieldClass, primaryButton } from '@/lib/ui'
import { LoadingNote, SectionError } from './states'

type Props = {
  onPick: (place: Place) => void
}

export function PlacePicker({ onPick }: Props) {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-6">
      <NameSearch onPick={onPick} />
      <details className="group rounded-popup bg-line/40 px-3">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <MapPin size={20} weight="duotone" aria-hidden="true" className="text-accent" />
            {t('picker.or')}
          </span>
          <CaretDown
            size={18}
            weight="bold"
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="pb-4 pt-2">
          <AdministrativePick onPick={onPick} />
        </div>
      </details>
    </div>
  )
}

function NameSearch({ onPick }: Props) {
  const { t } = useT()
  const id = useId()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data, error, isLoading, mutate } = usePlaceSearch(debounced)
  const waiting = query.trim() !== debounced && query.trim().length >= 2

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`${id}-q`} className="font-medium">
        {t('picker.name')}
      </label>
      <div className="relative">
        <MagnifyingGlass
          size={20}
          weight="bold"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          id={`${id}-q`}
          type="text"
          inputMode="search"
          autoComplete="off"
          value={query}
          placeholder={t('picker.placeholder')}
          onChange={(e) => setQuery(e.target.value)}
          aria-describedby={`${id}-help`}
          className={`${fieldClass} pl-10`}
        />
      </div>
      <p id={`${id}-help`} className="text-sm text-ink-muted">
        {t('picker.help')}
      </p>

      <div aria-live="polite">
        {error ? (
          <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
        ) : waiting || isLoading ? (
          <LoadingNote>{t('picker.searching')}</LoadingNote>
        ) : data && data.length === 0 ? (
          <p>{t('picker.none', { query: debounced })}</p>
        ) : data ? (
          <ul className="flex flex-col gap-1">
            {data.map((r) => {
              const detail = [r.admin2, r.admin1].filter(Boolean).join(', ')
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onPick({
                        id: placeId(r.lat, r.lon),
                        name: r.name,
                        detail,
                        lat: r.lat,
                        lon: r.lon,
                      })
                    }
                    className="flex min-h-14 w-full items-center gap-3 rounded-popup px-3 py-2 text-left transition-colors hover:bg-line"
                  >
                    <MapPin size={20} weight="duotone" aria-hidden="true" className="shrink-0 text-accent" />
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium">{r.name}</span>
                      {detail ? <span className="text-sm text-ink-muted">{detail}</span> : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function AdministrativePick({ onPick }: Props) {
  const { t } = useT()
  const id = useId()
  const [provinceCode, setProvinceCode] = useState<number | null>(null)
  const [wardCode, setWardCode] = useState<number | null>(null)
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState(false)

  const provinces = useProvinces()
  const wards = useWards(provinceCode)

  const province = provinces.data?.find((p) => p.code === provinceCode)
  const ward = wards.data?.find((w) => w.code === wardCode)

  async function confirm() {
    if (!province || !ward) return
    setResolving(true)
    setResolveError(false)
    try {
      const found = await resolveWard(province.name, ward.name)
      if (!found) {
        setResolveError(true)
        return
      }
      onPick({
        id: placeId(found.lat, found.lon),
        name: ward.name,
        detail: found.exact ? province.name : t('picker.approx', { province: province.name }),
        lat: found.lat,
        lon: found.lon,
      })
    } catch {
      setResolveError(true)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-p`} className="font-medium">
          {t('picker.province')}
        </label>
        <select
          id={`${id}-p`}
          value={provinceCode ?? ''}
          onChange={(e) => {
            setProvinceCode(e.target.value ? Number(e.target.value) : null)
            setWardCode(null)
            setResolveError(false)
          }}
          disabled={provinces.isLoading || !!provinces.error}
          className={fieldClass}
        >
          <option value="">{provinces.isLoading ? t('picker.loadingList') : t('picker.selectProvince')}</option>
          {provinces.data?.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
        {provinces.error ? (
          <SectionError source={SOURCES.provinces} onRetry={() => provinces.mutate()} />
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-w`} className="font-medium">
          {t('picker.ward')}
        </label>
        <select
          id={`${id}-w`}
          value={wardCode ?? ''}
          onChange={(e) => {
            setWardCode(e.target.value ? Number(e.target.value) : null)
            setResolveError(false)
          }}
          disabled={!provinceCode || wards.isLoading || !!wards.error}
          className={fieldClass}
        >
          <option value="">
            {!provinceCode
              ? t('picker.selectProvinceFirst')
              : wards.isLoading
                ? t('picker.loadingList')
                : t('picker.selectWard')}
          </option>
          {wards.data?.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        {wards.error ? <SectionError source={SOURCES.provinces} onRetry={() => wards.mutate()} /> : null}
      </div>

      {resolveError ? <p role="alert">{t('picker.resolveError')}</p> : null}

      <div>
        <button type="button" onClick={confirm} disabled={!ward || resolving} className={primaryButton}>
          {resolving ? t('picker.resolving') : t('picker.use')}
        </button>
      </div>
    </div>
  )
}
