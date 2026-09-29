import React from 'react';
import { Play, Download, Terminal, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunSimulation,
  isSimulating,
}) => {
  const navItems = [
    { id: 'architecture', label: 'Kiến trúc Pipeline' },
    { id: 'point-in-time', label: 'Point-in-Time Data' },
    { id: 'features-labels', label: 'Features & Labels' },
    { id: 'walk-forward', label: 'Walk-Forward ML' },
    { id: 'forecast-2026', label: 'Tiên lượng 2026+' },
    { id: 'news-hybrid', label: 'NLP Tin tức (Hybrid 75%)' },
    { id: 'backtest', label: 'Backtest & Alpha' },
    { id: 'unit-tests', label: 'Kiểm thử Leakage' },
    { id: 'source-code', label: 'Mã nguồn Python' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-950/65 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      {/* Zone 1: Wordmark with Glassmorphic Accent */}
      <div className="flex items-center gap-3">
        <a 
          href="#architecture" 
          onClick={(e) => { e.preventDefault(); setActiveTab('architecture'); }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:text-emerald-300 transition-colors group cursor-pointer"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] group-hover:scale-125 transition-transform" />
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            VietnamTradingAI
          </span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-inner">
            v0.1
          </span>
        </a>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pl-2 border-l border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>HOSE · HNX · UPCoM</span>
        </div>
      </div>

      {/* Zone 2: Glassmorphic Tab Navigation Bar */}
      <nav className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-white/8">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-all text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap relative ${
                isActive
                  ? 'glass-pill-active text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Medium screens scrollable navigation fallback */}
      <nav className="hidden md:flex xl:hidden items-center gap-4 text-xs font-medium text-slate-400 overflow-x-auto max-w-md py-1">
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                isActive ? 'text-emerald-300 font-semibold' : 'hover:text-slate-200'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Glassmorphic Primary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 rounded-lg cursor-pointer whitespace-nowrap glass-button-primary ${
            isSimulating ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Đang chạy...' : 'Chạy Walk-Forward'}</span>
        </button>

        <button
          onClick={() => setActiveTab('source-code')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 rounded-lg glass-button hover:text-white whitespace-nowrap cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">CLI & Scripts</span>
        </button>
      </div>
    </header>
  );
};
