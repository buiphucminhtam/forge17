import { beforeAll, afterAll, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
});

// Global test teardown
afterAll(() => {
  // Cleanup
});

afterEach(() => {
  // Reset mocks between tests
});

// Mock console for cleaner test output
const originalConsole = { ...console };

beforeAll(() => {
  console.log = (...args: unknown[]) => {
    if (process.env.DEBUG) originalConsole.log(...args);
  };
  console.warn = (...args: unknown[]) => {
    if (process.env.DEBUG) originalConsole.warn(...args);
  };
});
