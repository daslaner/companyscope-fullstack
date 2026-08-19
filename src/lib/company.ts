import { companies } from '../data/companies';
import type { Company, CompanyTab } from '../types/company';

export const companyTabs: ReadonlyArray<{ id: CompanyTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'financials', label: 'Financials' },
  { id: 'operations', label: 'Operations' },
  { id: 'security', label: 'Security' },
  { id: 'people', label: 'People' },
  { id: 'signals', label: 'Signals' },
  { id: 'explainer', label: 'Explainer' },
];

export const isCompanyTab = (value: string | undefined): value is CompanyTab =>
  Boolean(value && companyTabs.some((tab) => tab.id === value));

export const getCompany = (id: string | undefined): Company | undefined =>
  companies.find((company) => company.id === id);

export const formatCurrency = (valueM: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(valueM * 1_000_000);

export const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value}%`;
