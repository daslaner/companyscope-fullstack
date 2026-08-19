import type { Company } from '../types/company';

type Location = { city: string; country: string; countryCode: string; lat: number; lng: number };
type Profile = { prefix: string; suffix: string; industry: string; tags: string[] };

const locations: Location[] = [
  { city: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.52, lng: 13.405 },
  { city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041 },
  { city: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.6761, lng: 12.5683 },
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5072, lng: -0.1276 },
  { city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.006 },
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
  { city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198 },
  { city: 'Santiago', country: 'Chile', countryCode: 'CL', lat: -33.4489, lng: -70.6693 },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lng: -79.3832 },
  { city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  { city: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038 },
  { city: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lng: 18.0686 },
  { city: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.1699, lng: 24.9384 },
  { city: 'Warsaw', country: 'Poland', countryCode: 'PL', lat: 52.2297, lng: 21.0122 },
  { city: 'Zurich', country: 'Switzerland', countryCode: 'CH', lat: 47.3769, lng: 8.5417 },
  { city: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.2082, lng: 16.3738 },
  { city: 'Dublin', country: 'Ireland', countryCode: 'IE', lat: 53.3498, lng: -6.2603 },
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093 },
  { city: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lng: 126.978 },
  { city: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333 },
];

const profiles: Profile[] = [
  { prefix: 'Northstar', suffix: 'Security', industry: 'Cybersecurity', tags: ['B2B', 'Security'] },
  { prefix: 'Aurora', suffix: 'Payments', industry: 'FinTech', tags: ['Payments', 'SaaS'] },
  { prefix: 'Solstice', suffix: 'Grid', industry: 'Energy', tags: ['Climate', 'Infrastructure'] },
  { prefix: 'Atlas', suffix: 'Health', industry: 'HealthTech', tags: ['Healthcare', 'Platform'] },
  { prefix: 'Cedar', suffix: 'Cloud', industry: 'Cloud Infrastructure', tags: ['Cloud', 'Developer Tools'] },
];

const revenueBands = ['€10M–€25M', '€25M–€50M', '€50M–€100M', '€100M–€250M', '€250M–€500M', '€500M+'] as const;
const fundingStages = ['Bootstrapped', 'Series B', 'Series C', 'Growth equity', 'Public'] as const;
const remotePolicies = ['Remote-first', 'Hybrid', 'Office-first'] as const;
const leadershipStates = ['Stable', 'Watch', 'Changed recently'] as const;

const slug = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const companies: Company[] = locations.flatMap((location, locationIndex) =>
  profiles.map((profile, profileIndex) => {
    const index = locationIndex * profiles.length + profileIndex;
    const name = `${profile.prefix} ${location.city} ${profile.suffix}`;
    const riskScore = 12 + ((index * 17) % 72);
    const securityRating = 62 + ((index * 11) % 37);
    const employees = 95 + ((index * 173) % 4_900);
    const revenueM = 12 + ((index * 29) % 720);
    const growthPct = -4 + ((index * 7) % 41);
    const id = slug(name);
    const observedDay = String(5 + (index % 22)).padStart(2, '0');

    return {
      id,
      name,
      legalName: `${name} ${location.countryCode === 'US' ? 'Inc.' : 'Ltd.'}`,
      domain: `${id}.example`,
      country: location.country,
      countryCode: location.countryCode,
      city: location.city,
      lat: location.lat + (profileIndex - 2) * 0.06,
      lng: location.lng + (profileIndex - 2) * 0.08,
      industry: profile.industry,
      founded: 2004 + ((index * 3) % 19),
      employees,
      revenueBand: revenueBands[Math.min(revenueBands.length - 1, Math.floor(revenueM / 125))] ?? revenueBands[0],
      revenueM,
      growthPct,
      profitability: index % 4 === 0 ? 'Investing for growth' : index % 3 === 0 ? 'Break-even' : 'Profitable',
      fundingStage: fundingStages[index % fundingStages.length] ?? fundingStages[0],
      riskScore,
      verified: index % 5 !== 0,
      tags: [...profile.tags, index % 2 === 0 ? 'Enterprise' : 'Scale-up'],
      description: `${name} is a synthetic portfolio company used to demonstrate global company intelligence workflows without representing a real-world business.`,
      operations: {
        offices: 2 + (index % 14),
        countries: 1 + (index % 18),
        cloudRegions: 2 + (index % 9),
        uptimePct: Number((99.72 + (index % 27) / 100).toFixed(2)),
        vendorConcentrationPct: 18 + ((index * 9) % 58),
      },
      security: {
        rating: securityRating,
        mfaCoveragePct: 72 + ((index * 5) % 29),
        openFindings: index % 8,
        criticalFindings: index % 17 === 0 ? 1 : 0,
        incidents90d: index % 13 === 0 ? 2 : index % 7 === 0 ? 1 : 0,
        certifications: index % 3 === 0 ? ['ISO 27001', 'SOC 2 Type II'] : index % 2 === 0 ? ['ISO 27001'] : ['SOC 2 Type II'],
        lastAssessment: `2026-07-${observedDay}`,
      },
      people: {
        headcountGrowthPct: -6 + ((index * 5) % 33),
        engineeringSharePct: 18 + ((index * 4) % 42),
        openRoles: 2 + ((index * 13) % 64),
        remotePolicy: remotePolicies[index % remotePolicies.length] ?? remotePolicies[0],
        leadershipStability: leadershipStates[index % leadershipStates.length] ?? leadershipStates[0],
      },
      signals: [
        {
          id: `${id}-growth`,
          label: growthPct >= 20 ? 'High growth' : growthPct >= 8 ? 'Steady growth' : 'Growth watch',
          detail: `Revenue growth proxy is ${growthPct}% year over year.`,
          severity: growthPct < 4 ? 'watch' : 'info',
          observedAt: `2026-08-${String(1 + (index % 17)).padStart(2, '0')}`,
        },
        {
          id: `${id}-security`,
          label: securityRating >= 85 ? 'Strong security posture' : securityRating >= 72 ? 'Security monitored' : 'Security review recommended',
          detail: `Security posture rating is ${securityRating}/100 with ${index % 8} open findings.`,
          severity: securityRating < 72 ? 'critical' : securityRating < 85 ? 'watch' : 'info',
          observedAt: `2026-08-${String(2 + (index % 16)).padStart(2, '0')}`,
        },
        {
          id: `${id}-people`,
          label: 'Hiring activity',
          detail: `${2 + ((index * 13) % 64)} open roles across the organization.`,
          severity: 'info',
          observedAt: `2026-08-${String(1 + (index % 18)).padStart(2, '0')}`,
        },
      ],
    } satisfies Company;
  }),
);

export const industries = [...new Set(companies.map((company) => company.industry))].sort();
export const countries = [...new Set(companies.map((company) => company.country))].sort();
