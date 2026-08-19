import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OutcomePanel } from './OutcomePanel';

describe('OutcomePanel', () => {
  it('makes product outcomes and rollout state visible', () => {
    render(<OutcomePanel />);

    expect(screen.getByRole('heading', { name: /outcomes, flags and rollout/i })).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.getByText('2m 14s')).toBeInTheDocument();
    expect(screen.getByText('Portfolio compare')).toBeInTheDocument();
    expect(screen.getAllByText('Effective flag: true')).toHaveLength(3);
    expect(screen.getByText('Effective flag: false')).toBeInTheDocument();
    expect(screen.getByText('Demo metrics')).toBeInTheDocument();
  });
});
