/**
 * Pact Broker / Standalone Configuration
 * Configure for Pact Broker integration or standalone mode
 * For forgewright project
 */
module.exports = {
  // Standalone mode (default)
  standalone: {
    port: 1234,
    host: 'localhost',
  },

  // Broker mode (uncomment when using Pact Broker)
  // broker: {
  //   url: process.env.PACT_BROKER_URL || 'http://localhost:8080',
  //   auth: {
  //     username: process.env.PACT_BROKER_USERNAME,
  //     password: process.env.PACT_BROKER_PASSWORD,
  //   },
  //   publish: process.env.CI === 'true',
  //   consumerVersion: process.env.GIT_COMMIT || 'local',
  // },

  // Provider verification settings
  provider: {
    name: 'forgewright-api',
    port: 3000,
    baseUrl: process.env.PROVIDER_BASE_URL || 'http://localhost:3000',
  },

  // Match rules for contract compatibility
  pactFiles: ['./tests/contracts/pacts/*.json'],

  // Verification settings
  verification: {
    timeout: 30000,
    retry: 3,
  },
};
