const xlsx = require('xlsx');
const wb = xlsx.readFile('Dashboard_Template_30_Slides_Final.xlsx');

// The real data sheet is "2026"
const sheet = wb.Sheets['2026'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Row 0 = top header (PM/CPO grouping)
// Row 1 = summary/grand total row
// Row 2 = column headers
// Row 3+ = data rows

const headers = rows[2];
console.log('\n=== COLUMN HEADERS (Row 2) ===');
headers.forEach((h, i) => {
  if (h !== '') console.log(`  Col ${i} [${String.fromCharCode(65 + (i >= 26 ? 0 : i))}${i >= 26 ? i-25 : ''}]: "${h}"`);
});

// Print summary row (Row 1)
console.log('\n=== SUMMARY ROW (Row 1) ===');
rows[1].forEach((v, i) => {
  if (v !== '' && v !== 0 && headers[i]) {
    console.log(`  [${headers[i]}]: ${v}`);
  }
});

// Print first data row
console.log('\n=== SAMPLE DATA ROW (Row 3) ===');
rows[3].forEach((v, i) => {
  if (v !== '' && headers[i]) {
    console.log(`  [${headers[i]}]: ${v}`);
  }
});

// Count unique projects, PEs, DOC owners
const dataRows = rows.slice(3).filter(r => r[0] !== '');
const projects = {};
const peOwners = {};
const docOwners = {};
const workTypes = {};
const statusGroups = {};

dataRows.forEach(r => {
  const project = r[6];
  const pe = r[17];
  const doc = r[18];
  const workType = r[57];
  const status = r[56];
  const remain = r[63];
  const aging1 = r[54];
  const aging2 = r[55];
  const estimateFinalIncome = r[27];
  const ar = r[43];
  const ap = r[44];
  const ac1Amount = r[58];
  const ac1Done = r[59];
  const aging1val = r[60];
  const ac2Amount = r[61];
  const ac2Done = r[62];
  const aging2val = r[63]; // wait, let me re-check

  if (!projects[project]) projects[project] = { count: 0, remain: 0, income: 0, ar: 0, ap: 0 };
  projects[project].count++;
  projects[project].remain += parseFloat(remain) || 0;
  projects[project].income += parseFloat(estimateFinalIncome) || 0;
  projects[project].ar += parseFloat(ar) || 0;
  projects[project].ap += parseFloat(ap) || 0;

  if (pe) {
    if (!peOwners[pe]) peOwners[pe] = { count: 0, aging1Sum: 0, aging2Sum: 0 };
    peOwners[pe].count++;
    peOwners[pe].aging1Sum += parseFloat(aging1) || 0;
    peOwners[pe].aging2Sum += parseFloat(aging2) || 0;
  }

  if (doc) {
    if (!docOwners[doc]) docOwners[doc] = { count: 0, aging1Sum: 0, aging2Sum: 0 };
    docOwners[doc].count++;
    docOwners[doc].aging1Sum += parseFloat(aging1) || 0;
    docOwners[doc].aging2Sum += parseFloat(aging2) || 0;
  }

  if (workType) {
    if (!workTypes[workType]) workTypes[workType] = { count: 0, remain: 0 };
    workTypes[workType].count++;
    workTypes[workType].remain += parseFloat(remain) || 0;
  }

  if (status) {
    statusGroups[status] = (statusGroups[status] || 0) + 1;
  }
});

console.log('\n=== PROJECTS ===');
Object.entries(projects).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.count} sites | Income: ${v.income.toFixed(2)} | AR: ${v.ar.toFixed(2)} | AP: ${v.ap.toFixed(2)} | Remain: ${v.remain.toFixed(2)}`);
});

console.log('\n=== PE OWNERS ===');
Object.entries(peOwners).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.count} sites | AvgAging1: ${(v.aging1Sum/v.count).toFixed(2)} | AvgAging2: ${(v.aging2Sum/v.count).toFixed(2)}`);
});

console.log('\n=== DOC OWNERS ===');
Object.entries(docOwners).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.count} sites | AvgAging1: ${(v.aging1Sum/v.count).toFixed(2)} | AvgAging2: ${(v.aging2Sum/v.count).toFixed(2)}`);
});

console.log('\n=== WORK TYPES ===');
Object.entries(workTypes).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.count} sites | Remain: ${v.remain.toFixed(2)}`);
});

console.log('\n=== STATUS ===');
Object.entries(statusGroups).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});

// Calculate overall financials
const totalIncome = dataRows.reduce((s, r) => s + (parseFloat(r[27]) || 0), 0);
const totalAR = dataRows.reduce((s, r) => s + (parseFloat(r[43]) || 0), 0);
const totalAP = dataRows.reduce((s, r) => s + (parseFloat(r[44]) || 0), 0);
const totalRemain = dataRows.reduce((s, r) => s + (parseFloat(r[63]) || 0), 0);
const avgAging1 = dataRows.reduce((s, r) => s + (parseFloat(r[54]) || 0), 0) / dataRows.length;
const avgAging2 = dataRows.reduce((s, r) => s + (parseFloat(r[55]) || 0), 0) / dataRows.length;

console.log('\n=== OVERALL FINANCIALS ===');
console.log(`  Total Rows: ${dataRows.length}`);
console.log(`  Total Estimate Final Income: ${totalIncome.toFixed(2)}`);
console.log(`  Total AR: ${totalAR.toFixed(2)}`);
console.log(`  Total AP: ${totalAP.toFixed(2)}`);
console.log(`  Total Remain (col 63): ${totalRemain.toFixed(2)}`);
console.log(`  Avg Aging1 (col 54): ${avgAging1.toFixed(2)}`);
console.log(`  Avg Aging2 (col 55): ${avgAging2.toFixed(2)}`);

// Check AC columns
const totalAC1Amount = dataRows.reduce((s, r) => s + (parseFloat(r[58]) || 0), 0);
const totalAC1Done = dataRows.reduce((s, r) => s + (parseFloat(r[59]) || 0), 0);
const totalAC2Amount = dataRows.reduce((s, r) => s + (parseFloat(r[61]) || 0), 0);
const totalAC2Done = dataRows.reduce((s, r) => s + (parseFloat(r[62]) || 0), 0);
const avgAging1val = dataRows.reduce((s, r) => s + (parseFloat(r[60]) || 0), 0) / dataRows.length;
const avgAging2val = dataRows.reduce((s, r) => s + (parseFloat(r[63]) || 0), 0) / dataRows.length;

console.log('\n=== AC ACCEPTANCE ===');
console.log(`  AC1 Amount (col 58): ${totalAC1Amount.toFixed(2)}`);
console.log(`  AC1 Done (col 59): ${totalAC1Done.toFixed(2)}`);
console.log(`  AC1 Avg Aging (col 60): ${avgAging1val.toFixed(2)}`);
console.log(`  AC2 Amount (col 61): ${totalAC2Amount.toFixed(2)}`);
console.log(`  AC2 Done (col 62): ${totalAC2Done.toFixed(2)}`);
