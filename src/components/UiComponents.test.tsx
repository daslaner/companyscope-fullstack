import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AppHeader } from './AppHeader';
import { MetricCard } from './MetricCard';
import { SecurityPanel } from './SecurityPanel';
import { ThemeToggle } from './ThemeToggle';
import { WatchlistButton } from './WatchlistButton';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

beforeEach(() => localStorage.clear());

describe('design-system and shell components', () => {
  it('covers button and badge variants plus card passthrough props', () => {
    render(<div>
      <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button>
      <Badge>Neutral</Badge><Badge tone="positive">Positive</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger badge</Badge><Badge tone="accent">Accent</Badge>
      <Card className="custom" data-testid="card">Card body</Card>
      <MetricCard label="Coverage" value="90%" note="Target" /><MetricCard label="No note" value="100" />
    </div>);
    expect(screen.getByTestId('card')).toHaveClass('custom');
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('renders security controls and header navigation states', () => {
    render(<ThemeProvider><MemoryRouter initialEntries={['/dashboard']}><AppHeader /><SecurityPanel /></MemoryRouter></ThemeProvider>);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explorer' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Security posture' })).toBeInTheDocument();
    expect(screen.getByText('CSRF + Origin')).toBeInTheDocument();
  });

  it('toggles theme and saved-company state accessibly', () => {
    render(<ThemeProvider><ThemeToggle /><WatchlistButton companyId="northstar-berlin-security" /></ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Switch to dark mode/i }));
    expect(document.documentElement).toHaveClass('dark');
    const save = screen.getByRole('button', { name: /Save company/i });
    expect(save).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(save);
    expect(screen.getByRole('button', { name: /Saved/i })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Saved/i }));
    expect(screen.getByRole('button', { name: /Save company/i })).toHaveAttribute('aria-pressed', 'false');
  });
});
