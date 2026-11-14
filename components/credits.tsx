import { linkClass, pageX } from '@/lib/ui'

type Props = {
  weather?: boolean
  basemap?: boolean
  radar?: boolean
  quakes?: boolean
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <span className="sr-only"> (mở tab mới)</span>
    </a>
  )
}

export function Credits({ weather = true, basemap = false, radar = false, quakes = false }: Props) {
  return (
    <footer className={`mt-10 border-t border-line py-6 text-sm text-ink-muted ${pageX}`}>
      <div className="flex flex-col gap-1">
        {weather ? (
          <p>
            Weather data by <ExternalLink href="https://open-meteo.com/">Open-Meteo.com</ExternalLink>
          </p>
        ) : null}
        {basemap ? (
          <p>
            <ExternalLink href="https://openfreemap.org/">OpenFreeMap</ExternalLink>{' '}
            <ExternalLink href="https://www.openmaptiles.org/">© OpenMapTiles</ExternalLink> Data from{' '}
            <ExternalLink href="https://www.openstreetmap.org/copyright">OpenStreetMap</ExternalLink>
          </p>
        ) : null}
        {radar ? (
          <p>
            Ra-đa mưa: <ExternalLink href="https://www.rainviewer.com/">RainViewer</ExternalLink>
          </p>
        ) : null}
        {quakes ? (
          <p>
            Động đất: <ExternalLink href="https://earthquake.usgs.gov/">USGS</ExternalLink>
          </p>
        ) : null}
        <p>
          Theo dõi thêm tại <ExternalLink href="https://moitruongthudo.vn/">moitruongthudo.vn</ExternalLink>{' '}
          và <ExternalLink href="https://nchmf.gov.vn/">nchmf.gov.vn</ExternalLink>
        </p>
      </div>
    </footer>
  )
}
