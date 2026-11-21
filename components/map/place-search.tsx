'use client'

import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { Clock3, MapPin, X } from 'lucide-react'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { CITIES, readCoordinates } from '@/lib/constants'
import type { SelectedPlace } from '@/lib/types'

const HISTORY_KEY = 'khi-viet-recent-v1'
const HISTORY_LIMIT = 5
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

type Recent = { id: string; label: string; at: number; placeId?: string; lat?: number; lng?: number }

function getRecent(): Recent[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter(item => item && typeof item.id === 'string' && typeof item.label === 'string' && typeof item.at === 'number' && Date.now() - item.at < THIRTY_DAYS).slice(0, HISTORY_LIMIT)
  } catch { return [] }
}

export function saveRecent(place: SelectedPlace, query?: string) {
  try {
    const id = place.placeId ?? `${place.lat.toFixed(4)},${place.lng.toFixed(4)}`
    const label = place.placeId ? (query?.slice(0, 100) || 'Địa điểm đã xem') : (CITIES.find(city => city.lat === place.lat && city.lng === place.lng)?.name ?? id)
    const item = place.placeId ? { id, at: Date.now(), label, placeId: place.placeId } : { id, at: Date.now(), label, lat: Number(place.lat.toFixed(4)), lng: Number(place.lng.toFixed(4)) }
    localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...getRecent().filter(entry => entry.id !== id)].slice(0, HISTORY_LIMIT)))
  } catch {}
}

export function PlaceSearch({ onSelect, mapsEnabled }: { onSelect: (place: SelectedPlace) => void; mapsEnabled: boolean }) {
  const places = useMapsLibrary('places')
  const activePlaces = mapsEnabled ? places : null
  const input = useRef<HTMLInputElement>(null)
  const session = useRef<google.maps.places.AutocompleteSessionToken>(null)
  const selection = useRef(0)
  const selecting = useRef(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<Recent[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<{ input: string; matches: google.maps.places.PlacePrediction[] } | null>(null)
  const value = query.trim()
  const predictions = activePlaces && suggestions?.input === value ? suggestions.matches : []
  const localMatches = CITIES.filter(city => !value || city.name.toLocaleLowerCase('vi').includes(value.toLocaleLowerCase('vi')))

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return
      if (event.target instanceof HTMLElement && (event.target.matches('input, textarea, select, [role=textbox]') || event.target.isContentEditable)) return
      event.preventDefault()
      input.current?.focus()
    }
    document.addEventListener('keydown', shortcut)
    return () => document.removeEventListener('keydown', shortcut)
  }, [])

  useEffect(() => {
    if (!activePlaces || !open || value.length < 2) return
    let canceled = false
    const timer = window.setTimeout(async () => {
      try {
        session.current ??= new activePlaces.AutocompleteSessionToken()
        const result = await activePlaces.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: value, includedRegionCodes: ['vn'], language: 'vi', region: 'vn', sessionToken: session.current })
        if (!canceled) setSuggestions({ input: value, matches: result.suggestions.flatMap(item => item.placePrediction ? [item.placePrediction] : []).slice(0, 6) })
      } catch {
        if (!canceled) setFeedback('Không tải được gợi ý. Kiểm tra Places API (New) hoặc thử lại.')
      }
    }, 250)
    return () => { canceled = true; window.clearTimeout(timer) }
  }, [activePlaces, open, value])

  function finish(place: SelectedPlace, searchTerm?: string) {
    saveRecent(place, searchTerm)
    selection.current++
    session.current = null
    setSuggestions(null)
    setFeedback(null)
    setQuery('')
    setOpen(false)
    onSelect(place)
    input.current?.blur()
  }

  async function selectPlace(place: google.maps.places.Place, id: string, searchTerm: string) {
    if (selecting.current) return
    selecting.current = true
    const version = ++selection.current
    session.current = null
    setFeedback('Đang lấy tọa độ…')
    try {
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] })
      if (version !== selection.current) return
      if (!place.location) throw new Error('Missing location')
      finish({ ...place.location.toJSON(), name: place.displayName ?? undefined, address: place.formattedAddress ?? undefined, placeId: id }, searchTerm)
    } catch {
      if (version === selection.current) setFeedback('Không lấy được địa điểm. Kiểm tra Places API (New) hoặc thử lại.')
    } finally { selecting.current = false }
  }

  function selectRecent(entry: Recent) {
    if (entry.placeId && activePlaces) { void selectPlace(new activePlaces.Place({ id: entry.placeId, requestedLanguage: 'vi', requestedRegion: 'vn' }), entry.placeId, entry.label); return }
    const point = readCoordinates(new URLSearchParams({ lat: String(entry.lat), lng: String(entry.lng) }))
    if (point) finish({ ...point, name: CITIES.find(city => city.name === entry.label)?.name })
  }

  const visibleRecent = recent.filter(entry => !entry.placeId || activePlaces)

  return <Command className="wx-command" shouldFilter={false} label="Tìm địa điểm" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }} onKeyDownCapture={event => {
    if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) { event.stopPropagation(); return }
    if (event.key === 'Escape') { selection.current++; setOpen(false); session.current = null; input.current?.blur() }
  }}>
    <div className="wx-search-line">
      <CommandInput ref={input} value={query} onValueChange={text => { selection.current++; setQuery(text); setOpen(true); setFeedback(null) }}
        onFocus={() => { setRecent(getRecent()); setOpen(true) }} aria-label="Tìm thành phố hoặc địa chỉ" placeholder="Tìm thành phố, địa chỉ…" maxLength={180} />
      {query ? <button className="wx-clear" aria-label="Xóa nội dung tìm kiếm" onClick={() => { selection.current++; session.current = null; setQuery(''); setSuggestions(null); setFeedback(null); input.current?.focus() }}><X size={16} /></button> : <kbd aria-hidden="true">/</kbd>}
    </div>
    <CommandList hidden={!open} label="Địa điểm">
      {open && <>
        {!!predictions.length && <CommandGroup heading="Kết quả từ Google Maps">
          {predictions.map(prediction => <CommandItem value={`place-${prediction.placeId}`} key={prediction.placeId} onSelect={() => void selectPlace(prediction.toPlace(), prediction.placeId, value)}>
            <MapPin /><span className="min-w-0"><strong className="block truncate font-medium">{(prediction.mainText ?? prediction.text).toString()}</strong><small className="block truncate text-muted-foreground">{prediction.secondaryText?.toString()}</small></span>
          </CommandItem>)}
        </CommandGroup>}
        {!value && !!visibleRecent.length && <CommandGroup heading="Đã xem gần đây">
          {visibleRecent.map(entry => <CommandItem key={entry.id} value={`recent-${entry.id}`} onSelect={() => selectRecent(entry)}><Clock3 />{entry.label}</CommandItem>)}
        </CommandGroup>}
        {!predictions.length && !!localMatches.length && <CommandGroup heading="Thành phố có sẵn">
          {localMatches.map(city => <CommandItem key={city.name} value={`city-${city.name}`} onSelect={() => finish(city)}><MapPin />{city.name}</CommandItem>)}
        </CommandGroup>}
        {(feedback || (value.length >= 2 && !predictions.length && !localMatches.length)) && <p role="status" className="px-3 py-2 text-sm text-muted-foreground">{feedback ?? (!activePlaces ? 'Tìm kiếm địa chỉ cần kết nối Google Maps.' : suggestions?.input !== value ? 'Đang tìm địa điểm…' : 'Không tìm thấy địa điểm phù hợp.')}</p>}
      </>}
    </CommandList>
  </Command>
}
