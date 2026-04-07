import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { sharedConfig } from './k6-config.js';

/**
 * Stress Test Scenarios
 * Identifies system breaking points under extreme load
 * For forgewright project
 */
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 500 },
    { duration: '10m', target: 1000 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

const errorRate = new Rate('errors');
const BASE_URL = sharedConfig.baseUrl;

export default function () {
  const res = http.get(`${BASE_URL}/api/analysis`, {
    tags: { name: 'AnalysisEndpoint' },
  });

  const isSuccess = check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => r.json('data') !== undefined,
  });

  errorRate.add(!isSuccess);
  sleep(0.5 + Math.random());
}
