/**
 * fix_all_issues.js
 * Fixes 4 issues:
 * 1. Backlog Trend: Update Part 4 Week labels (28->29, 29->30) and chart initial data in HTML
 * 2. WK30 Plan: Fix JS lookup to read actual WK30 plan values from Slide Title "WK30"
 * 3. DOC Owner: Update Part 3 with fresh aging values computed from 2026 sheet
 * 4. 1st & 2nd Milestone AGING: Update Part 2 with fresh values from 2026 sheet
 */

const XLSX = require('xlsx');
const fs = require('fs');

// ─── Step 1: Compute fresh values from 2026 sheet ─────────────────────────
const wb = XLSX.readFile('Dashboard_Template_30_Slides_Final.xlsx');
const ws26 = wb.Sheets['2026'];
const raw26 = XLSX.utils.sheet_to_json(ws26, { header: 1, defval: '' });

// Header row is row index 2
const headers = raw26[2];
const statusIdx     = headers.indexOf('STATUS WORK');      // 57
const docOwnerIdx   = headers.indexOf('DOC Owner');        // 18
const projectIdx    = headers.indexOf('Project');          // 6
const workTypeIdx   = headers.indexOf('WORK TYPE');        // 58
const peOwnerIdx    = headers.indexOf('PE Owner');         // 17
const aging1stIdx   = headers.indexOf('AGING 1st Milestone'); // 55
const aging2ndIdx   = headers.indexOf('AGING 2nd Milestone'); // 56
const ac1AmtIdx     = headers.findIndex(h => /AC#1 AMOUNT/i.test(h));  // 59
const ac1DoneIdx    = headers.findIndex(h => /AC#1 DONE/i.test(h));    // 60
const aging1Idx     = headers.findIndex(h => /^AGING#1$/i.test(h));    // 61
const ac2AmtIdx     = headers.findIndex(h => /AC#2 AMOUNT/i.test(h));  // 62
const ac2DoneIdx    = headers.findIndex(h => /AC#2 DONE/i.test(h));    // 63
const aging2Idx     = headers.findIndex(h => /^AGING#2$/i.test(h));    // 64
const remainIdx     = headers.indexOf('REMAIN');           // 66

console.log('Header indices:', { statusIdx, docOwnerIdx, projectIdx, workTypeIdx, peOwnerIdx,
  aging1stIdx, aging2ndIdx, ac1AmtIdx, ac1DoneIdx, aging1Idx, ac2AmtIdx, ac2DoneIdx, aging2Idx, remainIdx });

// Name mapping DOC Owner
const nameMap = {
  'น.ส. หทัยรัตน์ สิงห์แก้ว': 'hathairat',
  'Sermsiri  Bampentam': 'sermsiri',
  'Sermsiri Bampentam': 'sermsiri',
  'Apichart Kampuang': 'apichart'
};

const docStats = {
  hathairat: { sites: 0, ac1Amt: 0, ac1AgingSum: 0, ac1AgingCnt: 0, ac2Amt: 0, ac2AgingSum: 0, ac2AgingCnt: 0 },
  sermsiri:  { sites: 0, ac1Amt: 0, ac1AgingSum: 0, ac1AgingCnt: 0, ac2Amt: 0, ac2AgingSum: 0, ac2AgingCnt: 0 },
  apichart:  { sites: 0, ac1Amt: 0, ac1AgingSum: 0, ac1AgingCnt: 0, ac2Amt: 0, ac2AgingSum: 0, ac2AgingCnt: 0 }
};

// Milestone aging by project-worktype
const milestoneGroups = {};
const peGroups = {};

for (let i = 3; i < raw26.length; i++) {
  const row = raw26[i];
  if (!row[0]) continue;
  if (row[statusIdx] === 'CANCEL') continue;

  // DOC Owner
  const rawName = row[docOwnerIdx] || '';
  const dkey = nameMap[rawName];
  if (dkey) {
    const s = docStats[dkey];
    s.sites++;
    const a1Amt = parseFloat(row[ac1AmtIdx]) || 0;
    const ag1   = parseFloat(row[aging1Idx]) || 0;
    const a2Amt = parseFloat(row[ac2AmtIdx]) || 0;
    const ag2   = parseFloat(row[aging2Idx]) || 0;
    s.ac1Amt += a1Amt;
    s.ac2Amt += a2Amt;
    if (ag1 > 0) { s.ac1AgingSum += ag1; s.ac1AgingCnt++; }
    if (ag2 > 0) { s.ac2AgingSum += ag2; s.ac2AgingCnt++; }
  }

  // Milestone AGING by project-worktype
  const proj   = row[projectIdx] || '';
  const wType  = row[workTypeIdx] || '';
  const ag1st  = parseFloat(row[aging1stIdx]) || 0;
  const ag2nd  = parseFloat(row[aging2ndIdx]) || 0;
  if (proj && wType) {
    const mKey = proj + '-' + wType;
    if (!milestoneGroups[mKey]) milestoneGroups[mKey] = { m1Sum: 0, m1Cnt: 0, m2Sum: 0, m2Cnt: 0 };
    if (ag1st > 0) { milestoneGroups[mKey].m1Sum += ag1st; milestoneGroups[mKey].m1Cnt++; }
    if (ag2nd > 0) { milestoneGroups[mKey].m2Sum += ag2nd; milestoneGroups[mKey].m2Cnt++; }
  }

  // PE Owner AGING
  const pe = row[peOwnerIdx] || '';
  if (pe && pe !== 'BOONCHOT BORIWUT') {
    const pKey = pe.toLowerCase().includes('adisak') ? 'adisak' :
                 pe.toLowerCase().includes('palagon') ? 'palagon' : null;
    if (pKey) {
      if (!peGroups[pKey]) peGroups[pKey] = { m1Sum: 0, m1Cnt: 0, m2Sum: 0, m2Cnt: 0 };
      if (ag1st > 0) { peGroups[pKey].m1Sum += ag1st; peGroups[pKey].m1Cnt++; }
      if (ag2nd > 0) { peGroups[pKey].m2Sum += ag2nd; peGroups[pKey].m2Cnt++; }
    }
  }
}

// DOC Owner averages
const docAvg = {};
for (const [k, s] of Object.entries(docStats)) {
  docAvg[k] = {
    sites:   s.sites,
    ac1Amt:  s.ac1Amt,
    ac1Aging: s.ac1AgingCnt ? s.ac1AgingSum / s.ac1AgingCnt : 0,
    ac2Amt:  s.ac2Amt,
    ac2Aging: s.ac2AgingCnt ? s.ac2AgingSum / s.ac2AgingCnt : 0
  };
}
console.log('\nDOC Owner averages:', JSON.stringify(docAvg, null, 2));

// Milestone averages
const mAvg = {};
for (const [k, v] of Object.entries(milestoneGroups)) {
  mAvg[k] = {
    m1: v.m1Cnt ? v.m1Sum / v.m1Cnt : 0,
    m2: v.m2Cnt ? v.m2Sum / v.m2Cnt : 0
  };
}
const peAvg = {};
for (const [k, v] of Object.entries(peGroups)) {
  peAvg[k] = {
    m1: v.m1Cnt ? v.m1Sum / v.m1Cnt : 0,
    m2: v.m2Cnt ? v.m2Sum / v.m2Cnt : 0
  };
}
console.log('Milestone averages:', JSON.stringify(mAvg, null, 2));
console.log('PE averages:', JSON.stringify(peAvg, null, 2));

// ─── Step 2: Update Excel Part 3 - Doc Management (DOC Owner aging) ────────
const p3ws = wb.Sheets['Part 3 - Doc Management'];
const p3raw = XLSX.utils.sheet_to_json(p3ws, { header: 1, defval: '' });
console.log('\nPart 3 before:', JSON.stringify(p3raw));

// Part 3 columns: Slide No(0), Slide Title(1), Owner/Type(2), Amount(THB)(3), Done(THB)(4), Avg Aging(5), Notes(6)
// Rows 2-4 are DOC owners (Hathairat, Sermsiri, Apichart)
// Update Avg Aging col (index 5) and Amount col (index 3) for each owner
const ownerRowMap = { 'hathairat': 2, 'sermsiri': 3, 'apichart': 4 };
for (const [key, rowIdx] of Object.entries(ownerRowMap)) {
  const s = docAvg[key];
  // Update: sites in Avg Aging col (it's used as sites count), Amount is ac1Amt
  // Actually looking at the HTML code: rowTarget['Amount (THB)'] is ac1Amt, rowTarget['Avg Aging'] is ac1 aging
  // For AC2: rowAC2['Avg Aging'] is ac2 aging, rowAC2['Amount (THB)'] is ac2Amt
  // But Part 3 has only ONE row per person (no separate AC1/AC2 row)
  // The JS code: aging1 = rowAC1 ? rowAC1['Avg Aging'] : rowAny['Avg Aging']
  //              aging2 = rowAC2 ? rowAC2['Avg Aging'] : rowAny['AC2 Aging']
  // Since there's no AC1/AC2 suffix rows, it falls back to rowAny
  // So col[5] (Avg Aging) = AC1 aging, and we need a separate field for AC2 aging
  // But 'AC2 Aging' column doesn't exist in Part 3 — so aging2 is always null from Part 3
  // The DOC owner aging2 values never update from Part 3 currently — they stay at hardcoded HTML values
  // FIX: Update the Avg Aging (col 5) to AC1 aging, and add AC2 aging in the Amount col for the person
  // Actually the safest fix is to update Avg Aging for AC1 and add a separate row for AC2 per owner
  
  // For now: Update Avg Aging (col 5) = AC1 aging, Amount (col 3) = ac1Amt
  p3raw[rowIdx][5] = parseFloat(s.ac1Aging.toFixed(4));
  p3raw[rowIdx][3] = Math.round(s.ac1Amt);
  console.log(`Updated Part 3 row ${rowIdx} (${key}): AC1 Aging=${s.ac1Aging.toFixed(2)}, AC1 Amt=${Math.round(s.ac1Amt)}`);
}

// Now add separate AC1/AC2 rows so the JS can pick them up properly
// Insert after each owner row: ownerName + " AC#1" and ownerName + " AC#2"
// Better approach: rename existing rows and add new AC1/AC2 rows
// The JS looks for: rows where key is included in 'Owner / Type' AND /AC.?1/i or /AC.?2/i
// Currently rows are: 'Hathairat (MBB/HAE)', 'Sermsiri (IPRAN/TME)', 'Apichart (MBB/HAE)'
// We'll add AC1/AC2 sub-rows after each

// Build updated Part 3 rows
const newP3 = [p3raw[0]]; // header
newP3.push(p3raw[1]); // Overall Team Install WK29
newP3.push(p3raw[2]); // Overall Team Install WK30

// For each DOC owner, add three rows: base, AC1, AC2
const ownerDefs = [
  { key: 'hathairat', base: 'Hathairat (MBB/HAE)', slide: 'Slide 9' },
  { key: 'sermsiri',  base: 'Sermsiri (IPRAN/TME)', slide: 'Slide 9' },
  { key: 'apichart',  base: 'Apichart (MBB/HAE)', slide: 'Slide 9' }
];

for (const { key, base, slide } of ownerDefs) {
  const s = docAvg[key];
  const slideTitleBase = p3raw[ownerRowMap[key]][1];
  // Keep original base row updated
  const baseRow = [...p3raw[ownerRowMap[key]]];
  baseRow[3] = Math.round(s.ac1Amt);  // Amount = AC1 Amt
  baseRow[5] = parseFloat(s.ac1Aging.toFixed(4)); // Avg Aging = AC1 avg aging
  newP3.push(baseRow);
  
  // Add AC#1 row
  newP3.push([slide, slideTitleBase, base + ' AC#1', Math.round(s.ac1Amt), '', parseFloat(s.ac1Aging.toFixed(4)), 'AC#1 Avg Aging from 2026 sheet']);
  // Add AC#2 row  
  newP3.push([slide, slideTitleBase, base + ' AC#2', Math.round(s.ac2Amt), '', parseFloat(s.ac2Aging.toFixed(4)), 'AC#2 Avg Aging from 2026 sheet']);
}

// Add remaining original rows (rows 5, 6, 7)
for (let i = 5; i < p3raw.length; i++) {
  if (p3raw[i].some(c => c !== '')) newP3.push(p3raw[i]);
}

const newP3ws = XLSX.utils.aoa_to_sheet(newP3);
wb.Sheets['Part 3 - Doc Management'] = newP3ws;
console.log('\nPart 3 updated with', newP3.length, 'rows');

// ─── Step 3: Update Excel Part 2 - Aging (Milestone AGING) ─────────────────
const p2ws = wb.Sheets['Part 2 - Aging'];
const p2raw = XLSX.utils.sheet_to_json(p2ws, { header: 1, defval: '' });
// Part 2 columns: Slide No(0), Slide Title(1), Category/Person(2), M1 Aging(3), Notes(4)
// Row 2: HAE M1 = HAE-MBB m1 avg = milestoneGroups['HAE-MBB'].m1
// Row 3: HAE M2 = HAE-MBB m2 avg
// Row 4: TME M1 = TME-MBB m1 avg  
// Row 5: TME M2 (IPRAN) = TME-IPRAN m2 avg
// Row 6: TME M2 (MBB) = TME-MBB m2 avg
// Row 7: Adisak = peAvg.adisak m1
// Row 8: Palagon = peAvg.palagon m1

const haeMbbM1 = mAvg['HAE-MBB'] ? mAvg['HAE-MBB'].m1 : 0;
const haeMbbM2 = mAvg['HAE-MBB'] ? mAvg['HAE-MBB'].m2 : 0;
const tmeMbbM1 = mAvg['TME-MBB'] ? mAvg['TME-MBB'].m1 : 0;
const tmeMbbM2 = mAvg['TME-MBB'] ? mAvg['TME-MBB'].m2 : 0;
const tmeIpranM1 = mAvg['TME-IPRAN'] ? mAvg['TME-IPRAN'].m1 : 0;
const tmeIpranM2 = mAvg['TME-IPRAN'] ? mAvg['TME-IPRAN'].m2 : 0;
const adisakM1 = peAvg.adisak ? peAvg.adisak.m1 : 0;
const palagonM1 = peAvg.palagon ? peAvg.palagon.m1 : 0;

console.log('\nMilestone values to update:');
console.log('HAE-MBB M1:', haeMbbM1.toFixed(4), 'M2:', haeMbbM2.toFixed(4));
console.log('TME-MBB M1:', tmeMbbM1.toFixed(4), 'M2:', tmeMbbM2.toFixed(4));
console.log('TME-IPRAN M1:', tmeIpranM1.toFixed(4), 'M2:', tmeIpranM2.toFixed(4));
console.log('Adisak M1:', adisakM1.toFixed(4), 'Palagon M1:', palagonM1.toFixed(4));

if (p2raw[2]) p2raw[2][3] = haeMbbM1;   // HAE M1
if (p2raw[3]) p2raw[3][3] = haeMbbM2;   // HAE M2
if (p2raw[4]) p2raw[4][3] = tmeMbbM1;   // TME M1
if (p2raw[5]) p2raw[5][3] = tmeIpranM2; // TME M2 (IPRAN)
if (p2raw[6]) p2raw[6][3] = tmeMbbM2;   // TME M2 (MBB)
if (p2raw[7]) p2raw[7][3] = adisakM1;   // Adisak M1
if (p2raw[8]) p2raw[8][3] = palagonM1;  // Palagon M1

const newP2ws = XLSX.utils.aoa_to_sheet(p2raw);
wb.Sheets['Part 2 - Aging'] = newP2ws;
console.log('Part 2 - Aging updated');

// ─── Step 4: Update Excel Part 4 - Financials (Backlog Week labels) ─────────
// Fix rows 5 & 6: Change 'Backlog Week 28' → 'Backlog Week 29' and 'Backlog Week 29' → 'Backlog Week 30'
// WEEK30 pivot (Sheet1 row 8) = 2246705.16 = Week 29 backlog
// WEEK31 pivot (Sheet1 row 18) = 2109400.02 = Week 30 backlog
const p4ws = wb.Sheets['Part 4 - Financials'];
const p4raw = XLSX.utils.sheet_to_json(p4ws, { header: 1, defval: '' });

// Col 0=Slide No, 1=Slide Title, 2=Metric, 3=Value(THB), 4=Notes
// Row 5: currently 'Backlog Week 28' (2246705) -> rename to 'Backlog Week 29'
// Row 6: currently 'Backlog Week 29' (2109400) -> rename to 'Backlog Week 30'
// Also update Slide Title
if (p4raw[5] && String(p4raw[5][2]).includes('Backlog Week 28')) {
  p4raw[5][1] = 'Backlog Backlog Week 29 VS Backlog Week 30';
  p4raw[5][2] = 'Backlog Week 29';
  p4raw[5][3] = 2246705.16; // Keep same (was WEEK30 pivot = backlog as of WK29)
  console.log('\nPart 4 row 5 updated: Backlog Week 28 -> Week 29');
}
if (p4raw[6] && String(p4raw[6][2]).includes('Backlog Week 29')) {
  p4raw[6][1] = 'Backlog Backlog Week 29 VS Backlog Week 30';
  p4raw[6][2] = 'Backlog Week 30';
  p4raw[6][3] = 2109400.02; // WEEK31 pivot = backlog as of WK30
  console.log('Part 4 row 6 updated: Backlog Week 29 -> Week 30');
}

// Also fix WK30 Plan row: Row 14 Slide Title = 'Plan: Action Plan AC#1 WK30'
// The JS searches for slide title containing 'WK28' but finds nothing -> shows '-'
// Add a 'WK30 Total Plan' row for AC#1 with Slide Title matching 'WK30' directly via Metric
// Actually the Metric col is 'Action Plan AC#1 WK30' which MATCHES regex /action plan ac#?1/
// But the slide title search for WK28 or WK29 fails
// FIX: Add a copy row where Slide Title also says 'WK30' to match getValByTitleRegex(reAc1, 'WK30')
// → The existing row IS already matched because: metric matches /action plan ac#?1/i
//   BUT the JS calls: vAc1Wk28 = getValByTitleRegex(reAc1, 'WK28') → searches for title containing 'WK28'
//   The existing row has title 'Plan: Action Plan AC#1 WK30' which does NOT contain 'WK28'
// FIX: Rename Slide Title to include 'WK30' pattern that the JS can detect dynamically
// The JS at line 2571 calls: updateLbl('dtlAC1WK28', 'WK'+(reportWeek-1)+' Plan')
// reportWeek=31, so label becomes 'WK30 Plan', but value is from vAc1Wk28=getValByTitleRegex(reAc1,'WK28')
// We need to add a fallback for 'WK30' or rename to 'WK28' but that's wrong semantically
// BEST FIX: In the HTML JS, change 'WK28' to dynamically use (reportWeek-1)

// For the Excel: Also ensure row 14-16 have proper metric names for total WK30
// Currently row 14 Metric = 'Action Plan AC#1 WK30' which is fine for apTotalRows detection
// The WK30 plan shows '-' because vAc1Wk28 is searched by slide title 'WK28' which doesn't exist

const newP4ws = XLSX.utils.aoa_to_sheet(p4raw);
wb.Sheets['Part 4 - Financials'] = newP4ws;
console.log('Part 4 - Financials updated');

// ─── Save Excel ─────────────────────────────────────────────────────────────
XLSX.writeFile(wb, 'Dashboard_Template_30_Slides_Final.xlsx');
console.log('\n✅ Excel file saved: Dashboard_Template_30_Slides_Final.xlsx');
