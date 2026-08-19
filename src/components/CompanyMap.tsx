import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { companies } from '../data/companies';
import { riskBand } from '../lib/risk';
import { analytics } from '../product/analytics';

type CompanyMapProps = { alternative?: 'list' | 'table' };

const iconFor = (score: number) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${
      score < 30 ? '#10b981' : score < 55 ? '#f59e0b' : '#ef4444'
    };border:3px solid white;box-shadow:0 1px 8px rgba(15,23,42,.3)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export function CompanyMap({ alternative = 'list' }: CompanyMapProps) {
  return (
    <section aria-labelledby="map-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="map-title" className="text-xl font-bold text-slate-950 dark:text-white">
            Global company footprint
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            100 synthetic companies across 20 markets.{' '}
            {alternative === 'table'
              ? 'The company table below provides the keyboard-accessible equivalent.'
              : 'The company list below provides the keyboard-accessible equivalent.'}
          </p>
        </div>
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400" aria-label="Risk legend">
          <span>● Low</span>
          <span>● Moderate</span>
          <span>● Elevated</span>
        </div>
      </div>

      <div
        className="h-[440px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        aria-hidden="true"
      >
        <MapContainer
          center={[24, 8]}
          zoom={2}
          className="h-full w-full"
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          zoomControl={false}
          minZoom={2}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {companies.map((company) => (
            <Marker
              key={company.id}
              position={[company.lat, company.lng]}
              icon={iconFor(company.riskScore)}
              interactive={false}
            />
          ))}
        </MapContainer>
      </div>

      {alternative === 'list' && (
        <details className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            Browse the map as an accessible company list
          </summary>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <li key={company.id}>
                <Link
                  className="block rounded-xl border border-slate-200 p-3 text-sm hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-slate-800"
                  to={`/companies/${company.id}/overview`}
                  onClick={() =>
                    analytics.track({
                      name: 'company_opened',
                      properties: { companyId: company.id, source: 'map' },
                    })
                  }
                >
                  <span className="font-semibold text-slate-950 dark:text-white">{company.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {company.city}, {company.countryCode} · {riskBand(company.riskScore)} risk
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
