'use client'

import {
  BellRinging,
  CaretDown,
  ChartLineUp,
  CloudRain,
  MapPin,
  MapTrifold,
  ShieldCheck,
  Wind,
  type Icon,
} from '@phosphor-icons/react'
import { useT, type TKey } from '@/lib/i18n'
import { pageX } from '@/lib/ui'

const FEATURES: { Icon: Icon; title: TKey; desc: TKey }[] = [
  { Icon: Wind, title: 'info.f1.title', desc: 'info.f1.desc' },
  { Icon: CloudRain, title: 'info.f2.title', desc: 'info.f2.desc' },
  { Icon: MapTrifold, title: 'info.f3.title', desc: 'info.f3.desc' },
  { Icon: ShieldCheck, title: 'info.f4.title', desc: 'info.f4.desc' },
]

const STEPS: { Icon: Icon; title: TKey; desc: TKey }[] = [
  { Icon: MapPin, title: 'info.how.1.title', desc: 'info.how.1.desc' },
  { Icon: ChartLineUp, title: 'info.how.2.title', desc: 'info.how.2.desc' },
  { Icon: BellRinging, title: 'info.how.3.title', desc: 'info.how.3.desc' },
]

const FAQ: { q: TKey; a: TKey }[] = [
  { q: 'info.faq.1.q', a: 'info.faq.1.a' },
  { q: 'info.faq.2.q', a: 'info.faq.2.a' },
  { q: 'info.faq.3.q', a: 'info.faq.3.a' },
  { q: 'info.faq.4.q', a: 'info.faq.4.a' },
]

export function InfoSections() {
  const { t } = useT()

  return (
    <div className={`${pageX} mx-auto mt-16 flex max-w-[1200px] flex-col gap-14`}>
      <section aria-labelledby="info-heading" className="flex max-w-3xl flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-accent uppercase">{t('info.eyebrow')}</p>
        <h2
          id="info-heading"
          className="font-display text-2xl leading-tight tracking-tight text-balance sm:text-3xl lg:text-4xl"
        >
          {t('info.heading')}
        </h2>
        <p className="leading-relaxed text-pretty text-ink-muted">{t('info.lead')}</p>
      </section>

      <section aria-label={t('info.eyebrow')}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <li key={title} className="flex flex-col gap-3 rounded-popup bg-surface p-5">
              <span className="grid size-11 place-items-center rounded-cell bg-line/70 text-accent">
                <Icon size={24} weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="font-medium text-ink">{t(title)}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{t(desc)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="flex flex-col gap-5">
        <h2 id="how-heading" className="font-display text-xl tracking-tight sm:text-2xl">
          {t('info.how.title')}
        </h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map(({ Icon, title, desc }) => (
            <li key={title} className="flex gap-4 rounded-popup bg-surface p-5">
              <Icon size={28} weight="duotone" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-ink">{t(title)}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{t(desc)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq-heading" className="flex max-w-3xl flex-col gap-4">
        <h2 id="faq-heading" className="font-display text-xl tracking-tight sm:text-2xl">
          {t('info.faq.title')}
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-popup bg-surface">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-popup px-5 py-3 font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {t(q)}
                <CaretDown
                  size={18}
                  weight="bold"
                  aria-hidden="true"
                  className="shrink-0 text-ink-muted transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-ink-muted">{t(a)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
