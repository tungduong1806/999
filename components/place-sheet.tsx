'use client'

import { useEffect, useRef } from 'react'
import { addHomePlace, MAX_HOMES, setCurrentPlace, usePlaces, type Place } from '@/lib/places'
import { textButton } from '@/lib/ui'
import { PlacePicker } from './place-picker'

export type SheetMode = 'current' | 'home' | null

type Props = {
  mode: SheetMode
  onClose: () => void
}

export function PlaceSheet({ mode, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const { homes } = usePlaces()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (mode && !dialog.open) dialog.showModal()
    if (!mode && dialog.open) dialog.close()
  }, [mode])

  function handlePick(place: Place) {
    if (mode === 'current') setCurrentPlace(place)
    if (mode === 'home') addHomePlace(place)
    onClose()
  }

  const title = mode === 'home' ? 'Thêm nơi ở quê' : 'Đổi nơi bạn đang học'
  const full = mode === 'home' && homes.length >= MAX_HOMES

  return (
    <dialog
      ref={ref}
      aria-labelledby="place-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="sheet fixed inset-0 m-0 mx-auto mt-auto h-fit max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-sheet bg-surface p-0 text-ink shadow-float"
    >
      {mode ? (
        <div className="flex flex-col gap-4 p-4 pb-8 sm:p-6 sm:pb-8">
          <div className="flex items-center justify-between gap-4">
            <h2 id="place-sheet-title" className="font-display text-xl leading-tight tracking-tight">
              {title}
            </h2>
            <button type="button" onClick={onClose} className={textButton}>
              Đóng
            </button>
          </div>
          {full ? (
            <p>Bạn đã lưu đủ {MAX_HOMES} nơi. Xóa bớt một nơi ở tab Quê nhà để thêm nơi mới.</p>
          ) : (
            <PlacePicker onPick={handlePick} />
          )}
        </div>
      ) : null}
    </dialog>
  )
}
