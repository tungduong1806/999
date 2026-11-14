'use client'

import { ChatCircleText } from '@phosphor-icons/react'
import { useT } from '@/lib/i18n'
import { pageX } from '@/lib/ui'
import { SectionTitle } from './states'

export function AskView() {
  const { t } = useT()
  return (
    <section className={`${pageX} flex max-w-[560px] flex-col gap-4 py-10`} aria-labelledby="ask-heading">
      <SectionTitle id="ask-heading" icon={<ChatCircleText size={20} weight="duotone" />}>
        {t('ask.title')}
      </SectionTitle>
      <p className="text-lg text-pretty">{t('ask.p1')}</p>
      <p className="text-ink-muted">{t('ask.p2')}</p>
    </section>
  )
}
