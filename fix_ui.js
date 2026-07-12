const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

// The proper table UI
const correctUI = `
    <!-- ── SO WEEK 27 VS WEEK 28 (Sheet1) ── -->
    <p class="section-title">📊 SO WEEK 27 VS WEEK 28</p>
    <div class="card" style="margin-bottom:28px">
      <div class="card-title" style="display:flex; justify-content:space-between;">
        <div>
          <span class="icon" style="--card-icon-bg:rgba(99,102,241,.15)">⚖️</span>
          SO Comparison (Sheet1)
        </div>
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

// 1. Find and replace the user's table (starts with `<!-- ── SO WEEK 27 VS WEEK 28 (Sheet1) ── -->` and ends at `</div>\n\n    <!-- ── Slide 27: REMAIN Summary ── -->`)
const userTableRegex = /<!-- ── SO WEEK 27 VS WEEK 28 \(Sheet1\) ── -->[\s\S]*?<\/div>\s*<!-- ── Slide 27: REMAIN Summary ── -->/;
if (h.match(userTableRegex)) {
    h = h.replace(userTableRegex, correctUI.trim() + '\n\n    <!-- ── Slide 27: REMAIN Summary ── -->');
}

// 2. Remove the table I injected at the bottom.
// It starts with `    <!-- ── SO Comparison (Sheet1) ── -->` and ends before `    <!-- ── Row 4: Safety & Conclusion (Part 5 & 6) ── -->`
const myTableRegex = /<!-- ── SO Comparison \(Sheet1\) ── -->[\s\S]*?<\/div>\s*<!-- ── Row 4: Safety & Conclusion \(Part 5 & 6\) ── -->/;
if (h.match(myTableRegex)) {
    h = h.replace(myTableRegex, '<!-- ── Row 4: Safety & Conclusion (Part 5 & 6) ── -->');
}

fs.writeFileSync('public/summary.html', h);
console.log('Fixed UI layout');
