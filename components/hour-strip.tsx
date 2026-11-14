'use client'

import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

export type StripCell = {
  key: string
  /** Data color of the cell. */
  bg: string
  /** Spoken and tooltip text: value and level in words. */
  label: string
  /** Text under the cell, shown only for some cells. */
  tick?: string
  /** Shorter tick used on narrow screens. */
  tickShort?: string
}

type Bracket = { start: number; length: number; label: string }

type Props = {
  cells: StripCell[]
  /** Cell outlined in ink: the current hour, day or radar frame. */
  activeIndex: number
  /** Accessible name of the whole strip. */
  name: string
  /** When given, the strip becomes a scrubber. */
  onSelect?: (index: number) => void
  bracket?: Bracket
}

/**
 * "Dải giờ": the signature element. One equal cell per hour or day, 28 px high,
 * 2 px gaps, 4 px radius, the current cell outlined in ink.
 */
export function HourStrip({ cells, activeIndex, name, onSelect, bracket }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pressing = useRef(false)
  const count = cells.length
  const columns: CSSProperties = { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }

  function indexFromPointer(event: PointerEvent) {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return activeIndex
    const ratio = (event.clientX - rect.left) / rect.width
    return Math.min(count - 1, Math.max(0, Math.floor(ratio * count)))
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!onSelect) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      onSelect(Math.min(count - 1, activeIndex + 1))
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      onSelect(Math.max(0, activeIndex - 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      onSelect(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      onSelect(count - 1)
    }
  }

  const interactiveProps = onSelect
    ? {
        role: 'slider' as const,
        tabIndex: 0,
        'aria-label': name,
        'aria-orientation': 'horizontal' as const,
        'aria-valuemin': 0,
        'aria-valuemax': count - 1,
        'aria-valuenow': activeIndex,
        'aria-valuetext': cells[activeIndex]?.label,
        onKeyDown,
        onPointerDown: (e: PointerEvent) => {
          pressing.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          onSelect(indexFromPointer(e))
        },
        onPointerMove: (e: PointerEvent) => {
          if (pressing.current) onSelect(indexFromPointer(e))
        },
        onPointerUp: () => {
          pressing.current = false
        },
        onPointerCancel: () => {
          pressing.current = false
        },
      }
    : {}

  const hasTicks = cells.some((c) => c.tick)

  return (
    <div className="w-full">
      {bracket ? <BracketRow bracket={bracket} columns={columns} count={count} /> : null}

      <div
        ref={trackRef}
        {...interactiveProps}
        className={
          onSelect
            ? 'touch-pan-y py-2 select-none'
            : 'py-2'
        }
      >
        <ol
          aria-label={onSelect ? undefined : name}
          aria-hidden={onSelect ? true : undefined}
          className="grid gap-0.5"
          style={columns}
        >
          {cells.map((cell, i) => (
            <li
              key={cell.key}
              title={cell.label}
              className="relative h-7 rounded-cell"
              style={{
                backgroundColor: cell.bg,
                ...(i === activeIndex ? { outline: '2px solid var(--color-ink)', zIndex: 10 } : null),
              }}
            >
              <span className="sr-only">{cell.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {hasTicks ? (
        <div
          aria-hidden="true"
          className="grid gap-0.5 font-mono text-sm leading-5 text-ink-muted"
          style={columns}
        >
          {cells.map((cell, i) =>
            cell.tick ? (
              <span key={cell.key} className="whitespace-pre-line" style={{ gridColumn: i + 1 }}>
                {cell.tickShort ? (
                  <>
                    <span className="sm:hidden">{cell.tickShort}</span>
                    <span className="hidden sm:inline">{cell.tick}</span>
                  </>
                ) : (
                  cell.tick
                )}
              </span>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  )
}

function BracketRow({
  bracket,
  columns,
  count,
}: {
  bracket: Bracket
  columns: CSSProperties
  count: number
}) {
  const { start, length, label } = bracket
  // Keep the label inside the strip: grow it rightwards from the bracket, or leftwards near the end.
  const alignEnd = start + length > count / 2
  const labelColumn = alignEnd ? `1 / ${start + length + 1}` : `${start + 1} / -1`
  return (
    <div aria-hidden="true" className="grid gap-x-0.5" style={columns}>
      <p
        className={`max-w-none pb-1 text-sm font-medium text-ink ${alignEnd ? 'text-right' : 'text-left'}`}
        style={{ gridColumn: labelColumn, gridRow: 1 }}
      >
        {label}
      </p>
      <div
        className="h-2 rounded-t-cell border-x-2 border-t-2 border-ink"
        style={{ gridColumn: `${start + 1} / span ${length}`, gridRow: 2 }}
      />
    </div>
  )
}
