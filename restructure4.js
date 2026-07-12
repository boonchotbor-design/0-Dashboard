const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

h = h.replace('.main-grid {\n      display: grid;\n      grid-template-columns: 1fr 1fr;', '.main-grid {\n      display: flex;\n      align-items: flex-start;\n    }\n    .main-grid > div.col-left, .main-grid > div.col-right {\n      flex: 1;\n      display: flex;\n      flex-direction: column;\n      gap: 20px;\n      min-width: 0;');

const s1 = h.indexOf('<div class="main-grid">');

// simple block parsing
let count = 0;
let innerStart = s1 + '<div class="main-grid">'.length;
let endGrid = -1;

for (let i = innerStart; i < h.length; i++) {
   if (h.substring(i, i+4) === '<div') count++;
   if (h.substring(i, i+5) === '</div') count--;
   if (count < 0) {
       endGrid = i;
       break;
   }
}

if (endGrid !== -1) {
   let inner = h.substring(innerStart, endGrid);
   
   const mStart = inner.indexOf('<div class="card">'); 
   const oStart = inner.indexOf('<!-- Card: Overall Team Install -->');
   const dStart = inner.indexOf('<div class="card">', oStart + 20); 
   const sStart = inner.indexOf('<!-- Card: SLA Onprocess -->');
   
   if (mStart !== -1 && oStart !== -1 && dStart !== -1 && sStart !== -1) {
       const milestone = inner.substring(mStart, oStart).trim();
       const overall = inner.substring(oStart, dStart).trim();
       const docOwner = inner.substring(dStart, sStart).trim();
       const sla = inner.substring(sStart).trim();

       let newInner = '\n      <div class="col-left">\n        ' + milestone + '\n\n        ' + docOwner + '\n\n        ' + overall + '\n      </div>\n      <div class="col-right">\n        ' + sla + '\n      </div>\n    ';

       h = h.substring(0, innerStart) + newInner + h.substring(endGrid);
       fs.writeFileSync('public/summary.html', h);
       console.log('Restructure successful');
   } else {
       console.log('Inner bounds failed');
   }
} else {
   console.log('Grid end not found');
}
