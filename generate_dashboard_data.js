const fs = require('fs');
const xlsx = require('xlsx');

// Find latest Excel file
let excelPath = 'Dashboard_Template_30_Slides_Final_FIXED.xlsx';
const wkFiles = fs.readdirSync('.').filter(f => f.match(/^Dashboard_Template_30_Slides_Final_WK\d+\.xlsx$/i));
if (wkFiles.length > 0) {
  // Sort to pick highest week
  wkFiles.sort((a, b) => {
    const wA = parseInt(a.match(/WK(\d+)/i)[1]);
    const wB = parseInt(b.match(/WK(\d+)/i)[1]);
    return wB - wA;
  });
  excelPath = wkFiles[0];
}

console.log('Reading Excel file:', excelPath);
const wb = xlsx.readFile(excelPath);
const s26 = wb.Sheets['2026'];
const rawRows = xlsx.utils.sheet_to_json(s26, { header: 1, defval: '' });

const summaryRow = rawRows[1];
const dataRows = rawRows.slice(3).filter(r => r[0] !== '' && r[0] !== 0);

const COL = {
  PROJECT: 6,
  PE_OWNER: 17,
  DOC_OWNER: 18,
  ESTIMATE_INCOME: 27,
  AR: 43,
  AP: 44,
  AGING_1: 55,
  AGING_2: 56,
  STATUS_WORK: 57,
  WORK_TYPE: 58,
  AC1_AMOUNT: 59,
  AC1_DONE: 60,
  AGING1: 61,
  AC2_AMOUNT: 62,
  AC2_DONE: 63,
  AGING2: 64,
  REMAIN: 66,
};

const n = v => parseFloat(v) || 0;

// Project breakdown
const byProject = {};
dataRows.forEach(r => {
  const p = r[COL.PROJECT];
  if (!p) return;
  if (!byProject[p]) byProject[p] = { rows: [], income: 0, ar: 0, ap: 0, remain: 0 };
  byProject[p].rows.push(r);
  byProject[p].income += n(r[COL.ESTIMATE_INCOME]);
  byProject[p].ar += n(r[COL.AR]);
  byProject[p].ap += n(r[COL.AP]);
  byProject[p].remain += n(r[COL.REMAIN]);
});

// PE breakdown
const byPE = {};
dataRows.forEach(r => {
  const pe = r[COL.PE_OWNER];
  if (!pe || pe === 'CANCEL') return;
  if (!byPE[pe]) byPE[pe] = { hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [], all: [] };
  const proj = r[COL.PROJECT];
  const wt = r[COL.WORK_TYPE];
  byPE[pe].all.push(r);
  if (proj === 'HAE' && wt === 'MBB') byPE[pe].hae_mbb.push(r);
  if (proj === 'HAE' && wt !== 'MBB') byPE[pe].hae_iptan.push(r);
  if (proj === 'TME' && wt === 'MBB') byPE[pe].tme_mbb.push(r);
  if (proj === 'TME' && wt !== 'MBB') byPE[pe].tme_iptan.push(r);
});

// DOC Owner breakdown
const byDOC = {};
dataRows.forEach(r => {
  const doc = (r[COL.DOC_OWNER] || '').trim();
  if (!doc || doc === 'CANCEL') return;
  if (!byDOC[doc]) byDOC[doc] = { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
  byDOC[doc].rows.push(r);
  byDOC[doc].ac1 += n(r[COL.AC1_AMOUNT]);
  byDOC[doc].ac2 += n(r[COL.AC2_AMOUNT]);
  if (n(r[COL.AGING1]) > 0) byDOC[doc].aging1.push(n(r[COL.AGING1]));
  if (n(r[COL.AGING2]) > 0) byDOC[doc].aging2.push(n(r[COL.AGING2]));
});

// Work type
const mbbRows = dataRows.filter(r => r[COL.WORK_TYPE] === 'MBB');
const iptanRows = dataRows.filter(r => r[COL.WORK_TYPE] !== 'MBB' && r[COL.WORK_TYPE] !== '');

// Status
const completed = dataRows.filter(r => r[COL.STATUS_WORK] === 'COMPLETED');
const onProcess = dataRows.filter(r => r[COL.STATUS_WORK] === 'ON PROCESS');

// Aging
const m1All = dataRows.filter(r => n(r[COL.AGING_1]) > 0);
const m2All = dataRows.filter(r => n(r[COL.AGING_2]) > 0);
const haeM1 = dataRows.filter(r => r[COL.PROJECT] === 'HAE' && n(r[COL.AGING_1]) > 0);
const tmeM1 = dataRows.filter(r => r[COL.PROJECT] === 'TME' && n(r[COL.AGING_1]) > 0);

const avgM1All = m1All.length ? m1All.reduce((s, r) => s + n(r[COL.AGING_1]), 0) / m1All.length : 0;
const avgM2All = m2All.length ? m2All.reduce((s, r) => s + n(r[COL.AGING_2]), 0) / m2All.length : 0;
const avgM1Hae = haeM1.length ? haeM1.reduce((s, r) => s + n(r[COL.AGING_1]), 0) / haeM1.length : 0;
const avgM1Tme = tmeM1.length ? tmeM1.reduce((s, r) => s + n(r[COL.AGING_1]), 0) / tmeM1.length : 0;

// Part 3
const p3 = xlsx.utils.sheet_to_json(wb.Sheets['Part 3 - Doc Management'], { header: 1, defval: '' });
const ac1Row = p3.find(r => String(r[1]).includes('AC#1') || String(r[2]).includes('AC#1'));
const ac2Row = p3.find(r => String(r[1]).includes('AC#2') || String(r[2]).includes('AC#2'));

const ac1Amt = ac1Row ? n(ac1Row[3]) : 3694341.98;
const ac1Done = ac1Row ? n(ac1Row[4]) : 3385456.32;
const ac1Avg = ac1Row ? n(ac1Row[5]) : 14.30;

const ac2Amt = ac2Row ? n(ac2Row[3]) : 1583289.42;
const ac2Done = ac2Row ? n(ac2Row[4]) : 782067.08;
const ac2Avg = ac2Row ? n(ac2Row[5]) : 58.41;

// Existing backlogTrend
const prevData = JSON.parse(fs.readFileSync('src/data/dashboard-data.json', 'utf8'));
const currentWeekNum = 37;
const backlogTrend = (prevData.backlogTrend || []).filter(b => b.week !== `W${currentWeekNum}`);
const newRemain = parseFloat(n(summaryRow[COL.REMAIN]).toFixed(2));
backlogTrend.push({ week: `W${currentWeekNum}`, value: newRemain });

const adiPE = byPE['Adisak Chanmao'] || { all: [], hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [] };
const palPE = byPE['Palagon Prommueangma'] || { all: [], hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [] };

const adiM1 = adiPE.all.filter(r => n(r[COL.AGING_1]) > 0);
const adiM2 = adiPE.all.filter(r => n(r[COL.AGING_2]) > 0);
const palM1 = palPE.all.filter(r => n(r[COL.AGING_1]) > 0);
const palM2 = palPE.all.filter(r => n(r[COL.AGING_2]) > 0);

const hathairat = byDOC['น.ส. หทัยรัตน์ สิงห์แก้ว'] || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
const sermsiri = byDOC['Sermsiri  Bampentam'] || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
const apichart = byDOC['Apichart Kampuang'] || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };

// Team Weekly
const teamWeeklyPerformance = {};
dataRows.forEach(r => {
  const team = r[14];
  const wkStr = r[19];
  const typeSub = r[16];
  if (!team || team === 'CANCEL' || typeSub === 'CANCEL') return;
  if (!wkStr || wkStr === 0) return;
  const wkMatch = String(wkStr).match(/WK(\d+)/);
  const weekLabel = wkMatch ? 'W' + wkMatch[1] : String(wkStr);
  if (!teamWeeklyPerformance[team]) teamWeeklyPerformance[team] = {};
  if (!teamWeeklyPerformance[team][weekLabel]) teamWeeklyPerformance[team][weekLabel] = 0;
  teamWeeklyPerformance[team][weekLabel]++;
});

const weeklyMap = {};
Object.keys(teamWeeklyPerformance).forEach(team => {
  Object.entries(teamWeeklyPerformance[team]).forEach(([wk, count]) => {
    if (!weeklyMap[wk]) weeklyMap[wk] = { week: wk };
    weeklyMap[wk][team] = count;
  });
});
const teamWeeklyData = Object.values(weeklyMap).sort((a, b) => {
  const wA = parseInt(a.week.replace('W', '')) || 0;
  const wB = parseInt(b.week.replace('W', '')) || 0;
  return wA - wB;
});

const output = {
  reportWeek: currentWeekNum,
  projectYear: 2026,
  performance: {
    haeM1Avg: parseFloat(avgM1Hae.toFixed(2)),
    tmeM1Avg: parseFloat(avgM1Tme.toFixed(2)),
    overallM1Avg: parseFloat(avgM1All.toFixed(2)),
    overallM2Avg: parseFloat(avgM2All.toFixed(2)),
    smartQC: { passRate: 95, totalInspected: 142 }
  },
  projects: {
    HAE: {
      sites: byProject['HAE'] ? byProject['HAE'].rows.length : 0,
      income: parseFloat((byProject['HAE'] ? byProject['HAE'].income : 0).toFixed(2)),
      ar: parseFloat((byProject['HAE'] ? byProject['HAE'].ar : 0).toFixed(2)),
      ap: parseFloat((byProject['HAE'] ? byProject['HAE'].ap : 0).toFixed(2)),
      remain: parseFloat((byProject['HAE'] ? byProject['HAE'].remain : 0).toFixed(2))
    },
    TME: {
      sites: byProject['TME'] ? byProject['TME'].rows.length : 0,
      income: parseFloat((byProject['TME'] ? byProject['TME'].income : 0).toFixed(2)),
      ar: parseFloat((byProject['TME'] ? byProject['TME'].ar : 0).toFixed(2)),
      ap: parseFloat((byProject['TME'] ? byProject['TME'].ap : 0).toFixed(2)),
      remain: parseFloat((byProject['TME'] ? byProject['TME'].remain : 0).toFixed(2))
    }
  },
  peAging: {
    adisak: {
      name: 'Adisak Chanmao',
      sites: adiPE.all.length,
      m1: parseFloat((adiM1.length ? adiM1.reduce((s, r) => s + n(r[COL.AGING_1]), 0) / adiM1.length : 0).toFixed(2)),
      m2: parseFloat((adiM2.length ? adiM2.reduce((s, r) => s + n(r[COL.AGING_2]), 0) / adiM2.length : 0).toFixed(2)),
      hae_mbb: adiPE.hae_mbb.length,
      hae_iptan: adiPE.hae_iptan.length,
      tme_mbb: adiPE.tme_mbb.length,
      tme_iptan: adiPE.tme_iptan.length
    },
    palagon: {
      name: 'Palagon Prommueangma',
      sites: palPE.all.length,
      m1: parseFloat((palM1.length ? palM1.reduce((s, r) => s + n(r[COL.AGING_1]), 0) / palM1.length : 0).toFixed(2)),
      m2: parseFloat((palM2.length ? palM2.reduce((s, r) => s + n(r[COL.AGING_2]), 0) / palM2.length : 0).toFixed(2)),
      hae_mbb: palPE.hae_mbb.length,
      hae_iptan: palPE.hae_iptan.length,
      tme_mbb: palPE.tme_mbb.length,
      tme_iptan: palPE.tme_iptan.length
    }
  },
  docOwners: {
    hathairat: {
      name: 'น.ส. หทัยรัตน์ สิงห์แก้ว',
      sites: hathairat.rows.length,
      ac1: parseFloat(hathairat.ac1.toFixed(2)),
      ac2: parseFloat(hathairat.ac2.toFixed(2)),
      avgAging1: parseFloat((hathairat.aging1.length ? hathairat.aging1.reduce((a, b) => a + b) / hathairat.aging1.length : 0).toFixed(2)),
      avgAging2: parseFloat((hathairat.aging2.length ? hathairat.aging2.reduce((a, b) => a + b) / hathairat.aging2.length : 0).toFixed(2))
    },
    sermsiri: {
      name: 'Sermsiri Bampentam',
      sites: sermsiri.rows.length,
      ac1: parseFloat(sermsiri.ac1.toFixed(2)),
      ac2: parseFloat(sermsiri.ac2.toFixed(2)),
      avgAging1: parseFloat((sermsiri.aging1.length ? sermsiri.aging1.reduce((a, b) => a + b) / sermsiri.aging1.length : 0).toFixed(2)),
      avgAging2: parseFloat((sermsiri.aging2.length ? sermsiri.aging2.reduce((a, b) => a + b) / sermsiri.aging2.length : 0).toFixed(2))
    },
    apichart: {
      name: 'Apichart Kampuang',
      sites: apichart.rows.length,
      ac1: parseFloat(apichart.ac1.toFixed(2)),
      ac2: parseFloat(apichart.ac2.toFixed(2)),
      avgAging1: parseFloat((apichart.aging1.length ? apichart.aging1.reduce((a, b) => a + b) / apichart.aging1.length : 0).toFixed(2)),
      avgAging2: parseFloat((apichart.aging2.length ? apichart.aging2.reduce((a, b) => a + b) / apichart.aging2.length : 0).toFixed(2))
    }
  },
  workTypes: {
    MBB: {
      sites: mbbRows.length,
      remain: parseFloat(mbbRows.reduce((s, r) => s + n(r[COL.REMAIN]), 0).toFixed(2))
    },
    IPTAN: {
      sites: iptanRows.length,
      remain: parseFloat(iptanRows.reduce((s, r) => s + n(r[COL.REMAIN]), 0).toFixed(2))
    }
  },
  documentStatus: {
    ac1: {
      amount: ac1Amt,
      done: ac1Done,
      avgAging: ac1Avg
    },
    ac2: {
      amount: ac2Amt,
      done: ac2Done,
      avgAging: ac2Avg
    }
  },
  financials: {
    estimateFinalIncome: parseFloat(n(summaryRow[COL.ESTIMATE_INCOME]).toFixed(2)),
    ar: parseFloat(n(summaryRow[COL.AR]).toFixed(2)),
    ap: parseFloat(n(summaryRow[COL.AP]).toFixed(2)),
    remain: newRemain
  },
  siteStatus: {
    total: dataRows.length,
    completed: completed.length,
    onProcess: onProcess.length
  },
  recoveryPlan: {
    juneAcceptanceTarget: 192566,
    juneActionPlanAC2: 242060.3,
    installOnProcess: onProcess.reduce((s, r) => s + n(r[COL.ESTIMATE_INCOME]), 0)
  },
  backlogTrend,
  teamWeeklyPerformance,
  teamWeeklyData
};

fs.writeFileSync('src/data/dashboard-data.json', JSON.stringify(output, null, 2), 'utf8');
console.log('=== GENERATED src/data/dashboard-data.json ===');
console.log(JSON.stringify(output, null, 2));
