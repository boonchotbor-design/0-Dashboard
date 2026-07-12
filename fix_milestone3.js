const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

const oldBlock = `              // ── Milestone Table by Work Type (HAE-MBB / TME-MBB / TME-IPRAN) ──
              const wtIdx = headers.findIndex(h => String(h).toUpperCase() === 'WORK TYPE');
              if (wtIdx >= 0 && window.milestoneData) {
                for (let i = 3; i < allRows.length; i++) {
                  const row = allRows[i];
                  if (!row || !row[projIdx]) continue;
                  const proj = String(row[projIdx]).toUpperCase();
                  const wt   = String(row[wtIdx] || '').toUpperCase();
                  if (proj.includes('HAE') && wt.includes('MBB'))   window.milestoneData.haeMbb.sites++;
                  if (proj.includes('TME') && wt.includes('MBB'))   window.milestoneData.tmeMbb.sites++;
                  if (proj.includes('TME') && wt.includes('IPRAN')) window.milestoneData.tmeIpran.sites++;
                }

                const fmtd   = n  => (n === null || n === undefined || isNaN(n)) ? '-' : Number(n).toFixed(2) + 'd';
                const bcolor = n  => (!n || isNaN(n)) ? 'badge-blue' : (n > 10 ? 'badge-amber' : 'badge-green');
                const md = window.milestoneData;
                const mHtml = \`
                  <tr>
                    <td style="color:var(--text-primary);font-weight:500">HAE-MBB</td>
                    <td style="text-align:center"><span class="badge badge-blue">\${md.haeMbb.sites}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolor(md.haeMbb.m1)}">\${fmtd(md.haeMbb.m1)}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolor(md.haeMbb.m2)}">\${fmtd(md.haeMbb.m2)}</span></td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-primary);font-weight:500">TME-MBB</td>
                    <td style="text-align:center"><span class="badge badge-blue">\${md.tmeMbb.sites}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolor(md.tmeMbb.m1)}">\${fmtd(md.tmeMbb.m1)}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolor(md.tmeMbb.m2)}">\${fmtd(md.tmeMbb.m2)}</span></td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-primary);font-weight:500">TME-IPRAN</td>
                    <td style="text-align:center"><span class="badge badge-blue">\${md.tmeIpran.sites}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolor(md.tmeIpran.m1)}">\${fmtd(md.tmeIpran.m1)}</span></td>
                    <td style="text-align:center"><span class="badge \${bcolor(md.tmeIpran.m2)}">\${fmtd(md.tmeIpran.m2)}</span></td>
                  </tr>
                \`;
                const mTbody = document.getElementById('milestoneWorkTypeBody');
                if (mTbody) mTbody.innerHTML = mHtml;
              }`;

const newBlock = `              // ── Milestone Table: BP(67)=Project+Type, BD(55)=M1, BE(56)=M2 ──
              {
                const bpIdx = 67;  // Column BP = HAEMBB / TMEMBB / TMEIPRAN
                const m1Idx = 55;  // Column BD = AGING 1st Milestone
                const m2Idx = 56;  // Column BE = AGING 2nd Milestone

                const mGroups = {
                  'HAE-MBB':   { sites: 0, sumM1: 0, cntM1: 0, sumM2: 0, cntM2: 0 },
                  'TME-MBB':   { sites: 0, sumM1: 0, cntM1: 0, sumM2: 0, cntM2: 0 },
                  'TME-IPRAN': { sites: 0, sumM1: 0, cntM1: 0, sumM2: 0, cntM2: 0 }
                };

                for (let i = 3; i < allRows.length; i++) {
                  const row = allRows[i];
                  if (!row) continue;
                  const bp  = String(row[bpIdx] || '').toUpperCase().replace(/[\\s-]/g, '');
                  if (!bp) continue;
                  const m1v = Number(row[m1Idx]);
                  const m2v = Number(row[m2Idx]);
                  let grp = null;
                  if (bp.startsWith('HAE') && bp.includes('MBB'))             grp = 'HAE-MBB';
                  else if (bp.startsWith('TME') && bp.includes('MBB'))        grp = 'TME-MBB';
                  else if (bp.startsWith('TME') && bp.includes('IPRAN'))      grp = 'TME-IPRAN';
                  if (!grp) continue;
                  mGroups[grp].sites++;
                  if (!isNaN(m1v) && m1v > 0) { mGroups[grp].sumM1 += m1v; mGroups[grp].cntM1++; }
                  if (!isNaN(m2v) && m2v > 0) { mGroups[grp].sumM2 += m2v; mGroups[grp].cntM2++; }
                }

                const fmtdM  = n => (n === null || n === undefined || isNaN(n) || n === 0) ? '-' : Number(n).toFixed(2) + 'd';
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
                if (mTbody && mHtml) mTbody.innerHTML = mHtml;
              }`;

if (h.includes('// ── Milestone Table by Work Type (HAE-MBB / TME-MBB / TME-IPRAN) ──')) {
  h = h.replace(oldBlock, newBlock);
  console.log('Replaced successfully');
} else {
  console.log('Target block NOT found');
}

fs.writeFileSync('public/summary.html', h);
