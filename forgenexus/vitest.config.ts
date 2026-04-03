import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    reporter: 'basic',
    include: ['test/**/*.test.ts'],
  },
});
