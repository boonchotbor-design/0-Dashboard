const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Line 1952 is '          let importedSheets = [];\r' (index 1952)
lines[1952] = '          let importedSheets = [];\r\n          let reportWeek = 28;\r';

// 2. Line 1958-1959
lines[1958] = "            const week = findMetric(p1, 'report week', 'Value');\r";
lines[1959] = "            if (week) {\r\n              reportWeek = parseInt(week) || 28;\r\n              document.getElementById('weekBadge').textContent = `WEEK ${week} · 2026`;\r\n            }\r";

// 3. The huge block 2368 to 2470
// Line 2368 is:             // Actual Acceptance by week
const blockStart = 2368;
const blockEnd = 2470; // Include everything down to setEl('dtlAC2LatestTotal', ...);

const newBlock = `
            // Actual Acceptance by week (Dynamic)
            const vAct23 = getVal(\`actual acceptance wk\${reportWeek - 4}\`);
            const vAct24 = getVal(\`actual acceptance wk\${reportWeek - 3}\`);
            const vAct25 = getVal(\`actual acceptance wk\${reportWeek - 2}\`);
            const vAct26 = getVal(\`actual acceptance wk\${reportWeek - 1}\`);
            const vActJune = getVal('actual acceptance june');
            
            // Update UI labels
            const setLbl = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text; };
            setLbl('lblActWk1', \`WK\${reportWeek - 4}\`);
            setLbl('lblActWk2', \`WK\${reportWeek - 3}\`);
            setLbl('lblActWk3', \`WK\${reportWeek - 2}\`);
            setLbl('lblActWk4', \`WK\${reportWeek - 1}\`);
            setLbl('lblActWk5', \`WK\${reportWeek}\`);

            const getValByTitleRegex = (metricRegex, titleKw) => {
              const row = p4.find(r =>
                metricRegex.test(String(r['Metric']).toLowerCase()) &&
                String(r['Slide Title'] || '').toLowerCase().includes(titleKw.toLowerCase())
              );
              return row ? getV(row) : null;
            };

            // AC#1 plan by year — Dynamic for reportWeek - 1
            let reAc1Prev = new RegExp(\`action plan ac#?1 wk\${reportWeek - 1}\`, 'i');
            let vAc123 = getValByTitleRegex(reAc1Prev, '2023');
            let vAc124 = getValByTitleRegex(reAc1Prev, '2024');
            let vAc125 = getValByTitleRegex(reAc1Prev, '2025');
            let vAc126 = getValByTitleRegex(reAc1Prev, '2026');

            // AC#2 plan by year — Dynamic for reportWeek - 1
            let reAc2Prev = new RegExp(\`action plan ac#?2 wk\${reportWeek - 1}\`, 'i');
            let vAc223 = getValByTitleRegex(reAc2Prev, '2023');
            let vAc224 = getValByTitleRegex(reAc2Prev, '2024');
            let vAc225 = getValByTitleRegex(reAc2Prev, '2025');
            let vAc226 = getValByTitleRegex(reAc2Prev, '2026');

            // Totals for AC#1 and AC#2 plans
            let vAc1Total = getValByTitleRegex(/action plan ac#?1/, 'total');
            let vAc2Total = getValByTitleRegex(/action plan ac#?2/, 'total');

            // Fallback to reading from Sheet1 pivot table if data is missing in Part 4
            const sheet1 = wb.Sheets['Sheet1'];
            if (sheet1) {
              const s1Rows = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });
              let currentSection = null;
              s1Rows.forEach(row => {
                let label = String(row[15] || '').toUpperCase();
                let val = row[16] || 0;

                if (label.includes('AC#1') || label.includes('AC1')) {
                  currentSection = 'AC1';
                  if (!vAc1Total) vAc1Total = val;
                }
                else if (label.includes('AC#2') || label.includes('AC2')) {
                  currentSection = 'AC2';
                  if (!vAc2Total) vAc2Total = val;
                }
                else if (label.includes('202') && currentSection) {
                  if (currentSection === 'AC1') {
                    if (label.includes('2023') && !vAc123) vAc123 = val;
                    if (label.includes('2024') && !vAc124) vAc124 = val;
                    if (label.includes('2025') && !vAc125) vAc125 = val;
                    if (label.includes('2026') && !vAc126) vAc126 = val;
                  } else if (currentSection === 'AC2') {
                    if (label.includes('2023') && !vAc223) vAc223 = val;
                    if (label.includes('2024') && !vAc224) vAc224 = val;
                    if (label.includes('2025') && !vAc225) vAc225 = val;
                    if (label.includes('2026') && !vAc226) vAc226 = val;
                  }
                }
              });
            }

            // On-Process per project — Metric contains project name
            const vOnMBB = getVal('tme-mbb') || getVal('on-process (2026) tme-mbb');
            const vOnIPRAN = getVal('tme-ipran') || getVal('on-process (2026) tme-ipran');
            const vOnBATT = getVal('tme-battery') || getVal('on-process (2026) tme-battery');
            const vOnHAEMBB = getVal('hae-mbb') || getVal('on-process (2026) hae-mbb');
            const vOnTRE = getVal('tre-dismantle') || getVal('on-process (2026) tre-dismantle');

            const setEl = (id, val) => { if (val !== null) { const el = document.getElementById(id); if (el) el.textContent = fmtBaht(val); } };
            const vActWK27 = getVal(\`actual acceptance wk\${reportWeek}\`);
            setEl('dtlActWK23', vAct23); setEl('dtlActWK24', vAct24); setEl('dtlActWK25', vAct25);
            setEl('dtlActWK26', vAct26); setEl('dtlActWK27', vActWK27); setEl('dtlActJUNE', vActJune);

            const vActHuawei = getValByTitleRegex(/actual acceptance total/i, 'huawei');
            const vActTrue = getValByTitleRegex(/actual acceptance total/i, 'true-tuc');
            setEl('dtlActHuawei', vActHuawei); setEl('dtlActTrueTuc', vActTrue);

            // WK-1 cards now show only total (single row in Excel)
            const vAc1WK27Total = getVal(\`action plan ac#1 wk\${reportWeek - 1}\`);
            const vAc2WK27Total = getVal(\`action plan ac#2 wk\${reportWeek - 1}\`);
            
            // Update labels dynamically for AC tables
            setLbl('lblAc1PrevWk', \`WK\${reportWeek - 1}\`);
            setLbl('lblAc2PrevWk', \`WK\${reportWeek - 1}\`);
            setLbl('lblAc1LatestWk', \`WK\${reportWeek}\`);
            setLbl('lblAc2LatestWk', \`WK\${reportWeek}\`);

            setEl('dtlAC1Total', vAc1WK27Total || vAc1Total);
            setEl('dtlAC2Total', vAc2WK27Total || vAc2Total);
            setEl('dtlOnProcMBB', vOnMBB); setEl('dtlOnProcIPRAN', vOnIPRAN); setEl('dtlOnProcBATT', vOnBATT);
            setEl('dtlOnProcHAEMBB', vOnHAEMBB); setEl('dtlOnProcTRE', vOnTRE);

            let reAc1Latest = new RegExp(\`action plan ac#?1 wk\${reportWeek}\`, 'i');
            const vAc1Wk28_23 = getValByTitleRegex(reAc1Latest, '2023');
            const vAc1Wk28_24 = getValByTitleRegex(reAc1Latest, '2024');
            const vAc1Wk28_25 = getValByTitleRegex(reAc1Latest, '2025');
            const vAc1Wk28_26 = getValByTitleRegex(reAc1Latest, '2026');
            const vAc1Wk28Tot = getValByTitleRegex(/action plan ac#?1 total/i, 'total') || getValByTitleRegex(reAc1Latest, 'total');

            let reAc2Latest = new RegExp(\`action plan ac#?2 wk\${reportWeek}\`, 'i');
            const vAc2Wk28_23 = getValByTitleRegex(reAc2Latest, '2023');
            const vAc2Wk28_24 = getValByTitleRegex(reAc2Latest, '2024');
            const vAc2Wk28_25 = getValByTitleRegex(reAc2Latest, '2025');
            const vAc2Wk28_26 = getValByTitleRegex(reAc2Latest, '2026');
            const vAc2Wk28Tot = getValByTitleRegex(/action plan ac#?2 total/i, 'total') || getValByTitleRegex(reAc2Latest, 'total');

            setEl('dtlAC1Latest_2023', vAc1Wk28_23); setEl('dtlAC1Latest_2024', vAc1Wk28_24); setEl('dtlAC1Latest_2025', vAc1Wk28_25); setEl('dtlAC1Latest_2026', vAc1Wk28_26); setEl('dtlAC1LatestTotal', vAc1Wk28Tot);
            setEl('dtlAC2Latest_2023', vAc2Wk28_23); setEl('dtlAC2Latest_2024', vAc2Wk28_24); setEl('dtlAC2Latest_2025', vAc2Wk28_25); setEl('dtlAC2Latest_2026', vAc2Wk28_26); setEl('dtlAC2LatestTotal', vAc2Wk28Tot);\r`;

lines.splice(blockStart, blockEnd - blockStart + 1, newBlock.split('\n').join('\r\n'));

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Successfully updated summary.html by index');
