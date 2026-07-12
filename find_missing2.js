const fs = require('fs');
const h = fs.readFileSync('public/summary.html', 'utf8');

// Find saveDashboard
const saveMatch = h.match(/const VALUE_IDS = \[\s*([\s\S]*?)\s*\];/);
if (!saveMatch) { console.log('saveDashboard not found'); process.exit(1); }
const savedIdsStr = saveMatch[1];
const savedIds = new Set();
const re = /'([^']+)'/g;
let m;
while ((m = re.exec(savedIdsStr)) !== null) {
  savedIds.add(m[1]);
}

// Find all document.getElementById assignments in the code
const assignments = new Set();
const lines = h.split('\n');
lines.forEach(l => {
  const match = l.match(/document\.getElementById\(['"]([^'"]+)['"]\)/);
  if (match) {
    if (l.includes('.textContent') || l.includes('.innerHTML') || l.includes('setElIfEmpty')) {
      assignments.add(match[1]);
    }
  }
});

// Also search for setElIfEmpty('ID' usage
const setElRe = /setElIfEmpty\(['"]([^'"]+)['"]/g;
while ((m = setElRe.exec(h)) !== null) {
  assignments.add(m[1]);
}

console.log('--- MISSING IDs ---');
[...assignments].forEach(id => {
  if (!savedIds.has(id)) {
    console.log(id);
  }
});
