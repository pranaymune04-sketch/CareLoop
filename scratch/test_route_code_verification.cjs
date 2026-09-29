const { matchRoutes } = require('react-router-dom');

const hwRoutes = [
  { path: '/health-worker', element: 'HealthWorkerDashboard' },
  { path: '/health-worker/patients', element: 'HealthWorkerPatients' },
  { path: '/health-worker/patients/register', element: 'HealthWorkerRegisterPatient' },
  { path: '/health-worker/patients/:id', element: 'HealthWorkerPatientProfile' },
  { path: '/health-worker/create-referral', element: 'CreateReferralEntry' },
  { path: '/health-worker/create-referral/normal', element: 'CreateNormalReferral' },
  { path: '/health-worker/create-referral/emergency', element: 'CreateEmergencyReferral' },
  { path: '/health-worker/referrals', element: 'HealthWorkerReferrals' },
  { path: '/health-worker/referrals/at-risk', element: 'HealthWorkerAtRiskReferrals' },
  { path: '/health-worker/referrals/:id', element: 'HealthWorkerReferralDetail' },
];

const testCases = [
  { path: '/health-worker/referrals/at-risk', expectedElement: 'HealthWorkerAtRiskReferrals', mustNotBe: 'HealthWorkerReferralDetail' },
  { path: '/health-worker/referrals/ref_001', expectedElement: 'HealthWorkerReferralDetail' },
  { path: '/health-worker/patients/register', expectedElement: 'HealthWorkerRegisterPatient', mustNotBe: 'HealthWorkerPatientProfile' },
  { path: '/health-worker/patients/pat_001', expectedElement: 'HealthWorkerPatientProfile' },
  { path: '/health-worker/create-referral/emergency', expectedElement: 'CreateEmergencyReferral' },
  { path: '/health-worker/create-referral/normal', expectedElement: 'CreateNormalReferral' },
  { path: '/health-worker/create-referral', expectedElement: 'CreateReferralEntry' },
  { path: '/health-worker/referrals', expectedElement: 'HealthWorkerReferrals' },
  { path: '/health-worker/patients', expectedElement: 'HealthWorkerPatients' },
  { path: '/health-worker', expectedElement: 'HealthWorkerDashboard' },
];

console.log('=== REACT ROUTER CODE-LEVEL MATCH VERIFICATION ===\n');
let allPassed = true;

for (const tc of testCases) {
  const matches = matchRoutes(hwRoutes, tc.path);
  if (!matches || matches.length === 0) {
    console.error(`FAIL: ${tc.path} matched NO routes!`);
    allPassed = false;
    continue;
  }

  const matchedRoute = matches[matches.length - 1].route;
  const matchedElement = matchedRoute.element;
  const params = matches[matches.length - 1].params;

  const passedExpected = matchedElement === tc.expectedElement;
  const passedMustNot = !tc.mustNotBe || matchedElement !== tc.mustNotBe;

  if (passedExpected && passedMustNot) {
    console.log(`PASS: "${tc.path}" -> Matched Route: "${matchedRoute.path}" -> Component: <${matchedElement} /> | Params: ${JSON.stringify(params)}`);
  } else {
    console.error(`FAIL: "${tc.path}" -> Expected <${tc.expectedElement} />, but matched <${matchedElement} /> (Route: "${matchedRoute.path}")`);
    allPassed = false;
  }
}

console.log('\nResult: All code-level route matches PASSED:', allPassed);
process.exit(allPassed ? 0 : 1);
