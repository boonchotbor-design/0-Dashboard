const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

const newUI = `
        <table class="dash-table">
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
        </table>
`;

// Replace the UI
const tableRegex = /<table class="dash-table">\s*<thead>\s*<tr>\s*<th>Name[\s\S]*?<\/table>/;
if (h.match(tableRegex)) {
    h = h.replace(tableRegex, newUI.trim());
}

// Inject JS logic right after `// PE rows: Adisak Average M1+M2, Palagon Average M1+M2`
// We will replace the whole PE calculation section.
const oldJsStart = h.indexOf("// PE rows: Adisak Average M1+M2");
const oldJsEnd = h.indexOf("/* ─── Part 3 - Doc Management ─── */");

if (oldJsStart !== -1 && oldJsEnd !== -1) {
    const newJs = `
            // Extract M1 and M2 Averages from Part 2 - Aging
            const haeM1_row = p2.find(r => String(r['Category / Person']).includes('HAE M1'));
            const haeM2_row = p2.find(r => String(r['Category / Person']).includes('HAE M2'));
            const tmeM1_mbb_row = p2.find(r => String(r['Category / Person']).includes('TME M1') && !String(r['Notes']).includes('IPRAN'));
            const tmeM1_ipran_row = p2.find(r => String(r['Category / Person']).includes('TME M1') && String(r['Notes']).includes('IPRAN'));
            const tmeM2_mbb_row = p2.find(r => String(r['Category / Person']).includes('TME M2') && String(r['Notes']).includes('MBB'));
            const tmeM2_ipran_row = p2.find(r => String(r['Category / Person']).includes('TME M2') && String(r['Notes']).includes('IPRAN'));

            window.milestoneData = {
              haeMbb: {
                 m1: haeM1_row ? Number(haeM1_row['M1 Aging']) : null,
                 m2: haeM2_row ? Number(haeM2_row['M1 Aging']) : null,
                 sites: 0
              },
              tmeMbb: {
                 m1: tmeM1_mbb_row ? Number(tmeM1_mbb_row['M1 Aging']) : null,
                 m2: tmeM2_mbb_row ? Number(tmeM2_mbb_row['M1 Aging']) : null,
                 sites: 0
              },
              tmeIpran: {
                 m1: tmeM1_ipran_row ? Number(tmeM1_ipran_row['M1 Aging']) : null,
                 m2: tmeM2_ipran_row ? Number(tmeM2_ipran_row['M1 Aging']) : null,
                 sites: 0
              }
            };
            
            // Note: we'll render it later when we have site counts from '2026' sheet
          }

          `;
    h = h.substring(0, oldJsStart) + newJs + h.substring(oldJsEnd);
}

// Now find where '2026' sheet is processed to get site counts
const s2026Start = h.indexOf("const allRows = XLSX.utils.sheet_to_json(s2026");
if (s2026Start !== -1) {
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
                 
                 // Render the milestone table
                 const fmtd = (n) => n === null || isNaN(n) ? '-' : n.toFixed(2) + 'd';
                 const bcolor = (n) => n > 10 ? 'badge-amber' : 'badge-green';
                 
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
    // Insert after "if (isHae || isTme) {" loop finishes? No, after "const totalSites = ..." block.
    // Let's insert it right after the loop that calculates `totalSites`.
    // Wait, let's just append it to the end of the `if (projIdx >= 0) {` block.
    // It's safer to use regex to find where to put it.
}

fs.writeFileSync('public/summary.html', h);
console.log('Done replacement');
