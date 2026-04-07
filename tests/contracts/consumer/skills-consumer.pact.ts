/**
 * Pact Contract Testing Consumer Tests
 * Consumer-driven contract tests for API providers
 * For forgewright project
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PactV3 } from '@pact-foundation/pact';
import path from 'path';

const provider = new PactV3({
  consumer: 'forgewright-tests',
  provider: 'forgewright-api',
  dir: path.resolve(__dirname, '../pacts'),
  logLevel: 'warn',
  spec: 3,
});

describe('Skills API Contract', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('GET /api/skills', () => {
    it('returns a list of skills', async () => {
      await provider.addInteraction({
        states: [{ description: 'skills exist' }],
        uponReceiving: 'a request for all skills',
        withRequest: {
          method: 'GET',
          path: '/api/skills',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            skills: provider.Matchers.eachLike({
              id: provider.Matchers.string('software-engineer'),
              name: provider.Matchers.string('Software Engineer'),
              version: provider.Matchers.string('1.0.0'),
            }, { min: 1 }),
            total: provider.Matchers.number(3),
          },
        },
      });

      const response = await fetch('http://localhost:3000/api/skills');
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.skills).toBeDefined();
      expect(body.skills.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/skills/:skillId', () => {
    it('returns a skill by id', async () => {
      await provider.addInteraction({
        states: [{ description: 'skill software-engineer exists' }],
        uponReceiving: 'a request for a specific skill',
        withRequest: {
          method: 'GET',
          path: '/api/skills/software-engineer',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: provider.Matchers.string('software-engineer'),
            name: provider.Matchers.string('Software Engineer'),
            version: provider.Matchers.string('1.0.0'),
          },
        },
      });

      const response = await fetch('http://localhost:3000/api/skills/software-engineer');
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.id).toBe('software-engineer');
    });

    it('returns 404 for non-existent skill', async () => {
      await provider.addInteraction({
        states: [{ description: 'skill non-existent does not exist' }],
        uponReceiving: 'a request for a non-existent skill',
        withRequest: {
          method: 'GET',
          path: '/api/skills/non-existent',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: {
            error: provider.Matchers.string('Not Found'),
          },
        },
      });

      const response = await fetch('http://localhost:3000/api/skills/non-existent');
      expect(response.status).toBe(404);
    });
  });
});

describe('Projects API Contract', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('GET /api/projects', () => {
    it('returns a list of projects', async () => {
      await provider.addInteraction({
        states: [{ description: 'projects exist' }],
        uponReceiving: 'a request for all projects',
        withRequest: {
          method: 'GET',
          path: '/api/projects',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            projects: provider.Matchers.eachLike({
              id: provider.Matchers.string('p1'),
              name: provider.Matchers.string('Test Project'),
              status: provider.Matchers.string('active'),
            }, { min: 1 }),
            total: provider.Matchers.number(2),
          },
        },
      });

      const response = await fetch('http://localhost:3000/api/projects');
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.projects).toBeDefined();
    });
  });

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      await provider.addInteraction({
        states: [{ description: 'no projects exist' }],
        uponReceiving: 'a request to create a project',
        withRequest: {
          method: 'POST',
          path: '/api/projects',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: {
            name: provider.Matchers.string('New Project'),
          },
        },
        willRespondWith: {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: provider.Matchers.string('p-new'),
            name: provider.Matchers.string('New Project'),
            createdAt: provider.Matchers.string(),
          },
        },
      });

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Project' }),
      });
      expect(response.status).toBe(201);
    });
  });
});
