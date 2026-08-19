import { describe, expect, it } from 'vitest';
import { riskBand, riskLabel, riskTone } from './risk';

describe('risk helpers', () => {
  it.each([
    [0, 'Low', 'positive'],
    [29, 'Low', 'positive'],
    [30, 'Moderate', 'warning'],
    [54, 'Moderate', 'warning'],
    [55, 'Elevated', 'danger'],
    [100, 'Elevated', 'danger'],
  ] as const)('classifies score %i', (score, band, tone) => {
    expect(riskBand(score)).toBe(band);
    expect(riskTone(score)).toBe(tone);
    expect(riskLabel(score)).toBe(`${band} risk (${score}/100)`);
  });
});
