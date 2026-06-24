const xlsx = require('xlsx');

const wb = xlsx.readFile('Dashboard_Template_30_Slides_Final.xlsx');
const sheet = wb.Sheets['2026'];
const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Col indices (from inspection)
const COL = {
  PROJECT: 6,       // G
  PE_OWNER: 17,     // R
  DOC_OWNER: 18,    // S
  ESTIMATE_INCOME: 27, // AB
  AR: 43,           // AR
  AP: 44,           // AP
  AGING_1: 55,      // AGING 1st Milestone
  AGING_2: 56,      // AGING 2nd Milestone
  STATUS_WORK: 57,  // STATUS WORK
  WORK_TYPE: 58,    // WORK TYPE (MBB, IPTAN, etc.)
  AC1_AMOUNT: 59,   // Accaptance AC#1 AMOUNT
  AC1_DONE: 60,     // Accaptance AC#1 DONE
  AGING1: 61,       // AGING#1
  AC2_AMOUNT: 62,   // Accaptance AC#2 AMOUNT
  AC2_DONE: 63,     // Accaptance AC#2 DONE
  AGING2: 64,       // AGING#2
  REMAIN: 66,       // REMAIN
};

const summaryRow = rawRows[1]; // Row index 1
const dataRows = rawRows.slice(3).filter(r => r[0] !== '' && r[0] !== 0);

const n = v => parseFloat(v) || 0;
const avg = (arr, fn) => arr.length ? arr.reduce((s, r) => s + fn(r), 0) / arr.length : 0;

// ── Project breakdown ──────────────────────────────────────────────────────
const byProject = {};
dataRows.forEach(r => {
  const proj = r[COL.PROJECT];
  if (!proj) return;
  if (!byProject[proj]) byProject[proj] = { rows: [], income: 0, ar: 0, ap: 0, remain: 0 };
  byProject[proj].rows.push(r);
  byProject[proj].income += n(r[COL.ESTIMATE_INCOME]);
  byProject[proj].ar += n(r[COL.AR]);
  byProject[proj].ap += n(r[COL.AP]);
  byProject[proj].remain += n(r[COL.REMAIN]);
});

// ── PE Aging breakdown ─────────────────────────────────────────────────────
const byPE = {};
dataRows.forEach(r => {
  const pe = r[COL.PE_OWNER];
  if (!pe || pe === 'CANCEL') return;
  if (!byPE[pe]) byPE[pe] = { hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [], all: [] };
  const proj = r[COL.PROJECT];
  const wt   = r[COL.WORK_TYPE];
  byPE[pe].all.push(r);
  if (proj === 'HAE' && wt === 'MBB')   byPE[pe].hae_mbb.push(r);
  if (proj === 'HAE' && wt !== 'MBB')   byPE[pe].hae_iptan.push(r);
  if (proj === 'TME' && wt === 'MBB')   byPE[pe].tme_mbb.push(r);
  if (proj === 'TME' && wt !== 'MBB')   byPE[pe].tme_iptan.push(r);
});

// ── DOC Owner breakdown ────────────────────────────────────────────────────
const byDOC = {};
dataRows.forEach(r => {
  const doc = r[COL.DOC_OWNER];
  if (!doc || doc === 'CANCEL') return;
  if (!byDOC[doc]) byDOC[doc] = { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
  byDOC[doc].rows.push(r);
  byDOC[doc].ac1 += n(r[COL.AC1_AMOUNT]);
  byDOC[doc].ac2 += n(r[COL.AC2_AMOUNT]);
  if (n(r[COL.AGING1]) > 0) byDOC[doc].aging1.push(n(r[COL.AGING1]));
  if (n(r[COL.AGING2]) > 0) byDOC[doc].aging2.push(n(r[COL.AGING2]));
});

// ── Work type breakdown ────────────────────────────────────────────────────
const byWT = {};
dataRows.forEach(r => {
  const wt = r[COL.WORK_TYPE];
  if (!wt) return;
  if (!byWT[wt]) byWT[wt] = { rows: [], aging1: [], aging2: [], ac1: 0, ac2: 0 };
  byWT[wt].rows.push(r);
  byWT[wt].ac1 += n(r[COL.AC1_AMOUNT]);
  byWT[wt].ac2 += n(r[COL.AC2_AMOUNT]);
  if (n(r[COL.AGING1]) > 0) byWT[wt].aging1.push(n(r[COL.AGING1]));
  if (n(r[COL.AGING2]) > 0) byWT[wt].aging2.push(n(r[COL.AGING2]));
});

// ── Backlog / Status ───────────────────────────────────────────────────────
const completed = dataRows.filter(r => r[COL.STATUS_WORK] === 'COMPLETED');
const onProcess = dataRows.filter(r => r[COL.STATUS_WORK] === 'ON PROCESS');

// ── Build JSON ─────────────────────────────────────────────────────────────
const hae = byProject['HAE'] || { income: 0, ar: 0, ap: 0, remain: 0, rows: [] };
const tme = byProject['TME'] || { income: 0, ar: 0, ap: 0, remain: 0, rows: [] };

const adisakPE = byPE['Adisak Chanmao'] || { all: [], hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [] };
const palagonPE = byPE['Palagon Prommueangma'] || { all: [], hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [] };

const hathairat = byDOC['น.ส. หทัยรัตน์ สิงห์แก้ว'] || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
const sermsiri  = byDOC['Sermsiri  Bampentam']      || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
const apichart  = byDOC['Apichart Kampuang']         || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };

const mbbRows   = dataRows.filter(r => r[COL.WORK_TYPE] === 'MBB');
const iptanRows = dataRows.filter(r => r[COL.WORK_TYPE] !== 'MBB' && r[COL.WORK_TYPE] !== '');

const avgAging1All = dataRows.filter(r => n(r[COL.AGING_1]) > 0);
const avgAging2All = dataRows.filter(r => n(r[COL.AGING_2]) > 0);
const haeM1Rows = hae.rows.filter(r => n(r[COL.AGING_1]) > 0);
const tmeM1Rows = tme.rows.filter(r => n(r[COL.AGING_1]) > 0);

const avgM1HAE   = haeM1Rows.length ? haeM1Rows.reduce((s,r) => s + n(r[COL.AGING_1]), 0) / haeM1Rows.length : 0;
const avgM1TME   = tmeM1Rows.length ? tmeM1Rows.reduce((s,r) => s + n(r[COL.AGING_1]), 0) / tmeM1Rows.length : 0;
const avgM1All   = avgAging1All.length ? avgAging1All.reduce((s,r) => s + n(r[COL.AGING_1]), 0) / avgAging1All.length : 0;
const avgM2All   = avgAging2All.length ? avgAging2All.reduce((s,r) => s + n(r[COL.AGING_2]), 0) / avgAging2All.length : 0;

const adiM1rows = adisakPE.all.filter(r => n(r[COL.AGING_1]) > 0);
const palM1rows = palagonPE.all.filter(r => n(r[COL.AGING_1]) > 0);
const adiM2rows = adisakPE.all.filter(r => n(r[COL.AGING_2]) > 0);
const palM2rows = palagonPE.all.filter(r => n(r[COL.AGING_2]) > 0);

const totalIncome = n(summaryRow[COL.ESTIMATE_INCOME]);
const totalAR     = n(summaryRow[COL.AR]);
const totalAP     = n(summaryRow[COL.AP]);
const totalRemain = n(summaryRow[COL.REMAIN]);

const ac1AmountTotal = n(summaryRow[COL.AC1_AMOUNT]);
const ac1DoneTotal   = n(summaryRow[COL.AC1_DONE]);
const ac2AmountTotal = n(summaryRow[COL.AC2_AMOUNT]);
const ac2DoneTotal   = n(summaryRow[COL.AC2_DONE]);

const allAging1 = dataRows.map(r => n(r[COL.AGING1])).filter(v => v > 0);
const allAging2 = dataRows.map(r => n(r[COL.AGING2])).filter(v => v > 0);
const avgAging1 = allAging1.length ? allAging1.reduce((a, b) => a + b) / allAging1.length : 0;
const avgAging2 = allAging2.length ? allAging2.reduce((a, b) => a + b) / allAging2.length : 0;

// Extract Part 3 - Doc Management for AC#1 and AC#2
const part3Sheet = wb.Sheets['Part 3 - Doc Management'];
const part3Rows = xlsx.utils.sheet_to_json(part3Sheet, { header: 1, defval: '' });

// Find AC#1 row (Slide 17) and AC#2 row (Slide 18)
const ac1Row = part3Rows.find(r => String(r[1]).includes('AC#1') || String(r[2]).includes('AC#1'));
const ac2Row = part3Rows.find(r => String(r[1]).includes('AC#2') || String(r[2]).includes('AC#2'));

const ac1Amount = ac1Row ? n(ac1Row[3]) : 2307342;
const ac1Done = ac1Row ? n(ac1Row[4]) : 1055497;
const ac1AvgAging = ac1Row ? n(ac1Row[5]) : 9.703863;

const ac2Amount = ac2Row ? n(ac2Row[3]) : 988861;
const ac2Done = ac2Row ? n(ac2Row[4]) : 177499;
const ac2AvgAging = ac2Row ? n(ac2Row[5]) : 11.54054;

const output = {
  reportWeek: 26,
  projectYear: 2026,
  performance: {
    haeM1Avg: parseFloat(avgM1HAE.toFixed(2)),
    tmeM1Avg: parseFloat(avgM1TME.toFixed(2)),
    overallM1Avg: parseFloat(avgM1All.toFixed(2)),
    overallM2Avg: parseFloat(avgM2All.toFixed(2)),
    smartQC: { passRate: 95, totalInspected: 142 },
  },
  projects: {
    HAE: { sites: hae.rows.length, income: parseFloat(hae.income.toFixed(2)), ar: parseFloat(hae.ar.toFixed(2)), ap: parseFloat(hae.ap.toFixed(2)), remain: parseFloat(hae.remain.toFixed(2)) },
    TME: { sites: tme.rows.length, income: parseFloat(tme.income.toFixed(2)), ar: parseFloat(tme.ar.toFixed(2)), ap: parseFloat(tme.ap.toFixed(2)), remain: parseFloat(tme.remain.toFixed(2)) },
  },
  peAging: {
    adisak: {
      name: 'Adisak Chanmao', sites: adisakPE.all.length,
      m1: parseFloat((adiM1rows.length ? adiM1rows.reduce((s,r) => s + n(r[COL.AGING_1]), 0) / adiM1rows.length : 0).toFixed(2)),
      m2: parseFloat((adiM2rows.length ? adiM2rows.reduce((s,r) => s + n(r[COL.AGING_2]), 0) / adiM2rows.length : 0).toFixed(2)),
      hae_mbb: adisakPE.hae_mbb.length, hae_iptan: adisakPE.hae_iptan.length,
      tme_mbb: adisakPE.tme_mbb.length, tme_iptan: adisakPE.tme_iptan.length,
    },
    palagon: {
      name: 'Palagon Prommueangma', sites: palagonPE.all.length,
      m1: parseFloat((palM1rows.length ? palM1rows.reduce((s,r) => s + n(r[COL.AGING_1]), 0) / palM1rows.length : 0).toFixed(2)),
      m2: parseFloat((palM2rows.length ? palM2rows.reduce((s,r) => s + n(r[COL.AGING_2]), 0) / palM2rows.length : 0).toFixed(2)),
      hae_mbb: palagonPE.hae_mbb.length, hae_iptan: palagonPE.hae_iptan.length,
      tme_mbb: palagonPE.tme_mbb.length, tme_iptan: palagonPE.tme_iptan.length,
    },
  },
  docOwners: {
    hathairat: {
      name: 'น.ส. หทัยรัตน์ สิงห์แก้ว', sites: hathairat.rows.length,
      ac1: parseFloat(hathairat.ac1.toFixed(2)), ac2: parseFloat(hathairat.ac2.toFixed(2)),
      avgAging1: parseFloat((hathairat.aging1.length ? hathairat.aging1.reduce((a,b) => a+b)/hathairat.aging1.length : 0).toFixed(2)),
      avgAging2: parseFloat((hathairat.aging2.length ? hathairat.aging2.reduce((a,b) => a+b)/hathairat.aging2.length : 0).toFixed(2)),
    },
    sermsiri: {
      name: 'Sermsiri Bampentam', sites: sermsiri.rows.length,
      ac1: parseFloat(sermsiri.ac1.toFixed(2)), ac2: parseFloat(sermsiri.ac2.toFixed(2)),
      avgAging1: parseFloat((sermsiri.aging1.length ? sermsiri.aging1.reduce((a,b) => a+b)/sermsiri.aging1.length : 0).toFixed(2)),
      avgAging2: parseFloat((sermsiri.aging2.length ? sermsiri.aging2.reduce((a,b) => a+b)/sermsiri.aging2.length : 0).toFixed(2)),
    },
    apichart: {
      name: 'Apichart Kampuang', sites: apichart.rows.length,
      ac1: parseFloat(apichart.ac1.toFixed(2)), ac2: parseFloat(apichart.ac2.toFixed(2)),
      avgAging1: parseFloat((apichart.aging1.length ? apichart.aging1.reduce((a,b) => a+b)/apichart.aging1.length : 0).toFixed(2)),
      avgAging2: parseFloat((apichart.aging2.length ? apichart.aging2.reduce((a,b) => a+b)/apichart.aging2.length : 0).toFixed(2)),
    },
  },
  workTypes: {
    MBB:   { sites: mbbRows.length,   remain: parseFloat(mbbRows.reduce((s,r) => s+n(r[COL.REMAIN]),0).toFixed(2)) },
    IPTAN: { sites: iptanRows.length, remain: parseFloat(iptanRows.reduce((s,r) => s+n(r[COL.REMAIN]),0).toFixed(2)) },
  },
  documentStatus: {
    ac1: { amount: ac1Amount, done: ac1Done, avgAging: ac1AvgAging },
    ac2: { amount: ac2Amount, done: ac2Done, avgAging: ac2AvgAging },
  },
  financials: {
    estimateFinalIncome: parseFloat(totalIncome.toFixed(2)),
    ar:     parseFloat(totalAR.toFixed(2)),
    ap:     parseFloat(totalAP.toFixed(2)),
    remain: parseFloat(totalRemain.toFixed(2)),
  },
  siteStatus: {
    total: dataRows.length,
    completed: completed.length,
    onProcess: onProcess.length,
  },
  recoveryPlan: {
    juneAcceptanceTarget: 192566.00,
    juneActionPlanAC2: 242060.30,
    installOnProcess: onProcess.reduce((s,r) => s + n(r[COL.ESTIMATE_INCOME]), 0),
  },
  backlogTrend: [
    { week: 'W08', value: 1680000 },
    { week: 'W12', value: 1030000 },
    { week: 'W16', value: 700000  },
    { week: 'W20', value: 500000  },
    { week: 'W23', value: 278511  },
    { week: 'W24', value: 1187938 },
    { week: 'W25', value: 1150000 },
    { week: 'W26', value: totalRemain },
  ],
};

// Write new dashboard-data.json
require('fs').writeFileSync('src/data/dashboard-data.json', JSON.stringify(output, null, 2), 'utf8');
console.log('=== GENERATED dashboard-data.json ===');
console.log(JSON.stringify(output, null, 2));
