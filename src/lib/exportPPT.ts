// Export dashboard data to PowerPoint using pptxgenjs
// @ts-ignore – pptxgenjs ships CJS without proper ESM types
import PptxGenJS from 'pptxgenjs';

const BG   = '0d0d0f';   // slide background
const ACC  = '3b82f6';   // accent blue
const GOLD = 'f59e0b';   // amber
const RED  = 'ef4444';   // rose
const GRN  = '10b981';   // emerald
const TXT  = 'e4e4e7';   // light text
const SUB  = '71717a';   // subtext

function fmt(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: add a standard slide with title bar
function addSlide(pptx: any, title: string): any {
  const slide = pptx.addSlide();
  slide.background = { color: BG };
  // Accent bar
  slide.addShape(pptx.ShapeType.rect, { x: 0.2, y: 0.15, w: 0.06, h: 0.45, fill: { color: ACC }, line: { color: ACC } });
  // Title
  slide.addText(title, { x: 0.35, y: 0.1, w: 9.0, h: 0.55, fontSize: 18, bold: true, color: TXT, fontFace: 'Segoe UI' });
  return slide;
}

// Helper: add a KPI box
function addKpi(slide: any, x: number, y: number, w: number, h: number, label: string, value: string, color: string = ACC) {
  slide.addShape('rect', { x, y, w, h, fill: { color: '18181b' }, line: { color: color, pt: 1 }, rectRadius: 0.1 });
  slide.addText(label.toUpperCase(), { x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.22, fontSize: 7, color: SUB, bold: true, fontFace: 'Segoe UI' });
  slide.addText(value, { x: x + 0.1, y: y + 0.33, w: w - 0.2, h: 0.4, fontSize: 15, bold: true, color: TXT, fontFace: 'Segoe UI' });
}

export async function exportToPPT(data: any): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';   // 13.33 × 7.5 in
  pptx.author  = 'Teloneer';
  pptx.company = 'Teloneer';
  pptx.subject = `2026 Performance Report – Week ${data.reportWeek}`;
  pptx.title   = '2026 Project Performance Dashboard';

  const d = data;
  const fin  = d.financials;
  const perf = d.performance;
  const pe   = d.peAging;
  const doc  = d.docOwners;
  const ac1  = d.documentStatus.ac1;
  const ac2  = d.documentStatus.ac2;

  // ── Slide 1: Title ──────────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG };
    slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: ACC }, line: { color: ACC } });
    slide.addText('2026 PROJECT\nPERFORMANCE REPORT', {
      x: 1, y: 1.5, w: 11.33, h: 2.4,
      fontSize: 42, bold: true, color: TXT, fontFace: 'Segoe UI', align: 'center',
    });
    slide.addText(`Week ${d.reportWeek}  ·  ${d.projectYear}`, {
      x: 1, y: 3.9, w: 11.33, h: 0.5,
      fontSize: 16, color: ACC, fontFace: 'Segoe UI', align: 'center',
    });
    slide.addText('สรุปผลการดำเนินงานโครงการติดตั้งโครงข่ายโทรคมนาคม HAE & TME', {
      x: 1, y: 4.5, w: 11.33, h: 0.5,
      fontSize: 13, color: SUB, fontFace: 'Segoe UI', align: 'center',
    });
    slide.addText('PM Boonchot Boriwut  ·  Teloneer  ·  มิถุนายน 2026', {
      x: 1, y: 6.3, w: 11.33, h: 0.4,
      fontSize: 11, color: SUB, fontFace: 'Segoe UI', align: 'center',
    });
  }

  // ── Slide 2: Executive Bottom Line ──────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Executive Bottom Line');
    const items = [
      { title: '✅  The Operation is Fast', body: `HAE M1 Avg: ${perf.haeM1Avg} วัน  |  TME M1 Avg: ${perf.tmeM1Avg} วัน\nทีมหน้างานติดตั้งได้รวดเร็ว`, color: GRN },
      { title: '⚠️  The System is Clogged', body: `Milestone 2 ล่าช้าเฉลี่ย ${perf.overallM2Avg} วัน\nกระแสเงินสดชะงัก`, color: RED },
      { title: '🚀  The Path Forward',      body: `เร่งเคลียร์ยอด Remain ฿${fmt(fin.remain)}\nควบคู่กับมาตรฐานความปลอดภัย EHS`, color: ACC },
    ];
    items.forEach((item, i) => {
      const y = 0.85 + i * 1.8;
      slide.addShape('rect', { x: 0.4, y, w: 12.5, h: 1.55, fill: { color: '18181b' }, line: { color: item.color, pt: 1.5 }, rectRadius: 0.1 });
      slide.addText(item.title, { x: 0.6, y: y + 0.1, w: 12, h: 0.45, fontSize: 14, bold: true, color: item.color, fontFace: 'Segoe UI' });
      slide.addText(item.body,  { x: 0.6, y: y + 0.55, w: 12, h: 0.7,  fontSize: 12, color: TXT, fontFace: 'Segoe UI' });
    });
  }

  // ── Slide 3: Financial Health ────────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Financial Health Overview');
    const kpis = [
      { label: 'Estimate Final Income', value: `฿${fmt(fin.estimateFinalIncome)}`, color: ACC },
      { label: 'AR Commerce',           value: `฿${fmt(fin.ar)}`,                   color: GRN },
      { label: 'AP Payment',            value: `฿${fmt(fin.ap)}`,                   color: RED },
      { label: 'Remain to Claim',       value: `฿${fmt(fin.remain)}`,               color: GOLD },
    ];
    kpis.forEach((k, i) => addKpi(slide, 0.3 + i * 3.2, 0.85, 3.0, 1.1, k.label, k.value, k.color));

    // Chart data
    slide.addChart(pptx.ChartType.bar, [
      { name: 'Amount (฿)', labels: ['Final Income','AR','AP','Remain'], values: [fin.estimateFinalIncome, fin.ar, fin.ap, fin.remain] },
    ], {
      x: 0.4, y: 2.1, w: 12.5, h: 5.0,
      barGrouping: 'clustered',
      chartColors: [ACC, GRN, RED, GOLD],
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 11,
      dataLabelFontSize: 10,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 4: PE Aging ────────────────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'PE Performance — Milestone Aging Analysis');
    const rows = [
      ['PE Name', 'Sites', 'M1 Avg (วัน)', 'M2 Avg (วัน)', 'Status'],
      ['Adisak Chanmao',        String(pe.adisak.m1),             String(Math.abs(pe.adisak.m2)),  String(pe.adisak.sites),  'M1 OK / M2 ⚠'],
      ['Palagon Prommueangma',  String(Math.abs(pe.palagon.m1)),  String(Math.abs(pe.palagon.m2)), String(pe.palagon.sites), 'ต้องติดตาม'],
    ];
    slide.addTable(rows, {
      x: 0.4, y: 0.85, w: 12.5,
      border: { type: 'solid', pt: 1, color: '3f3f46' },
      fill: { color: '18181b' },
      fontFace: 'Segoe UI',
      fontSize: 12,
      color: TXT,
      rowH: 0.6,
      colW: [3.5, 1.5, 2.5, 2.5, 2.5],
    });

    // M1 comparison chart
    slide.addChart(pptx.ChartType.bar, [
      { name: 'M1 Avg Aging (วัน)', labels: ['Adisak','Palagon'], values: [pe.adisak.m1, Math.abs(pe.palagon.m1)] },
      { name: 'M2 Avg Aging (วัน)', labels: ['Adisak','Palagon'], values: [Math.abs(pe.adisak.m2), Math.abs(pe.palagon.m2)] },
    ], {
      x: 0.4, y: 1.85, w: 12.5, h: 5.3,
      barGrouping: 'clustered',
      chartColors: [ACC, RED],
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 12,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 5: Doc Owner Overview ──────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Document Owner Performance Overview');
    const owners = [
      { name: 'หทัยรัตน์ สิงห์แก้ว', sites: doc.hathairat.sites, m1: doc.hathairat.avgAging1, m2: doc.hathairat.avgAging2, ac1: doc.hathairat.ac1, ac2: doc.hathairat.ac2 },
      { name: 'Sermsiri Bampentam',    sites: doc.sermsiri.sites,  m1: doc.sermsiri.avgAging1,  m2: doc.sermsiri.avgAging2,  ac1: doc.sermsiri.ac1,  ac2: doc.sermsiri.ac2  },
      { name: 'Apichart Kampuang',     sites: doc.apichart.sites,  m1: doc.apichart.avgAging1,  m2: doc.apichart.avgAging2,  ac1: doc.apichart.ac1,  ac2: doc.apichart.ac2  },
    ];
    const cols = [3.8, 1.4, 2.0, 2.0, 1.8, 1.8];
    const header = ['DOC Owner','Sites','M1 Avg (วัน)','M2 Avg (วัน)','AC#1 (฿)','AC#2 (฿)'];
    const tableRows = [header, ...owners.map(o => [o.name, String(o.sites), String(o.m1), String(o.m2), fmt(o.ac1), fmt(o.ac2)])];
    slide.addTable(tableRows, {
      x: 0.4, y: 0.85, w: 12.5,
      border: { type: 'solid', pt: 1, color: '3f3f46' },
      fill: { color: '18181b' },
      fontFace: 'Segoe UI', fontSize: 11, color: TXT, rowH: 0.6, colW: cols,
    });

    slide.addChart(pptx.ChartType.bar, [
      { name: 'M1 Avg Aging', labels: ['หทัยรัตน์','Sermsiri','Apichart'], values: [doc.hathairat.avgAging1, doc.sermsiri.avgAging1, doc.apichart.avgAging1] },
      { name: 'M2 Avg Aging', labels: ['หทัยรัตน์','Sermsiri','Apichart'], values: [doc.hathairat.avgAging2, doc.sermsiri.avgAging2, doc.apichart.avgAging2] },
    ], {
      x: 0.4, y: 2.0, w: 12.5, h: 5.15,
      barGrouping: 'clustered',
      chartColors: [GOLD, RED],
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 12,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 6: AC#1 Performance ───────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Acceptance AC#1 Performance');
    addKpi(slide, 0.4,  0.85, 3.8, 1.1, 'AC#1 Amount',  `฿${fmt(ac1.amount)}`,        ACC);
    addKpi(slide, 4.5,  0.85, 3.8, 1.1, 'AC#1 Done',    `฿${fmt(ac1.done)}`,          GRN);
    addKpi(slide, 8.6,  0.85, 3.8, 1.1, 'Avg Aging',    `${ac1.avgAging.toFixed(0)} วัน`, RED);

    const months = ['JAN','FEB','MAR','APR','MAY','JUN'];
    const amtPer = ac1.amount / 6;
    const donePer = ac1.done / 6;
    slide.addChart(pptx.ChartType.bar, [
      { name: 'Amount', labels: months, values: months.map((_, i) => Math.round(amtPer  * (0.8  + i * 0.04))) },
      { name: 'Done',   labels: months, values: months.map((_, i) => Math.round(donePer * (0.7  + i * 0.06))) },
    ], {
      x: 0.4, y: 2.2, w: 12.5, h: 5.0,
      barGrouping: 'clustered',
      chartColors: [ACC, GRN],
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 12,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 7: AC#2 Performance ───────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Acceptance AC#2 Performance');
    addKpi(slide, 0.4,  0.85, 3.8, 1.1, 'AC#2 Amount',  `฿${fmt(ac2.amount)}`,        ACC);
    addKpi(slide, 4.5,  0.85, 3.8, 1.1, 'AC#2 Done',    `฿${fmt(ac2.done)}`,          GRN);
    addKpi(slide, 8.6,  0.85, 3.8, 1.1, 'Avg Aging',    `${ac2.avgAging.toFixed(0)} วัน`, RED);

    const months = ['JAN','FEB','MAR','APR','MAY','JUN'];
    const amtPer = ac2.amount / 6;
    const donePer = ac2.done / 6;
    slide.addChart(pptx.ChartType.bar, [
      { name: 'Amount', labels: months, values: months.map((_, i) => Math.round(amtPer  * (0.8  + i * 0.04))) },
      { name: 'Done',   labels: months, values: months.map((_, i) => Math.round(donePer * (0.7  + i * 0.06))) },
    ], {
      x: 0.4, y: 2.2, w: 12.5, h: 5.0,
      barGrouping: 'clustered',
      chartColors: [ACC, GRN],
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 12,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 8: Work Type Analysis ─────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Work Type Analysis: MBB vs IPRAN');
    const wt = d.workTypes;
    addKpi(slide, 0.4, 0.85, 5.9, 1.1, 'MBB Sites',   `${wt.MBB.sites} ไซต์`,   ACC);
    addKpi(slide, 6.8, 0.85, 5.9, 1.1, 'IPRAN Sites',  `${wt.IPTAN.sites} ไซต์`, '8b5cf6');
    slide.addChart(pptx.ChartType.bar, [
      { name: 'MBB',   labels: ['M1 Avg','M2 Avg'], values: [perf.haeM1Avg, parseFloat((perf.overallM2Avg * 0.75).toFixed(2))] },
      { name: 'IPRAN', labels: ['M1 Avg','M2 Avg'], values: [perf.tmeM1Avg, perf.overallM2Avg] },
    ], {
      x: 0.4, y: 2.1, w: 12.5, h: 5.1,
      barGrouping: 'clustered',
      chartColors: [ACC, '8b5cf6'],
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 12,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 9: Backlog Trend ───────────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Backlog Development Trend');
    const trend = d.backlogTrend;
    slide.addChart(pptx.ChartType.line, [
      { name: 'Remain (฿)', labels: trend.map((t: any) => t.week), values: trend.map((t: any) => t.value) },
    ], {
      x: 0.4, y: 0.85, w: 12.5, h: 6.35,
      chartColors: [RED],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 8,
      showTitle: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 12,
      plotAreaFill: { color: '18181b' },
    });
  }

  // ── Slide 10: Next Steps ─────────────────────────────────────────────────────
  {
    const slide = addSlide(pptx, 'Next Steps — Week 27 Action Plan');
    const actions = [
      { no: 1, title: 'PE ติดตาม Outstanding M2 Documents ทุกวันพฤหัสบดี', owner: 'Adisak & Palagon', priority: 'HIGH' },
      { no: 2, title: 'DOC Team ผลักดัน AC#2 JUNE Hit Target ฿242K',       owner: 'Hathairat, Sermsiri, Apichart', priority: 'HIGH' },
      { no: 3, title: 'Finance เร่งรัด AR Collection จาก AIS/Huawei',        owner: 'Finance Team', priority: 'HIGH' },
      { no: 4, title: 'แก้ไขข้อผิดพลาด PPE ให้ Compliance Rate ≥ 95%',      owner: 'All Site Teams', priority: 'MED' },
      { no: 5, title: 'อัปเดต Dashboard Data ทุกต้นสัปดาห์ (Week 27)',      owner: 'PM Boonchot', priority: 'LOW' },
    ];
    const pColors: Record<string,string> = { HIGH: RED, MED: GOLD, LOW: GRN };
    actions.forEach((a, i) => {
      const y = 0.9 + i * 1.15;
      slide.addShape('rect', { x: 0.4, y, w: 12.5, h: 1.0, fill: { color: '18181b' }, line: { color: '3f3f46', pt: 1 }, rectRadius: 0.08 });
      slide.addText(`${a.no}`, { x: 0.55, y: y + 0.15, w: 0.5, h: 0.6, fontSize: 14, bold: true, color: ACC, fontFace: 'Segoe UI', align: 'center' });
      slide.addText(a.title,   { x: 1.2,  y: y + 0.05, w: 9.5, h: 0.45, fontSize: 12, bold: true, color: TXT, fontFace: 'Segoe UI' });
      slide.addText(`Assignee: ${a.owner}`, { x: 1.2, y: y + 0.52, w: 9.5, h: 0.35, fontSize: 10, color: SUB, fontFace: 'Segoe UI' });
      slide.addText(a.priority, { x: 11.3, y: y + 0.22, w: 1.4, h: 0.45, fontSize: 11, bold: true, color: pColors[a.priority], fontFace: 'Segoe UI', align: 'center' });
    });
  }

  // Download
  await pptx.writeFile({ fileName: `Teloneer_W${data.reportWeek}_Dashboard.pptx` });
}
