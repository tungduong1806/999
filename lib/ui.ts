const focusless = 'disabled:cursor-not-allowed'

/** The only filled accent control: the primary action of a screen. */
export const primaryButton = `inline-flex min-h-11 items-center justify-center rounded-popup bg-accent px-5 font-medium text-surface shadow-press-accent transition-[transform,box-shadow] duration-100 motion-safe:active:translate-y-[3px] motion-safe:active:shadow-none disabled:translate-y-0 disabled:bg-line disabled:text-ink-muted disabled:shadow-none ${focusless}`

/** Secondary action: soft filled surface, no outline. */
export const outlineButton = `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-popup bg-line/70 px-4 font-medium text-ink transition-colors duration-100 hover:bg-line motion-safe:active:translate-y-px disabled:translate-y-0 disabled:bg-line/40 disabled:text-ink-muted ${focusless}`

export const textButton = `inline-flex min-h-11 items-center rounded-cell px-2 font-medium text-ink underline decoration-1 underline-offset-4 hover:decoration-2 motion-safe:active:translate-y-px disabled:text-ink-muted disabled:no-underline ${focusless}`

/** Borderless filled field. Focus is shown by the global accent outline. */
export const fieldClass =
  'min-h-12 w-full rounded-popup border-0 bg-line/60 px-3 text-ink transition-colors placeholder:text-ink-muted hover:bg-line focus:bg-line disabled:bg-surface disabled:text-ink-muted'

export const linkClass = 'underline decoration-1 underline-offset-4 hover:decoration-2'

export const pageX = 'px-4 lg:px-8'
