const fs = require('fs');
const content = fs.readFileSync('c:/0_Dashboad/public/summary.html', 'utf8');

const tryStart = content.indexOf('        try {\n          const wb = XLSX');
const catchIdx = content.indexOf('        } catch (err) {', tryStart);

const block = content.substring(tryStart, catchIdx);
const linesBefore = content.substring(0, tryStart).split('\n').length;

let depth = 0;
let prev = 1;
let inString = false;
let strChar = '';

block.split('\n').forEach((line, idx) => {
  const lineNo = linesBefore + idx;
  const opens = (line.match(/{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  depth += opens - closes;
  
  // Report when depth goes up then down suddenly or at suspicious values
  if (depth < prev && depth <= 1) {
    console.log(`Line ${lineNo}: depth now ${depth} | ${line.trim().substring(0, 100)}`);
  }
  prev = depth;
});

console.log('\nFinal depth:', depth);
