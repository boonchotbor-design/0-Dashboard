const fs = require('fs');
const h = fs.readFileSync('public/summary.html', 'utf8');
const lines = h.split('\n');

// Find all getElementById calls that SET data
const setIds = new Set();
lines.forEach(l => {
  const m = l.match(/document\.getElementById\(['"]([^'"]+)['"]\)(?:\.textContent|\.innerHTML)/);
  if(m) setIds.add(m[1]);
});

// Find what's in saveDashboard VALUE_IDS
const saveStart = lines.findIndex(l => l.includes('function saveDashboard'));
let inList = false;
const savedIds = new Set();
for(let i=saveStart; i<saveStart+60; i++) {
  if(lines[i] && lines[i].includes('weekBadge')) inList = true;
  if(inList) {
    const matches = lines[i].match(/'([a-zA-Z][a-zA-Z0-9]+)'/g);
    if(matches) matches.forEach(m => savedIds.add(m.replace(/'/g,'')));
    if(lines[i] && lines[i].includes('];')) break;
  }
}

// IDs that get SET during import but NOT in save list
const missing = [...setIds].filter(id => !savedIds.has(id)).sort();
console.log('Missing from saveDashboard VALUE_IDS:');
missing.forEach(id => console.log(' -', id));
console.log('\nTotal set:', setIds.size, 'Saved:', savedIds.size, 'Missing:', missing.length);
