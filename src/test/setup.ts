import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, vi } from 'vitest';

vi.mock('leaflet', () => ({
  default: { divIcon: vi.fn((options: unknown) => options) },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => createElement('div', { 'data-testid': 'leaflet-map' }, children),
  Marker: ({ children }: { children?: ReactNode }) => createElement('div', { 'data-testid': 'leaflet-marker' }, children),
  Popup: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  TileLayer: () => createElement('div', { 'data-testid': 'tile-layer' }),
}));


type RechartsStubProps = {
  children?: ReactNode;
  formatter?: unknown;
  shape?: unknown;
  tickFormatter?: unknown;
};

const rechartsStub = (name: string) =>
  ({ children, formatter, shape, tickFormatter }: RechartsStubProps) => {
    const rendered: ReactNode[] = [children];
    if (typeof formatter === 'function') {
      formatter(42, 'Revenue');
      formatter(12, 'Growth');
    }
    if (typeof tickFormatter === 'function') {
      tickFormatter(1_000);
    }
    if (typeof shape === 'function') {
      rendered.push(shape({ index: 0, cx: 100, cy: 100, innerRadius: 40, outerRadius: 80, startAngle: 0, endAngle: 90 }));
    }
    return createElement('div', { 'data-recharts': name }, rendered);
  };

vi.mock('recharts', () => ({
  Area: rechartsStub('Area'),
  AreaChart: rechartsStub('AreaChart'),
  Bar: rechartsStub('Bar'),
  BarChart: rechartsStub('BarChart'),
  CartesianGrid: rechartsStub('CartesianGrid'),
  Legend: rechartsStub('Legend'),
  Line: rechartsStub('Line'),
  LineChart: rechartsStub('LineChart'),
  Pie: rechartsStub('Pie'),
  PieChart: rechartsStub('PieChart'),
  PolarAngleAxis: rechartsStub('PolarAngleAxis'),
  PolarGrid: rechartsStub('PolarGrid'),
  Radar: rechartsStub('Radar'),
  RadarChart: rechartsStub('RadarChart'),
  RadialBar: rechartsStub('RadialBar'),
  RadialBarChart: rechartsStub('RadialBarChart'),
  ResponsiveContainer: rechartsStub('ResponsiveContainer'),
  Scatter: rechartsStub('Scatter'),
  ScatterChart: rechartsStub('ScatterChart'),
  Sector: rechartsStub('Sector'),
  Tooltip: rechartsStub('Tooltip'),
  XAxis: rechartsStub('XAxis'),
  YAxis: rechartsStub('YAxis'),
}));

function createMediaQueryList(query: string, matches = false): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  } as MediaQueryList;
}

const defaultMatchMedia = (query: string) => createMediaQueryList(query);

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: vi.fn(defaultMatchMedia),
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.mocked(window.matchMedia).mockReset().mockImplementation(defaultMatchMedia);
});
