/**
 * MSW Mock Browser Setup
 * Service Worker-based API mocking for Playwright E2E tests
 * For forgewright project
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index.js';

export const worker = setupWorker(...handlers);

export async function initBrowserMsw() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
  console.log('[MSW] Worker started in browser mode');
}

export { worker };
