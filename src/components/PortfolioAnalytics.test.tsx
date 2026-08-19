import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortfolioAnalytics } from './PortfolioAnalytics';

describe('PortfolioAnalytics', () => {
  it('renders seven distinct chart families with accessible context', () => {
    render(<PortfolioAnalytics />);

    expect(screen.getByRole('heading', { name: 'Seven ways to interrogate the portfolio' })).toBeInTheDocument();
    expect(screen.getAllByTestId(/^chart-/)).toHaveLength(7);
    expect(screen.getByText('Bar chart')).toBeInTheDocument();
    expect(screen.getByText('Donut chart')).toBeInTheDocument();
    expect(screen.getByText('Line chart')).toBeInTheDocument();
    expect(screen.getByText('Area chart')).toBeInTheDocument();
    expect(screen.getByText('Scatter chart')).toBeInTheDocument();
    expect(screen.getByText('Radar chart')).toBeInTheDocument();
    expect(screen.getByText('Radial bar chart')).toBeInTheDocument();
    expect(document.querySelector('[data-recharts="Sector"]')).toBeInTheDocument();
  });
});
