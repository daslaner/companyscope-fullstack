import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { ThemeProvider } from './theme/ThemeProvider';

describe('App routing', () => {
  it('falls back to the home route for unknown URLs', async () => {
    render(<ThemeProvider><MemoryRouter initialEntries={['/unknown-route']}><App /></MemoryRouter></ThemeProvider>);
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Understand companies/i);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });
});
