const http = require('http');
const { matchRoutes } = require('react-router-dom');

const facilityRoutes = [
  { path: '/facility', element: 'FacilityDashboard' },
  { path: '/facility/incoming', element: 'FacilityIncoming' },
  { path: '/facility/incoming/:id', element: 'FacilityReferralDetail' },
  { path: '/facility/referrals', element: 'FacilityReferrals' },
  { path: '/facility/referrals/:id', element: 'FacilityReferralDetail' },
  { path: '/facility/capacity', element: 'FacilityCapacity' },
];

const testCases = [
  { path: '/facility', expectedElement: 'FacilityDashboard' },
  { path: '/facility/incoming', expectedElement: 'FacilityIncoming' },
  { path: '/facility/incoming/ref_001', expectedElement: 'FacilityReferralDetail' },
  { path: '/facility/incoming/ref_008', expectedElement: 'FacilityReferralDetail' },
  { path: '/facility/referrals', expectedElement: 'FacilityReferrals' },
  { path: '/facility/referrals/ref_001', expectedElement: 'FacilityReferralDetail' },
  { path: '/facility/referrals/ref_006', expectedElement: 'FacilityReferralDetail' },
  { path: '/facility/capacity', expectedElement: 'FacilityCapacity' },
];

console.log('=== 1. CODE-LEVEL ROUTE MATCHING VERIFICATION (REACT ROUTER) ===\n');
let allMatchOk = true;

for (const tc of testCases) {
  const matches = matchRoutes(facilityRoutes, tc.path);
  if (!matches || matches.length === 0) {
    console.error(`FAIL: ${tc.path} matched NO routes!`);
    allMatchOk = false;
    continue;
  }

  const matchedRoute = matches[matches.length - 1].route;
  const matchedElement = matchedRoute.element;
  const params = matches[matches.length - 1].params;

  if (matchedElement === tc.expectedElement) {
    console.log(`PASS: "${tc.path}" -> Matched Route: "${matchedRoute.path}" -> Component: <${matchedElement} /> | Params: ${JSON.stringify(params)}`);
  } else {
    console.error(`FAIL: "${tc.path}" -> Expected <${tc.expectedElement} />, but matched <${matchedElement} />`);
    allMatchOk = false;
  }
}

console.log(`\nCode-Level Route Matches: ${allMatchOk ? 'ALL PASS' : 'FAIL'}\n`);

console.log('=== 2. HTTP SERVER VERIFICATION (http://localhost:5173) ===\n');

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          hasCareLoop: data.includes('CareLoop') || data.includes('vite') || data.includes('<div id="root">')
        });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function runHttpTests() {
  const httpRoutes = [
    '/facility',
    '/facility/incoming',
    '/facility/incoming/ref_001',
    '/facility/incoming/ref_008',
    '/facility/referrals',
    '/facility/referrals/ref_001',
    '/facility/referrals/ref_006',
    '/facility/capacity',
  ];

  let allHttpOk = true;
  for (const r of httpRoutes) {
    const res = await checkRoute(r);
    console.log(`${r} -> Status: ${res.statusCode}, SPA Root: ${res.hasCareLoop}`);
    if (res.statusCode !== 200) allHttpOk = false;
  }

  console.log(`\nHTTP Server Verification: ${allHttpOk ? 'ALL PASS' : 'FAIL'}`);
  process.exit(allMatchOk && allHttpOk ? 0 : 1);
}

runHttpTests();
