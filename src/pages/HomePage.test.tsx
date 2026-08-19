import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../theme/ThemeProvider';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('communicates the portfolio value proposition and primary actions', () => {
    render(<ThemeProvider><MemoryRouter><HomePage /></MemoryRouter></ThemeProvider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Understand companies/i);
    expect(screen.getByRole('link', { name: 'Create workspace' })).toHaveAttribute('href', '/register');
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Global company footprint' })).toBeInTheDocument();
  });
});
