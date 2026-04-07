import http from 'k6/http';
import { check, sleep } from 'k6';
import { sharedConfig } from './k6-config.js';

/**
 * Load Test Scenarios
 * Simulates sustained normal traffic patterns
 * For forgewright project
 */
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '10m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = sharedConfig.baseUrl;

export default function () {
  // API Health Check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });

  // User browsing scenario
  const pages = [
    '/api/users',
    '/api/projects',
    '/api/skills',
  ];

  for (const page of pages) {
    const res = http.get(`${BASE_URL}${page}`);
    check(res, {
      [`${page} returns 200`]: (r) => r.status === 200,
      [`${page} response time < 500ms`]: (r) => r.timings.duration < 500,
    });
    sleep(1 + Math.random() * 2);
  }
}
