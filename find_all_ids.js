const fs = require('fs');
const h = fs.readFileSync('public/summary.html', 'utf8');
const idMatch = h.match(/id="([^"]+)"/g) || [];
const ids = idMatch.map(s => s.substring(4, s.length - 1));
const uniqueIds = [...new Set(ids)];

const saveMatch = h.match(/const VALUE_IDS = \[\s*([\s\S]*?)\s*\];/);
const savedIdsStr = saveMatch ? saveMatch[1] : '';
const savedIds = new Set();
const re = /'([^']+)'/g;
let m;
while ((m = re.exec(savedIdsStr)) !== null) {
  savedIds.add(m[1]);
}

console.log('All unique IDs in HTML:', uniqueIds.length);
console.log('IDs in VALUE_IDS:', savedIds.size);
const missing = uniqueIds.filter(id => !savedIds.has(id));
console.log('Missing IDs from VALUE_IDS:');
console.log(missing.join(', '));
