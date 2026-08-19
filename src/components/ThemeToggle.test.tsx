import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeToggle', () => {
  it('persists a dark theme preference', () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('companyscope.theme')).toBe('dark');
  });
});
