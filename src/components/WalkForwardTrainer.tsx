import React, { useState } from 'react';
import { 
  GitFork, 
  Layers, 
  TrendingUp, 
  Award, 
  Sliders, 
  BarChart, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { WALK_FORWARD_FOLDS, SAMPLE_TOP_K_SIGNALS } from '../data/mockVietnamData';
import { WalkForwardFold } from '../types/trading';

interface WalkForwardTrainerProps {
  onNavigateToForecast?: () => void;
}

export const WalkForwardTrainer: React.FC<WalkForwardTrainerProps> = ({ onNavigateToForecast }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [minProbability, setMinProbability] = useState<number>(0.55);
  const [topK, setTopK] = useState<number>(10);

  const activeFold = WALK_FORWARD_FOLDS.find(f => f.year === selectedYear) || WALK_FORWARD_FOLDS[4];

  // Filter signals based on min probability
  const qualifiedSignals = SAMPLE_TOP_K_SIGNALS.filter(s => s.pUp >= minProbability).slice(0, topK);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <GitFork className="w-4 h-4" />
              <span>PURGED EXPANDING WALK-FORWARD EVALUATION</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Kiểm Định Tịnh Tiến Độc Lập Theo Từng Năm (2020 &rarr; 2026)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Mỗi năm kiểm thử được huấn luyện trên dữ liệu quá khứ tích lũy (expanding window), có tập Validation riêng 
              và <span className="text-emerald-400 font-semibold font-mono">vùng đệm Purge 5 phiên</span> để triệt tiêu hoàn toàn sự gối đầu của nhãn t+5. 
              Mỗi năm sinh ra 1 tệp model độc lập (.joblib).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-950 p-2 rounded-lg border border-slate-800">
            {WALK_FORWARD_FOLDS.map((fold) => (
              <button
                key={fold.year}
                onClick={() => setSelectedYear(fold.year)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedYear === fold.year
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {fold.year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Fold Visual Architecture */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">CẤU TRÚC PHÂN TÁCH FOLD NĂM {selectedYear}</div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Mô hình: model_xgb_{selectedYear}.joblib</span>
              <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Out-of-sample Test
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500">Train Samples:</span> <span className="text-white font-bold">{activeFold.trainSamples.toLocaleString('vi-VN')}</span>
            </div>
            <div>
              <span className="text-slate-500">Test Samples:</span> <span className="text-white font-bold">{activeFold.testSamples.toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {selectedYear === 2026 && onNavigateToForecast && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-400">Tiên lượng tương lai 2026+:</strong> Đã có bản nâng cấp model kết hợp kết quả train 2024 và thực tế thị trường hiện tại (Thông tư 68, sóng FTSE, đa khung 1D-20D).
              </span>
            </div>
            <button
              onClick={onNavigateToForecast}
              className="px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              Mở Tiên Lượng 2026+ &rarr;
            </button>
          </div>
        )}

        {/* Visual Timeline Segments */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-1.5 h-12 text-xs font-mono">
            {/* Train Segment */}
            <div className="col-span-7 bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-indigo-300 font-bold text-[11px] truncate">TRAIN WINDOW</span>
              <span className="text-[10px] text-slate-400 truncate">{activeFold.trainRange}</span>
            </div>

            {/* Validation Segment */}
            <div className="col-span-2 bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-amber-300 font-bold text-[11px] truncate">VALIDATION</span>
              <span className="text-[10px] text-slate-400 truncate">{activeFold.valRange.split('→')[0]}</span>
            </div>

            {/* Purge Buffer */}
            <div className="col-span-1 bg-rose-950/50 border border-rose-500/40 rounded-lg p-1 text-center flex flex-col items-center justify-center">
              <span className="text-rose-300 font-bold text-[10px]">PURGE</span>
              <span className="text-[9px] text-rose-400 font-bold">5 D</span>
            </div>

            {/* Test Segment */}
            <div className="col-span-2 bg-emerald-950/50 border border-emerald-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-emerald-300 font-bold text-[11px] truncate">TEST {selectedYear}</span>
              <span className="text-[10px] text-slate-300 truncate">{activeFold.testRange.split('→')[0]}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>2015-01-01</span>
            <span className="flex items-center gap-1 text-rose-400/90">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Purge 5 sessions ở đuôi: cắt bỏ 5 phiên cuối trước ngày chuyển giao để nhãn t+5 không lọt sang Validation/Test</span>
            </span>
            <span>{selectedYear}-12-31</span>
          </div>
        </div>

        {/* Metric Cards for this fold */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">ROC-AUC</div>
            <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">{activeFold.rocAuc.toFixed(3)}</div>
            <div className="text-[10px] text-slate-400">Khả năng phân loại</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">ACCURACY</div>
            <div className="text-base font-bold text-white font-mono tabular-nums">{(activeFold.accuracy * 100).toFixed(1)}%</div>
            <div className="text-[10px] text-slate-400">Độ chính xác P(up)</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">BRIER SCORE</div>
            <div className="text-base font-bold text-slate-300 font-mono tabular-nums">{activeFold.brierScore.toFixed(3)}</div>
            <div className="text-[10px] text-slate-400">Hiệu chuẩn xác suất</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">REGRESSOR RMSE</div>
            <div className="text-base font-bold text-cyan-400 font-mono tabular-nums">{activeFold.rmse.toFixed(3)}</div>
            <div className="text-[10px] text-slate-400">Sai số biên độ</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">STRATEGY RETURN</div>
            <div className={`text-base font-bold font-mono tabular-nums ${activeFold.strategyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {activeFold.strategyReturn >= 0 ? '+' : ''}{(activeFold.strategyReturn * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">Hiệu suất danh mục</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">VNINDEX BENCHMARK</div>
            <div className={`text-base font-bold font-mono tabular-nums ${activeFold.benchmarkReturn >= 0 ? 'text-slate-200' : 'text-rose-400'}`}>
              {activeFold.benchmarkReturn >= 0 ? '+' : ''}{(activeFold.benchmarkReturn * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">Lợi suất thị trường</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">ALPHA VƯỢT TRỘI</div>
            <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">
              +{(activeFold.alpha * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">Sharpe: {activeFold.sharpe}</div>
          </div>
        </div>
      </div>

      {/* Dual XGBoost Prediction Ranking Table for this Fold */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Xếp hạng Tín hiệu Top K từ Dual XGBoost (Mẫu phiên thử nghiệm)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Model kết hợp xác suất tăng P(up) từ XGBClassifier và lợi nhuận kỳ vọng từ XGBRegressor.
            </p>
          </div>

          {/* Interactive filter controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Min P(up):</span>
              <select
                value={minProbability}
                onChange={(e) => setMinProbability(parseFloat(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-emerald-400 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value={0.50}>0.50 (50%)</option>
                <option value={0.55}>0.55 (55% Mặc định)</option>
                <option value={0.60}>0.60 (60%)</option>
                <option value={0.65}>0.65 (65%)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Top K:</span>
              <select
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value={5}>Top 5</option>
                <option value={8}>Top 8</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table of ranked stocks */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Mã CP</th>
                <th className="py-2.5 px-3 font-semibold">Ngành</th>
                <th className="py-2.5 px-3 font-semibold text-right">Xác suất P(up)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kỳ vọng lợi nhuận</th>
                <th className="py-2.5 px-3 font-semibold text-right">Giá vào Open[t+1]</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tỷ trọng mục tiêu</th>
                <th className="py-2.5 px-3 font-semibold text-center">Trạng thái giải ngân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {qualifiedSignals.map((sig) => (
                <tr key={sig.symbol} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{sig.rank}</td>
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{sig.symbol}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{sig.industry}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-emerald-400 font-bold">
                    {(sig.pUp * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-cyan-400">
                    +{(sig.expectedReturn * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-white">
                    {sig.entryPrice.toFixed(1)}k
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                    {(sig.targetWeight * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Đạt điều kiện Top {topK}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Summary Master Table (2020 -> 2026) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Bảng Tổng Hợp Nghiên Cứu Thường Niên (Yearly Research Summary Table)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Không gộp các năm lại thành một con số duy nhất. Mỗi năm đánh giá độc lập để kiểm định độ bền bỉ qua từng chu kỳ thị trường.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">reports/generated/metrics_yearly.csv</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Năm Test</th>
                <th className="py-2.5 px-3 font-semibold text-right">ROC-AUC</th>
                <th className="py-2.5 px-3 font-semibold text-right">Accuracy</th>
                <th className="py-2.5 px-3 font-semibold text-right">Brier</th>
                <th className="py-2.5 px-3 font-semibold text-right">RMSE</th>
                <th className="py-2.5 px-3 font-semibold text-right">Lợi suất AI</th>
                <th className="py-2.5 px-3 font-semibold text-right">VNINDEX</th>
                <th className="py-2.5 px-3 font-semibold text-right">Alpha</th>
                <th className="py-2.5 px-3 font-semibold text-right">Sharpe</th>
                <th className="py-2.5 px-3 font-semibold text-right">Max DD</th>
                <th className="py-2.5 px-3 font-semibold text-right">Turnover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {WALK_FORWARD_FOLDS.map((fold) => {
                const isSelected = fold.year === selectedYear;
                return (
                  <tr 
                    key={fold.year} 
                    onClick={() => setSelectedYear(fold.year)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-950/30 text-white font-semibold' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span>{fold.year}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-400">{fold.rocAuc.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{(fold.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{fold.brierScore.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{fold.rmse.toFixed(3)}</td>
                    <td className={`py-2.5 px-3 text-right tabular-nums font-bold ${fold.strategyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fold.strategyReturn >= 0 ? '+' : ''}{(fold.strategyReturn * 100).toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-3 text-right tabular-nums ${fold.benchmarkReturn >= 0 ? 'text-slate-300' : 'text-rose-400'}`}>
                      {fold.benchmarkReturn >= 0 ? '+' : ''}{(fold.benchmarkReturn * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-400 font-bold">
                      +{(fold.alpha * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fold.sharpe.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-rose-400">{(fold.maxDrawdown * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{(fold.turnoverPct * 100).toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
