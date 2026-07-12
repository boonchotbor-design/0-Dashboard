const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

const newUI = `        <table class="dash-table">
          <thead>
            <tr>
              <th>Work Type</th>
              <th style="text-align: center;">จำนวน site</th>
              <th style="text-align: center;">Average M1</th>
              <th style="text-align: center;">Average M2</th>
            </tr>
          </thead>
          <tbody id="milestoneWorkTypeBody">
            <tr>
              <td colspan="4" style="text-align:center;font-style:italic;color:var(--text-secondary);padding:12px;">No data imported</td>
            </tr>
          </tbody>
        </table>`;

h = h.replace(/<table class="dash-table">\s*<thead>\s*<tr>\s*<th>Name[\s\S]*?<\/table>/, newUI);

const newJs = `
            // Extract M1 and M2 Averages from Part 2 - Aging
            const haeM1_row = p2.find(r => String(r[C]).includes('HAE M1'));
            const haeM2_row = p2.find(r => String(r[C]).includes('HAE M2'));
            const tmeM1_mbb_row = p2.find(r => String(r[C]).includes('TME M1') && !String(r['Notes']).includes('IPRAN'));
            const tmeM1_ipran_row = p2.find(r => String(r[C]).includes('TME M1') && String(r['Notes']).includes('IPRAN'));
            const tmeM2_mbb_row = p2.find(r => String(r[C]).includes('TME M2') && String(r['Notes']).includes('MBB'));
            const tmeM2_ipran_row = p2.find(r => String(r[C]).includes('TME M2') && String(r['Notes']).includes('IPRAN'));

            window.milestoneData = {
              haeMbb: {
                 m1: haeM1_row ? Number(haeM1_row[M1]) : null,
                 m2: haeM2_row ? Number(haeM2_row[M1]) : null,
                 sites: 0
              },
              tmeMbb: {
                 m1: tmeM1_mbb_row ? Number(tmeM1_mbb_row[M1]) : null,
                 m2: tmeM2_mbb_row ? Number(tmeM2_mbb_row[M1]) : null,
                 sites: 0
              },
              tmeIpran: {
                 m1: tmeM1_ipran_row ? Number(tmeM1_ipran_row[M1]) : null,
                 m2: tmeM2_ipran_row ? Number(tmeM2_ipran_row[M1]) : null,
                 sites: 0
              }
            };
            // The table is rendered in the 2026 sheet block
`;

const oldJsStart = h.indexOf("// PE rows: Adisak Average M1+M2");
const oldJsEnd = h.indexOf("/* ─── Part 3 - Doc Management ─── */");
if (oldJsStart !== -1 && oldJsEnd !== -1) {
    h = h.substring(0, oldJsStart) + newJs + h.substring(oldJsEnd);
}

const renderLogic = `
              const wtIdx = headers.findIndex(h => String(h).toUpperCase() === 'WORK TYPE');
              if (wtIdx >= 0 && window.milestoneData) {
                 for (let i = 3; i < allRows.length; i++) {
                   const row = allRows[i];
                   if (!row || !row[projIdx]) continue;
                   const proj = String(row[projIdx]).toUpperCase();
                   const wt = String(row[wtIdx] || '').toUpperCase();
                   if (proj.includes('HAE') && wt.includes('MBB')) window.milestoneData.haeMbb.sites++;
                   if (proj.includes('TME') && wt.includes('MBB')) window.milestoneData.tmeMbb.sites++;
                   if (proj.includes('TME') && wt.includes('IPRAN')) window.milestoneData.tmeIpran.sites++;
                 }
                 
                 const fmtd = (n) => n === null || isNaN(n) ? '-' : n.toFixed(2) + 'd';
                 const bcolor = (n) => n > 10 ? 'badge-amber' : (n > 0 ? 'badge-green' : 'badge-blue');
                 
                 const md = window.milestoneData;
                 const html = \`
                   <tr>
                     <td style="color:var(--text-primary);font-weight:500">HAE-MBB</td>
                     <td style="text-align: center;"><span class="badge badge-blue">\${md.haeMbb.sites}</span></td>
                     <td style="text-align: center;"><span class="badge \${bcolor(md.haeMbb.m1)}">\${fmtd(md.haeMbb.m1)}</span></td>
                     <td style="text-align: center;"><span class="badge \${bcolor(md.haeMbb.m2)}">\${fmtd(md.haeMbb.m2)}</span></td>
                   </tr>
                   <tr>
                     <td style="color:var(--text-primary);font-weight:500">TME-MBB</td>
                     <td style="text-align: center;"><span class="badge badge-blue">\${md.tmeMbb.sites}</span></td>
                     <td style="text-align: center;"><span class="badge \${bcolor(md.tmeMbb.m1)}">\${fmtd(md.tmeMbb.m1)}</span></td>
                     <td style="text-align: center;"><span class="badge \${bcolor(md.tmeMbb.m2)}">\${fmtd(md.tmeMbb.m2)}</span></td>
                   </tr>
                   <tr>
                     <td style="color:var(--text-primary);font-weight:500">TME-IPRAN</td>
                     <td style="text-align: center;"><span class="badge badge-blue">\${md.tmeIpran.sites}</span></td>
                     <td style="text-align: center;"><span class="badge \${bcolor(md.tmeIpran.m1)}">\${fmtd(md.tmeIpran.m1)}</span></td>
                     <td style="text-align: center;"><span class="badge \${bcolor(md.tmeIpran.m2)}">\${fmtd(md.tmeIpran.m2)}</span></td>
                   </tr>
                 \`;
                 const tbody = document.getElementById('milestoneWorkTypeBody');
                 if(tbody) tbody.innerHTML = html;
              }
`;

// Insert render logic right after `setBadge('s26WaitDo', onProcess);`
const targetPoint = "setBadge('s26WaitDo', onProcess);";
if (h.includes(targetPoint)) {
    h = h.replace(targetPoint, targetPoint + '\n' + renderLogic);
}

// Also remove `document.getElementById('pePalagonM1')` etc which are no longer there, 
// to prevent errors? Not needed since they use `if (el)`.

// But wait, what if `peIdx` logic (the old Palagon/Adisak sites counting) fails?
// It's still there but we just don't have the elements. `setBadge` gracefully fails if ID is not found.

fs.writeFileSync('public/summary.html', h);
console.log('Milestone table updated successfully.');
