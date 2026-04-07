import http from 'k6/http';
import { check } from 'k6';
import { sharedConfig } from './k6-config.js';

/**
 * Smoke/Sanity Test Scenarios
 * Quick validation that critical endpoints are functional
 * For forgewright project
 */
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

const BASE_URL = sharedConfig.baseUrl;
const criticalEndpoints = [
  { path: '/health', expectedStatus: 200 },
  { path: '/api/status', expectedStatus: 200 },
];

export default function () {
  for (const endpoint of criticalEndpoints) {
    const res = http.get(`${BASE_URL}${endpoint.path}`);
    check(res, {
      [`${endpoint.path} is healthy`]: () => res.status === endpoint.expectedStatus,
      [`${endpoint.path} responds < 1s`]: () => res.timings.duration < 1000,
    });
  }
}
