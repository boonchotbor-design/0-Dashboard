const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

// 1. Insert UI
const uiHTML = `
    <!-- ── SO Comparison (Sheet1) ── -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-title" style="display:flex; justify-content:space-between;">
        <div>
          <span class="icon" style="--card-icon-bg:rgba(99,102,241,.15)">⚖️</span>
          SO Comparison (Sheet1)
        </div>
        <span class="badge" style="background:rgba(255,255,255,0.1); font-size:0.65rem; border:1px solid rgba(255,255,255,0.15); color:#94a3b8;">SO WEEK 27 VS WEEK 28</span>
      </div>
      <table class="dash-table">
        <thead>
          <tr>
            <th rowspan="2">YEAR</th>
            <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">WK27 (Sum of REMAIN)</th>
            <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">WK28 (Sum of REMAIN)</th>
            <th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">Diff (WK28 - WK27)</th>
          </tr>
          <tr>
            <th style="text-align: right; color:#fcd34d;">AC1 DONE</th>
            <th style="text-align: right; color:#fcd34d;">UNFULFILL</th>
            <th style="text-align: right; color:#93c5fd;">AC1 DONE</th>
            <th style="text-align: right; color:#93c5fd;">UNFULFILL</th>
            <th style="text-align: right;">AC1 DONE</th>
            <th style="text-align: right;">UNFULFILL</th>
          </tr>
        </thead>
        <tbody id="soComparisonBody">
          <tr><td colspan="7" style="text-align:center;font-style:italic;color:var(--text-secondary);padding:12px;">No data imported</td></tr>
        </tbody>
      </table>
    </div>
`;

if (!h.includes('SO Comparison (Sheet1)')) {
    h = h.replace('<!-- ── Row 4: Safety & Conclusion (Part 5 & 6) ── -->', uiHTML + '\n    <!-- ── Row 4: Safety & Conclusion (Part 5 & 6) ── -->');
}

// 2. Insert JS logic
const jsLogic = `
            // SO Comparison (Sheet1)
            try {
              const sheet1 = wb.Sheets['Sheet1'];
              if (sheet1) {
                const s1Rows = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });
                let html = '';
                const years = ['2022', '2023', '2024', '2025', '2026', 'Grand Total'];
                let wk27Start = s1Rows.findIndex(r => r[0] === 'WEEK27');
                let wk28Start = s1Rows.findIndex(r => r[0] === 'WEEK28');

                if (wk27Start !== -1 && wk28Start !== -1) {
                  years.forEach(year => {
                    const r27Idx = s1Rows.findIndex((r, idx) => idx > wk27Start && idx < wk28Start && r[0] === year);
                    const r28Idx = s1Rows.findIndex((r, idx) => idx > wk28Start && r[0] === year);
                    
                    const r27 = r27Idx !== -1 ? s1Rows[r27Idx] : [];
                    const r28 = r28Idx !== -1 ? s1Rows[r28Idx] : [];
                    
                    const getVal = (row, col) => {
                       const v = row[col];
                       if(v === '' || v === undefined) return 0;
                       return Number(String(v).replace(/[^0-9.-]/g, '')) || 0;
                    };

                    const wk27Ac1 = getVal(r27, 3);
                    const wk27Un = getVal(r27, 9);
                    const wk28Ac1 = getVal(r28, 3);
                    const wk28Un = getVal(r28, 9);
                    const diffAc1 = wk28Ac1 - wk27Ac1;
                    const diffUn = wk28Un - wk27Un;

                    const fmt = (n) => n === 0 ? '-' : Number(n).toLocaleString('th-TH', { maximumFractionDigits: 0 });
                    
                    const diffColor = (n) => {
                       if(n > 0) return 'color:#10b981'; // Green
                       if(n < 0) return 'color:#ef4444'; // Red
                       return 'color:var(--text-secondary)';
                    };
                    
                    const isTotal = year === 'Grand Total';
                    const rowStyle = isTotal ? 'font-weight: 700; background: rgba(255,255,255,0.03);' : '';
                    const labelColor = isTotal ? 'var(--text-primary)' : 'var(--text-primary)';

                    html += \`<tr style="\${rowStyle}">
                      <td style="color:\${labelColor}">\${year}</td>
                      <td style="text-align: right;">\${fmt(wk27Ac1)}</td>
                      <td style="text-align: right;">\${fmt(wk27Un)}</td>
                      <td style="text-align: right;">\${fmt(wk28Ac1)}</td>
                      <td style="text-align: right;">\${fmt(wk28Un)}</td>
                      <td style="text-align: right; \${diffColor(diffAc1)}">\${diffAc1 > 0 ? '+' : ''}\${fmt(diffAc1)}</td>
                      <td style="text-align: right; \${diffColor(diffUn)}">\${diffUn > 0 ? '+' : ''}\${fmt(diffUn)}</td>
                    </tr>\`;
                  });
                  
                  const tbody = document.getElementById('soComparisonBody');
                  if(tbody) tbody.innerHTML = html;
                }
              }
            } catch(e) {
              console.warn('Sheet1 SO Comparison parsing error:', e.message);
            }
`;

if (!h.includes('// SO Comparison (Sheet1)')) {
    h = h.replace('if (importedSheets.length > 0) {', 'if (importedSheets.length > 0) {\n' + jsLogic);
}

fs.writeFileSync('public/summary.html', h);
console.log('SO Comparison successfully injected.');
