'use client'

import { ArrowUpRight, Sparkle } from '@phosphor-icons/react'
import { useActionState, useId, useRef, useState } from 'react'
import { localeOf, useT } from '@/lib/i18n'
import { fieldClass, primaryButton } from '@/lib/ui'
import { forecastGrid, QUESTION_LIMIT, WEATHER_SOURCE, WEATHER_ZONE, type WeatherAnswer } from '@/lib/weather-contract'
import { weatherCopy } from '@/lib/weather-copy'
import { SectionTitle } from './states'

type AskState = WeatherAnswer | { error: 'forecast' | 'quota' | 'invalid' | 'assistant' } | null

export function WeatherQuestion({ lat, lon, placeName }: { lat: number; lon: number; placeName: string }) {
  const { t, lang } = useT()
  const copy = weatherCopy[lang]
  const [question, setQuestion] = useState('')
  const input = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const [result, dispatch, busy] = useActionState(async (_previous: AskState, formData: FormData): Promise<AskState> => {
    const question = String(formData.get('question') ?? '').trim()
    if (question.length < 3 || question.length > QUESTION_LIMIT) return { error: 'invalid' }
    try {
      const response = await fetch('/api/weather/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...forecastGrid(lat, lon), placeName: placeName.slice(0, 120), question, lang }),
        signal: AbortSignal.timeout(38_000),
      })
      const data = await response.json()
      if (response.ok) return data as WeatherAnswer
      if (data.error === 'quota_reached') return { error: 'quota' }
      if (data.error === 'forecast_unavailable') return { error: 'forecast' }
      if (data.error === 'invalid_question') return { error: 'invalid' }
      return { error: 'assistant' }
    } catch {
      return { error: 'assistant' }
    }
  }, null)
  const errors = { forecast: copy.noForecast, quota: copy.quota, invalid: copy.invalid, assistant: copy.noAnswer }
  const locale = localeOf(lang)
  const date = new Intl.DateTimeFormat(locale, { timeZone: WEATHER_ZONE, dateStyle: 'short', timeStyle: 'short' })
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })

  return (
    <section aria-labelledby="weather-assistant" className="flex min-w-0 flex-col gap-4 rounded-sheet border border-line bg-surface p-4 sm:p-6">
      <SectionTitle id="weather-assistant" icon={<Sparkle size={20} weight="duotone" />}>{copy.assistant}</SectionTitle>
      <p className="text-sm text-ink-muted">{copy.scope}</p>
      <button type="button" disabled={busy} onClick={() => { setQuestion(copy.example); input.current?.focus() }} className="min-h-11 self-start rounded-popup border border-line px-3 text-left text-sm text-accent transition-colors hover:bg-line/60 disabled:opacity-50">
        {copy.example}
      </button>
      <form action={dispatch} className="flex flex-col gap-3" aria-busy={busy}>
        <label htmlFor={id} className="text-sm font-medium">{copy.question}</label>
        <textarea
          ref={input}
          id={id}
          name="question"
          rows={3}
          minLength={3}
          maxLength={QUESTION_LIMIT}
          required
          readOnly={busy}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className={`${fieldClass} resize-y py-3`}
          placeholder={copy.placeholder}
          aria-describedby={`${id}-privacy`}
        />
        <button type="submit" disabled={busy || question.trim().length < 3} className={`${primaryButton} gap-2 self-start`}>
          {busy ? copy.thinking : copy.send}
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </form>
      <p id={`${id}-privacy`} className="text-xs leading-relaxed text-ink-muted">{t('ask.p2')}</p>
      <div aria-live="polite" aria-atomic="true">
        {busy ? <p className="text-sm text-ink-muted">{copy.thinking}</p> : null}
        {!busy && result && 'error' in result ? <p className="text-sm text-ink">{errors[result.error]}</p> : null}
        {!busy && result && 'mode' in result ? (
          <div className="flex flex-col gap-2 rounded-popup border border-line bg-line/35 p-4">
            <h3 className="font-medium text-accent">{result.mode === 'ai' ? copy.answer : copy.summaryTitle}</h3>
            {result.mode === 'ai' ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{result.answer}</p>
            ) : (
              <>
                <p className="text-sm text-ink-muted">{copy.summaryNote}</p>
                <p className="text-sm">{date.formatRange(new Date(result.summary.from), new Date(result.summary.to))} (UTC+7)</p>
                <p className="text-sm">
                  {copy.temperature}: {number.format(result.summary.min)}–{number.format(result.summary.max)} °C ·{' '}
                  {copy.rain}: {result.summary.rainMm == null ? '—' : `${number.format(result.summary.rainMm)} mm`}
                </p>
              </>
            )}
            <p className="text-xs text-ink-muted">
              {WEATHER_SOURCE} · {copy.updated}{' '}
              <time dateTime={result.modelUpdatedAt}>{date.format(new Date(result.modelUpdatedAt))}</time> (UTC+7)
              {result.stale ? ` · ${copy.stale}` : ''}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
