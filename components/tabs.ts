import { ChatCircleText, House, MapTrifold, Wind, type Icon } from '@phosphor-icons/react'
import type { TKey } from '@/lib/i18n'

export type TabId = 'today' | 'home' | 'map' | 'ask'

export const TABS: { id: TabId; labelKey: TKey; Icon: Icon }[] = [
  { id: 'today', labelKey: 'nav.today', Icon: Wind },
  { id: 'home', labelKey: 'nav.home', Icon: House },
  { id: 'map', labelKey: 'nav.map', Icon: MapTrifold },
  { id: 'ask', labelKey: 'nav.ask', Icon: ChatCircleText },
]
