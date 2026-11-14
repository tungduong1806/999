'use client'

import { Check } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { Flag } from '@/components/flag'
import { LANGS, setLang, useT } from '@/lib/i18n'

/** Header dropdown: globe icon, current language code, three native language names. */
export function LanguageMenu() {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0]

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('nav.language')}
        className="flex min-h-11 items-center gap-1.5 rounded-popup px-3 text-sm font-medium text-ink transition-colors hover:bg-line/70"
      >
        <Flag lang={current.id} className="size-5" />
        {current.short}
      </button>
      {open ? (
        <ul
          id={listId}
          role="group"
          aria-label={t('nav.language')}
          className="absolute right-0 top-full z-40 mt-2 flex w-60 flex-col gap-1 rounded-popup bg-surface p-2 shadow-float"
        >
          {LANGS.map((l) => {
            const selected = l.id === lang
            return (
              <li key={l.id}>
                <button
                  type="button"
                  lang={l.id}
                  aria-pressed={selected}
                  onClick={() => {
                    setLang(l.id)
                    setOpen(false)
                  }}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-cell px-3 text-left transition-colors hover:bg-line ${
                    selected ? 'bg-line/60 font-medium text-accent' : 'text-ink'
                  }`}
                >
                  <Flag lang={l.id} className="size-7" />
                  <span className="flex-1">{l.native}</span>
                  {selected ? <Check size={20} weight="bold" aria-hidden="true" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

/** Footer segmented control with the same three languages. */
export function LanguageSegmented() {
  const { t, lang } = useT()
  return (
    <div role="group" aria-label={t('nav.language')} className="inline-flex gap-1 rounded-popup bg-line/60 p-1">
      {LANGS.map((l) => {
        const selected = l.id === lang
        return (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            aria-pressed={selected}
            onClick={() => setLang(l.id)}
            className={`flex min-h-10 items-center gap-2 whitespace-nowrap rounded-cell px-3 text-sm transition-colors ${
              selected ? 'bg-accent font-medium text-surface' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Flag lang={l.id} className="size-5" />
            {l.native}
          </button>
        )
      })}
    </div>
  )
}
