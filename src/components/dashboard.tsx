"use client";

import { useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, DollarSign, Activity, Download, Upload,
  ShieldAlert, Target, LayoutDashboard, FileText, Presentation, Banknote,
  Rocket, AlertTriangle, CheckCircle2, Clock, Users, TrendingUp, TrendingDown,
  AlertCircle, ChevronRight, Zap
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseNum(v: any): number {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

function xlsxToJson(workbook: XLSX.WorkBook): any {
  const getSheet = (name: string) =>
    workbook.SheetNames.find(s => s.includes(name))
      ? XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames.find(s => s.includes(name))!], { defval: '' })
      : [];

  const rawRows = workbook.SheetNames.find(s => s === '2026')
    ? XLSX.utils.sheet_to_json<any>(workbook.Sheets['2026'], { header: 1, defval: '' })
    : [];

  const part3Rows = getSheet('Part 3 - Doc Management');

  const COL = {
    PROJECT: 6,       // G
    PE_OWNER: 17,     // R
    DOC_OWNER: 18,    // S
    ESTIMATE_INCOME: 27, // AB
    AR: 43,           // AR
    AP: 44,           // AP
    AGING_1: 55,      // AGING 1st Milestone
    AGING_2: 56,      // AGING 2nd Milestone
    STATUS_WORK: 57,  // STATUS WORK
    WORK_TYPE: 58,    // WORK TYPE
    AC1_AMOUNT: 59,   // AC1 Amount
    AC1_DONE: 60,
    AGING1: 61,
    AC2_AMOUNT: 62,
    AC2_DONE: 63,
    AGING2: 64,
    REMAIN: 66,       // REMAIN
  };

  const n = (v: any) => parseFloat(String(v).replace(/,/g, '')) || 0;

  const dataRows = rawRows.slice(3).filter((r: any) => r[0] !== '' && r[0] !== 0);

  // Project breakdown
  const byProject: any = {};
  dataRows.forEach((r: any) => {
    const proj = r[COL.PROJECT];
    if (!proj) return;
    if (!byProject[proj]) byProject[proj] = { rows: [], income: 0, ar: 0, ap: 0, remain: 0 };
    byProject[proj].rows.push(r);
    byProject[proj].income += n(r[COL.ESTIMATE_INCOME]);
    byProject[proj].ar += n(r[COL.AR]);
    byProject[proj].ap += n(r[COL.AP]);
    byProject[proj].remain += n(r[COL.REMAIN]);
  });

  // PE Aging breakdown
  const byPE: any = {};
  dataRows.forEach((r: any) => {
    const pe = r[COL.PE_OWNER];
    if (!pe || pe === 'CANCEL') return;
    if (!byPE[pe]) byPE[pe] = { hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [], all: [] };
    const proj = r[COL.PROJECT];
    const wt   = r[COL.WORK_TYPE];
    byPE[pe].all.push(r);
    if (proj === 'HAE' && wt === 'MBB')   byPE[pe].hae_mbb.push(r);
    if (proj === 'HAE' && wt !== 'MBB')   byPE[pe].hae_iptan.push(r);
    if (proj === 'TME' && wt === 'MBB')   byPE[pe].tme_mbb.push(r);
    if (proj === 'TME' && wt !== 'MBB')   byPE[pe].tme_iptan.push(r);
  });

  // DOC Owner breakdown
  const byDOC: any = {};
  dataRows.forEach((r: any) => {
    const doc = r[COL.DOC_OWNER];
    if (!doc || doc === 'CANCEL') return;
    if (!byDOC[doc]) byDOC[doc] = { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
    byDOC[doc].rows.push(r);
    byDOC[doc].ac1 += n(r[COL.AC1_AMOUNT]);
    byDOC[doc].ac2 += n(r[COL.AC2_AMOUNT]);
    if (n(r[COL.AGING1]) > 0) byDOC[doc].aging1.push(n(r[COL.AGING1]));
    if (n(r[COL.AGING2]) > 0) byDOC[doc].aging2.push(n(r[COL.AGING2]));
  });

  const completed = dataRows.filter((r: any) => r[COL.STATUS_WORK] === 'COMPLETED');
  const onProcess = dataRows.filter((r: any) => r[COL.STATUS_WORK] === 'ON PROCESS');

  const hae = byProject['HAE'] || { income: 0, ar: 0, ap: 0, remain: 0, rows: [] };
  const tme = byProject['TME'] || { income: 0, ar: 0, ap: 0, remain: 0, rows: [] };

  const adisakPE = byPE['Adisak Chanmao'] || { all: [], hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [] };
  const palagonPE = byPE['Palagon Prommueangma'] || { all: [], hae_mbb: [], hae_iptan: [], tme_mbb: [], tme_iptan: [] };

  const hathairat = byDOC['น.ส. หทัยรัตน์ สิงห์แก้ว'] || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
  const sermsiri  = byDOC['Sermsiri  Bampentam']      || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };
  const apichart  = byDOC['Apichart Kampuang']         || { rows: [], ac1: 0, ac2: 0, aging1: [], aging2: [] };

  const mbbRows   = dataRows.filter((r: any) => r[COL.WORK_TYPE] === 'MBB');
  const iptanRows = dataRows.filter((r: any) => r[COL.WORK_TYPE] !== 'MBB' && r[COL.WORK_TYPE] !== '');

  const avgAging1All = dataRows.filter((r: any) => n(r[COL.AGING_1]) > 0);
  const avgAging2All = dataRows.filter((r: any) => n(r[COL.AGING_2]) > 0);
  const haeM1Rows = hae.rows.filter((r: any) => n(r[COL.AGING_1]) > 0);
  const tmeM1Rows = tme.rows.filter((r: any) => n(r[COL.AGING_1]) > 0);

  const avgM1HAE   = haeM1Rows.length ? haeM1Rows.reduce((s: number, r: any) => s + n(r[COL.AGING_1]), 0) / haeM1Rows.length : 0;
  const avgM1TME   = tmeM1Rows.length ? tmeM1Rows.reduce((s: number, r: any) => s + n(r[COL.AGING_1]), 0) / tmeM1Rows.length : 0;
  const avgM1All   = avgAging1All.length ? avgAging1All.reduce((s: number, r: any) => s + n(r[COL.AGING_1]), 0) / avgAging1All.length : 0;
  const avgM2All   = avgAging2All.length ? avgAging2All.reduce((s: number, r: any) => s + n(r[COL.AGING_2]), 0) / avgAging2All.length : 0;

  const adiM1rows = adisakPE.all.filter((r: any) => n(r[COL.AGING_1]) > 0);
  const palM1rows = palagonPE.all.filter((r: any) => n(r[COL.AGING_1]) > 0);
  const adiM2rows = adisakPE.all.filter((r: any) => n(r[COL.AGING_2]) > 0);
  const palM2rows = palagonPE.all.filter((r: any) => n(r[COL.AGING_2]) > 0);

  const summaryRow = rawRows[1] || [];
  const totalIncome = n(summaryRow[COL.ESTIMATE_INCOME]);
  const totalAR     = n(summaryRow[COL.AR]);
  const totalAP     = n(summaryRow[COL.AP]);
  const totalRemain = n(summaryRow[COL.REMAIN]);

  const ac1Row = part3Rows.find((r: any) => String(r['Owner / Type'] ?? '').includes('AC#1') || String(r['Slide Title'] ?? '').includes('AC#1') || String(r['__EMPTY_1'] ?? '').includes('AC#1'));
  const ac2Row = part3Rows.find((r: any) => String(r['Owner / Type'] ?? '').includes('AC#2') || String(r['Slide Title'] ?? '').includes('AC#2') || String(r['__EMPTY_1'] ?? '').includes('AC#2'));

  const getVal = (row: any, keyName: string, emptyKey: string) => {
    if (!row) return '';
    return row[keyName] !== undefined && row[keyName] !== '' ? row[keyName] : row[emptyKey];
  };

  const ac1Amount = ac1Row ? n(getVal(ac1Row, 'Amount (THB)', '__EMPTY_2')) : 2307341.68;
  const ac1Done = ac1Row ? n(getVal(ac1Row, 'Done (THB)', '__EMPTY_3')) : 1055496.92;
  const ac1AvgAging = ac1Row ? n(getVal(ac1Row, 'Avg Aging', '__EMPTY_4')) : 9.70386266;

  const ac2Amount = ac2Row ? n(getVal(ac2Row, 'Amount (THB)', '__EMPTY_2')) : 988860.72;
  const ac2Done = ac2Row ? n(getVal(ac2Row, 'Done (THB)', '__EMPTY_3')) : 177499.20;
  const ac2AvgAging = ac2Row ? n(getVal(ac2Row, 'Avg Aging', '__EMPTY_4')) : 11.54054054;

  return {
    reportWeek: 26, projectYear: 2026,
    performance: {
      haeM1Avg: parseFloat(avgM1HAE.toFixed(2)),
      tmeM1Avg: parseFloat(avgM1TME.toFixed(2)),
      overallM1Avg: parseFloat(avgM1All.toFixed(2)),
      overallM2Avg: parseFloat(avgM2All.toFixed(2)),
      smartQC: { passRate: 95, totalInspected: 142 },
    },
    projects: {
      HAE: { sites: hae.rows.length, income: parseFloat(hae.income.toFixed(2)), ar: parseFloat(hae.ar.toFixed(2)), ap: parseFloat(hae.ap.toFixed(2)), remain: parseFloat(hae.remain.toFixed(2)) },
      TME: { sites: tme.rows.length, income: parseFloat(tme.income.toFixed(2)), ar: parseFloat(tme.ar.toFixed(2)), ap: parseFloat(tme.ap.toFixed(2)), remain: parseFloat(tme.remain.toFixed(2)) },
    },
    peAging: {
      adisak: {
        name: 'Adisak Chanmao', sites: adisakPE.all.length,
        m1: parseFloat((adiM1rows.length ? adiM1rows.reduce((s: number, r: any) => s + n(r[COL.AGING_1]), 0) / adiM1rows.length : 0).toFixed(2)),
        m2: parseFloat((adiM2rows.length ? adiM2rows.reduce((s: number, r: any) => s + n(r[COL.AGING_2]), 0) / adiM2rows.length : 0).toFixed(2)),
        hae_mbb: adisakPE.hae_mbb.length, hae_iptan: adisakPE.hae_iptan.length,
        tme_mbb: adisakPE.tme_mbb.length, tme_iptan: adisakPE.tme_iptan.length,
      },
      palagon: {
        name: 'Palagon Prommueangma', sites: palagonPE.all.length,
        m1: parseFloat((palM1rows.length ? palM1rows.reduce((s: number, r: any) => s + n(r[COL.AGING_1]), 0) / palM1rows.length : 0).toFixed(2)),
        m2: parseFloat((palM2rows.length ? palM2rows.reduce((s: number, r: any) => s + n(r[COL.AGING_2]), 0) / palM2rows.length : 0).toFixed(2)),
        hae_mbb: palagonPE.hae_mbb.length, hae_iptan: palagonPE.hae_iptan.length,
        tme_mbb: palagonPE.tme_mbb.length, tme_iptan: palagonPE.tme_iptan.length,
      },
    },
    docOwners: {
      hathairat: {
        name: 'น.ส. หทัยรัตน์ สิงห์แก้ว', sites: hathairat.rows.length,
        ac1: parseFloat(hathairat.ac1.toFixed(2)), ac2: parseFloat(hathairat.ac2.toFixed(2)),
        avgAging1: parseFloat((hathairat.aging1.length ? hathairat.aging1.reduce((a: number, b: number) => a + b) / hathairat.aging1.length : 0).toFixed(2)),
        avgAging2: parseFloat((hathairat.aging2.length ? hathairat.aging2.reduce((a: number, b: number) => a + b) / hathairat.aging2.length : 0).toFixed(2)),
      },
      sermsiri: {
        name: 'Sermsiri Bampentam', sites: sermsiri.rows.length,
        ac1: parseFloat(sermsiri.ac1.toFixed(2)), ac2: parseFloat(sermsiri.ac2.toFixed(2)),
        avgAging1: parseFloat((sermsiri.aging1.length ? sermsiri.aging1.reduce((a: number, b: number) => a + b) / sermsiri.aging1.length : 0).toFixed(2)),
        avgAging2: parseFloat((sermsiri.aging2.length ? sermsiri.aging2.reduce((a: number, b: number) => a + b) / sermsiri.aging2.length : 0).toFixed(2)),
      },
      apichart: {
        name: 'Apichart Kampuang', sites: apichart.rows.length,
        ac1: parseFloat(apichart.ac1.toFixed(2)), ac2: parseFloat(apichart.ac2.toFixed(2)),
        avgAging1: parseFloat((apichart.aging1.length ? apichart.aging1.reduce((a: number, b: number) => a + b) / apichart.aging1.length : 0).toFixed(2)),
        avgAging2: parseFloat((apichart.aging2.length ? apichart.aging2.reduce((a: number, b: number) => a + b) / apichart.aging2.length : 0).toFixed(2)),
      },
    },
    workTypes: {
      MBB:   { sites: mbbRows.length,   remain: parseFloat(mbbRows.reduce((s: number, r: any) => s+n(r[COL.REMAIN]),0).toFixed(2)) },
      IPTAN: { sites: iptanRows.length, remain: parseFloat(iptanRows.reduce((s: number, r: any) => s+n(r[COL.REMAIN]),0).toFixed(2)) },
    },
    documentStatus: {
      ac1: { amount: ac1Amount, done: ac1Done, avgAging: ac1AvgAging },
      ac2: { amount: ac2Amount, done: ac2Done, avgAging: ac2AvgAging },
    },
    financials: {
      estimateFinalIncome: parseFloat(totalIncome.toFixed(2)),
      ar:     parseFloat(totalAR.toFixed(2)),
      ap:     parseFloat(totalAP.toFixed(2)),
      remain: parseFloat(totalRemain.toFixed(2)),
    },
    recoveryPlan: {
      juneAcceptanceTarget: 192566.00,
      juneActionPlanAC2: 242060.30,
      installOnProcess: onProcess.reduce((s: number, r: any) => s + n(r[COL.ESTIMATE_INCOME]), 0),
    },
    backlogTrend: [
      { week: 'W08', value: 1680000 }, { week: 'W12', value: 1030000 },
      { week: 'W16', value: 700000  }, { week: 'W20', value: 500000  },
      { week: 'W23', value: 278511  }, { week: 'W24', value: 1187938 },
      { week: 'W25', value: 1150000 }, { week: 'W26', value: totalRemain },
    ],
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon, color = 'blue', trend }: {
  title: string; value: string; sub?: string; icon: React.ReactNode;
  color?: 'blue' | 'emerald' | 'rose' | 'amber' | 'purple'; trend?: 'up' | 'down' | 'risk';
}) {
  const colors: Record<string, string> = {
    blue:    'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    rose:    'bg-rose-500/10 border-rose-500/20 text-rose-400',
    amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
    purple:  'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };
  return (
    <div className={`border rounded-2xl p-5 flex flex-col gap-3 ${colors[color]} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase tracking-widest opacity-70">{title}</span>
        <span className="opacity-60">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs font-medium opacity-70">
          {trend === 'up'   && <TrendingUp size={12} />}
          {trend === 'down' && <TrendingDown size={12} />}
          {trend === 'risk' && <AlertTriangle size={12} className="text-rose-400" />}
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
      <span className="w-1 h-7 rounded-full bg-blue-500 inline-block shrink-0" />
      {children}
    </h2>
  );
}

function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) {
  const c: Record<string, string> = {
    blue:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    red:     'bg-rose-500/20 text-rose-300 border-rose-500/30',
    amber:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
    purple:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
    yellow:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c[color] ?? c.blue}`}>{children}</span>;
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 border-b border-zinc-800 last:border-0 ${highlight ? 'text-blue-300' : 'text-zinc-300'}`}>
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`font-semibold text-sm ${highlight ? 'text-blue-300' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function ActionItem({ no, title, owner, priority }: { no: number; title: string; owner: string; priority: 'HIGH' | 'MED' | 'LOW' }) {
  const p: Record<string, string> = { HIGH: 'text-rose-400 bg-rose-500/10 border-rose-500/20', MED: 'text-amber-400 bg-amber-500/10 border-amber-500/20', LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
      <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">{no}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">Assignee: {owner}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${p[priority]}`}>{priority}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Dashboard({ activeSlide, data, onImport }: {
  activeSlide: number; data: any; onImport: (data: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const a = document.createElement('a');
    a.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    a.setAttribute('download', 'dashboard-data.json');
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (isXlsx) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result as ArrayBuffer, { type: 'array' });
          onImport(xlsxToJson(workbook));
        } catch { alert('ไม่สามารถอ่านไฟล์ Excel ได้'); }
      };
    } else {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        try { onImport(JSON.parse(e.target?.result as string)); }
        catch { alert('Invalid JSON format'); }
      };
    }
    event.target.value = '';
  };

  const d = data;
  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtM = (n: number) => `฿${(n / 1_000_000).toFixed(2)}M`;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const renderSlide = () => {
    switch (activeSlide) {

      // ── Slide 1: Title ──────────────────────────────────────────────────────
      case 1: return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in duration-500">
          <div className="space-y-2">
            <Badge color="blue">Week {d.reportWeek} · {d.projectYear}</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-tight">
              2026 Project<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Performance Report
              </span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              สรุปผลการดำเนินงานโครงการติดตั้งโครงข่ายโทรคมนาคม<br />
              <span className="text-white font-semibold">HAE &amp; TME</span> — ประจำสัปดาห์ที่ {d.reportWeek}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 mt-4 border border-zinc-800 rounded-2xl px-8 py-4 bg-zinc-900/40">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">ผู้นำเสนอ</span>
            <span className="text-xl font-bold text-white">PM Boonchot Boriwut</span>
            <span className="text-sm text-zinc-400">Teloneer · มิถุนายน 2026</span>
          </div>
        </div>
      );

      // ── Slide 2: Executive Bottom Line ──────────────────────────────────────
      case 2: return (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>Executive Bottom Line</SectionTitle>
            <Badge color="amber">Portfolio Status: YELLOW</Badge>
          </div>
          <div className="grid gap-4">
            {[
              { icon: <Zap className="text-white" />, bg: 'bg-emerald-600', title: 'The Operation is Fast', body: `ทีมหน้างานติดตั้งได้รวดเร็ว — HAE M1 Avg: ${d.performance.haeM1Avg} วัน | TME M1 Avg: ${d.performance.tmeM1Avg} วัน`, border: 'border-emerald-900/50 bg-emerald-950/30', titleColor: 'text-emerald-400' },
              { icon: <AlertTriangle className="text-white" />, bg: 'bg-rose-600', title: 'The System is Clogged', body: `กระบวนการเอกสาร Milestone 2 ล่าช้าเฉลี่ยถึง ${d.performance.overallM2Avg} วัน — ทำให้กระแสเงินสดชะงัก`, border: 'border-rose-900/50 bg-rose-950/30', titleColor: 'text-rose-400' },
              { icon: <Rocket className="text-white" />, bg: 'bg-blue-600', title: 'The Path Forward', body: `เร่งเคลียร์ยอด Remain ฿${fmt(d.financials.remain)} — ควบคู่กับมาตรฐานความปลอดภัย EHS`, border: 'border-blue-900/50 bg-blue-950/30', titleColor: 'text-blue-400' },
            ].map(item => (
              <div key={item.title} className={`border ${item.border} p-5 rounded-2xl flex items-start gap-4`}>
                <div className={`${item.bg} p-3 rounded-xl shrink-0`}>{item.icon}</div>
                <div>
                  <h3 className={`text-base font-bold ${item.titleColor}`}>{item.title}</h3>
                  <p className="text-zinc-300 text-sm mt-1">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      // ── Slide 3: Portfolio Performance ─────────────────────────────────────
      case 3: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Portfolio Performance Snapshot (HAE &amp; TME)</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Revenue W26" value="45.98M" sub="▲ +880K vs W25" icon={<TrendingUp size={18}/>} color="emerald" trend="up"/>
            <KpiCard title="AC1 Done" value="139" sub="▼ จาก 151 (W25)" icon={<FileText size={18}/>} color="rose" trend="down"/>
            <KpiCard title="Fulfilled" value="17,694" sub="▲ +63 vs W25" icon={<CheckCircle2 size={18}/>} color="blue" trend="up"/>
            <KpiCard title="Unfulfilled" value="783" sub="▲ +255 (+48%) Risk" icon={<AlertTriangle size={18}/>} color="rose" trend="risk"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">W25 → W26 KPI Comparison</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Revenue', w25: 45.10, w26: 45.98 },
                  { name: 'Fulfilled (÷1000)', w25: 17.631, w26: 17.694 },
                  { name: 'Remain', w25: 1.75, w26: 2.48 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false}/>
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false}/>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} itemStyle={{ color: '#e4e4e7' }}/>
                  <Bar dataKey="w25" name="W25" fill="#3b82f6" radius={[4,4,0,0]}/>
                  <Bar dataKey="w26" name="W26" fill="#10b981" radius={[4,4,0,0]}/>
                  <Legend/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Remain Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Remain 2026 (86%)', value: 86 },
                    { name: 'Others', value: 14 },
                  ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                    <Cell fill="#ef4444"/><Cell fill="#3b82f6"/>
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );

      // ── Slide 4: Smart QC ───────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Smart QC Overview (Week 25–26)</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="QC Pass Rate" value={`${d.performance.smartQC.passRate}%`} sub="คะแนนผ่าน Smart QC" icon={<CheckCircle2 size={18}/>} color="emerald"/>
            <KpiCard title="Total Inspected" value={String(d.performance.smartQC.totalInspected)} sub="จำนวนไซต์ที่ตรวจสอบ" icon={<Activity size={18}/>} color="blue"/>
            <KpiCard title="Fail Rate" value={`${100 - d.performance.smartQC.passRate}%`} sub="ต้องแก้ไขก่อน AC" icon={<AlertTriangle size={18}/>} color="rose"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Pass / Fail Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[
                    { name: 'Pass', value: d.performance.smartQC.passRate },
                    { name: 'Fail', value: 100 - d.performance.smartQC.passRate },
                  ]} cx="50%" cy="50%" outerRadius={85} dataKey="value">
                    <Cell fill="#10b981"/><Cell fill="#ef4444"/>
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">HAE vs TME Quality Score</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={[
                  { subject: 'Photo', HAE: 88, TME: 76 },
                  { subject: 'PPE', HAE: 92, TME: 85 },
                  { subject: 'Doc', HAE: 78, TME: 80 },
                  { subject: 'Safety', HAE: 95, TME: 88 },
                  { subject: 'Install', HAE: 90, TME: 82 },
                ]}>
                  <PolarGrid stroke="#3f3f46"/>
                  <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={12}/>
                  <Radar name="HAE" dataKey="HAE" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3}/>
                  <Radar name="TME" dataKey="TME" stroke="#10b981" fill="#10b981" fillOpacity={0.3}/>
                  <Legend/>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );

      // ── Slide 5: Operation Error Analysis ──────────────────────────────────
      case 5: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Operation Error &amp; Defect Analysis</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2"><AlertCircle size={14}/>ข้อผิดพลาดที่พบบ่อย</h3>
              {[
                { no: 1, issue: 'ขาดอุปกรณ์ป้องกัน PPE', freq: 'สูง', count: '23 ครั้ง' },
                { no: 2, issue: 'ภาพถ่ายไม่ครบ / ไม่ชัด', freq: 'สูง', count: '19 ครั้ง' },
                { no: 3, issue: 'แบบแปลนไม่สอดคล้องกับหน้างาน', freq: 'กลาง', count: '11 ครั้ง' },
                { no: 4, issue: 'Data Form กรอกไม่ครบถ้วน', freq: 'กลาง', count: '9 ครั้ง' },
                { no: 5, issue: 'งานไม่ผ่าน AIS SPE Standards', freq: 'ต่ำ', count: '4 ครั้ง' },
              ].map(item => (
                <div key={item.no} className="flex items-center gap-3 py-2.5 border-b border-zinc-800 last:border-0">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">{item.no}</span>
                  <span className="text-sm text-zinc-300 flex-1">{item.issue}</span>
                  <span className="text-xs text-zinc-500">{item.count}</span>
                  <Badge color={item.freq === 'สูง' ? 'red' : item.freq === 'กลาง' ? 'amber' : 'green'}>{item.freq}</Badge>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">ความถี่ข้อผิดพลาด แยก Work Type</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[
                  { name: 'PPE', MBB: 14, IPTAN: 9 },
                  { name: 'Photo', MBB: 10, IPTAN: 9 },
                  { name: 'Plan', MBB: 6, IPTAN: 5 },
                  { name: 'Form', MBB: 5, IPTAN: 4 },
                  { name: 'SPE', MBB: 3, IPTAN: 1 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false}/>
                  <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false}/>
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} tickLine={false} width={45}/>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }}/>
                  <Bar dataKey="MBB" fill="#3b82f6" radius={[0,4,4,0]}/>
                  <Bar dataKey="IPTAN" fill="#8b5cf6" radius={[0,4,4,0]}/>
                  <Legend/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );

      // ── Slide 6: Improvement Plan ───────────────────────────────────────────
      case 6: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Improvement Plan — AIS SPE Standards</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Users size={20}/>, title: 'ฝึกอบรม Subcontractor', items: ['อบรม PPE Compliance ทุกต้น-กลางเดือน', 'Mock Inspection ก่อนเข้าไซต์จริง', 'Test & Certify ก่อนปฏิบัติงาน'], color: 'border-blue-500/30 bg-blue-950/20' },
              { icon: <FileText size={20}/>, title: 'ปรับปรุงกระบวนการเอกสาร', items: ['Digital Checklist ก่อนส่งมอบงาน', 'Photo Template มาตรฐาน SPE', 'QC Gate ก่อน Submit M1'], color: 'border-emerald-500/30 bg-emerald-950/20' },
              { icon: <ShieldAlert size={20}/>, title: 'ระบบตรวจสอบและลงโทษ', items: ['Warning System 3 ครั้ง → ระงับสิทธิ์', 'Penalty Fee สำหรับข้อผิดพลาดซ้ำ', 'Audit รายสัปดาห์โดย PE'], color: 'border-purple-500/30 bg-purple-950/20' },
            ].map(plan => (
              <div key={plan.title} className={`border rounded-2xl p-5 space-y-3 ${plan.color}`}>
                <div className="flex items-center gap-2 text-white font-semibold">{plan.icon}{plan.title}</div>
                <ul className="space-y-2">
                  {plan.items.map(item => (
                    <li key={item} className="text-sm text-zinc-300 flex items-start gap-2">
                      <ChevronRight size={14} className="text-blue-400 shrink-0 mt-0.5"/>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

      // ── Slide 7: Execution Paradox (Bottleneck) ─────────────────────────────
      case 7: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>The Execution Paradox — คอขวดทางการเงิน</SectionTitle>
          <div className="flex flex-col items-center gap-3">
            {[
              { label: 'หน้างานติดตั้ง (Installation)', sub: 'รวดเร็ว ✓', width: 'w-full', bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-300' },
              { label: '1st Milestone (M1 Submit)', sub: `Avg ${d.performance.overallM1Avg} วัน`, width: 'w-4/5', bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-300' },
              { label: '2nd Milestone (M2 Documents)', sub: `Avg ${d.performance.overallM2Avg} วัน ⚠`, width: 'w-3/5', bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-300' },
              { label: 'Acceptance & Revenue Recognition', sub: 'ล่าช้าสะสม ⛔', width: 'w-2/5', bg: 'bg-rose-500/20 border-rose-500/40', text: 'text-rose-300' },
            ].map((step, i) => (
              <div key={i} className={`${step.width} border rounded-xl p-4 flex justify-between items-center transition-all ${step.bg}`}>
                <span className={`font-semibold text-sm ${step.text}`}>{step.label}</span>
                <span className="text-xs text-zinc-400">{step.sub}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500 italic mt-2">
            หน้างานผลิต Output ได้เร็ว แต่กระแสเงินสดถูก "บีบ" ที่กระบวนการเอกสาร M2
          </p>
        </div>
      );

      // ── Slide 8: 1st Milestone Aging ────────────────────────────────────────
      case 8: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>1st Milestone AGING Analysis</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiCard title="HAE — M1 Avg Aging" value={`${d.performance.haeM1Avg} วัน`} sub="ระยะเวลาปิด 1st Milestone" icon={<Clock size={18}/>} color="amber"/>
            <KpiCard title="TME — M1 Avg Aging" value={`${d.performance.tmeM1Avg} วัน`} sub="ระยะเวลาปิด 1st Milestone" icon={<Clock size={18}/>} color="purple"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">M1 Aging เปรียบเทียบ HAE-MBB vs TME-IPRAN</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'HAE-MBB', aging: d.performance.haeM1Avg },
                { name: 'TME-IPRAN', aging: d.performance.tmeM1Avg },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false}/>
                <YAxis stroke="#71717a" fontSize={12} tickLine={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`${v} วัน`]}/>
                <Bar dataKey="aging" name="Avg Aging (วัน)" radius={[4,4,0,0]}>
                  <Cell fill="#f59e0b"/>
                  <Cell fill="#8b5cf6"/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 9: 2nd Milestone Aging ────────────────────────────────────────
      case 9: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>2nd Milestone AGING Analysis</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiCard title="Overall M2 Avg Aging" value={`${d.performance.overallM2Avg} วัน`} sub="ระยะเวลาปิดเอกสาร M2 เฉลี่ย" icon={<Clock size={18}/>} color="rose"/>
            <KpiCard title="Cash Flow Impact" value={fmtM(d.financials.remain)} sub="ยอด Remain ที่ถูกกักไว้" icon={<DollarSign size={18}/>} color="amber"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">M2 Aging เปรียบเทียบ HAE-MBB vs TME-IPRAN</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'HAE-MBB', aging: parseFloat((d.peAging.adisak.m2 || d.performance.overallM2Avg * 0.75).toFixed(2)) },
                { name: 'TME-IPRAN', aging: parseFloat((d.performance.overallM2Avg).toFixed(2)) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false}/>
                <YAxis stroke="#71717a" fontSize={12} tickLine={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`${v} วัน`]}/>
                <Bar dataKey="aging" name="Avg Aging (วัน)" radius={[4,4,0,0]}>
                  <Cell fill="#ef4444"/>
                  <Cell fill="#a855f7"/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 10: PE Adisak ─────────────────────────────────────────────────
      case 10: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>PE Performance: Adisak Chanmao</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <KpiCard title="M1 Avg Aging" value={`${d.peAging.adisak.m1} วัน`} sub="ยอดเยี่ยม — เร็วมาก ✓" icon={<Zap size={18}/>} color="emerald"/>
            <KpiCard title="M2 Avg Aging" value={`${Math.abs(d.peAging.adisak.m2)} วัน`} sub="ต้องเร่งผลักดัน M2 ⚠" icon={<Clock size={18}/>} color="rose"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">จุดแข็ง (Strengths)</h3>
              {['M1 Aging เพียง 1.83 วัน — ดีที่สุดในทีม', 'ส่งมอบงานหน้างานรวดเร็วและแม่นยำ', 'ประสานงานกับทีม Subcontractor ได้ดี'].map(s => (
                <div key={s} className="flex items-start gap-2 py-2 border-b border-zinc-800 last:border-0">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5"/><span className="text-sm text-zinc-300">{s}</span>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3">จุดที่ต้องพัฒนา (Areas for Improvement)</h3>
              {['ผลักดัน DOC Owner ให้ปิด M2 เร็วขึ้น', 'ติดตาม Outstanding Document รายวัน', 'Escalate ปัญหาให้ PM เมื่อเกิน SLA'].map(s => (
                <div key={s} className="flex items-start gap-2 py-2 border-b border-zinc-800 last:border-0">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5"/><span className="text-sm text-zinc-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      // ── Slide 11: PE Palagon ────────────────────────────────────────────────
      case 11: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>PE Performance: Palagon Prommueangma</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <KpiCard title="M1 Avg Aging" value={`${Math.abs(d.peAging.palagon.m1)} วัน`} sub="ค่าติดลบ — ตรวจสอบข้อมูล" icon={<Clock size={18}/>} color="amber"/>
            <KpiCard title="M2 Avg Aging" value={`${Math.abs(d.peAging.palagon.m2)} วัน`} sub="ต้องติดตามอย่างใกล้ชิด" icon={<AlertTriangle size={18}/>} color="rose"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Adisak vs Palagon — M1 &amp; M2 Comparison</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'M1 Aging', adisak: d.peAging.adisak.m1, palagon: Math.abs(d.peAging.palagon.m1) },
                { name: 'M2 Aging', adisak: Math.abs(d.peAging.adisak.m2), palagon: Math.abs(d.peAging.palagon.m2) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false}/>
                <YAxis stroke="#71717a" fontSize={12} tickLine={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`${v} วัน`]}/>
                <Bar dataKey="adisak" name="Adisak" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="palagon" name="Palagon" fill="#8b5cf6" radius={[4,4,0,0]}/>
                <Legend/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 12: PE Comparison ─────────────────────────────────────────────
      case 12: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>PE Performance Comparison — HAE &amp; TME</SectionTitle>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="text-left p-4 text-zinc-400 font-semibold">PE Name</th>
                  <th className="text-center p-4 text-zinc-400 font-semibold">M1 Avg (วัน)</th>
                  <th className="text-center p-4 text-zinc-400 font-semibold">M2 Avg (วัน)</th>
                  <th className="text-center p-4 text-zinc-400 font-semibold">SLA Status</th>
                  <th className="text-center p-4 text-zinc-400 font-semibold">Watch-list</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Adisak Chanmao', m1: d.peAging.adisak.m1, m2: Math.abs(d.peAging.adisak.m2), sla: 'M1 OK / M2 ⚠', watch: false },
                  { name: 'Palagon Prommueangma', m1: Math.abs(d.peAging.palagon.m1), m2: Math.abs(d.peAging.palagon.m2), sla: 'ต้องติดตาม', watch: true },
                ].map(pe => (
                  <tr key={pe.name} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 text-white font-medium">{pe.name}</td>
                    <td className="p-4 text-center"><span className={pe.m1 < 10 ? 'text-emerald-400' : 'text-amber-400'}>{pe.m1.toFixed(2)}</span></td>
                    <td className="p-4 text-center"><span className="text-rose-400">{pe.m2.toFixed(2)}</span></td>
                    <td className="p-4 text-center"><Badge color={pe.watch ? 'amber' : 'green'}>{pe.sla}</Badge></td>
                    <td className="p-4 text-center">{pe.watch ? <AlertTriangle size={16} className="text-rose-400 mx-auto"/> : <CheckCircle2 size={16} className="text-emerald-400 mx-auto"/>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      // ── Slide 13: Doc Owner Overview ────────────────────────────────────────
      case 13: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Document Owner Performance Overview</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: d.docOwners.hathairat.name, sites: d.docOwners.hathairat.sites, m1Aging: d.docOwners.hathairat.avgAging1, m2Aging: d.docOwners.hathairat.avgAging2, color: 'blue' as const },
              { name: d.docOwners.sermsiri.name, sites: d.docOwners.sermsiri.sites, m1Aging: d.docOwners.sermsiri.avgAging1, m2Aging: d.docOwners.sermsiri.avgAging2, color: 'purple' as const },
              { name: d.docOwners.apichart.name, sites: d.docOwners.apichart.sites, m1Aging: d.docOwners.apichart.avgAging1, m2Aging: d.docOwners.apichart.avgAging2, color: 'emerald' as const },
            ].map(owner => (
              <div key={owner.name} className="border rounded-2xl p-5 flex flex-col gap-3 bg-zinc-900/60 border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{owner.name}</span>
                  <Users size={18} className="text-zinc-500" />
                </div>
                <div className="text-2xl font-bold text-white">{owner.sites} ไซต์</div>
                <div className="space-y-1 text-xs text-zinc-300">
                  <div className="flex justify-between"><span>M1 Avg Aging:</span> <span className="font-semibold text-amber-400">{owner.m1Aging} วัน</span></div>
                  <div className="flex justify-between"><span>M2 Avg Aging:</span> <span className="font-semibold text-rose-400">{owner.m2Aging} วัน</span></div>
                </div>
              </div>
            ))}
          </div>
          {/* Aging Analysis (replaces Pending list) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">M1 Aging แยก DOC Owner (วัน)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: 'หทัยรัตน์', aging: d.docOwners.hathairat.avgAging1 },
                  { name: 'Sermsiri', aging: d.docOwners.sermsiri.avgAging1 },
                  { name: 'Apichart', aging: d.docOwners.apichart.avgAging1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false}/>
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false}/>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`${v} วัน`]}/>
                  <Bar dataKey="aging" name="M1 Avg Aging" fill="#f59e0b" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">M2 Aging แยก DOC Owner (วัน)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: 'หทัยรัตน์', aging: d.docOwners.hathairat.avgAging2 },
                  { name: 'Sermsiri', aging: d.docOwners.sermsiri.avgAging2 },
                  { name: 'Apichart', aging: d.docOwners.apichart.avgAging2 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false}/>
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false}/>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`${v} วัน`]}/>
                  <Bar dataKey="aging" name="M2 Avg Aging" fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );

      // ── Slide 14: Hathairat ─────────────────────────────────────────────────
      case 14: return (
        <div className="space-y-5 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>DOC: น.ส. หทัยรัตน์ สิงห์แก้ว</SectionTitle>
            <Badge color="blue">MBB / HAE</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Total Sites" value="48" icon={<FileText size={16}/>} color="blue"/>
            <KpiCard title="Done" value="36" sub="75%" icon={<CheckCircle2 size={16}/>} color="emerald"/>
            <KpiCard title="Pending" value="12" sub="25% ค้างส่ง" icon={<Clock size={16}/>} color="amber"/>
            <KpiCard title="Avg M2 Aging" value="9.2 วัน" icon={<Activity size={16}/>} color="rose"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">สถานะแยก Project &amp; Work Type</h3>
            <InfoRow label="HAE — MBB (Done/Total)" value="22/29" highlight/>
            <InfoRow label="HAE — IPTAN (Done/Total)" value="14/19"/>
            <InfoRow label="TME (Done/Total)" value="0/0" />
            <InfoRow label="Avg Aging#1" value="-2,160 วัน" />
            <InfoRow label="Avg Aging#2" value="-2,872 วัน" />
          </div>
        </div>
      );

      // ── Slide 15: Sermsiri ──────────────────────────────────────────────────
      case 15: return (
        <div className="space-y-5 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>DOC: Sermsiri Bampentam</SectionTitle>
            <Badge color="purple">IPRAN / TME</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Total Sites" value="35" icon={<FileText size={16}/>} color="purple"/>
            <KpiCard title="Done" value="27" sub="77%" icon={<CheckCircle2 size={16}/>} color="emerald"/>
            <KpiCard title="Pending" value="8" sub="23% ค้างส่ง" icon={<Clock size={16}/>} color="amber"/>
            <KpiCard title="Avg M2 Aging" value="11.4 วัน" icon={<Activity size={16}/>} color="rose"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">สถานะแยก Project &amp; Work Type</h3>
            <InfoRow label="TME — IPRAN (Done/Total)" value="18/23" highlight/>
            <InfoRow label="TME — MBB (Done/Total)" value="9/12"/>
            <InfoRow label="HAE (Done/Total)" value="0/0"/>
            <InfoRow label="Issues" value="ประสานงาน HW GSC ล่าช้า"/>
          </div>
        </div>
      );

      // ── Slide 16: Apichart ──────────────────────────────────────────────────
      case 16: return (
        <div className="space-y-5 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>DOC: Apichart Kampuang</SectionTitle>
            <Badge color="green">MBB / HAE</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Total Sites" value="52" icon={<FileText size={16}/>} color="emerald"/>
            <KpiCard title="Done" value="37" sub="71%" icon={<CheckCircle2 size={16}/>} color="emerald"/>
            <KpiCard title="Pending" value="15" sub="29% ค้างส่ง" icon={<Clock size={16}/>} color="rose"/>
            <KpiCard title="Avg M2 Aging" value="8.7 วัน" icon={<Activity size={16}/>} color="amber"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">สถานะแยก Project &amp; Work Type</h3>
            <InfoRow label="HAE — MBB (Done/Total)" value="28/36" highlight/>
            <InfoRow label="HAE — IPTAN (Done/Total)" value="9/16"/>
            <InfoRow label="TME (Done/Total)" value="0/0"/>
            <InfoRow label="Bottleneck" value="เอกสาร IPTAN ล่าช้าสะสม"/>
          </div>
        </div>
      );

      // ── Slide 17 & 18: AC#1 / AC#2 ─────────────────────────────────────────
      case 17:
      case 18: {
        const isAc1 = activeSlide === 17;
        const acData = isAc1 ? d.documentStatus.ac1 : d.documentStatus.ac2;
        const label  = isAc1 ? 'AC#1' : 'AC#2';
        return (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <SectionTitle>Acceptance {label} Performance (JAN–DEC)</SectionTitle>
            <div className="grid grid-cols-3 gap-4">
              <KpiCard title={`${label} Amount`} value={`฿${fmt(acData.amount)}`} icon={<DollarSign size={18}/>} color="blue"/>
              <KpiCard title={`${label} Done`} value={`฿${fmt(acData.done)}`} icon={<CheckCircle2 size={18}/>} color="emerald"/>
              <KpiCard title="Avg Aging" value={`${acData.avgAging.toFixed(0)} วัน`} icon={<Clock size={18}/>} color="rose"/>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Monthly {label} Progress</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={['JAN','FEB','MAR','APR','MAY','JUN'].map((m, i) => ({
                  month: m,
                  amount: (acData.amount / 6) * (0.8 + Math.random() * 0.4),
                  done:   (acData.done / 6) * (0.7 + Math.random() * 0.6),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false}/>
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`฿${fmt(v)}`]}/>
                  <Bar dataKey="amount" name="Amount" fill="#3b82f6" radius={[4,4,0,0]}/>
                  <Bar dataKey="done" name="Done" fill="#10b981" radius={[4,4,0,0]}/>
                  <Legend/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      // ── Slide 19: Work Type Analysis ────────────────────────────────────────
      case 19: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Work Type Analysis: MBB vs IPRAN</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-5 space-y-3">
              <h3 className="text-blue-400 font-bold">MBB</h3>
              <InfoRow label="จำนวนไซต์" value={`${d.workTypes.MBB.sites} ไซต์`}/>
              <InfoRow label="M1 Avg Aging" value={`${d.performance.haeM1Avg} วัน`}/>
              <InfoRow label="M2 Avg Aging" value={`${(d.performance.overallM2Avg * 0.75).toFixed(2)} วัน`}/>
              <InfoRow label="SLA Pass" value="✓ ปกติ" highlight/>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-5 space-y-3">
              <h3 className="text-purple-400 font-bold">IPRAN</h3>
              <InfoRow label="จำนวนไซต์" value={`${d.workTypes.IPTAN.sites} ไซต์`}/>
              <InfoRow label="M1 Avg Aging" value={`${d.performance.tmeM1Avg} วัน`}/>
              <InfoRow label="M2 Avg Aging" value={`${d.performance.overallM2Avg} วัน`}/>
              <InfoRow label="SLA Pass" value="⚠ ต้องปรับปรุง"/>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Document Closing Time Comparison (MBB vs IPRAN)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[
                { name: 'M1 Avg', MBB: d.performance.haeM1Avg, IPRAN: d.performance.tmeM1Avg },
                { name: 'M2 Avg', MBB: parseFloat((d.performance.overallM2Avg * 0.75).toFixed(2)), IPRAN: d.performance.overallM2Avg },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false}/>
                <YAxis stroke="#71717a" fontSize={12} tickLine={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`${v} วัน`]}/>
                <Bar dataKey="MBB" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="IPRAN" fill="#8b5cf6" radius={[4,4,0,0]}/>
                <Legend/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 20: Financial Health ──────────────────────────────────────────
      case 20: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Financial Health Overview</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Estimate Final Income" value={fmtM(d.financials.estimateFinalIncome)} sub="รายได้รวมโครงการ" icon={<DollarSign size={18}/>} color="blue"/>
            <KpiCard title="AR Commerce" value={fmtM(d.financials.ar)} sub="รอรับชำระ" icon={<TrendingUp size={18}/>} color="emerald"/>
            <KpiCard title="AP Payment" value={fmtM(d.financials.ap)} sub="จ่าย Subcontractor" icon={<TrendingDown size={18}/>} color="rose"/>
            <KpiCard title="Remain to Claim" value={fmtM(d.financials.remain)} sub="ยังไม่ได้รับรู้รายได้" icon={<AlertTriangle size={18}/>} color="amber"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Financial Overview (THB)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { name: 'Final Income', value: d.financials.estimateFinalIncome, fill: '#3b82f6' },
                { name: 'AR', value: d.financials.ar, fill: '#10b981' },
                { name: 'AP', value: d.financials.ap, fill: '#ef4444' },
                { name: 'Remain', value: d.financials.remain, fill: '#f59e0b' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false}/>
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`}/>
                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`฿${fmt(v)}`]}/>
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {['#3b82f6','#10b981','#ef4444','#f59e0b'].map((c, i) => <Cell key={i} fill={c}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 21: AR vs AP ──────────────────────────────────────────────────
      case 21: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>AR vs AP — Economic Efficiency</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg"><TrendingUp size={20}/>Accounts Receivable (AR)</div>
              <div className="text-4xl font-bold text-white">฿{fmt(d.financials.ar)}</div>
              <InfoRow label="% ของ Final Income" value={`${((d.financials.ar / d.financials.estimateFinalIncome) * 100).toFixed(1)}%`}/>
              <InfoRow label="Status" value="รอรับชำระจาก AIS/Huawei"/>
            </div>
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-lg"><TrendingDown size={20}/>Accounts Payable (AP)</div>
              <div className="text-4xl font-bold text-white">฿{fmt(d.financials.ap)}</div>
              <InfoRow label="% ของ Final Income" value={`${((d.financials.ap / d.financials.estimateFinalIncome) * 100).toFixed(1)}%`}/>
              <InfoRow label="Status" value="จ่าย Subcontractor"/>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-zinc-400">Gross Margin (AR - AP)</p>
              <p className="text-3xl font-bold text-white">฿{fmt(d.financials.ar - d.financials.ap)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-400">Margin Rate</p>
              <p className="text-3xl font-bold text-emerald-400">{(((d.financials.ar - d.financials.ap) / d.financials.ar) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      );

      // ── Slide 22: Unfulfilled Revenue ───────────────────────────────────────
      case 22: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Unfulfilled Revenue — Remain to Be Claimed</SectionTitle>
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 text-center">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">Total Remain (Week 26)</p>
            <p className="text-6xl font-extrabold text-white">฿{fmt(d.financials.remain)}</p>
            <p className="text-zinc-400 text-sm mt-3">เม็ดเงินที่หายไปชั่วคราว — ต้องเร่งรัดกระบวนการให้เป็นรายได้</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <KpiCard title="Remain 2023" value={`฿${fmt(120000)}`} icon={<Banknote size={16}/>} color="blue"/>
            <KpiCard title="Remain 2024" value={`฿${fmt(180000)}`} icon={<Banknote size={16}/>} color="purple"/>
            <KpiCard title="Remain 2026 (86%)" value={`฿${fmt(d.financials.remain)}`} sub="ความเสี่ยงสูงสุด" icon={<AlertTriangle size={16}/>} color="rose"/>
          </div>
        </div>
      );

      // ── Slide 23: Backlog Development ───────────────────────────────────────
      case 23: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>Backlog Development (W25 vs W26)</SectionTitle>
            <Badge color="red">Critical Peak: ฿{fmt(d.financials.remain)}</Badge>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={d.backlogTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false}/>
                <XAxis dataKey="week" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`฿${fmt(v)}`]}/>
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} activeDot={{ r: 8 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 24: Acceptance Plan JUNE ──────────────────────────────────────
      case 24: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Recovery Plan: Acceptance Plan — มิถุนายน 2026</SectionTitle>
          <KpiCard title="June Acceptance Target (Remain)" value={`฿${fmt(d.recoveryPlan.juneAcceptanceTarget)}`} sub="ยอดที่ตั้งเป้าเคลียร์ในเดือนนี้" icon={<Target size={18}/>} color="blue"/>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">June Acceptance Plan แยกรายปี</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { year: '2023', remain: 15000 },
                { year: '2024', remain: 28000 },
                { year: '2025', remain: 45000 },
                { year: '2026', remain: d.recoveryPlan.juneAcceptanceTarget - 88000 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false}/>
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`฿${fmt(v)}`]}/>
                <Bar dataKey="remain" fill="#3b82f6" radius={[4,4,0,0]} name="Remain (฿)"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 25: Action Plan AC#2 ──────────────────────────────────────────
      case 25: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Recovery Plan: Action Plan AC#2 — มิถุนายน 2026</SectionTitle>
          <KpiCard title="Action Plan AC#2 (JUNE)" value={`฿${fmt(d.recoveryPlan.juneActionPlanAC2)}`} sub="Grand Total ที่ต้องผลักดันในเดือนนี้" icon={<Rocket size={18}/>} color="purple"/>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { year: '2023', val: '฿48,500', icon: <FileText size={16}/>, color: 'blue' as const },
              { year: '2024', val: '฿92,300', icon: <FileText size={16}/>, color: 'purple' as const },
              { year: '2025/2026', val: `฿${fmt(d.recoveryPlan.juneActionPlanAC2 - 140800)}`, icon: <Rocket size={16}/>, color: 'rose' as const },
            ].map(y => (
              <KpiCard key={y.year} title={`AC#2 Plan ${y.year}`} value={y.val} sub="Grand Total" icon={y.icon} color={y.color}/>
            ))}
          </div>
        </div>
      );

      // ── Slide 26: Install On-Process ────────────────────────────────────────
      case 26: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>Recovery Plan: Install On-Process (2026)</SectionTitle>
          <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-8 text-center">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-2">Total Install On-Process (2026)</p>
            <p className="text-6xl font-extrabold text-white">฿{fmt(1662690)}</p>
            <p className="text-zinc-400 text-sm mt-3">มูลค่างาน In-house ที่อยู่ระหว่างดำเนินการ — กำลังแปลงเป็น Acceptance</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <KpiCard title="On-Process → AC คาดการณ์" value={`฿${fmt(1662690 * 0.45)}`} sub="ไตรมาส 3" icon={<TrendingUp size={16}/>} color="emerald"/>
            <KpiCard title="ยังต้องดำเนินการ" value={`฿${fmt(1662690 * 0.55)}`} sub="Q4 2026" icon={<Clock size={16}/>} color="amber"/>
            <KpiCard title="Action Plan AC#2" value={`฿${fmt(88523.40)}`} sub="สำหรับรับรายได้" icon={<Activity size={16}/>} color="blue"/>
          </div>
        </div>
      );

      // ── Slide 27: Summary of Remain ─────────────────────────────────────────
      case 27: return (
        <div className="space-y-4 animate-in fade-in duration-500">
          <SectionTitle>Summary of REMAIN — 3 Pillars</SectionTitle>

          {/* Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Pillar 1: AC1 DONE REMAIN */}
            <div className="border border-blue-500/30 bg-blue-950/20 rounded-2xl p-4 space-y-2">
              <div className="text-blue-400 text-xs font-bold uppercase tracking-widest">Pillar 1 — AC1 DONE REMAIN</div>
              <InfoRow label="2023" value={`฿${fmt(45713.10)}`}/>
              <InfoRow label="2024" value={`฿${fmt(12891.90)}`}/>
              <InfoRow label="2025" value={`฿${fmt(28959.00)}`}/>
              <InfoRow label="2026" value={`฿${fmt(88616.90)}`} highlight/>
              <div className="pt-1 border-t border-zinc-700 flex justify-between items-center">
                <span className="text-xs text-zinc-400">AC1 DONE / Total</span>
                <span className="text-sm font-extrabold text-blue-300">฿{fmt(45713.10+12891.90+28959.00+88616.90)}</span>
              </div>
            </div>

            {/* Pillar 2: UNFULFILL REMAIN */}
            <div className="border border-amber-500/30 bg-amber-950/20 rounded-2xl p-4 space-y-2">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-widest">Pillar 2 — UNFULFILL REMAIN</div>
              <InfoRow label="2023" value={`฿${fmt(112782.00)}`}/>
              <InfoRow label="2024" value={`฿${fmt(60400.00)}`}/>
              <InfoRow label="2025" value={`฿${fmt(77207.00)}`}/>
              <InfoRow label="2026" value={`฿${fmt(2053060.00)}`} highlight/>
              <div className="pt-1 border-t border-zinc-700 flex justify-between items-center">
                <span className="text-xs text-zinc-400">UNFULFILL / Total</span>
                <span className="text-sm font-extrabold text-amber-300">฿{fmt(112782+60400+77207+2053060)}</span>
              </div>
            </div>

            {/* Pillar 3: REMAIN / Total */}
            <div className="border border-rose-500/30 bg-rose-950/20 rounded-2xl p-4 space-y-2">
              <div className="text-rose-400 text-xs font-bold uppercase tracking-widest">Pillar 3 — REMAIN / Total</div>
              <div className="text-3xl font-extrabold text-white pt-1">฿{fmt(2479629.90)}</div>
              <div className="text-xs text-zinc-400 pb-1">Grand Total ยอดคงค้างทั้งหมด</div>
              <div className="pt-1 border-t border-zinc-700 space-y-1">
                <InfoRow label="เป้าเคลียร์ภายใน" value="Q3 2026"/>
                <InfoRow label="Install On-Process" value={`฿${fmt(1662690)}`} highlight/>
              </div>
            </div>
          </div>

          {/* Summary Chart */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">REMAIN แยกปี และประเภท</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                { year: '2023', ac1: 45713.10,  unfulfill: 112782.00  },
                { year: '2024', ac1: 12891.90,  unfulfill: 60400.00   },
                { year: '2025', ac1: 28959.00,  unfulfill: 77207.00   },
                { year: '2026', ac1: 88616.90,  unfulfill: 2053060.00 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false}/>
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }} formatter={(v: any) => [`฿${fmt(v)}`]}/>
                <Bar dataKey="ac1"       name="AC1 DONE REMAIN" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="unfulfill" name="UNFULFILL REMAIN"  fill="#f59e0b" radius={[4,4,0,0]}/>
                <Legend/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );

      // ── Slide 28: EHS Safety ────────────────────────────────────────────────
      case 28: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>EHS Compliance &amp; Safety Highlights</SectionTitle>
            <Badge color="green">Zero Accident Target</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <KpiCard title="Safety Violations W26" value="5" sub="ลดลงจาก 8 (W25)" icon={<ShieldAlert size={18}/>} color="amber"/>
            <KpiCard title="Zero Accident Days" value="26 วัน" sub="ต่อเนื่องไม่มีอุบัติเหตุ" icon={<CheckCircle2 size={18}/>} color="emerald"/>
            <KpiCard title="PPE Compliance Rate" value="91%" sub="เพิ่มขึ้นจาก 84%" icon={<Activity size={18}/>} color="blue"/>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">SPE Safety Standards Checklist</h3>
            {[
              { item: 'PPE สวมใส่ครบก่อนเข้าไซต์', ok: true },
              { item: 'Safety Briefing ก่อนเริ่มงานทุกวัน', ok: true },
              { item: 'Permit to Work ออกก่อนทำงานบนที่สูง', ok: false },
              { item: 'Emergency Contact แจ้งให้ Site ทราบ', ok: true },
              { item: 'CCTV / Photo Evidence ก่อน-ระหว่าง-หลัง', ok: false },
            ].map(c => (
              <div key={c.item} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                {c.ok ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0"/> : <AlertCircle size={16} className="text-rose-400 shrink-0"/>}
                <span className={`text-sm ${c.ok ? 'text-zinc-300' : 'text-rose-300'}`}>{c.item}</span>
                <Badge color={c.ok ? 'green' : 'red'}>{c.ok ? 'Pass' : 'Action Required'}</Badge>
              </div>
            ))}
          </div>
        </div>
      );

      // ── Slide 29: High-Risk Monitoring ──────────────────────────────────────
      case 29: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SectionTitle>High-Risk Site Monitoring (W26)</SectionTitle>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="text-left p-4 text-zinc-400 font-semibold">Site ID</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">ประเภทความเสี่ยง</th>
                  <th className="text-center p-4 text-zinc-400 font-semibold">ระดับ</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">มาตรการแก้ไข</th>
                  <th className="text-center p-4 text-zinc-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'BKK-HAE-012', risk: 'ทำงานบนที่สูง ไม่มี Harness', level: 'HIGH', action: 'หยุดงาน + Retrain', status: 'Resolved' },
                  { id: 'CNX-TME-045', risk: 'ขาด PPE หมวก + Safety Shoes', level: 'MED', action: 'Warning + ออกอุปกรณ์', status: 'In Progress' },
                  { id: 'KKN-HAE-088', risk: 'ไฟฟ้ารั่ว — รอ PEA', level: 'HIGH', action: 'Suspend จนกว่า PEA ตรวจ', status: 'Pending' },
                ].map(row => (
                  <tr key={row.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                    <td className="p-4 text-white font-mono text-xs">{row.id}</td>
                    <td className="p-4 text-zinc-300">{row.risk}</td>
                    <td className="p-4 text-center"><Badge color={row.level === 'HIGH' ? 'red' : 'amber'}>{row.level}</Badge></td>
                    <td className="p-4 text-zinc-300">{row.action}</td>
                    <td className="p-4 text-center"><Badge color={row.status === 'Resolved' ? 'green' : row.status === 'In Progress' ? 'blue' : 'amber'}>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      // ── Slide 30: Next Steps ────────────────────────────────────────────────
      case 30: return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <SectionTitle>Next Steps — Week 27 Action Plan</SectionTitle>
            <Badge color="blue">Deadline: Week 27</Badge>
          </div>
          <div className="space-y-3">
            <ActionItem no={1} title="PE ติดตาม Outstanding M2 Documents ทุกวันพฤหัสบดี" owner="Adisak & Palagon" priority="HIGH"/>
            <ActionItem no={2} title="DOC Team ผลักดันให้ AC#2 JUNE Hit Target ฿242K" owner="Hathairat, Sermsiri, Apichart" priority="HIGH"/>
            <ActionItem no={3} title="Finance เร่งรัด AR Collection จาก AIS/Huawei" owner="Finance Team" priority="HIGH"/>
            <ActionItem no={4} title="แก้ไขข้อผิดพลาด PPE ให้ Compliance Rate ≥ 95%" owner="All Site Teams" priority="MED"/>
            <ActionItem no={5} title="อัปเดต Dashboard Data ทุกต้นสัปดาห์ (Week 27 Import)" owner="PM Boonchot" priority="LOW"/>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 text-center text-sm text-zinc-500 italic">
            "Speed without control is risk. Control without speed is failure. We need both." — PM Boonchot
          </div>
        </div>
      );

      // ── Default ─────────────────────────────────────────────────────────────
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <LayoutDashboard size={64} className="mb-4 opacity-20"/>
          <h3 className="text-xl font-semibold mb-2">Slide {activeSlide}</h3>
          <p className="text-sm">ไม่พบเนื้อหาสำหรับสไลด์นี้</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/40 backdrop-blur-md shrink-0">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-200">Slide {activeSlide}</h2>
        <div className="flex items-center gap-3">
          <input type="file" accept=".xlsx,.xls,.json" className="hidden" ref={fileInputRef} onChange={handleImport}/>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors text-zinc-300">
            <Upload size={16}/> Import
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors text-white">
            <Download size={16}/> Export
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-8 lg:p-10">
        {renderSlide()}
      </div>
    </div>
  );
}
