import { describe, expect, it } from 'vitest';
import { chartColor, formatChartValue } from './chartPresentation';

describe('chart presentation helpers', () => {
  it('maps chart indexes to the complete theme palette and cycles deterministically', () => {
    expect([0, 1, 2, 3, 4].map(chartColor)).toEqual([
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
    ]);
    expect(chartColor(5)).toBe('var(--chart-1)');
  });

  it('formats numeric, range and text values with optional units', () => {
    expect(formatChartValue(42, '%')).toContain('42');
    expect(formatChartValue([10, 20], 'M EUR')).toBe('10–20 M EUR');
    expect(formatChartValue('Stable')).toBe('Stable');
    expect(formatChartValue(null)).toBe('');
  });
});
