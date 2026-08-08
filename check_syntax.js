// Extract all <script> blocks from summary.html and check for syntax errors
const fs = require('fs');
const html = fs.readFileSync('C:/0_Dashboad/public/summary.html', 'utf8');

// Extract script content
const scripts = [];
const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
let m;
let idx = 0;
while ((m = re.exec(html)) !== null) {
  scripts.push({ index: idx++, content: m[1], pos: m.index });
}

console.log(`Found ${scripts.length} inline script blocks`);

// Try to parse each one
const vm = require('vm');
scripts.forEach((s, i) => {
  try {
    new vm.Script(s.content);
    console.log(`Script ${i}: OK`);
  } catch(e) {
    // Find line number in original HTML
    const linesBefore = html.substring(0, s.pos).split('\n').length;
    const errorLine = linesBefore + (e.lineNumber || 0) - 1;
    console.log(`Script ${i}: ERROR at line ~${errorLine} in HTML:`);
    console.log('  ', e.message);
    // Show context
    const scriptLines = s.content.split('\n');
    const errLineInScript = (e.lineNumber || 1) - 1;
    const start = Math.max(0, errLineInScript - 2);
    const end = Math.min(scriptLines.length, errLineInScript + 3);
    scriptLines.slice(start, end).forEach((l, li) => {
      const lineNo = linesBefore + start + li;
      console.log(`  ${lineNo}: ${l.substring(0,120)}`);
    });
  }
});
