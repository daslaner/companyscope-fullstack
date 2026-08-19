import type { Meta, StoryObj } from '@storybook/react-vite'; import { Button } from './Button';
const meta = { title:'Design System/Button', component:Button, parameters:{ layout:'centered' }, args:{ children:'Explore company' } } satisfies Meta<typeof Button>; export default meta;
type Story=StoryObj<typeof meta>; export const Primary:Story={}; export const Secondary:Story={ args:{variant:'secondary'} }; export const Danger:Story={ args:{variant:'danger'} };
