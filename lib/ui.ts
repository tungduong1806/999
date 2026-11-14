const focusless = 'disabled:cursor-not-allowed'

/** The only filled accent control: the primary action of a screen. */
export const primaryButton = `inline-flex min-h-11 items-center justify-center rounded-popup bg-accent px-5 font-medium text-surface shadow-press-accent transition-[transform,box-shadow] duration-100 motion-safe:active:translate-y-[3px] motion-safe:active:shadow-none disabled:translate-y-0 disabled:bg-line disabled:text-ink-muted disabled:shadow-none ${focusless}`

export const outlineButton = `inline-flex min-h-11 items-center justify-center rounded-popup border border-ink bg-surface px-4 font-medium text-ink shadow-press-ink transition-[transform,box-shadow] duration-100 motion-safe:active:translate-y-[3px] motion-safe:active:shadow-none disabled:translate-y-0 disabled:border-line disabled:text-ink-muted disabled:shadow-none ${focusless}`

export const textButton = `inline-flex min-h-11 items-center rounded-cell px-2 font-medium text-ink underline decoration-1 underline-offset-4 hover:decoration-2 motion-safe:active:translate-y-px disabled:text-ink-muted disabled:no-underline ${focusless}`

export const fieldClass =
  'min-h-11 w-full rounded-popup border border-ink-muted bg-surface px-3 text-ink placeholder:text-ink-muted disabled:border-line disabled:bg-ground disabled:text-ink-muted'

export const linkClass = 'underline decoration-1 underline-offset-4 hover:decoration-2'

export const pageX = 'px-4 lg:px-8'
