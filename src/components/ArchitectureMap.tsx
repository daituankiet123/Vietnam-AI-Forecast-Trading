import React, { useState } from 'react';
import { 
  Calendar, 
  Database, 
  Clock, 
  Cpu, 
  Tags, 
  GitFork, 
  Briefcase, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  ShieldCheck
} from 'lucide-react';

interface StageDetail {
  id: string;
  name: string;
  shortDesc: string;
  icon: any;
  input: string;
  output: string;
  criticalRules: string[];
  codeHighlight: string;
}

const STAGES: StageDetail[] = [
  {
    id: 'calendar',
    name: '1. Official Trading Calendar',
    shortDesc: 'Lịch giao dịch chính thức từ HOSE, HNX, UPCoM',
    icon: Calendar,
    input: 'trading_calendar.csv (danh sách ngày mở cửa sàn thực tế)',
    output: 'TradingCalendar object lọc phiên theo từng Sở',
    criticalRules: [
      'Tuyệt đối KHÔNG dùng pd.bdate_range(...) vì lệch lịch nghỉ lễ Việt Nam (Tết, Giỗ Tổ, 30/4-1/5, 2/9, ngày nghỉ bù).',
      'Định nghĩa chuẩn giờ giao dịch: ATO (09:00-09:15), Khớp lệnh liên tục, Nghỉ trưa (11:30-13:00), ATC (14:30-14:45), Giao dịch thỏa thuận (14:45-15:00).',
      'Calendar là dữ liệu đầu vào bắt buộc, không để model tự suy luận.'
    ],
    codeHighlight: `class TradingCalendar:
    @classmethod
    def from_csv(cls, path):
        df = pd.read_csv(path, comment="#")
        df["trading_date"] = pd.to_datetime(df["trading_date"]).dt.normalize()
        return cls(df)`
  },
  {
    id: 'storage',
    name: '2. Raw OHLCV Parquet / DuckDB Store',
    shortDesc: 'Lưu trữ OHLCV theo từng mã và index riêng biệt',
    icon: Database,
    input: 'Vnstock Market API (v4.0.8 pinned)',
    output: 'data/raw/ohlcv/{EXCHANGE}/{SYMBOL}.parquet + INDEX/VNINDEX.parquet',
    criticalRules: [
      'Lựa chọn Parquet + DuckDB thay vì MySQL để tận dụng columnar format, filter/projection pushdown cho dataset OHLCV lớn.',
      'Chuẩn hóa kiểu dữ liệu nghiêm ngặt: symbol, exchange, trading_date, open, high, low, close, volume.',
      'Loại bỏ trùng lặp phiên (drop_duplicates) và sắp xếp tăng dần theo trading_date.'
    ],
    codeHighlight: `def normalize_ohlcv(df, symbol, exchange):
    out = pd.DataFrame()
    out["symbol"] = symbol.upper()
    out["exchange"] = exchange.upper()
    out["trading_date"] = pd.to_datetime(df["time"]).dt.normalize()
    for c in ["open", "high", "low", "close", "volume"]:
        out[c] = pd.to_numeric(df[c], errors="coerce")
    return out.dropna().drop_duplicates(["symbol", "trading_date"]).sort_values("trading_date")`
  },
  {
    id: 'point_in_time',
    name: '3. Point-in-Time Universe & Corporate Actions',
    shortDesc: 'Kiểm soát thời điểm biết thông tin, chống survivorship bias',
    icon: Clock,
    input: 'universe_membership.csv + corporate_actions.csv',
    output: 'Point-in-time universe snapshot & validated corporate events',
    criticalRules: [
      'Chống Survivorship Bias: Model năm 2020 chỉ được thấy universe@2020, không được dùng danh sách niêm yết của 2026.',
      'Sự kiện Corporate Action chỉ tồn tại nếu announcement_date <= as_of.',
      'Không dùng adjusted-price hậu nghiệm làm feature mặc định để tránh backtest đẹp giả.'
    ],
    codeHighlight: `def events_known_by(symbol, exchange, as_of):
    as_of_dt = pd.to_datetime(as_of).normalize()
    return registry.loc[
        (registry["symbol"] == symbol) 
        & (registry["announcement_date"] <= as_of_dt) # Barrier!
    ]`
  },
  {
    id: 'features',
    name: '4. Feature Engineering (22+ Indicators)',
    shortDesc: 'Tạo đặc trưng chuẩn hóa không phụ thuộc scale giá tuyệt đối',
    icon: Cpu,
    input: 'Raw OHLCV + VNINDEX OHLCV',
    output: 'Bảng feature: Returns, SMA ratios, EMA ratios, ATR, Volatility, Volume, Market Regimes',
    criticalRules: [
      'Model KHÔNG nhận raw open/high/low/close/volume mà nhận returns, ratios, z-scores để giảm scale dependency.',
      'Relative Strength: return_20d - market_return_20d (so sánh sức mạnh cổ phiếu với VNINDEX).',
      'Đặc trưng hoàn toàn hướng về quá khứ (backward-looking), không chứa bất kỳ dữ liệu tương lai nào.'
    ],
    codeHighlight: `for w in sma_windows:
    sma = close.rolling(w, min_periods=w).mean()
    df[f"close_sma_ratio_{w}"] = close / sma - 1.0

df["relative_strength_20d"] = df["return_20d"] - df["market_return_20d"]`
  },
  {
    id: 'labels',
    name: '5. Anti-Leakage Forward Labels',
    shortDesc: 'Gắn nhãn chuẩn: Signal tại Close[t] → Mở vị thế tại Open[t+1] → Đóng tại Close[t+5]',
    icon: Tags,
    input: 'Close[t], Open[t+1], Close[t+5]',
    output: 'fwd_return = Exit[t+5] / Entry[t+1] - 1.0, label_up = (fwd_return > 0)',
    criticalRules: [
      'Tuyệt đối KHÔNG tính Close[t+5] / Close[t] vì nhà đầu tư không thể mua tại giá đóng cửa của ngày sinh tín hiệu.',
      'Vị thế chỉ được mở tại ATO/Open của phiên kế tiếp (t+1).',
      'Đuôi dữ liệu thiếu forward horizon 5 phiên bắt buộc phải gán NA để không gây rò rỉ nhãn.'
    ],
    codeHighlight: `out["entry_open_t1"] = out.groupby("symbol")["open"].shift(-1)
out["exit_close_th"] = out.groupby("symbol")["close"].shift(-horizon_sessions)
out["fwd_return"] = out["exit_close_th"] / out["entry_open_t1"] - 1.0
out["label_up"] = (out["fwd_return"] > 0.0).astype(float)`
  },
  {
    id: 'models',
    name: '6. Dual XGBoost Architecture',
    shortDesc: 'Tách riêng 2 mô hình: XGBClassifier cho P(up) + XGBRegressor cho Expected Return',
    icon: GitFork,
    input: 'X_train, y_clf_train, y_reg_train',
    output: 'Mô hình phân loại P(up) & mô hình hồi quy biên độ lợi nhuận',
    criticalRules: [
      'Thay vì bắt 1 model dự đoán cả 2, tách riêng: Classifier tính xác suất tăng giá, Regressor tính magnitude.',
      'Sử dụng tree_method="hist", max_depth=5, learning_rate=0.03, subsample=0.85, colsample_bytree=0.85.',
      'Lưu trữ độc lập theo từng năm: model_xgb_2020.joblib đến model_xgb_2026.joblib.'
    ],
    codeHighlight: `classifier = XGBClassifier(
    objective="binary:logistic",
    eval_metric="logloss",
    tree_method="hist",
    n_estimators=500,
    max_depth=5,
    learning_rate=0.03
)`
  },
  {
    id: 'walk_forward',
    name: '7. Purged Walk-Forward (2020 → 2026)',
    shortDesc: 'Kiểm định tịnh tiến mở rộng theo từng năm với vùng đệm Purge 5 phiên',
    icon: Briefcase,
    input: 'Expanding training window (2015-t), validation window (t-1), test year (t)',
    output: 'Out-of-sample predictions độc lập từng năm không bị lookahead bias',
    criticalRules: [
      'Purge 5 phiên ở cuối train/validation: vì nhãn t có target tới t+5, nếu không cắt 5 phiên sát biên thì label sẽ chạm vào vùng validation/test!',
      'Mỗi năm kiểm thử có model riêng, không gộp số liệu các năm vào 1 metric chung chung.',
      'Kiểm định xuyên suốt từ sóng Covid 2020, Siêu chu kỳ 2021, Down-trend 2022, Phục hồi 2023-2024 đến 2026.'
    ],
    codeHighlight: `def _purge_tail(df, purge_sessions=5):
    dates = df["trading_date"].drop_duplicates().sort_values()
    cutoff = dates.iloc[-purge_sessions - 1]
    return df[df["trading_date"] <= cutoff]`
  },
  {
    id: 'backtest',
    name: '8. Portfolio Backtest & Realistic Friction',
    shortDesc: 'Mô phỏng danh mục Top K, khấu trừ phí, trượt giá và chi phí quay vòng vốn',
    icon: BarChart3,
    input: 'Out-of-sample predictions, Top K=10, min_prob=0.55, commission=10bps, slippage=5bps',
    output: 'Đường cong tài sản (Equity Curve), drawdown, Sharpe, Calmar, Turnover',
    criticalRules: [
      'Tín hiệu sinh ra cuối ngày t → Chọn Top K có P(up) >= 0.55 → Tái cân bằng tại ATO ngày t+1.',
      'Tính toán gap giá mở cửa và khấu trừ chi phí turnover: cost = turnover * (commission + slippage) / 10,000.',
      'Khấu trừ trực tiếp vào open equity trước khi tính lợi suất trong phiên.'
    ],
    codeHighlight: `cost = turnover * (commission_bps + slippage_bps) / 10000.0
equity_after_cost = equity_open * (1.0 - cost)
equity_close = equity_after_cost * (1.0 + intraday_return)`
  }
];

export const ArchitectureMap: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string>('calendar');
  const activeDetail = STAGES.find(s => s.id === selectedStage) || STAGES[0];

  return (
    <div className="space-y-6">
      {/* Top Section Banner with Glassmorphism */}
      <div className="glass-container rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <span className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span>VIETNAMTRADINGAI V0.1 ARCHITECTURAL FOUNDATION</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Quy trình Nghiên cứu Định lượng & Machine Learning
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Hệ thống được thiết kế theo chuẩn Point-in-Time, loại bỏ hoàn toàn hiện tượng rò rỉ dữ liệu (lookahead bias), 
              thiên lệch kẻ sống sót (survivorship bias), và giả định phi thực tế trong giao dịch chứng khoán Việt Nam.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-300 glass-inner px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
            <div>
              <span className="text-slate-400">Dataset Format:</span> <span className="text-emerald-400 font-semibold">Parquet + DuckDB</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Model Core:</span> <span className="text-cyan-300 font-semibold">Dual XGBoost</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Purge Window:</span> <span className="text-emerald-400 font-semibold">5 Sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Navigator with Glassmorphic cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected 
                  ? 'glass-card border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/30' 
                  : 'glass-panel hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'glass-inner text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
              </div>
              <div className="text-xs font-semibold text-slate-100 truncate">{stage.name.split('. ')[1]}</div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{stage.shortDesc}</div>
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep Dive with Glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-container rounded-2xl p-6 relative overflow-hidden">
        {/* Left Specification Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <activeDetail.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{activeDetail.name}</h3>
              <p className="text-xs text-slate-300">{activeDetail.shortDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="glass-inner p-3.5 rounded-xl border border-white/8 shadow-sm">
              <div className="text-slate-400 font-mono mb-1 text-[10px]">INPUT DỮ LIỆU</div>
              <div className="text-slate-200 font-mono text-[11px] break-all">{activeDetail.input}</div>
            </div>
            <div className="glass-inner p-3.5 rounded-xl border border-white/8 shadow-sm">
              <div className="text-slate-400 font-mono mb-1 text-[10px]">OUTPUT KẾT QUẢ</div>
              <div className="text-slate-200 font-mono text-[11px] break-all">{activeDetail.output}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NGUYÊN TẮC BẮT BUỘC ĐỂ TRÁNH LOOKAHEAD BIAS</span>
            </div>
            <div className="space-y-2">
              {activeDetail.criticalRules.map((rule, rIdx) => (
                <div key={rIdx} className="flex items-start gap-2.5 text-xs text-slate-200 glass-inner p-2.5 rounded-xl border border-white/6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Code Implementation Column */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2.5 mb-2.5 border-b border-white/10">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-medium">
              <FileCode className="w-3.5 h-3.5" />
              <span>Core Python Implementation</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">vtai package</span>
          </div>
          <div className="flex-1 glass-inner p-4 rounded-xl border border-white/8 font-mono text-xs overflow-x-auto text-slate-200 shadow-inner">
            <pre className="leading-relaxed whitespace-pre-wrap">{activeDetail.codeHighlight}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
