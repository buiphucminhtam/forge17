/**
 * Pact Contract Testing Configuration
 * Defines provider/consumer setup for API contract validation
 * For forgewright project
 */
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const { like, eachLike, string, integer } = MatchersV3;

export const pactConfig = {
  dir: './tests/contracts/pacts',
  logLevel: 'warn',
  spec: 3,
};

export const createProvider = (name: string) =>
  new PactV3({
    consumer: 'forgewright-client',
    provider: name,
    dir: pactConfig.dir,
    logLevel: pactConfig.logLevel,
    spec: pactConfig.spec,
  });

export const createConsumer = (name: string) =>
  new PactV3({
    consumer: name,
    provider: 'forgewright-api',
    dir: pactConfig.dir,
    logLevel: pactConfig.logLevel,
    spec: pactConfig.spec,
  });

// Matchers for contract definitions
export const matchers = {
  skill: like({
    id: string('software-engineer'),
    name: string('Software Engineer'),
    version: string('1.0.0'),
    description: string('Mock description'),
  }),

  skillList: eachLike({
    id: string('software-engineer'),
    name: string('Software Engineer'),
    version: string('1.0.0'),
  }),

  project: like({
    id: string('p1'),
    name: string('Test Project'),
    status: string('active'),
    createdAt: string('2026-01-01'),
  }),

  projectList: eachLike({
    id: string('p1'),
    name: string('Test Project'),
    status: string('active'),
  }),

  analysis: like({
    id: string('analysis-1'),
    status: string('completed'),
    results: like({
      symbols: integer(100),
      relationships: integer(250),
      flows: integer(15),
    }),
  }),

  health: like({
    status: string('healthy'),
    timestamp: string('2026-01-01T00:00:00.000Z'),
  }),
};
