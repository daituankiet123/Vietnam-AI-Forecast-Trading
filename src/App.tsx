import React, { useState } from 'react';
import { Header } from './components/Header';
import { ArchitectureMap } from './components/ArchitectureMap';
import { PointInTimeInspector } from './components/PointInTimeInspector';
import { FeatureLabelStudio } from './components/FeatureLabelStudio';
import { WalkForwardTrainer } from './components/WalkForwardTrainer';
import { ForwardForecast2026 } from './components/ForwardForecast2026';
import { NewsSentimentModel } from './components/NewsSentimentModel';
import { BacktestDashboard } from './components/BacktestDashboard';
import { UnitTestRunner } from './components/UnitTestRunner';
import { SourceCodeExplorer } from './components/SourceCodeExplorer';
import { 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveTab('walk-forward');
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500/25 selection:text-emerald-200">
      {/* Glassmorphic Ambient Gradient Mesh Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Left Emerald Aura */}
        <div className="absolute -top-40 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-emerald-500/12 blur-[130px]" />
        {/* Top-Right Cyan Aura */}
        <div className="absolute top-20 -right-40 w-96 sm:w-[480px] h-96 sm:h-[480px] rounded-full bg-cyan-500/10 blur-[140px]" />
        {/* Center-Right Indigo Glow */}
        <div className="absolute top-[45%] right-10 w-80 sm:w-[400px] h-80 sm:h-[400px] rounded-full bg-indigo-500/8 blur-[120px]" />
        {/* Bottom-Left Teal Glow */}
        <div className="absolute -bottom-20 left-10 w-96 sm:w-[450px] h-96 sm:h-[450px] rounded-full bg-teal-500/10 blur-[130px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Universal Top Bar Contract Header with Glassmorphism */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
      />

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Glassmorphic Breadcrumb / Section Header Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 glass-panel px-4 py-2.5 rounded-xl border border-white/5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">VietnamTradingAI</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400 font-medium">
              {activeTab === 'architecture' && 'Kiến trúc Pipeline & Quy trình V0.1'}
              {activeTab === 'point-in-time' && 'Point-in-Time Data & Corporate Actions'}
              {activeTab === 'features-labels' && 'Kỹ thuật Đặc trưng & Gắn nhãn không Leakage'}
              {activeTab === 'walk-forward' && 'Kiểm định Purged Walk-Forward (2020 - 2026)'}
              {activeTab === 'forecast-2026' && 'Mô Hình Tiên Lượng 2026+ Đa Khung Thời Gian & Kịch Bản'}
              {activeTab === 'news-hybrid' && 'Mô Hình Tin Tức Thị Trường & Tích Hợp Hybrid (Accuracy ≥ 75%)'}
              {activeTab === 'backtest' && 'Portfolio Backtest & Khấu trừ Phí Trượt giá'}
              {activeTab === 'unit-tests' && 'Bộ Kiểm thử Leakage (6/6 Unit Tests)'}
              {activeTab === 'source-code' && 'Mã nguồn Python & CLI Windows/Linux'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>HOSE Official Sessions</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-300">Unadjusted Point-in-time</span>
            <span className="text-slate-700">·</span>
            <span className="text-cyan-400">5-Session Purge Gap</span>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'architecture' && <ArchitectureMap />}
        {activeTab === 'point-in-time' && <PointInTimeInspector />}
        {activeTab === 'features-labels' && <FeatureLabelStudio />}
        {activeTab === 'walk-forward' && <WalkForwardTrainer onNavigateToForecast={() => setActiveTab('forecast-2026')} />}
        {activeTab === 'forecast-2026' && <ForwardForecast2026 />}
        {activeTab === 'news-hybrid' && <NewsSentimentModel />}
        {activeTab === 'backtest' && <BacktestDashboard />}
        {activeTab === 'unit-tests' && <UnitTestRunner />}
        {activeTab === 'source-code' && <SourceCodeExplorer />}
      </main>

      {/* Glassmorphic Quantitative Research Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/8 glass-panel px-6 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">VietnamTradingAI v0.1</span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-400">Nền tảng Nghiên cứu Định lượng & Machine Learning Thị trường Chứng khoán Việt Nam</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span className="hover:text-emerald-400 transition-colors">Python 3.12</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-emerald-400 transition-colors">XGBoost Hist</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-emerald-400 transition-colors">Parquet + DuckDB</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-emerald-400 transition-colors">Vnstock v4.0.8</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
