export type ProductEvent =
  | { name: 'company_searched'; properties: { queryLength: number; resultCount: number } }
  | { name: 'company_opened'; properties: { companyId: string; source: 'table' | 'map' | 'saved' } }
  | { name: 'company_tab_opened'; properties: { companyId: string; tab: string } }
  | { name: 'explainer_requested'; properties: { companyId: string; focus: string } }
  | { name: 'company_saved'; properties: { companyId: string; saved: boolean } }
  | { name: 'workspace_created'; properties: { source: string } };

export interface AnalyticsPort {
  track(event: ProductEvent): void;
}

export class ConsoleAnalytics implements AnalyticsPort {
  constructor(private readonly enabled = import.meta.env.DEV) {}

  track(event: ProductEvent): void {
    if (this.enabled) console.info('[product-event]', event);
  }
}

export const analytics: AnalyticsPort = new ConsoleAnalytics();
