import React, { useState } from 'react';
import { 
  Cpu, 
  Tags, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Calculator, 
  CheckCircle2, 
  TrendingUp, 
  Layers,
  Filter
} from 'lucide-react';
import { CALCULATED_FEATURES } from '../data/mockVietnamData';

export const FeatureLabelStudio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [horizonSessions, setHorizonSessions] = useState<number>(5);
  const [demoEntryOpen, setDemoEntryOpen] = useState<number>(127.2);
  const [demoExitClose, setDemoExitClose] = useState<number>(134.0);
  const [demoSignalClose, setDemoSignalClose] = useState<number>(126.9);

  // Filter features
  const filteredFeatures = selectedCategory === 'all' 
    ? CALCULATED_FEATURES 
    : CALCULATED_FEATURES.filter(f => f.category === selectedCategory);

  // Calculate forward return and label
  const realisticReturn = (demoExitClose / demoEntryOpen - 1.0);
  const realisticLabel = realisticReturn > 0 ? 1 : 0;

  // Cheating return (buying at signal close instead of next open)
  const cheatingReturn = (demoExitClose / demoSignalClose - 1.0);
  const cheatingDelta = (cheatingReturn - realisticReturn) * 100;

  const categories = [
    { id: 'all', label: 'Tất cả (22 đặc trưng)' },
    { id: 'return', label: 'Lợi suất (Returns)' },
    { id: 'trend', label: 'Xu hướng (SMA/EMA)' },
    { id: 'volatility', label: 'Biến động & ATR' },
    { id: 'volume', label: 'Khối lượng (Volume)' },
    { id: 'market', label: 'Thị trường (VNINDEX)' },
    { id: 'relative', label: 'Relative Strength' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <Cpu className="w-4 h-4" />
              <span>FEATURE ENGINEERING & FORWARD LABEL DESIGN</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Kỹ Thuật Đặc Trưng & Công Thức Gắn Nhãn Không Rò Rỉ
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Model chỉ tiếp nhận các tỷ lệ (ratios), biến động (volatility) và tương quan với VNINDEX. 
              Công thức nhãn mô phỏng chuẩn xác chu kỳ: Tính tín hiệu tại <code className="text-emerald-400 font-mono">Close[t]</code> &rarr; 
              Vào lệnh tại <code className="text-emerald-400 font-mono">Open[t+1]</code> &rarr; Chốt vị thế tại <code className="text-emerald-400 font-mono">Close[t+5]</code>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-300 bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500">Signal:</span> <span className="text-white">Close[t]</span>
            </div>
            <span className="text-slate-700">&rarr;</span>
            <div>
              <span className="text-slate-500">Entry:</span> <span className="text-emerald-400 font-bold">Open[t+1]</span>
            </div>
            <span className="text-slate-700">&rarr;</span>
            <div>
              <span className="text-slate-500">Exit:</span> <span className="text-white font-bold">Close[t+5]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Label Formulation Simulator */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Tags className="w-4 h-4 text-emerald-400" />
            <span>MÔ PHỎNG QUY TRÌNH GẮN NHÃN TỰ ĐỘNG (Ví dụ thực tế mã FPT)</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Chống Cheat Giá Đóng Cửa
          </span>
        </div>

        {/* 3 Step Visual Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">BƯỚC 1: NGÀY T (20/05/2024)</div>
            <div className="text-sm font-bold text-white">Sinh tín hiệu cuối phiên (EOD)</div>
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Giá đóng cửa Close[t]:</span>
                <span className="text-white font-bold">{demoSignalClose.toFixed(1)}k</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Model AI suy luận:</span>
                <span className="text-emerald-400">P(up) = 74.2%</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              ⚠️ KHÔNG được khớp mua tại 126.9k vì phiên đã kết thúc!
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 relative shadow-sm shadow-emerald-500/10">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">BƯỚC 2: NGÀY T+1 (21/05/2024)</div>
            <div className="text-sm font-bold text-white">Mở vị thế tại phiên ATO/Open</div>
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Giá mở cửa Entry Open[t+1]:</span>
                <span className="text-emerald-400 font-bold">{demoEntryOpen.toFixed(1)}k</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Thời điểm thực thi:</span>
                <span className="text-slate-300">09:00 - 09:15 ATO</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
              ✓ Chuẩn thực tế: Bắt đầu chu kỳ nắm giữ 5 phiên
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">BƯỚC 3: NGÀY T+5 (27/05/2024)</div>
            <div className="text-sm font-bold text-white">Đóng vị thế tại phiên ATC/Close</div>
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Giá đóng cửa Exit Close[t+5]:</span>
                <span className="text-white font-bold">{demoExitClose.toFixed(1)}k</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lợi suất thực tế (fwd_return):</span>
                <span className="text-emerald-400 font-bold">+{(realisticReturn * 100).toFixed(2)}%</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
              Nhãn nhị phân: <span className="text-emerald-400 font-bold">label_up = {realisticLabel}.0</span> (TĂNG)
            </div>
          </div>
        </div>

        {/* Comparison Alert against Lookahead Bias */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="text-slate-300 font-semibold mb-0.5">
              So sánh: Chuẩn thực tế (Open[t+1]) vs. Gian lận Lookahead (Close[t])
            </div>
            <p className="text-slate-500 text-[11px]">
              Nếu giả định mua ngay tại Close[t] ({demoSignalClose}k), lợi nhuận tính toán sẽ là{' '}
              <span className="text-amber-400 font-mono">+{(cheatingReturn * 100).toFixed(2)}%</span>, 
              làm đẹp giả số liệu lên thêm <span className="text-rose-400 font-mono font-bold">+{cheatingDelta.toFixed(2)}%</span>!
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              Delta sai số = 0.00% (Clean)
            </span>
          </div>
        </div>
      </div>

      {/* Feature Engineering Catalog */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Danh mục 22 Đặc trưng Kỹ thuật & Chế độ Thị trường</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tất cả các đặc trưng đều chuẩn hóa tỷ lệ (ratios, pct_change, z-scores) để mô hình cây không bị ảnh hưởng bởi mệnh giá cổ phiếu.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFeatures.map((feat) => (
            <div 
              key={feat.name} 
              className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded">
                  {feat.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Importance Rank #{feat.importanceRank}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {feat.description}
              </p>

              <div className="bg-slate-900/60 p-2 rounded-lg font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <span className="text-slate-500">Formula:</span>
                <code className="text-slate-300">{feat.formula}</code>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-900">
                <span className="text-slate-500">Sample FPT:</span>
                <span className="text-white font-semibold tabular-nums">
                  {typeof feat.sampleValue === 'number' && feat.sampleValue < 1 && feat.sampleValue > -1
                    ? (feat.sampleValue * 100).toFixed(2) + '%'
                    : feat.sampleValue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
