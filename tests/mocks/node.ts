/**
 * MSW (Mock Service Worker) — Node.js Server Setup
 * Request interception for Vitest/Node-based integration tests
 * For forgewright project
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers/index.js';

export const server = setupServer(...handlers);

export function initNodeMsw() {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  console.log('[MSW] Server started in Node.js mode');
}

export function closeNodeMsw() {
  server.close();
  console.log('[MSW] Server closed');
}

export function resetMswHandlers() {
  server.resetHandlers();
  console.log('[MSW] Handlers reset');
}

export { server };
