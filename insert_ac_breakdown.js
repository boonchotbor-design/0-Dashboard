const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let content = fs.readFileSync(filePath, 'utf8');

const anchor = '              // Update UI elements';
const idx = content.indexOf(anchor);

if (idx > -1) {
  const insertCode = `
            const setUI = (id, val) => { const el = document.getElementById(id); if (el && val !== null) el.textContent = val; };
            const fmtBaht = v => Number(v || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 }) + ' ฿';
            const fmtB = v => v ? fmtBaht(v) : '-';
            
            // Set AC#1 Prev Breakdown
            setUI('dtlAC12023', fmtB(vAc123));
            setUI('dtlAC12024', fmtB(vAc124));
            setUI('dtlAC12025', fmtB(vAc125));
            setUI('dtlAC12026', fmtB(vAc126));
            setUI('dtlAC1Total', fmtB((Number(vAc123)||0)+(Number(vAc124)||0)+(Number(vAc125)||0)+(Number(vAc126)||0)));

            // Set AC#2 Prev Breakdown
            setUI('dtlAC22023', fmtB(vAc223));
            setUI('dtlAC22024', fmtB(vAc224));
            setUI('dtlAC22025', fmtB(vAc225));
            setUI('dtlAC22026', fmtB(vAc226));
            setUI('dtlAC2Total', fmtB((Number(vAc223)||0)+(Number(vAc224)||0)+(Number(vAc225)||0)+(Number(vAc226)||0)));
`;
  content = content.substring(0, idx) + insertCode + content.substring(idx);
  fs.writeFileSync(filePath, content);
  console.log('Inserted AC breakdown UI updates');
} else {
  console.log('Anchor not found');
}
