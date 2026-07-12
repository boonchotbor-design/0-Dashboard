const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

const s1 = h.indexOf('<div class="main-grid">');
const s2 = h.indexOf('<!-- Card: SLA Onprocess -->');
const sEnd = h.indexOf('<!-- /main-grid -->', s2) !== -1 ? h.indexOf('<!-- /main-grid -->', s2) : h.indexOf('</div>\n\n    <style>', s2);

const pre = h.substring(0, s1);
const mid = h.substring(s1 + '<div class="main-grid">'.length, s2);
const post = h.substring(s2);

const b1_start = mid.indexOf('<div class="card">');
const b2_start = mid.indexOf('<!-- Card: Overall Team Install -->');
const b3_start = mid.indexOf('<div class="card">', b2_start + 10);

const milestone = mid.substring(b1_start, b2_start).trim();
const overall = mid.substring(b2_start, b3_start).trim();
const docOwner = mid.substring(b3_start).trim();

let newGrid = '<div class="main-grid">\n';
newGrid += '      <div style="display:flex; flex-direction:column; gap:20px; min-width:0;">\n';
newGrid += '        ' + milestone + '\n\n';
newGrid += '        ' + docOwner + '\n\n';
newGrid += '        ' + overall + '\n';
newGrid += '      </div>\n';
newGrid += '      <div style="display:flex; flex-direction:column; gap:20px; min-width:0;">\n';

const finalH = pre + newGrid + post.replace('<!-- Card: SLA Onprocess -->', '        <!-- Card: SLA Onprocess -->');

const endGrid = finalH.indexOf('    <div style="text-align: center;');
if (endGrid !== -1) {
    const lastDiv = finalH.lastIndexOf('</div>', endGrid);
    const patchedH = finalH.substring(0, lastDiv) + '      </div>\n    </div>' + finalH.substring(lastDiv + 6);
    fs.writeFileSync('public/summary.html', patchedH);
    console.log('Success');
} else {
    console.log('End grid not found');
}
