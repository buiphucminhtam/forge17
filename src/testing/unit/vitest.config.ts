import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.mock.ts',
      ],
    },
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@testing': './src/testing',
      '@core': './src/testing/core',
      '@utils': './src/testing/utils',
    },
  },
});
