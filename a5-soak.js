import { journey } from './journey.js';

export const options = {
  stages: [
    { duration: '30s', target: 2 },  // ramp up to 2 users
    { duration: '10m', target: 2 },  // hold 2 users for 10 minutes
    { duration: '30s', target: 0 },  // ramp down
  ],
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    'http_req_duration{group:::home}': ['p(95)<1000'],
    'http_req_duration{group:::recommendation}': ['p(95)<1500'],
  },
};

export default function () {
  journey();
}