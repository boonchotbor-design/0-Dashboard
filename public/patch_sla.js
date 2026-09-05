const fs = require('fs');
let html = fs.readFileSync('summary.html', 'utf8');

// 1. Add s26WorkTypeIdx declaration
html = html.replace(
    /let s26DocOwnerIdx=-1, s26PEOwnerIdx=-1, s26MS1AgingIdx=-1, s26MS2AgingIdx=-1;/,
    'let s26DocOwnerIdx=-1, s26PEOwnerIdx=-1, s26MS1AgingIdx=-1, s26MS2AgingIdx=-1, s26WorkTypeIdx=-1;'
);
html = html.replace(
    /s26DocOwnerIdx=-1; s26PEOwnerIdx=-1; s26MS1AgingIdx=-1; s26MS2AgingIdx=-1;/,
    's26DocOwnerIdx=-1; s26PEOwnerIdx=-1; s26MS1AgingIdx=-1; s26MS2AgingIdx=-1; s26WorkTypeIdx=-1;'
);
html = html.replace(
    /s26DocOwnerIdx = docOwnerIdx; s26PEOwnerIdx = peOwnerIdx;/,
    's26DocOwnerIdx = docOwnerIdx; s26PEOwnerIdx = peOwnerIdx; s26WorkTypeIdx = workTypeIdx;'
);

// 2. Modify PE Owner SLA calculation
const oldSLA = `              // PE Owner SLA — MS1 & MS2
              const peOwnerDefs2 = [
                { nameMatch: /adisak/i,  key: 'adisak',  ids: { sites: 'peAdisakSites',  ms1Avg: 'peAdisakMS1Avg',  ms1mm: 'peAdisakMS1MinMax',  ms2Avg: 'peAdisakMS2Avg',  ms2mm: 'peAdisakMS2MinMax' } },
                { nameMatch: /palagon/i, key: 'palagon', ids: { sites: 'pePalagonSites', ms1Avg: 'pePalagonMS1Avg', ms1mm: 'pePalagonMS1MinMax', ms2Avg: 'pePalagonMS2Avg', ms2mm: 'pePalagonMS2MinMax' } },
              ];
              const peStats2 = {};
              for (let i = s26HeaderRow + 1; i < s26Rows.length; i++) {
                const row = s26Rows[i];
                if (!row || !row[0]) continue;
                const pName = String(row[s26PEOwnerIdx] || '').trim();
                if (!pName || pName === 'CANCEL') continue;
                const m = peOwnerDefs2.find(d => d.nameMatch.test(pName));
                if (!m) continue;
                const k = m.key;
                if (!peStats2[k]) peStats2[k] = { sites: 0, ms1Ages: [], ms2Ages: [] };
                peStats2[k].sites++;
                const ms1v = Number(String(row[s26MS1AgingIdx] || '').replace(/[^0-9.-]/g,''));
                const ms2v = Number(String(row[s26MS2AgingIdx] || '').replace(/[^0-9.-]/g,''));
                if (!isNaN(ms1v) && ms1v > 0) peStats2[k].ms1Ages.push(ms1v);
                if (!isNaN(ms2v) && ms2v > 0) peStats2[k].ms2Ages.push(ms2v);
              }
              peOwnerDefs2.forEach(({ key, ids }) => {
                const d = peStats2[key];
                if (!d) return;
                const sEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
                const sBadge = (id, val, cls) => { const e = document.getElementById(id); if (e) { e.textContent = val; e.className = 'badge ' + cls; } };
                sEl(ids.sites, d.sites);
                if (d.ms1Ages.length) {
                  const avg = d.ms1Ages.reduce((a,b)=>a+b,0) / d.ms1Ages.length;
                  sBadge(ids.ms1Avg, avg.toFixed(1)+'d', agingBadgeClass2(avg));
                  sEl(ids.ms1mm, \`↓\${Math.min(...d.ms1Ages)}d / ↑\${Math.max(...d.ms1Ages)}d\`);
                }
                if (d.ms2Ages.length) {
                  const avg = d.ms2Ages.reduce((a,b)=>a+b,0) / d.ms2Ages.length;
                  sBadge(ids.ms2Avg, avg.toFixed(1)+'d', agingBadgeClass2(avg));
                  sEl(ids.ms2mm, \`↓\${Math.min(...d.ms2Ages)}d / ↑\${Math.max(...d.ms2Ages)}d\`);
                }
              });`;

const newSLA = `              // PE Owner SLA — MS1 & MS2 (Separated by Type)
              const peOwnerDefs2 = [
                { nameMatch: /adisak/i,  label: 'Adisak Chanmao' },
                { nameMatch: /palagon/i, label: 'Palagon Prommueangma' }
              ];
              const peTypes = [
                { match: /HAE-MBB/i, label: 'HAE-MBB' },
                { match: /TME-IPRAN/i, label: 'TME-IPRAN' },
                { match: /TME-MBB/i, label: 'TME-MBB' },
                { match: /BAT(E|TE)RRY|BATT/i, label: 'TME-BATTERY' }
              ];
              const peStats2 = {}; // key: "ownerLabel|typeLabel"
              for (let i = s26HeaderRow + 1; i < s26Rows.length; i++) {
                const row = s26Rows[i];
                if (!row || !row[0]) continue;
                const pName = String(row[s26PEOwnerIdx] || '').trim();
                if (!pName || pName === 'CANCEL') continue;
                const m = peOwnerDefs2.find(d => d.nameMatch.test(pName));
                if (!m) continue;
                
                let wt = 'Other';
                if (s26WorkTypeIdx > -1) {
                    const wtRaw = String(row[s26WorkTypeIdx] || '').trim();
                    const typeMatch = peTypes.find(t => t.match.test(wtRaw));
                    if (typeMatch) wt = typeMatch.label;
                }
                if (wt === 'Other') continue; // only show the requested types

                const k = m.label + '|' + wt;
                if (!peStats2[k]) peStats2[k] = { owner: m.label, type: wt, sites: 0, ms1Ages: [], ms2Ages: [] };
                peStats2[k].sites++;
                const ms1v = Number(String(row[s26MS1AgingIdx] || '').replace(/[^0-9.-]/g,''));
                const ms2v = Number(String(row[s26MS2AgingIdx] || '').replace(/[^0-9.-]/g,''));
                if (!isNaN(ms1v) && ms1v > 0) peStats2[k].ms1Ages.push(ms1v);
                if (!isNaN(ms2v) && ms2v > 0) peStats2[k].ms2Ages.push(ms2v);
              }
              
              const peBodyEl = document.getElementById('peOwnerBody');
              if (peBodyEl) {
                let htmlRows = '';
                // Sort by Owner first, then by Type
                const sortedKeys = Object.keys(peStats2).sort((a, b) => a.localeCompare(b));
                sortedKeys.forEach(k => {
                  const d = peStats2[k];
                  let ms1Avg = '-', ms1mm = '-', ms1Cls = 'badge-green';
                  let ms2Avg = '-', ms2mm = '-', ms2Cls = 'badge-amber';
                  
                  if (d.ms1Ages.length) {
                    const avg = d.ms1Ages.reduce((a,b)=>a+b,0) / d.ms1Ages.length;
                    ms1Avg = avg.toFixed(1)+'d';
                    ms1Cls = agingBadgeClass2(avg);
                    ms1mm = \`↓\${Math.min(...d.ms1Ages)}d / ↑\${Math.max(...d.ms1Ages)}d\`;
                  }
                  if (d.ms2Ages.length) {
                    const avg = d.ms2Ages.reduce((a,b)=>a+b,0) / d.ms2Ages.length;
                    ms2Avg = avg.toFixed(1)+'d';
                    ms2Cls = agingBadgeClass2(avg);
                    ms2mm = \`↓\${Math.min(...d.ms2Ages)}d / ↑\${Math.max(...d.ms2Ages)}d\`;
                  }
                  
                  htmlRows += \`<tr>
                    <td style="color:var(--text-primary);font-weight:500">\${d.owner} <span style="color:#94a3b8;font-size:0.85em">(\${d.type})</span></td>
                    <td><span class="badge badge-purple">\${d.sites}</span></td>
                    <td><span class="badge \${ms1Cls}">\${ms1Avg}</span></td>
                    <td style="font-size:.75rem;color:#94a3b8">\${ms1mm}</td>
                    <td><span class="badge \${ms2Cls}">\${ms2Avg}</span></td>
                    <td style="font-size:.75rem;color:#94a3b8">\${ms2mm}</td>
                  </tr>\`;
                });
                if(!htmlRows) {
                  htmlRows = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No data for specified types</td></tr>';
                }
                peBodyEl.innerHTML = htmlRows;
              }`;

if (html.includes(oldSLA)) {
    html = html.replace(oldSLA, newSLA);
    fs.writeFileSync('summary.html', html);
    console.log('Successfully updated PE Owner SLA logic!');
} else {
    console.log('Failed to find old SLA logic to replace! Please verify oldSLA string.');
}
