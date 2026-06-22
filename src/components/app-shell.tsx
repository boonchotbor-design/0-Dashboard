import { ReactNode } from "react";
import { LayoutDashboard, Presentation, Target, ShieldAlert, FileText, Banknote, Rocket, Settings } from "lucide-react";

const slides = [
  { id: 1, title: "Title Slide", icon: Presentation },
  { id: 2, title: "Executive Bottom Line", icon: Target },
  { id: 3, title: "Portfolio Performance", icon: LayoutDashboard },
  { id: 4, title: "Smart QC Overview", icon: ShieldAlert },
  { id: 5, title: "Operation Error Analysis", icon: ShieldAlert },
  { id: 6, title: "Improvement Plan", icon: Rocket },
  { id: 7, title: "The Execution Paradox", icon: FileText },
  { id: 8, title: "1st Milestone AGING", icon: FileText },
  { id: 9, title: "2nd Milestone AGING", icon: FileText },
  { id: 10, title: "PE: Adisak Chanmao", icon: LayoutDashboard },
  { id: 11, title: "PE: Palagon", icon: LayoutDashboard },
  { id: 12, title: "PE Comparison", icon: Target },
  { id: 13, title: "Doc Owner Overview", icon: FileText },
  { id: 14, title: "DOC: Hathairat", icon: FileText },
  { id: 15, title: "DOC: Sermsiri", icon: FileText },
  { id: 16, title: "DOC: Apichart", icon: FileText },
  { id: 17, title: "AC#1 Performance", icon: Target },
  { id: 18, title: "AC#2 Performance", icon: Target },
  { id: 19, title: "Work Type Analysis", icon: LayoutDashboard },
  { id: 20, title: "Financial Health", icon: Banknote },
  { id: 21, title: "AR vs AP", icon: Banknote },
  { id: 22, title: "Unfulfilled Revenue", icon: Banknote },
  { id: 23, title: "Backlog Development", icon: Target },
  { id: 24, title: "Acceptance Plan (JUNE)", icon: Rocket },
  { id: 25, title: "Action Plan AC#2", icon: Rocket },
  { id: 26, title: "Install On-Process", icon: Rocket },
  { id: 27, title: "Summary of REMAIN", icon: Banknote },
  { id: 28, title: "EHS Compliance", icon: ShieldAlert },
  { id: 29, title: "High-Risk Monitoring", icon: ShieldAlert },
  { id: 30, title: "Next Steps", icon: Target },
];

export function AppShell({ children, activeSlide, onSelectSlide }: { children: ReactNode, activeSlide: number, onSelectSlide: (id: number) => void }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 bg-zinc-900/50 p-4 hidden md:flex flex-col gap-4">
        <div className="flex items-center gap-3 font-bold text-xl px-2 mb-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Presentation size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-400">Teloneer 2026</span>
            <span className="text-lg leading-none">Week 26 <span className="text-blue-500">Report</span></span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
          {slides.map(slide => {
            const Icon = slide.icon;
            const isActive = activeSlide === slide.id;
            return (
              <button
                key={slide.id}
                onClick={() => onSelectSlide(slide.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${isActive ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'}`}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-md ${isActive ? 'bg-blue-500/20' : 'bg-zinc-800'}`}>
                  <span className="text-xs font-mono">{slide.id}</span>
                </div>
                <span className="truncate">{slide.title}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-zinc-950">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #52525b; }
      `}} />
    </div>
  );
}
