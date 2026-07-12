const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

// ── 1. Fix Milestone JS: add min/max ──
const OLD = `                const mGroups = {
                  'HAE-MBB':   { sites: 0, sumM1: 0, cntM1: 0, sumM2: 0, cntM2: 0 },
                  'TME-MBB':   { sites: 0, sumM1: 0, cntM1: 0, sumM2: 0, cntM2: 0 },
                  'TME-IPRAN': { sites: 0, sumM1: 0, cntM1: 0, sumM2: 0, cntM2: 0 }
                };
                for (let i = 3; i < allRows.length; i++) {
                  const row = allRows[i];
                  if (!row) continue;
                  const bp  = String(row[67] || '').toUpperCase().replace(/[\\s-]/g, '');
                  if (!bp) continue;
                  const m1v = Number(row[55]);
                  const m2v = Number(row[56]);
                  let grp = null;
                  if      (bp.startsWith('HAE') && bp.includes('MBB'))   grp = 'HAE-MBB';
                  else if (bp.startsWith('TME') && bp.includes('MBB'))   grp = 'TME-MBB';
                  else if (bp.startsWith('TME') && bp.includes('IPRAN')) grp = 'TME-IPRAN';
                  if (!grp) continue;
                  mGroups[grp].sites++;
                  if (!isNaN(m1v) && m1v > 0) { mGroups[grp].sumM1 += m1v; mGroups[grp].cntM1++; }
                  if (!isNaN(m2v) && m2v > 0) { mGroups[grp].sumM2 += m2v; mGroups[grp].cntM2++; }
                }
                const fmtdM   = n => (!n || isNaN(n) || n === 0) ? '-' : Number(n).toFixed(2) + 'd';
                const bcolorM = n => (!n || isNaN(n) || n === 0) ? 'badge-blue' : (n > 10 ? 'badge-amber' : 'badge-green');
                let mHtml = '';
                Object.entries(mGroups).forEach(([label, g]) => {
                  const avgM1 = g.cntM1 > 0 ? g.sumM1 / g.cntM1 : null;
                  const avgM2 = g.cntM2 > 0 ? g.sumM2 / g.cntM2 : null;
                  mHtml += \`<tr>
                    <td style="color:var(--text-primary);font-weight:500">\${label}</td>
                    <td style="text-align:center"><span class="badge badge-blue">\${g.sites}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolorM(avgM1)}">\${fmtdM(avgM1)}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolorM(avgM2)}">\${fmtdM(avgM2)}</span></td>
                  </tr>\`;
                });
                const mTbody = document.getElementById('milestoneWorkTypeBody');
                if (mTbody && mHtml) mTbody.innerHTML = mHtml;`;

const NEW = `                const mGroups = {
                  'HAE-MBB':   { sites: 0, sumM1: 0, cntM1: 0, minM1: Infinity, maxM1: 0, sumM2: 0, cntM2: 0, minM2: Infinity, maxM2: 0 },
                  'TME-MBB':   { sites: 0, sumM1: 0, cntM1: 0, minM1: Infinity, maxM1: 0, sumM2: 0, cntM2: 0, minM2: Infinity, maxM2: 0 },
                  'TME-IPRAN': { sites: 0, sumM1: 0, cntM1: 0, minM1: Infinity, maxM1: 0, sumM2: 0, cntM2: 0, minM2: Infinity, maxM2: 0 }
                };
                for (let i = 3; i < allRows.length; i++) {
                  const row = allRows[i];
                  if (!row) continue;
                  const bp  = String(row[67] || '').toUpperCase().replace(/[\\s-]/g, '');
                  if (!bp) continue;
                  const m1v = Number(row[55]);
                  const m2v = Number(row[56]);
                  let grp = null;
                  if      (bp.startsWith('HAE') && bp.includes('MBB'))   grp = 'HAE-MBB';
                  else if (bp.startsWith('TME') && bp.includes('MBB'))   grp = 'TME-MBB';
                  else if (bp.startsWith('TME') && bp.includes('IPRAN')) grp = 'TME-IPRAN';
                  if (!grp) continue;
                  mGroups[grp].sites++;
                  if (!isNaN(m1v) && m1v > 0) {
                    mGroups[grp].sumM1 += m1v; mGroups[grp].cntM1++;
                    if (m1v < mGroups[grp].minM1) mGroups[grp].minM1 = m1v;
                    if (m1v > mGroups[grp].maxM1) mGroups[grp].maxM1 = m1v;
                  }
                  if (!isNaN(m2v) && m2v > 0) {
                    mGroups[grp].sumM2 += m2v; mGroups[grp].cntM2++;
                    if (m2v < mGroups[grp].minM2) mGroups[grp].minM2 = m2v;
                    if (m2v > mGroups[grp].maxM2) mGroups[grp].maxM2 = m2v;
                  }
                }
                const fmtdM   = n => (!n || isNaN(n) || n === 0 || !isFinite(n)) ? '-' : Number(n).toFixed(2) + 'd';
                const bcolorM = n => (!n || isNaN(n) || n === 0) ? 'badge-blue' : (n > 10 ? 'badge-amber' : 'badge-green');
                let mHtml = '';
                Object.entries(mGroups).forEach(([label, g]) => {
                  const avgM1 = g.cntM1 > 0 ? g.sumM1 / g.cntM1 : null;
                  const avgM2 = g.cntM2 > 0 ? g.sumM2 / g.cntM2 : null;
                  mHtml += \`<tr>
                    <td style="color:var(--text-primary);font-weight:500">\${label}</td>
                    <td style="text-align:center"><span class="badge badge-blue">\${g.sites}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolorM(avgM1)}">\${fmtdM(avgM1)}</span></td>
                    <td style="text-align:center"><span class="badge badge-green">\${fmtdM(g.minM1)}</span></td>
                    <td style="text-align:center"><span class="badge badge-amber">\${fmtdM(g.maxM1)}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolorM(avgM2)}">\${fmtdM(avgM2)}</span></td>
                    <td style="text-align:center"><span class="badge badge-green">\${fmtdM(g.minM2)}</span></td>
                    <td style="text-align:center"><span class="badge badge-amber">\${fmtdM(g.maxM2)}</span></td>
                  </tr>\`;
                });
                const mTbody = document.getElementById('milestoneWorkTypeBody');
                if (mTbody && mHtml) mTbody.innerHTML = mHtml;`;

if (h.includes(OLD)) {
  h = h.replace(OLD, NEW);
  console.log('✅ Milestone min/max added');
} else {
  console.log('❌ Milestone OLD block not found');
}

// ── 2. Fix SO Comparison: always run, use AC1 DONE Remain(col3) and UNFULFILL Remain(col9) ──
const SO_OLD = `              // SO Comparison from Sheet1 pivot table
              // Structure: Row 0 = 'WEEK27', Row 10 = 'WEEK28', year rows in between at col 0
              // WK27: col0=year, col1=AC1Done_count, col2=AC1Done_Revenue, col3=AC1Done_Remain, col4=Fulfilled_count, col5=Fulfilled_Revenue, col6=Fulfilled_Remain, col7=Unfulfill_count, col8=Unfulfill_Revenue, col9=Unfulfill_Remain, col11=Total_Revenue, col12=Total_Remain
              let wk27Label = '', wk28Label = '';
              const soWk27 = [], soWk28 = [];
              let currentWk = null;
              s1Rows.forEach(row => {
                const cell0 = String(row[0] || '').trim();
                if (/^WEEK\\s*\\d+$/i.test(cell0)) {
                  if (!wk27Label) { wk27Label = cell0; currentWk = 'wk27'; }
                  else { wk28Label = cell0; currentWk = 'wk28'; }
                } else if (currentWk && /^202\\d$/.test(cell0)) {
                  const rev = Number(row[11] || row[5] || 0);
                  const rem = Number(row[12] || row[6] || 0);
                  if (currentWk === 'wk27') soWk27.push({ year: cell0, revenue: rev, remain: rem });
                  else soWk28.push({ year: cell0, revenue: rev, remain: rem });
                }
              });

              // Update SO comparison table header labels
              const soWk1Head = document.getElementById('soWk1Head');
              const soWk2Head = document.getElementById('soWk2Head');
              if (soWk1Head && wk27Label) soWk1Head.colSpan = 2, soWk1Head.textContent = wk27Label + ' Revenue / Remain';
              if (soWk2Head && wk28Label) soWk2Head.colSpan = 2, soWk2Head.textContent = wk28Label + ' Revenue / Remain';

              const soBody = document.getElementById('soCompareBody');
              if (soBody && (soWk27.length > 0 || soWk28.length > 0)) {
                const years = [...new Set([...soWk27.map(r => r.year), ...soWk28.map(r => r.year)])];
                let html = '';
                years.forEach(yr => {
                  const w27 = soWk27.find(r => r.year === yr) || { revenue: 0, remain: 0 };
                  const w28 = soWk28.find(r => r.year === yr) || { revenue: 0, remain: 0 };
                  html += \`<tr>
                    <td style="color:#f0f6ff;font-weight:600">\${yr}</td>
                    <td style="color:#10b981">\${fmtBaht(w27.revenue)}</td>
                    <td style="color:#f59e0b">\${fmtBaht(w27.remain)}</td>
                    <td style="color:#10b981">\${fmtBaht(w28.revenue)}</td>
                    <td style="color:#f59e0b">\${fmtBaht(w28.remain)}</td>
                  </tr>\`;
                });
                soBody.innerHTML = html;
              }
            }
          }`;

const SO_NEW = `              console.log('Sheet1 AC1 fallback done');
            }
          }

          /* ─── Sheet1: SO Comparison WEEK27 vs WEEK28 (always run) ─── */
          {
            const s1soSheet = wb.Sheets['Sheet1'];
            if (s1soSheet) {
              const s1soRows = XLSX.utils.sheet_to_json(s1soSheet, { header: 1, defval: '' });
              // Col 0=Year, Col 3=AC1 DONE Sum of REMAIN, Col 9=UNFULFILL Sum of REMAIN
              let wk27Label = '', wk28Label = '';
              const soWk27 = [], soWk28 = [];
              let currentWk = null;
              s1soRows.forEach(row => {
                const cell0 = String(row[0] || '').trim();
                if (/^WEEK\\s*\\d+$/i.test(cell0)) {
                  if (!wk27Label) { wk27Label = cell0; currentWk = 'wk27'; }
                  else { wk28Label = cell0; currentWk = 'wk28'; }
                } else if (currentWk && /^202\\d$/.test(cell0)) {
                  const ac1Rem = Number(row[3] || 0);
                  const unfRem = Number(row[9] || 0);
                  if (currentWk === 'wk27') soWk27.push({ year: cell0, ac1: ac1Rem, unf: unfRem });
                  else soWk28.push({ year: cell0, ac1: ac1Rem, unf: unfRem });
                }
              });
              const soWk1Head = document.getElementById('soWk1Head');
              const soWk2Head = document.getElementById('soWk2Head');
              if (soWk1Head && wk27Label) soWk1Head.textContent = wk27Label;
              if (soWk2Head && wk28Label) soWk2Head.textContent = wk28Label;
              const soBody = document.getElementById('soCompareBody');
              if (soBody && (soWk27.length > 0 || soWk28.length > 0)) {
                const years = [...new Set([...soWk27.map(r => r.year), ...soWk28.map(r => r.year)])].sort();
                let html = '';
                years.forEach(yr => {
                  const w27 = soWk27.find(r => r.year === yr) || { ac1: 0, unf: 0 };
                  const w28 = soWk28.find(r => r.year === yr) || { ac1: 0, unf: 0 };
                  html += \`<tr>
                    <td style="color:#f0f6ff;font-weight:600">\${yr}</td>
                    <td style="color:#f59e0b;text-align:right">\${w27.ac1 > 0 ? fmtBaht(w27.ac1) : '-'}</td>
                    <td style="color:#f87171;text-align:right">\${w27.unf > 0 ? fmtBaht(w27.unf) : '-'}</td>
                    <td style="\${w28.ac1 > w27.ac1 ? 'color:#f87171' : 'color:#34d399'};text-align:right">\${w28.ac1 > 0 ? fmtBaht(w28.ac1) : '-'}</td>
                    <td style="\${w28.unf > w27.unf ? 'color:#f87171' : 'color:#34d399'};text-align:right">\${w28.unf > 0 ? fmtBaht(w28.unf) : '-'}</td>
                  </tr>\`;
                });
                soBody.innerHTML = html;
              }
            }
          }`;

if (h.includes('// SO Comparison from Sheet1 pivot table')) {
  h = h.replace(SO_OLD, SO_NEW);
  console.log('✅ SO Comparison fixed');
} else {
  console.log('❌ SO OLD block not found');
}

fs.writeFileSync('public/summary.html', h);
console.log('Done');
