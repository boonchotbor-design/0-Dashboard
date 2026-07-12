const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let content = fs.readFileSync(filePath, 'utf8');

const brokenStart = content.indexOf('              });\n                  if (!isNaN(aging1)) {\r\n');
const afterMark = '              // Update UI elements';
const afterIdx = content.indexOf(afterMark);

console.log('Replacing chars', brokenStart, 'to', afterIdx);

// New replacement: close the Sheet1 forEach properly, then remove orphaned aging code
const newBlock = '              });\n            }\n\n';

content = content.substring(0, brokenStart) + newBlock + content.substring(afterIdx);
fs.writeFileSync(filePath, content);
console.log('Fixed. New length:', content.length);
