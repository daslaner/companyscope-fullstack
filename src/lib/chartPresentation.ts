export function chartColor(index: number): string {
  switch (index % 5) {
    case 1:
      return 'var(--chart-2)';
    case 2:
      return 'var(--chart-3)';
    case 3:
      return 'var(--chart-4)';
    case 4:
      return 'var(--chart-5)';
    default:
      return 'var(--chart-1)';
  }
}

export function formatChartValue(value: unknown, suffix = ''): string {
  let formatted: string;

  if (Array.isArray(value)) {
    formatted = value.join('–');
  } else if (typeof value === 'number') {
    formatted = value.toLocaleString();
  } else {
    formatted = String(value ?? '');
  }

  return suffix.length > 0 ? `${formatted} ${suffix}` : formatted;
}
