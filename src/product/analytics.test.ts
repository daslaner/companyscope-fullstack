import { describe, expect, it, vi } from 'vitest';
import { ConsoleAnalytics, type ProductEvent } from './analytics';

const event: ProductEvent = {
  name: 'company_opened',
  properties: { companyId: 'northstar-berlin-security', source: 'table' },
};

describe('ConsoleAnalytics', () => {
  it('emits typed events when the development adapter is enabled', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    new ConsoleAnalytics(true).track(event);

    expect(info).toHaveBeenCalledWith('[product-event]', event);
  });

  it('stays silent when the adapter is disabled', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    new ConsoleAnalytics(false).track(event);

    expect(info).not.toHaveBeenCalled();
  });
});
