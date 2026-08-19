import type { Meta, StoryObj } from '@storybook/react-vite';
import { companies } from '../data/companies';
import type { CompanyTab } from '../types/company';
import { CompanyDetailAnalytics } from './CompanyDetailAnalytics';

const company = companies[0];

if (!company) {
  throw new Error('Expected the local company dataset to contain at least one company.');
}

const tabs: CompanyTab[] = ['overview', 'financials', 'operations', 'security', 'people', 'signals', 'explainer'];

const meta = {
  title: 'Data Visualization/Company Detail Analytics',
  component: CompanyDetailAnalytics,
  args: {
    company,
    tab: 'overview',
  },
  argTypes: {
    tab: {
      control: 'select',
      options: tabs,
    },
  },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CompanyDetailAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
