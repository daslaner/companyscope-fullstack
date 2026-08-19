import type { RiskBand } from '../types/company';

export const riskBand = (score: number): RiskBand => score < 30 ? 'Low' : score < 55 ? 'Moderate' : 'Elevated';
export const riskLabel = (score: number) => `${riskBand(score)} risk (${score}/100)`;
export const riskTone = (score: number) => score < 30 ? 'positive' : score < 55 ? 'warning' : 'danger';
