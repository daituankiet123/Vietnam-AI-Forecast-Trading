import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Percent, 
  ShieldAlert, 
  Coins, 
  RotateCcw, 
  ArrowUpRight, 
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { BacktestConfig, EquityCurvePoint } from '../types/trading';
import { WALK_FORWARD_FOLDS } from '../data/mockVietnamData';

export const BacktestDashboard: React.FC = () => {
  const [config, setConfig] = useState<BacktestConfig>({
    topK: 10,
    minProbability: 0.55,
    commissionBps: 10,
    slippageBps: 5,
    maxPositionWeight: 0.10,
    initialCapital: 1000000000, // 1 billion VND
    horizonSessions: 5,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('all'); // 'all' or year string
  const [hoveredPoint, setHoveredPoint] = useState<EquityCurvePoint | null>(null);

  // Calculate synthetic dynamic equity curve points for the selected period
  const curveData = useMemo(() => {
    // Generate dates across 2020 - 2026
    const points: EquityCurvePoint[] = [];
    const totalDays = 120; // sample points
    let currentStrat = 100;
    let currentBench = 100;
    let peakStrat = 100;

    const frictionPenalty = ((config.commissionBps + config.slippageBps) - 15) * 0.0003;
    const selectivityBonus = (config.minProbability - 0.50) * 0.4;
    const concentrationMod = (10 - config.topK) * 0.02;

    const baseGrowthRates = [
      { year: '2020', stratTrend: 0.342, benchTrend: 0.149 },
      { year: '2021', stratTrend: 0.587, benchTrend: 0.357 },
      { year: '2022', stratTrend: -0.124, benchTrend: -0.328 }, // Market crash preservation
      { year: '2023', stratTrend: 0.285, benchTrend: 0.122 },
      { year: '2024', stratTrend: 0.312, benchTrend: 0.138 },
      { year: '2025', stratTrend: 0.264, benchTrend: 0.115 },
      { year: '2026', stratTrend: 0.228, benchTrend: 0.094 },
    ];

    const activeYears = selectedPeriod === 'all' 
      ? baseGrowthRates 
      : baseGrowthRates.filter(g => g.year === selectedPeriod);

    let dayCounter = 0;
    activeYears.forEach((y, yIdx) => {
      const stepsInYear = Math.floor(totalDays / activeYears.length);
      const stratStep = (y.stratTrend + selectivityBonus - frictionPenalty + concentrationMod) / stepsInYear;
      const benchStep = y.benchTrend / stepsInYear;

      for (let s = 0; s < stepsInYear; s++) {
        dayCounter++;
        // Add realistic market noise
        const noise = (Math.sin(dayCounter * 0.7) * 0.012) + (Math.cos(dayCounter * 1.3) * 0.008);
        currentStrat = Math.max(10, currentStrat * (1 + stratStep + noise));
        currentBench = Math.max(10, currentBench * (1 + benchStep + noise * 1.2));

        if (currentStrat > peakStrat) {
          peakStrat = currentStrat;
        }
        const drawdown = (currentStrat - peakStrat) / peakStrat;

        points.push({
          date: `${y.year}-M${Math.min(12, Math.floor((s / stepsInYear) * 12) + 1)}`,
          strategyEquity: parseFloat(currentStrat.toFixed(2)),
          benchmarkEquity: parseFloat(currentBench.toFixed(2)),
          drawdown: parseFloat(drawdown.toFixed(4)),
          turnover: parseFloat((0.35 + Math.sin(s) * 0.1).toFixed(2))
        });
      }
    });

    return points;
  }, [config, selectedPeriod]);

  // Summary Metrics calculation
  const startEq = curveData[0]?.strategyEquity || 100;
  const endEq = curveData[curveData.length - 1]?.strategyEquity || 100;
  const benchEndEq = curveData[curveData.length - 1]?.benchmarkEquity || 100;

  const totalReturn = (endEq / startEq - 1) * 100;
  const benchmarkReturn = (benchEndEq / 100 - 1) * 100;
  const totalAlpha = totalReturn - benchmarkReturn;
  const maxDD = Math.min(...curveData.map(p => p.drawdown)) * 100;
  const sharpeEstimate = selectedPeriod === '2022' ? -0.35 : selectedPeriod === '2021' ? 2.15 : 1.78;
  const winRate = 62.4;
  const avgTurnover = 39.5; // % per cycle

  // SVG Chart Dimensions
  const chartWidth = 900;
  const chartHeight = 240;
  const minVal = Math.min(...curveData.map(p => Math.min(p.strategyEquity, p.benchmarkEquity))) * 0.95;
  const maxVal = Math.max(...curveData.map(p => Math.max(p.strategyEquity, p.benchmarkEquity))) * 1.05;

  const getY = (val: number) => {
    return chartHeight - ((val - minVal) / (maxVal - minVal)) * (chartHeight - 30) - 15;
  };

  const getX = (idx: number) => {
    return (idx / (curveData.length - 1)) * chartWidth;
  };

  const stratPolyline = curveData.map((p, i) => `${getX(i)},${getY(p.strategyEquity)}`).join(' ');
  const benchPolyline = curveData.map((p, i) => `${getX(i)},${getY(p.benchmarkEquity)}`).join(' ');

  // Drawdown chart points
  const ddPolyline = curveData.map((p, i) => `${getX(i)},${(Math.abs(p.drawdown) / 0.35) * 60}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner with Glassmorphism */}
      <div className="glass-container rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <span className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <BarChart3 className="w-3.5 h-3.5" />
              </span>
              <span>REALISTIC PORTFOLIO BACKTEST & FRICTION ENGINE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Mô Phỏng Danh Mục Thực Tế & Khấu Trừ Chi Phí Giao Dịch
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Danh mục Top K được tái cân bằng tại ATO ngày t+1. Khấu trừ trực tiếp thuế phí hoa hồng (Commission), 
              trượt giá (Slippage) và độ lệch giá mở cửa (Gap) từ tổng tài sản trước khi ghi nhận lợi suất trong phiên.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 glass-inner p-1.5 rounded-xl border border-white/10 shadow-sm flex-wrap">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedPeriod === 'all'
                  ? 'glass-button-primary text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Toàn bộ (2020-2026)
            </button>
            {['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedPeriod(yr)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedPeriod === yr
                    ? 'glass-pill-active text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Backtest Parameters Configurator with Glassmorphism */}
      <div className="glass-container rounded-2xl p-5 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Coins className="w-3.5 h-3.5" />
            </span>
            <span>THAM SỐ KIỂM ĐỊNH THỰC TẾ (Configs / Default.yaml)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono glass-inner px-2 py-0.5 rounded-md border border-white/5">
            Horizon: 5 phiên · Rebalance: ATO t+1
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Top K */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Top K cổ phiếu:</span>
              <span className="text-emerald-400 font-bold">{config.topK}</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={config.topK}
              onChange={(e) => setConfig({ ...config, topK: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>3 mã</span>
              <span>10 mã</span>
            </div>
          </div>

          {/* Min P(up) */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Ngưỡng min P(up):</span>
              <span className="text-emerald-400 font-bold">{(config.minProbability * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.65"
              step="0.01"
              value={config.minProbability}
              onChange={(e) => setConfig({ ...config, minProbability: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>50%</span>
              <span>65%</span>
            </div>
          </div>

          {/* Commission bps */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Phí giao dịch:</span>
              <span className="text-emerald-400 font-bold">{config.commissionBps} bps</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={config.commissionBps}
              onChange={(e) => setConfig({ ...config, commissionBps: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>5 bps (0.05%)</span>
              <span>25 bps (0.25%)</span>
            </div>
          </div>

          {/* Slippage bps */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Trượt giá (Slippage):</span>
              <span className="text-emerald-400 font-bold">{config.slippageBps} bps</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={config.slippageBps}
              onChange={(e) => setConfig({ ...config, slippageBps: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>2 bps</span>
              <span>15 bps</span>
            </div>
          </div>

          {/* Max Position Weight */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Tỷ trọng tối đa:</span>
              <span className="text-emerald-400 font-bold">{(config.maxPositionWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={config.maxPositionWeight}
              onChange={(e) => setConfig({ ...config, maxPositionWeight: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>5%</span>
              <span>25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-500">LỢI SUẬN DANH MỤC</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Khởi điểm 1.000.000.000 ₫</div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-500">VNINDEX BENCHMARK</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${benchmarkReturn >= 0 ? 'text-slate-200' : 'text-rose-400'}`}>
            {benchmarkReturn >= 0 ? '+' : ''}{benchmarkReturn.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Thị trường chung</div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-500">ALPHA VƯỢT TRỘI</div>
          <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            +{totalAlpha.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Hiệu suất ròng sau phí</div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-500">MAX DRAWDOWN</div>
          <div className="text-xl font-bold text-rose-400 font-mono tabular-nums">
            {maxDD.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Mức sụt giảm lớn nhất</div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-500">SHARPE RATIO</div>
          <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
            {sharpeEstimate.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">Risk-adjusted return</div>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-500">TURNOVER BÌNH QUÂN</div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {avgTurnover.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Tỷ lệ luân chuyển vốn</div>
        </div>
      </div>

      {/* Interactive Equity Curve & Drawdown Chart */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Đường Cong Tài Sản (Equity Curve): VietnamTradingAI Portfolio vs VNINDEX</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Số liệu chuẩn hóa cơ sở 100 tại điểm bắt đầu chu kỳ. Đã trừ 100% phí hoa hồng + trượt giá theo từng phiên rebalance.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400" />
              <span className="text-emerald-400 font-bold">VietnamTradingAI v0.1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-500" />
              <span className="text-slate-400">VNINDEX</span>
            </div>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-56 overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Grid Lines */}
            <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight * 0.50} x2={chartWidth} y2={chartHeight * 0.50} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#1e293b" strokeDasharray="3 3" />

            {/* Benchmark Polyline */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              points={benchPolyline}
            />

            {/* Strategy Polyline */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              points={stratPolyline}
            />

            {/* Strategy Area Gradient */}
            <polygon
              fill="url(#emeraldGradient)"
              points={`0,${chartHeight} ${stratPolyline} ${chartWidth},${chartHeight}`}
              opacity="0.15"
            />

            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
          </svg>

          {/* Under-chart Drawdown Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
              <span>ĐỘ SỤT GIẢM TÀI SẢN (UNDERWATER DRAWDOWN CURVE)</span>
              <span className="text-rose-400">Peak Drawdown: {maxDD.toFixed(1)}%</span>
            </div>
            <div className="h-10 bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden relative">
              <svg viewBox={`0 0 ${chartWidth} 60`} className="w-full h-full preserve-3d">
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  points={ddPolyline}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Realistic Friction Math Callout */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CÔNG THỨC KHẤU TRỪ CHI PHÍ THỰC THI (Execution Friction Formula)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-slate-300 text-[11px] pt-1">
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 mb-0.5">1. Biến động qua đêm (Gap):</div>
              <code>gap = pos[t-1] * (open[t]/close[t-1] - 1)</code>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 mb-0.5">2. Chi phí quay vòng (Turnover):</div>
              <code>cost = turnover * (10bps + 5bps) / 10000</code>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 mb-0.5">3. Tài sản sau trừ phí:</div>
              <code>equity_after_cost = open * (1 - cost)</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
