const xlsx = require('xlsx');
const workbook = xlsx.readFile('Copy of Progress Report Record_2026_CPO_PIVOT.xlsx');
const sheet = workbook.Sheets['2026'];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const headers = data[2]; // Row 3 is headers
const rows = data.slice(3);

function getColIndex(name) {
  return headers.indexOf(name);
}

const colProject = getColIndex('Project');
const colWorkType = getColIndex('WORK TYPE');
const colPE = getColIndex('PE Owner');
const colDocOwner = getColIndex('DOC Owner');
const colM1 = getColIndex('AGING 1st Milestone');
const colM2 = getColIndex('AGING 2nd Milestone');
const colAC1Amount = getColIndex('Accaptance AC#1 AMOUNT');
const colAC1Done = getColIndex('Accaptance AC#1 DONE');
const colAging1 = getColIndex('AGING#1');
const colAC2Amount = getColIndex('Accaptance AC#2 AMOUNT');
const colAC2Done = getColIndex('Accaptance AC#2 DONE');
const colAging2 = getColIndex('AGING#2');
const colIncome = getColIndex('ESTIMATE FINAL INCOME');
const colAR = getColIndex('AR');
const colAP = getColIndex('AP');
const colRemain = getColIndex('REMAIN');

let stats = {
  haeM1: [], tmeM1: [],
  peAdisakM1: [], peAdisakM2: [],
  pePalagonM1: [], pePalagonM2: [],
  docHathairat: [], docSermsiri: [], docApichart: [],
  ac1Amount: 0, ac1Done: 0, aging1: [],
  ac2Amount: 0, ac2Done: 0, aging2: [],
  income: 0, ar: 0, ap: 0, remain: 0
};

rows.forEach(r => {
  if (!r || r.length === 0) return;
  const proj = r[colProject];
  const m1 = parseFloat(r[colM1]);
  const m2 = parseFloat(r[colM2]);
  
  if (proj === 'HAE' && !isNaN(m1)) stats.haeM1.push(m1);
  if (proj === 'TME' && !isNaN(m1)) stats.tmeM1.push(m1);
  
  const pe = r[colPE] || '';
  if (pe.includes('Adisak')) {
    if (!isNaN(m1)) stats.peAdisakM1.push(m1);
    if (!isNaN(m2)) stats.peAdisakM2.push(m2);
  }
  if (pe.includes('Palagon')) {
    if (!isNaN(m1)) stats.pePalagonM1.push(m1);
    if (!isNaN(m2)) stats.pePalagonM2.push(m2);
  }

  const ac1A = parseFloat(r[colAC1Amount]) || 0;
  const ac1D = parseFloat(r[colAC1Done]) || 0;
  const ag1 = parseFloat(r[colAging1]);
  stats.ac1Amount += ac1A; stats.ac1Done += ac1D;
  if (!isNaN(ag1)) stats.aging1.push(ag1);

  const ac2A = parseFloat(r[colAC2Amount]) || 0;
  const ac2D = parseFloat(r[colAC2Done]) || 0;
  const ag2 = parseFloat(r[colAging2]);
  stats.ac2Amount += ac2A; stats.ac2Done += ac2D;
  if (!isNaN(ag2)) stats.aging2.push(ag2);

  stats.income += parseFloat(r[colIncome]) || 0;
  stats.ar += parseFloat(r[colAR]) || 0;
  stats.ap += parseFloat(r[colAP]) || 0;
  stats.remain += parseFloat(r[colRemain]) || 0;
});

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

console.log("HAE M1 Avg:", avg(stats.haeM1).toFixed(2));
console.log("TME M1 Avg:", avg(stats.tmeM1).toFixed(2));
console.log("Adisak M1 Avg:", avg(stats.peAdisakM1).toFixed(2), "M2 Avg:", avg(stats.peAdisakM2).toFixed(2));
console.log("Palagon M1 Avg:", avg(stats.pePalagonM1).toFixed(2), "M2 Avg:", avg(stats.pePalagonM2).toFixed(2));
console.log("AC1 Amount:", stats.ac1Amount.toFixed(2), "AC1 Done:", stats.ac1Done.toFixed(2), "Avg Aging1:", avg(stats.aging1).toFixed(2));
console.log("AC2 Amount:", stats.ac2Amount.toFixed(2), "AC2 Done:", stats.ac2Done.toFixed(2), "Avg Aging2:", avg(stats.aging2).toFixed(2));
console.log("Income:", stats.income.toFixed(2), "AR:", stats.ar.toFixed(2), "AP:", stats.ap.toFixed(2), "Remain:", stats.remain.toFixed(2));
