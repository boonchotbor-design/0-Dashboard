const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let content = fs.readFileSync(filePath, 'utf8');

const anchor = "if (actPlan === null) actPlan = getSum('action plan');";
const idx = content.indexOf(anchor);

if (idx > -1) {
  const insertCode = `
            const fmtBaht = v => Number(v || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 }) + ' ฿';
            const setUI = (id, val) => { const el = document.getElementById(id); if (el && val !== null) el.textContent = val; };
            setUI('finIncome', fmtBaht(income));
            setUI('finAR', fmtBaht(ar));
            setUI('finAP', fmtBaht(ap));
            setUI('finBacklog', fmtBaht(backlog));
            if (ac2tgt !== null) setUI('finAC2Target', fmtBaht(ac2tgt));
            if (actPlan !== null) setUI('finActionPlan', fmtBaht(actPlan));
`;
  content = content.substring(0, idx + anchor.length) + insertCode + content.substring(idx + anchor.length);
  fs.writeFileSync(filePath, content);
  console.log('Inserted Financial Details UI updates');
} else {
  console.log('Anchor not found');
}
