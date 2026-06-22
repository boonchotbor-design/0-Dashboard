"use client";

import { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Activity, Download, Upload, ShieldAlert, Target, LayoutDashboard } from 'lucide-react';

export function Dashboard({ activeSlide, data, onImport }: { activeSlide: number, data: any, onImport: (data: any) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "dashboard-template.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        try {
          const content = JSON.parse(e.target?.result as string);
          onImport(content);
        } catch (error) {
          alert("Invalid JSON format");
        }
      };
    }
  };

  const renderSlideContent = () => {
    switch (activeSlide) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in duration-500">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              2026 Project Performance <br />
              <span className="text-blue-500">& Strategic Recovery Plan</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-[600px]">
              สรุปผลการดำเนินงานโครงการติดตั้งโครงข่ายโทรคมนาคม HAE และ TME ประจำสัปดาห์ที่ {data.reportWeek}
            </p>
            <div className="pt-8">
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-2">ผู้นำเสนอ</div>
              <div className="text-xl font-semibold">PM Boonchot Boriwut</div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold mb-8 text-blue-400">บทสรุปผู้บริหาร (Executive Bottom Line)</h2>
            <div className="grid gap-6">
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-emerald-600 p-3 rounded-lg"><Activity className="text-white" /></div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-400">The Operation is Fast</h3>
                  <p className="text-zinc-300 mt-2">ทีมหน้างานติดตั้งได้รวดเร็ว HAE M1 Avg: {data.performance.haeM1Avg} วัน | TME M1 Avg: {data.performance.tmeM1Avg} วัน</p>
                </div>
              </div>
              <div className="bg-rose-950/30 border border-rose-900/50 p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-rose-600 p-3 rounded-lg"><ShieldAlert className="text-white" /></div>
                <div>
                  <h3 className="text-lg font-bold text-rose-400">The System is Clogged</h3>
                  <p className="text-zinc-300 mt-2">กระบวนการเอกสาร Milestone 2 ดึงเวลาล่าช้าเฉลี่ยถึง {data.performance.overallM2Avg} วัน ทำให้กระแสเงินสดชะงัก</p>
                </div>
              </div>
              <div className="bg-blue-950/30 border border-blue-900/50 p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg"><Target className="text-white" /></div>
                <div>
                  <h3 className="text-lg font-bold text-blue-400">The Path Forward</h3>
                  <p className="text-zinc-300 mt-2">เดินหน้าเคลียร์ยอด Remain {data.financials.remain.toLocaleString()} THB ควบคู่กับความปลอดภัย EHS</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 20:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">สุขภาพทางการเงิน (Financial Health)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Estimate Final Income" value={`฿${data.financials.estimateFinalIncome.toLocaleString()}`} icon={<DollarSign size={20}/>} positive={true} />
              <StatCard title="Accounts Receivable (AR)" value={`฿${data.financials.ar.toLocaleString()}`} icon={<DollarSign size={20}/>} positive={true} />
              <StatCard title="Accounts Payable (AP)" value={`฿${data.financials.ap.toLocaleString()}`} icon={<DollarSign size={20}/>} positive={false} />
              <StatCard title="Remain to Claim" value={`฿${data.financials.remain.toLocaleString()}`} icon={<DollarSign size={20}/>} positive={false} />
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">รายได้รวมของโครงการ (Income Overview)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Final Income", value: data.financials.estimateFinalIncome, fill: "#3b82f6" },
                    { name: "AR (Commerce)", value: data.financials.ar, fill: "#10b981" },
                    { name: "AP (Payment)", value: data.financials.ap, fill: "#f43f5e" },
                    { name: "Remain", value: data.financials.remain, fill: "#f59e0b" }
                  ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${(val/1000).toFixed(0)}k`} />
                    <Tooltip cursor={{fill: '#27272a'}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} itemStyle={{ color: '#e4e4e7' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 23:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <h2 className="text-2xl font-bold mb-6 text-blue-400">แนวโน้มยอดคงค้าง (Backlog Development)</h2>
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Unfulfilled Revenue Trend</h3>
                  <p className="text-zinc-400 text-sm">การพัฒนาการของยอด Backlog จากจุดต่ำสุดสู่วิกฤต</p>
                </div>
                <div className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-sm font-semibold border border-rose-500/30">
                  Critical Peak: ฿{data.financials.remain.toLocaleString()}
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.backlogTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="week" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${(val/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} itemStyle={{ color: '#e4e4e7' }} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={4} dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, fill: '#fca5a5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 17:
      case 18:
        const isAc1 = activeSlide === 17;
        const acData = isAc1 ? data.documentStatus.ac1 : data.documentStatus.ac2;
        return (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
             <h2 className="text-2xl font-bold mb-6 text-blue-400">สถานะการส่งมอบ {isAc1 ? "AC#1" : "AC#2"}</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl text-center">
                  <div className="text-zinc-400 mb-2 font-medium">AMOUNT</div>
                  <div className="text-4xl font-bold text-white">฿{acData.amount.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-900/50 p-8 rounded-2xl text-center">
                  <div className="text-emerald-500 mb-2 font-medium">DONE</div>
                  <div className="text-4xl font-bold text-emerald-400">฿{acData.done.toLocaleString()}</div>
                </div>
                <div className="bg-rose-900/20 border border-rose-900/50 p-8 rounded-2xl text-center">
                  <div className="text-rose-500 mb-2 font-medium">Avg AGING</div>
                  <div className="text-4xl font-bold text-rose-400">{acData.avgAging.toFixed(2)} วัน</div>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <LayoutDashboard size={64} className="mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">Slide {activeSlide} Placeholder</h3>
            <p>เนื้อหาส่วนนี้กำลังเชื่อมต่อข้อมูล โปรดเลือก Slide 1, 2, 17, 18, 20, 23 เพื่อดูตัวอย่างการแสดงผล</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top Header Controls */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
           <h2 className="text-lg font-semibold tracking-tight text-zinc-200">Slide {activeSlide}</h2>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors text-zinc-300">
            <Upload size={16} /> Import
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors text-white">
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      {/* Main Slide Content Area */}
      <div className="flex-1 overflow-auto p-8 lg:p-12">
        {renderSlideContent()}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, positive }: { title: string, value: string, icon: React.ReactNode, positive: boolean }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className="flex justify-between items-center text-zinc-400">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="text-zinc-500">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-2 truncate">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{positive ? 'Positive indicator' : 'Needs attention'}</span>
        </div>
      </div>
    </div>
  );
}
