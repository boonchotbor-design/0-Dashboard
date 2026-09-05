
    Chart.defaults.color = '#64748b';
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 11;

    /* ── Backlog Trend ── */
    const blCtx = document.getElementById('backlogChart').getContext('2d');
    const grad = blCtx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, 'rgba(59,130,246,.35)');
    grad.addColorStop(1, 'rgba(59,130,246,0)');

    window.backlogChart = new Chart(blCtx, {
      type: 'line',
      data: {
        labels: ['W08', 'W12', 'W16', 'W20', 'W23', 'W24', 'W25', 'Week 26', 'Week 29', 'Week 30'],
        datasets: [{
          label: 'Backlog (฿)',
          data: [1680000, 1030000, 700000, 500000, 278511, 1187938, 1150000, 2084224.68, 2246705.16, 2109400.02],
          borderColor: '#3b82f6', backgroundColor: grad, borderWidth: 2.5,
          pointBackgroundColor: '#3b82f6', pointBorderColor: '#0a0d14', pointBorderWidth: 2,
          pointRadius: 5, tension: .4, fill: true,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1c2540', borderColor: 'rgba(59,130,246,.4)', borderWidth: 1,
            callbacks: { label: ctx => ' ฿' + ctx.parsed.y.toLocaleString('th-TH', { maximumFractionDigits: 0 }) }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#64748b', callback: v => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K' } }
        }
      }
    });

    /* ── Site Donut ── */
    window.siteDonut = new Chart(document.getElementById('siteDonut').getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'On Process', 'Other'],
        datasets: [{ data: [153, 53, 2], backgroundColor: ['#10b981', '#3b82f6', '#374151'], borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c2540', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1 } }
      }
    });

    /* ── Doc Status Bar ── */
    window.docChart = new Chart(document.getElementById('docChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['AC1', 'AC2'],
        datasets: [
          { label: 'Total Amount', data: [2307342, 988861], backgroundColor: 'rgba(59,130,246,.5)', borderColor: '#3b82f6', borderWidth: 1.5, borderRadius: 6 },
          { label: 'Done', data: [1055497, 177499], backgroundColor: 'rgba(16,185,129,.5)', borderColor: '#10b981', borderWidth: 1.5, borderRadius: 6 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 10, boxHeight: 10, padding: 12 } },
          tooltip: { backgroundColor: '#1c2540', callbacks: { label: ctx => ' ' + ctx.dataset.label + ': ฿' + ctx.parsed.y.toLocaleString('th-TH', { maximumFractionDigits: 0 }) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#64748b', callback: v => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K' } }
        }
      }
    });

    /* ── Team Weekly Performance Chart ── */
    window.teamWeeklyChart = new Chart(document.getElementById('teamWeeklyChart').getContext('2d'), {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#64748b' } },
          tooltip: { backgroundColor: '#1c2540' }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' }, stacked: true },
          y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#64748b' }, stacked: true }
        }
      }
    });
  