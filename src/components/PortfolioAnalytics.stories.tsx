import type { Meta, StoryObj } from '@storybook/react-vite';
import { PortfolioAnalytics } from './PortfolioAnalytics';

const meta = {
  title: 'Data Visualization/Portfolio Analytics',
  component: PortfolioAnalytics,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PortfolioAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SevenChartFamilies: Story = {};
