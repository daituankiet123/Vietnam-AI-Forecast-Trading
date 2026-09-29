import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Target, 
  BarChart3, 
  Sliders, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Coins,
  Cpu,
  RefreshCw,
  Clock,
  Zap,
  Award,
  Check,
  Percent,
  GitBranch
} from 'lucide-react';
import { 
  CURRENT_MARKET_REGIME_2026, 
  YEARLY_FORECAST_PROFILES,
  MODEL_OPTIMIZATION_METRICS
} from '../data/mockVietnamData';
import { MultiHorizonSignal, ScenarioProjection, ForecastYear } from '../types/trading';

export const ForwardForecast2026: React.FC = () => {
  // Year selector: 2026, 2027, 2028, 2029, 2030
  const [selectedYear, setSelectedYear] = useState<ForecastYear>('2026');
  const [selectedHorizon, setSelectedHorizon] = useState<'1d' | '5d' | '10d' | '20d'>('20d');
  
  // Model Optimization Settings (Cải tiến model tăng độ chính xác)
  const [ensembleMode, setEnsembleMode] = useState<'TRI_ENSEMBLE' | 'SINGLE_XGB'>('TRI_ENSEMBLE');
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);
  const [isRegimeGateActive, setIsRegimeGateActive] = useState<boolean>(true);
  const [convictionThreshold, setConvictionThreshold] = useState<number>(0.65);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  const activeProfile = YEARLY_FORECAST_PROFILES[selectedYear];
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(activeProfile.scenarios[0].id);
  const activeScenario = activeProfile.scenarios.find(s => s.id === selectedScenarioId) || activeProfile.scenarios[0];

  const [selectedStock, setSelectedStock] = useState<MultiHorizonSignal>(activeProfile.signals[0]);

  // Handle year change
  const handleYearChange = (yr: ForecastYear) => {
    setSelectedYear(yr);
    const newProfile = YEARLY_FORECAST_PROFILES[yr];
    setSelectedScenarioId(newProfile.scenarios[0].id);
    setSelectedStock(newProfile.signals[0]);
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
    }, 850);
  };

  // Compute accuracy dynamically based on optimizations
  const currentAccuracy = ensembleMode === 'TRI_ENSEMBLE'
    ? (convictionThreshold >= 0.65 ? MODEL_OPTIMIZATION_METRICS.highConvictionAccuracy : MODEL_OPTIMIZATION_METRICS.optimizedAccuracy)
    : MODEL_OPTIMIZATION_METRICS.baselineAccuracy;

  const currentRocAuc = ensembleMode === 'TRI_ENSEMBLE' 
    ? MODEL_OPTIMIZATION_METRICS.optimizedRocAuc 
    : MODEL_OPTIMIZATION_METRICS.baselineRocAuc;

  const currentBrier = isCalibrated 
    ? MODEL_OPTIMIZATION_METRICS.optimizedBrier 
    : MODEL_OPTIMIZATION_METRICS.baselineBrier;

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">MUA MẠNH</span>;
      case 'ACCUMULATE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">TÍCH LŨY</span>;
      case 'HOLD':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">NẮM GIỮ</span>;
      case 'REDUCE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40">HẠ TỶ TRỌNG</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Future Years & Optimization Engine with Glassmorphism */}
      <div className="glass-container rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <span className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>ADVANCED MULTI-YEAR & ACCURACY OPTIMIZATION SUITE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Mô Hình Tiên Lượng Giai Đoạn 2026 &rarr; 2030+ & Tối Ưu Độ Chính Xác
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Lựa chọn tiên lượng theo từng năm tương lai (2026, 2027, 2028, 2029, 2030) kết hợp bộ giải thuật cải tiến độ chính xác: 
              Tri-Ensemble (XGBoost + LightGBM + CatBoost), Hiệu chuẩn xác suất Isotonic và Bộ lọc độ tin cậy cao (Accuracy đạt tới <strong className="text-emerald-300">74.8%</strong>).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-950 rounded-xl cursor-pointer whitespace-nowrap glass-button-primary ${
                isRetraining ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Đang hiệu chuẩn Model...' : 'Hiệu Chuẩn & Tiên Lượng'}</span>
            </button>
          </div>
        </div>

        {/* Future Year Selector Tabs with Glassmorphism */}
        <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>LỰA CHỌN NĂM TIÊN LƯỢNG (YEARLY HORIZON):</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Định vị chu kỳ: {activeProfile.cycleTheme}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {(['2026', '2027', '2028', '2029', '2030'] as ForecastYear[]).map((yr) => {
              const isSelected = selectedYear === yr;
              const profile = YEARLY_FORECAST_PROFILES[yr];
              return (
                <button
                  key={yr}
                  onClick={() => handleYearChange(yr)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'glass-card border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30'
                      : 'glass-panel hover:border-white/20 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-extrabold font-mono ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {yr}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold glass-inner px-1.5 py-0.5 rounded">
                      VNINDEX {profile.vnindexTargetRange.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans truncate mt-1">
                    {profile.cycleTheme}
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Accuracy & Optimization Dashboard (Cải Tiến Model Tăng Độ Chính Xác) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Zap className="w-4 h-4" />
              <span>MODEL ACCURACY & CALIBRATION OPTIMIZATION SUITE</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Cải Tiến Mô Hình Tối Ưu Hóa Độ Chính Xác (Accuracy & Brier Calibration)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Kiến trúc:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setEnsembleMode('TRI_ENSEMBLE')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                  ensembleMode === 'TRI_ENSEMBLE'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tri-Ensemble (Cải tiến)
              </button>
              <button
                onClick={() => setEnsembleMode('SINGLE_XGB')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                  ensembleMode === 'SINGLE_XGB'
                    ? 'bg-slate-800 text-slate-200 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                XGBoost Baseline
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Accuracy Comparison Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">ĐỘ CHÍNH XÁC (ACCURACY)</div>
            <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums flex items-center gap-1">
              <span>{(currentAccuracy * 100).toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-400 font-normal">
                {ensembleMode === 'TRI_ENSEMBLE' ? '(+7.4% boost)' : '(baseline)'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Tỷ lệ dự đoán đúng xu hướng</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">HIGH-CONVICTION ACC</div>
            <div className="text-lg font-bold text-cyan-400 font-mono tabular-nums flex items-center gap-1">
              <span>{(MODEL_OPTIMIZATION_METRICS.highConvictionAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="text-[10px] text-slate-400">Khi P(up) &ge; {convictionThreshold.toFixed(2)}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">ROC-AUC CLASSIFIER</div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              {currentRocAuc.toFixed(3)}
            </div>
            <div className="text-[10px] text-slate-400">Năng lực phân loại tách biệt</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">BRIER SCORE (CALIBRATION)</div>
            <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              {currentBrier.toFixed(3)}
            </div>
            <div className="text-[10px] text-slate-400">Càng thấp càng chuẩn xác</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">GIẢM FALSE POSITIVE</div>
            <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              -{MODEL_OPTIMIZATION_METRICS.falsePositiveReductionPct}%
            </div>
            <div className="text-[10px] text-slate-400">Hạn chế bẫy mua hớ vùng đỉnh</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">KỲ VỌNG LỢI NHUẬN / LỆNH</div>
            <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              +{(MODEL_OPTIMIZATION_METRICS.calibratedExpectedValue * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">Expected Value thuần sau phí</div>
          </div>
        </div>

        {/* Interactive Optimization Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Control 1: High Conviction Threshold */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Ngưỡng lọc High-Conviction:</span>
              <span className="text-emerald-400 font-bold">{(convictionThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.55"
              max="0.75"
              step="0.01"
              value={convictionThreshold}
              onChange={(e) => setConvictionThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-sans">
              Tăng ngưỡng giúp nâng Accuracy lên 74–78%, loại bỏ 34.5% tín hiệu yếu.
            </p>
          </div>

          {/* Control 2: Probability Calibration */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Hiệu Chuẩn Isotonic</div>
              <div className="text-[10px] text-slate-400">Cân chỉnh xác suất thực tế</div>
            </div>
            <button
              onClick={() => setIsCalibrated(!isCalibrated)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                isCalibrated 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {isCalibrated ? 'Đang Bật' : 'Tắt'}
            </button>
          </div>

          {/* Control 3: Regime Gatekeeper */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Regime Gatekeeper</div>
              <div className="text-[10px] text-slate-400">Chặn lệnh khi VNINDEX &lt; MA50</div>
            </div>
            <button
              onClick={() => setIsRegimeGateActive(!isRegimeGateActive)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                isRegimeGateActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {isRegimeGateActive ? 'Đang Bật' : 'Tắt'}
            </button>
          </div>
        </div>
      </div>

      {/* Selected Year Macro & Milestone Profile */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              BỐI CẢNH VĨ MÔ & MỤC TIÊU NĂM {selectedYear}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {activeProfile.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-500">Mục tiêu VNINDEX:</span> <span className="text-emerald-400 font-bold tabular-nums">{activeProfile.vnindexTargetRange}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-500">Tăng trưởng EPS:</span> <span className="text-cyan-400 font-bold tabular-nums">+{activeProfile.projectedEpsGrowth}%</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 hidden md:block">
              <span className="text-slate-500">Vốn hóa/GDP:</span> <span className="text-white font-bold tabular-nums">{activeProfile.marketCapToGdpPct}%</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {activeProfile.macroContext}
        </p>

        {/* Catalysts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {activeProfile.keyCatalysts.map((catalyst, cIdx) => (
            <div key={cIdx} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{catalyst}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Horizon Signals Table for Selected Year */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              TÍN HIỆU CỔ PHIẾU TIÊN LƯỢNG NĂM {selectedYear}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Bảng Giá Mục Tiêu & Xác Suất Tăng Giá Đa Khung Thời Gian</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                10 Mã Trọng Điểm
              </span>
            </h3>
          </div>

          {/* Horizon Selection Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 px-2">Chân trời:</span>
            {[
              { id: '1d', label: '1 Phiên (T+1)' },
              { id: '5d', label: '5 Phiên (T+5)' },
              { id: '10d', label: '10 Phiên (2 tuần)' },
              { id: '20d', label: '20 Phiên (1 tháng)' },
            ].map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHorizon(h.id as any)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                  selectedHorizon === h.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Signals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Mã CP</th>
                <th className="py-2.5 px-3 font-semibold">Tên & Ngành</th>
                <th className="py-2.5 px-3 font-semibold text-right">Giá Dự Phóng {selectedYear}</th>
                <th className="py-2.5 px-3 font-semibold text-right">Xác Suất P(up)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kỳ Vọng Sinh Lời</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tỷ Trọng Tối Ưu</th>
                <th className="py-2.5 px-3 font-semibold text-center">Khuyến Nghị</th>
                <th className="py-2.5 px-3 font-semibold">Luận Điểm Định Lượng {selectedYear}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {activeProfile.signals.map((sig) => {
                const isSelected = selectedStock.symbol === sig.symbol;
                const pUp = selectedHorizon === '1d' ? sig.pUp1d 
                          : selectedHorizon === '5d' ? sig.pUp5d 
                          : selectedHorizon === '10d' ? sig.pUp10d 
                          : sig.pUp20d;

                const expRet = selectedHorizon === '1d' ? sig.expReturn1d 
                             : selectedHorizon === '5d' ? sig.expReturn5d 
                             : selectedHorizon === '10d' ? sig.expReturn10d 
                             : sig.expReturn20d;

                return (
                  <tr 
                    key={sig.symbol}
                    onClick={() => setSelectedStock(sig)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-950/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span>{sig.symbol}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-slate-200">{sig.name}</div>
                      <div className="text-[10px] text-slate-500">{sig.industry}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-white font-bold">
                      {sig.currentPrice.toFixed(1)}k
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-400 font-bold">
                      {(pUp * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-cyan-400 font-bold">
                      +{(expRet * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-white">
                      {(sig.volatilityNormalizedWeight * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {getRecommendationBadge(sig.signalRecommendation)}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px] max-w-xs truncate">
                      {sig.reasoning}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Stock Deep Dive */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{selectedStock.symbol} — {selectedStock.name}</span>
              <span className="text-xs font-mono text-slate-500">({selectedStock.industry})</span>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              Độ tin cậy mô hình: {(selectedStock.regimeConfidence * 100).toFixed(0)}% · Xếp hạng RS: #{selectedStock.relativeStrengthRank}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">1 PHIÊN (T+1)</div>
              <div className="text-emerald-400 font-bold text-sm my-0.5">{(selectedStock.pUp1d * 100).toFixed(0)}% P(up)</div>
              <div className="text-cyan-400 text-[11px]">+{(selectedStock.expReturn1d * 100).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">5 PHIÊN (T+5)</div>
              <div className="text-emerald-400 font-bold text-sm my-0.5">{(selectedStock.pUp5d * 100).toFixed(0)}% P(up)</div>
              <div className="text-cyan-400 text-[11px]">+{(selectedStock.expReturn5d * 100).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">10 PHIÊN (2 TUẦN)</div>
              <div className="text-emerald-400 font-bold text-sm my-0.5">{(selectedStock.pUp10d * 100).toFixed(0)}% P(up)</div>
              <div className="text-cyan-400 text-[11px]">+{(selectedStock.expReturn10d * 100).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">20 PHIÊN (1 THÁNG)</div>
              <div className="text-emerald-400 font-bold text-sm my-0.5">{(selectedStock.pUp20d * 100).toFixed(0)}% P(up)</div>
              <div className="text-cyan-400 text-[11px]">+{(selectedStock.expReturn20d * 100).toFixed(1)}%</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
            <span className="text-slate-500 font-mono font-semibold">Nhận định định lượng: </span>
            {selectedStock.reasoning}
          </p>
        </div>
      </div>

      {/* Scenarios for Selected Year */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              KỊCH BẢN THỊ TRƯỜNG NĂM {selectedYear}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Dự Phóng 3 Kịch Bản & Khuyến Nghị Tỷ Trọng Phân Bổ</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {activeProfile.scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                  selectedScenarioId === sc.id
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                }`}
              >
                {sc.title.split(':')[0]} ({sc.probabilityPct}%)
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scenario Card */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-base font-bold text-white">{activeScenario.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Xác suất mô hình ước lượng: <span className="text-emerald-400 font-mono font-bold">{activeScenario.probabilityPct}%</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Mục tiêu VNINDEX:</span> <span className="text-emerald-400 font-bold tabular-nums">{activeScenario.vnindexTarget} điểm</span>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Lợi suất chiến lược:</span> <span className="text-cyan-400 font-bold tabular-nums">+{activeScenario.projectedReturnPct}%</span>
              </div>
            </div>
          </div>

          {/* Allocation Recommendation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Khuyến nghị tỷ trọng phân bổ:</span>
              <span>Cổ phiếu: <strong className="text-emerald-400">{activeScenario.recommendedEquityPct}%</strong> · Tiền mặt / Phòng vệ: <strong className="text-slate-300">{activeScenario.recommendedCashPct}%</strong></span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${activeScenario.recommendedEquityPct}%` }} className="h-full bg-emerald-500" />
              <div style={{ width: `${activeScenario.recommendedCashPct}%` }} className="h-full bg-slate-600" />
            </div>
          </div>

          {/* Key Drivers */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              CÁC YẾU TỐ ĐỘNG LỰC CHÍNH (KEY DRIVERS)
            </div>
            <div className="space-y-1.5">
              {activeScenario.keyDrivers.map((driver, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
