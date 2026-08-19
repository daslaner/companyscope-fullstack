import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
const meta = { title: 'Design System/Badge', component: Badge, args: { children: 'Verified' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Neutral: Story = {};
export const Positive: Story = { args: { tone: 'positive' } };
export const Warning: Story = { args: { tone: 'warning' } };
export const Danger: Story = { args: { tone: 'danger' } };
