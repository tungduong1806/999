'use client'

import {
  ArrowUp,
  Ambulance,
  FireTruck,
  GithubLogo,
  Heart,
  Info,
  ShareNetwork,
  Siren,
  type Icon,
} from '@phosphor-icons/react'
import { useT } from '@/lib/i18n'
import { DEVELOPER, GITHUB_URL } from '@/lib/site'
import { pageX } from '@/lib/ui'
import { LanguageSegmented } from './language-switcher'
import { Logo } from './logo'
import { TABS, type TabId } from './tabs'

type Props = {
  onNavigate: (tab: TabId) => void
  onAbout: () => void
  onShare: () => void
}

const footerLink =
  'inline-flex min-h-10 items-center gap-2 rounded-cell text-ink-muted transition-colors hover:text-accent'

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { t } = useT()
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={footerLink}>
      {children}
      <span className="sr-only"> {t('common.newTab')}</span>
    </a>
  )
}

function FooterAction({ onClick, Icon, children }: { onClick: () => void; Icon: Icon; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-popup bg-line/60 px-3 text-sm text-ink transition-colors hover:bg-line"
    >
      <Icon size={18} weight="duotone" aria-hidden="true" className="text-accent" />
      {children}
    </button>
  )
}

export function SiteFooter({ onNavigate, onAbout, onShare }: Props) {
  const { t } = useT()

  return (
    <footer className="mt-12 border-t border-line bg-surface/60 text-sm">
      <div className={`${pageX} mx-auto grid max-w-[1200px] gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <p className="font-display text-xl tracking-tight text-ink">{t('app.name')}</p>
          </div>
          <p className="max-w-[34ch] text-ink-muted">{t('footer.blurb')}</p>
          <LanguageSegmented />
          <div className="flex flex-wrap gap-2">
            <FooterAction onClick={onShare} Icon={ShareNetwork}>
              {t('nav.share')}
            </FooterAction>
            <FooterAction onClick={onAbout} Icon={Info}>
              {t('nav.about')}
            </FooterAction>
          </div>
        </div>

        <nav aria-labelledby="footer-features" className="flex flex-col gap-1">
          <h2 id="footer-features" className="mb-1 font-medium text-ink">
            {t('footer.product')}
          </h2>
          {TABS.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onNavigate(id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`${footerLink} text-left`}
            >
              <Icon size={18} weight="duotone" aria-hidden="true" />
              {t(labelKey)}
            </button>
          ))}
        </nav>

        <section aria-labelledby="footer-sources" className="flex flex-col gap-1">
          <h2 id="footer-sources" className="mb-1 font-medium text-ink">
            {t('footer.sources')}
          </h2>
          <ExternalLink href="https://open-meteo.com/">Weather data by Open-Meteo.com</ExternalLink>
          <ExternalLink href="https://openfreemap.org/">OpenFreeMap</ExternalLink>
          <ExternalLink href="https://www.openmaptiles.org/">© OpenMapTiles</ExternalLink>
          <ExternalLink href="https://www.openstreetmap.org/copyright">© OpenStreetMap</ExternalLink>
          <ExternalLink href="https://www.rainviewer.com/">RainViewer</ExternalLink>
          <ExternalLink href="https://earthquake.usgs.gov/">USGS</ExternalLink>
        </section>

        <section aria-labelledby="footer-emergency" className="flex flex-col gap-1">
          <h2 id="footer-emergency" className="mb-1 font-medium text-ink">
            {t('footer.emergency')}
          </h2>
          <a href="tel:113" className={footerLink}>
            <Siren size={18} weight="duotone" aria-hidden="true" />
            113 · {t('about.police')}
          </a>
          <a href="tel:114" className={footerLink}>
            <FireTruck size={18} weight="duotone" aria-hidden="true" />
            114 · {t('about.fire')}
          </a>
          <a href="tel:115" className={footerLink}>
            <Ambulance size={18} weight="duotone" aria-hidden="true" />
            115 · {t('about.ambulance')}
          </a>
          <p className="mt-3 font-medium text-ink">{t('footer.moreTracking')}</p>
          <ExternalLink href="https://moitruongthudo.vn/">moitruongthudo.vn</ExternalLink>
          <ExternalLink href="https://nchmf.gov.vn/">nchmf.gov.vn</ExternalLink>
        </section>
      </div>

      <div className="border-t border-line">
        <div
          className={`${pageX} mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 py-5 sm:flex-row sm:items-center`}
        >
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
            <span>
              © {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
            </span>
          </p>
          <p className="flex flex-wrap items-center gap-x-2 text-ink">
            <Heart size={16} weight="fill" aria-hidden="true" className="text-aqi-rat-xau" />
            <span className="text-ink-muted">{t('footer.developedBy')}</span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 font-medium transition-colors hover:text-accent"
            >
              <GithubLogo size={18} weight="fill" aria-hidden="true" />
              {DEVELOPER}
              <span className="sr-only"> {t('common.newTab')}</span>
            </a>
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-popup px-3 text-ink-muted transition-colors hover:bg-line hover:text-ink"
          >
            <ArrowUp size={16} weight="bold" aria-hidden="true" />
            {t('footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  )
}
