const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let content = fs.readFileSync(filePath, 'utf8');

const afterMark = '              // Update UI elements';
const afterIdx = content.indexOf(afterMark);

const acLogic = `            // ── AC#1 / AC#2 raw data from 2026 sheet (dynamic header indices) ──
            const sheet2026 = getSheet(/2026/);
            let sumAc1Amt = 0, countAc1Aging = 0, sumAc1Aging = 0;
            let sumAc2Amt = 0, countAc2Aging = 0, sumAc2Aging = 0;
            let minAc1Aging = Infinity, maxAc1Aging = -Infinity;
            let minAc2Aging = Infinity, maxAc2Aging = -Infinity;

            if (sheet2026 && sheet2026.length > 1) {
              const headers = sheet2026[0];
              const ac1AmtIdx = headers.findIndex(h => String(h).toUpperCase() === 'ACTUAL ACCEPTANCE#1');
              const ac2AmtIdx = headers.findIndex(h => String(h).toUpperCase() === 'ACTUAL ACCEPTANCE#2');
              const ac1AgingIdx = headers.findIndex(h => String(h).toUpperCase() === 'AGING#1');
              const ac2AgingIdx = headers.findIndex(h => String(h).toUpperCase() === 'AGING#2');

              for (let i = 1; i < sheet2026.length; i++) {
                const row = sheet2026[i];
                if (!row) continue;
                
                // AC#1 Amt
                if (ac1AmtIdx > -1 && row[ac1AmtIdx] !== undefined && row[ac1AmtIdx] !== null) {
                  const val = Number(String(row[ac1AmtIdx]).replace(/[^0-9.-]/g, ''));
                  if (!isNaN(val)) sumAc1Amt += val;
                }
                // AC#1 Aging
                if (ac1AgingIdx > -1 && row[ac1AgingIdx] !== undefined && row[ac1AgingIdx] !== null && String(row[ac1AgingIdx]).trim() !== '') {
                  const val = Number(String(row[ac1AgingIdx]).replace(/[^0-9.-]/g, ''));
                  if (!isNaN(val)) {
                    sumAc1Aging += val;
                    countAc1Aging++;
                    if (val < minAc1Aging) minAc1Aging = val;
                    if (val > maxAc1Aging) maxAc1Aging = val;
                  }
                }
                
                // AC#2 Amt
                if (ac2AmtIdx > -1 && row[ac2AmtIdx] !== undefined && row[ac2AmtIdx] !== null) {
                  const val = Number(String(row[ac2AmtIdx]).replace(/[^0-9.-]/g, ''));
                  if (!isNaN(val)) sumAc2Amt += val;
                }
                // AC#2 Aging
                if (ac2AgingIdx > -1 && row[ac2AgingIdx] !== undefined && row[ac2AgingIdx] !== null && String(row[ac2AgingIdx]).trim() !== '') {
                  const val = Number(String(row[ac2AgingIdx]).replace(/[^0-9.-]/g, ''));
                  if (!isNaN(val)) {
                    sumAc2Aging += val;
                    countAc2Aging++;
                    if (val < minAc2Aging) minAc2Aging = val;
                    if (val > maxAc2Aging) maxAc2Aging = val;
                  }
                }
              }
            }

            const avgAc1Aging = countAc1Aging > 0 ? (sumAc1Aging / countAc1Aging) : 0;
            const avgAc2Aging = countAc2Aging > 0 ? (sumAc2Aging / countAc2Aging) : 0;

            const setBadge = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setBadge('rawAc1Amt', sumAc1Amt > 0 ? fmtBaht(sumAc1Amt) : '-');
            setBadge('rawAc2Amt', sumAc2Amt > 0 ? fmtBaht(sumAc2Amt) : '-');
            setBadge('rawAc1Aging', avgAc1Aging > 0 ? avgAc1Aging.toFixed(2) + 'd' : '-');
            setBadge('rawAc2Aging', avgAc2Aging > 0 ? avgAc2Aging.toFixed(2) + 'd' : '-');
            setBadge('rawAc1AgingMin', isFinite(minAc1Aging) ? minAc1Aging + 'd' : '-');
            setBadge('rawAc1AgingMax', isFinite(maxAc1Aging) ? maxAc1Aging + 'd' : '-');
            setBadge('rawAc2AgingMin', isFinite(minAc2Aging) ? minAc2Aging + 'd' : '-');
            setBadge('rawAc2AgingMax', isFinite(maxAc2Aging) ? maxAc2Aging + 'd' : '-');

`;

content = content.substring(0, afterIdx) + acLogic + content.substring(afterIdx);
fs.writeFileSync(filePath, content);
console.log('Inserted logic successfully.');
