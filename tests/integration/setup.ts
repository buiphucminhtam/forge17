/**
 * Global integration test setup
 * Handles Docker service lifecycle for integration tests
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const COMPOSE_FILE = `${__dirname}/docker-compose.test.yml`;

export async function startServices(): Promise<void> {
  console.log('Starting integration test services...');
  try {
    execSync(`docker compose -f ${COMPOSE_FILE} up -d`, { stdio: 'inherit' });
    await waitForServices();
    console.log('All services are ready.');
  } catch (error) {
    console.error('Failed to start services:', error);
    throw error;
  }
}

export async function stopServices(): Promise<void> {
  console.log('Stopping integration test services...');
  try {
    execSync(`docker compose -f ${COMPOSE_FILE} down -v --remove-orphans`, { stdio: 'inherit' });
  } catch (error) {
    console.warn('Failed to stop services cleanly:', error);
  }
}

export async function waitForServices(): Promise<void> {
  const maxWait = 60_000;
  const start = Date.now();

  await Promise.all([
    waitForPostgres('5433', 'forgenexus_test'),
    waitForPostgres('5434', 'mcp_test'),
  ]);

  console.log(`Services ready in ${Date.now() - start}ms`);
}

async function waitForPostgres(port: string, db: string): Promise<void> {
  const maxWait = 30_000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    try {
      execSync(`pg_isready -h localhost -p ${port} -U testuser -d ${db}`, { stdio: 'ignore' });
      return;
    } catch {
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error(`Postgres on port ${port} did not become ready in time`);
}

export function getForgenexusDBUrl(): string {
  return 'postgresql://testuser:testpass@localhost:5433/forgenexus_test';
}

export function getMcpDBUrl(): string {
  return 'postgresql://testuser:testpass@localhost:5434/mcp_test';
}
