import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

function Consumer() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = '';
  vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
});

describe('ThemeProvider', () => {
  it('uses stored preference and toggles both directions', () => {
    localStorage.setItem('companyscope.theme', 'dark');
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
    fireEvent.click(screen.getByRole('button', { name: 'dark' }));
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('companyscope.theme')).toBe('light');
  });

  it('falls back to the system preference when nothing is stored', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
  });

  it('survives unavailable localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'light' }));
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
  });

  it('fails fast when the hook is used outside its provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow(/ThemeProvider/);
    consoleError.mockRestore();
  });
});
