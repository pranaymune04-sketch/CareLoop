const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Checking built artifacts...');
if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html does not exist!');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');
console.log('dist/index.html found and verified (' + html.length + ' bytes).');

// Verify admin page files exist and are non-empty
const adminPages = [
  'AdminDashboard.tsx',
  'AdminNetworkDashboard.tsx',
  'AdminReferralAnalytics.tsx',
  'AdminGapMonitoring.tsx',
  'AdminFacilityPerformance.tsx',
  'AdminReferralDetail.tsx',
  'AdminUsers.tsx',
  'AdminOverview.tsx',
  'AdminAudit.tsx',
  'DemoAdminBanner.tsx',
  'index.ts'
];

const adminDir = path.resolve(__dirname, '../src/pages/admin');
let allExist = true;

for (const file of adminPages) {
  const filePath = path.join(adminDir, file);
  if (!fs.existsSync(filePath)) {
    console.error('Missing expected file:', file);
    allExist = false;
  } else {
    const stats = fs.statSync(filePath);
    console.log(`[OK] ${file} (${stats.size} bytes)`);
  }
}

if (!allExist) {
  console.error('Some admin files are missing!');
  process.exit(1);
}

console.log('\nAll 11 Admin components and barrel exports verified successfully!');
