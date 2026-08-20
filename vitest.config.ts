import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      include: ['src/**/*.{ts,tsx}', 'tools/explainer-core.ts', 'tools/auth-core.ts', 'tools/static-core.ts'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.tsx',
        'src/test/**',
        'src/main.tsx',
        'src/types/**',
        'tools/**/*.test.ts',
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
});
