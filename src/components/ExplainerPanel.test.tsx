import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { companies } from '../data/companies';
import { requestCompanyExplainer } from '../lib/api';
import { ExplainerPanel } from './ExplainerPanel';

vi.mock('../lib/api', () => ({ requestCompanyExplainer: vi.fn() }));
const company = companies[0]!;

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ExplainerPanel company={company} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  // Never return the mock from a Vitest hook: returned functions are treated as cleanup callbacks.
  vi.mocked(requestCompanyExplainer).mockReset();
});

describe('ExplainerPanel', () => {
  it('associates each explainer option with an accessible radio control', () => {
    renderPanel();
    const securityRadio = screen.getByRole('radio', { name: 'Security lens' });
    expect(securityRadio).toHaveAttribute('id', 'explainer-focus-security');
    expect(securityRadio).toHaveAccessibleDescription('Explain the security posture and open questions.');
    expect(screen.getByText('Security lens').closest('label')).toHaveAttribute('for', 'explainer-focus-security');
  });

  it('requests an allow-listed focus, exposes pending state and renders the result', async () => {
    type ExplainerResponse = Awaited<ReturnType<typeof requestCompanyExplainer>>;
    let resolveRequest!: (value: ExplainerResponse) => void;

    vi.mocked(requestCompanyExplainer).mockImplementation(
      () =>
        new Promise<ExplainerResponse>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderPanel();
    fireEvent.click(screen.getByRole('radio', { name: /Security lens/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate explainer' }));

    await waitFor(() => expect(requestCompanyExplainer).toHaveBeenCalledWith(company.id, 'security'));

    try {
      expect(await screen.findByRole('button', { name: 'Generating…' })).toBeDisabled();
    } finally {
      // Always settle the deferred mutation so a failed assertion cannot leak async work into the next test.
      await act(async () => {
        resolveRequest({
          explanation: 'Structured security explanation',
          model: 'test-model',
          generatedAt: '2026-08-18T12:00:00.000Z',
        });
      });
    }

    expect(await screen.findByText('Structured security explanation')).toBeInTheDocument();
    expect(screen.getByText(/test-model/)).toBeInTheDocument();
  });

  it('surfaces API failures without stale output', async () => {
    vi.mocked(requestCompanyExplainer).mockRejectedValueOnce(new Error('EXPLAINER_UNAVAILABLE'));
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Generate explainer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('EXPLAINER_UNAVAILABLE');
  });

  it('normalizes unknown rejection values to a safe user-facing error', async () => {
    vi.mocked(requestCompanyExplainer).mockRejectedValueOnce('network-failure');
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Generate explainer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Explainer request failed.');
  });
});
