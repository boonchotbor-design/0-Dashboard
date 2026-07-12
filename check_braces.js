const fs = require('fs');
const content = fs.readFileSync('c:/0_Dashboad/public/summary.html', 'utf8');

// Find try block start
const tryStart = content.indexOf('        try {\n          const wb = XLSX');
const catchIdx = content.indexOf('        } catch (err) {', tryStart);

console.log('try block starts at:', tryStart);
console.log('catch starts at:', catchIdx);

const block = content.substring(tryStart, catchIdx);

// Track brace balance line by line
let depth = 0;
let lineNum = 0;

// Count lines before tryStart to get correct line number
const linesBefore = content.substring(0, tryStart).split('\n').length;

block.split('\n').forEach((line, idx) => {
  const opens = (line.match(/{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  depth += opens - closes;
  if (depth <= 0 && idx > 0) {
    console.log(`Line ${linesBefore + idx}: depth=${depth} | ${line.trim().substring(0,80)}`);
  }
});

console.log('\nFinal depth (should be 1 for try{):', depth);
