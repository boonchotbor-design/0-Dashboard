const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');
h = h.replace("const DASH_VERSION = 'v6';", "const DASH_VERSION = 'v7';");
h = h.replace("'dashboardData2026_v5']).forEach", "'dashboardData2026_v5','dashboardData2026_v6']).forEach");
fs.writeFileSync('public/summary.html', h);
console.log('Version bumped to v7, stale list updated');
