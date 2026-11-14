'use client'

import { useEffect, useId, useState } from 'react'
import { resolveWard, SOURCES } from '@/lib/data'
import { placeId, type Place } from '@/lib/places'
import { usePlaceSearch, useProvinces, useWards } from '@/lib/queries'
import { fieldClass, primaryButton } from '@/lib/ui'
import { LoadingNote, SectionError } from './states'

type Props = {
  onPick: (place: Place) => void
}

export function PlacePicker({ onPick }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <NameSearch onPick={onPick} />
      <details className="group border-t border-line pt-2">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium">
          Hoặc chọn theo tỉnh và phường/xã
        </summary>
        <div className="pt-3">
          <AdministrativePick onPick={onPick} />
        </div>
      </details>
    </div>
  )
}

function NameSearch({ onPick }: Props) {
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
        Tên nơi
      </label>
      <input
        id={`${id}-q`}
        type="text"
        inputMode="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-describedby={`${id}-help`}
        className={fieldClass}
      />
      <p id={`${id}-help`} className="text-sm text-ink-muted">
        Nhập tên phường, quận hoặc thành phố, ví dụ Cầu Giấy hoặc Vinh.
      </p>

      <div aria-live="polite">
        {error ? (
          <SectionError source={SOURCES.openMeteo} onRetry={() => mutate()} />
        ) : waiting || isLoading ? (
          <LoadingNote>Đang tìm…</LoadingNote>
        ) : data && data.length === 0 ? (
          <p>Không tìm thấy nơi nào tên “{debounced}”. Thử viết có dấu hoặc dùng tên rộng hơn.</p>
        ) : data ? (
          <ul className="divide-y divide-line border-y border-line">
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
                    className="flex min-h-14 w-full flex-col items-start justify-center py-2 text-left hover:bg-ground"
                  >
                    <span className="font-medium">{r.name}</span>
                    {detail ? <span className="text-sm text-ink-muted">{detail}</span> : null}
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
        detail: found.exact ? province.name : `${province.name} (vị trí ước tính theo tỉnh)`,
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
          Tỉnh/thành
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
          <option value="">{provinces.isLoading ? 'Đang tải danh sách…' : 'Chọn tỉnh/thành'}</option>
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
          Phường/xã
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
            {!provinceCode ? 'Chọn tỉnh/thành trước' : wards.isLoading ? 'Đang tải danh sách…' : 'Chọn phường/xã'}
          </option>
          {wards.data?.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        {wards.error ? <SectionError source={SOURCES.provinces} onRetry={() => wards.mutate()} /> : null}
      </div>

      {resolveError ? (
        <p role="alert">Chưa tìm được tọa độ cho nơi này. Thử tìm theo tên ở trên.</p>
      ) : null}

      <div>
        <button type="button" onClick={confirm} disabled={!ward || resolving} className={primaryButton}>
          {resolving ? 'Đang tìm tọa độ…' : 'Dùng nơi này'}
        </button>
      </div>
    </div>
  )
}
