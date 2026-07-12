const xlsx = require('xlsx');
const wb = xlsx.readFile('c:/0_Dashboad/Dashboard_Template_30_Slides_Final.xlsx');
const p4 = xlsx.utils.sheet_to_json(wb.Sheets['Part 4 - Financials'], {defval: ''});

const getV = (row) => { const k = Object.keys(row).find(key => key.trim() === 'Value (THB)' || key.trim() === 'Amount (THB)' || key.trim() === 'Value'); return k ? row[k] : null; };

const getValByTitleRegex = (metricRegex, titleKw) => {
  const row = p4.find(r =>
    metricRegex.test(String(r['Metric']).toLowerCase()) &&
    String(r['Slide Title'] || '').toLowerCase().includes(titleKw.toLowerCase())
  );
  return row ? getV(row) : null;
};

const reportWeek = 29;
let reAc1Prev = new RegExp(`action plan ac#?1 wk${reportWeek}`, 'i');
let vAc123 = getValByTitleRegex(reAc1Prev, '2023');
let vAc124 = getValByTitleRegex(reAc1Prev, '2024');
let vAc125 = getValByTitleRegex(reAc1Prev, '2025');
let vAc126 = getValByTitleRegex(reAc1Prev, '2026');

console.log('vAc123:', vAc123);
console.log('vAc124:', vAc124);
console.log('vAc125:', vAc125);
console.log('vAc126:', vAc126);
