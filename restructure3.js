const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

h = h.replace('.main-grid {\n      display: grid;\n      grid-template-columns: 1fr 1fr;', '.main-grid {\n      display: flex;\n      align-items: flex-start;\n    }\n    .main-grid > div.col-left, .main-grid > div.col-right {\n      flex: 1;\n      display: flex;\n      flex-direction: column;\n      gap: 20px;\n      min-width: 0;');

const mainGridRegex = /<div class="main-grid">([\s\S]*?)<\/div>\s*<\/div>\s*<script>/;
const match = h.match(mainGridRegex);

if (match) {
   let inner = match[1];
   const mStart = inner.indexOf('<div class="card">'); 
   const oStart = inner.indexOf('<!-- Card: Overall Team Install -->');
   const dStart = inner.indexOf('<div class="card">', oStart + 20); 
   const sStart = inner.indexOf('<!-- Card: SLA Onprocess -->');
   
   if (mStart !== -1 && oStart !== -1 && dStart !== -1 && sStart !== -1) {
       const milestone = inner.substring(mStart, oStart).trim();
       const overall = inner.substring(oStart, dStart).trim();
       const docOwner = inner.substring(dStart, sStart).trim();
       
       // sla needs to keep everything until the last </div>
       // inner ends with `      <div class="card">...</div>\n    `
       // wait! if `match` goes up to `</div>\n  </div>\n  <script>`, then match[1] ends right before the closing </div> of main-grid.
       const sla = inner.substring(sStart).trim();

       let newInner = '\n      <div class="col-left">\n        ' + milestone + '\n\n        ' + docOwner + '\n\n        ' + overall + '\n      </div>\n      <div class="col-right">\n        ' + sla + '\n      </div>\n    ';

       h = h.replace(match[1], newInner);
       fs.writeFileSync('public/summary.html', h);
       console.log('Restructure successful');
   } else {
       console.log('Inner bounds failed');
   }
} else {
   console.log('Regex failed');
}
