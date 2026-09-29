import React, { useState } from 'react';
import { 
  FileCode, 
  Terminal, 
  Copy, 
  Check, 
  FolderTree, 
  Download, 
  Play, 
  Layers, 
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { SOURCE_CODE_FILES } from '../data/sourceCodeFiles';
import { SourceFile } from '../types/trading';

export const SourceCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(SOURCE_CODE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCommandTab, setActiveCommandTab] = useState<'powershell' | 'bash'>('powershell');
  const [simulatedCliOutput, setSimulatedCliOutput] = useState<string>('');
  const [isExecutingCli, setIsExecutingCli] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCli = (commandType: 'ingest-index' | 'ingest-prices' | 'build-dataset' | 'yearly-eval') => {
    setIsExecutingCli(true);
    setSimulatedCliOutput(`$ Running command: vtai.cli ${commandType}...`);

    setTimeout(() => {
      if (commandType === 'ingest-index') {
        setSimulatedCliOutput(
`[2026-09-28 18:22:10] INFO - vtai.data.vnstock_provider: Fetching VNINDEX from 2015-01-01 to 2026-09-29...
[2026-09-28 18:22:11] INFO - vtai.data.calendar: Validating against official HOSE trading calendar...
[2026-09-28 18:22:12] SUCCESS - Saved 2,930 normalized trading sessions to data/raw/ohlcv/INDEX/VNINDEX.parquet`
        );
      } else if (commandType === 'ingest-prices') {
        setSimulatedCliOutput(
`[2026-09-28 18:22:15] INFO - vtai.data.vnstock_provider: Downloading 10 HOSE Bluechips: FPT, VCB, HPG, MWG, ACB, SSI, VHM, VIC, GAS, BID...
[2026-09-28 18:22:17] INFO - vtai.data.normalize: Processing unadjusted raw prices with temporal validation...
[2026-09-28 18:22:18] SUCCESS - Saved 10 parquet files to data/raw/ohlcv/HOSE/*.parquet`
        );
      } else if (commandType === 'build-dataset') {
        setSimulatedCliOutput(
`[2026-09-28 18:22:20] INFO - vtai.features.builder: Building 22 technical & market features for 10 symbols...
[2026-09-28 18:22:21] INFO - vtai.labels.forward: Generating forward labels (entry_open_t1 -> exit_close_t5)...
[2026-09-28 18:22:22] INFO - vtai.data.storage: DuckDB projection & Parquet compression...
[2026-09-28 18:22:23] SUCCESS - Model dataset built: data/processed/model_dataset.parquet (29,300 rows x 34 columns)`
        );
      } else if (commandType === 'yearly-eval') {
        setSimulatedCliOutput(
`[2026-09-28 18:22:25] INFO - vtai.training.walk_forward: Purged Walk-Forward Evaluator (2020 -> 2026)...
[2026-09-28 18:22:26] FOLD 2020: Train 2015-2018 | Val 2019 | Purge 5d | Test 2020 -> ROC-AUC: 0.628 | Return: +34.2%
[2026-09-28 18:22:27] FOLD 2021: Train 2015-2019 | Val 2020 | Purge 5d | Test 2021 -> ROC-AUC: 0.645 | Return: +58.7%
[2026-09-28 18:22:28] FOLD 2022: Train 2015-2020 | Val 2021 | Purge 5d | Test 2022 -> ROC-AUC: 0.612 | Return: -12.4% (Preservation)
[2026-09-28 18:22:29] FOLD 2023: Train 2015-2021 | Val 2022 | Purge 5d | Test 2023 -> ROC-AUC: 0.638 | Return: +28.5%
[2026-09-28 18:22:30] FOLD 2024: Train 2015-2022 | Val 2023 | Purge 5d | Test 2024 -> ROC-AUC: 0.651 | Return: +31.2%
[2026-09-28 18:22:31] FOLD 2025: Train 2015-2023 | Val 2024 | Purge 5d | Test 2025 -> ROC-AUC: 0.642 | Return: +26.4%
[2026-09-28 18:22:32] FOLD 2026: Train 2015-2024 | Val 2025 | Purge 5d | Test 2026 -> ROC-AUC: 0.658 | Return: +22.8%
[2026-09-28 18:22:33] SUCCESS - Saved 7 model joblib files and reports/generated/metrics_yearly.csv`
        );
      }
      setIsExecutingCli(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <FolderTree className="w-4 h-4" />
              <span>SOURCE TREE & PRODUCTION CLI ARCHITECTURE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Mã Nguồn Python VietnamTradingAI v0.1 Hoàn Chỉnh
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Toàn bộ source code được module hóa theo chuẩn nghiên cứu định lượng chuyên nghiệp. Tách rời adapter dữ liệu Vnstock 
              để dự phòng rủi ro API, kết hợp DuckDB/Parquet và Dual XGBoost cho từng năm.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>vnstock==4.0.8 pinned</span>
            </span>
          </div>
        </div>
      </div>

      {/* CLI Runner Terminal Simulator */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>MÔ PHỎNG CLI & LỆNH THỰC THI (CLI Command Simulator)</span>
          </div>

          {/* Quick command triggers */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleRunCli('ingest-index')}
              disabled={isExecutingCli}
              className="px-2.5 py-1 text-xs font-mono bg-slate-950 hover:bg-slate-900 text-slate-300 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              1. ingest-index
            </button>
            <button
              onClick={() => handleRunCli('ingest-prices')}
              disabled={isExecutingCli}
              className="px-2.5 py-1 text-xs font-mono bg-slate-950 hover:bg-slate-900 text-slate-300 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              2. ingest-prices
            </button>
            <button
              onClick={() => handleRunCli('build-dataset')}
              disabled={isExecutingCli}
              className="px-2.5 py-1 text-xs font-mono bg-slate-950 hover:bg-slate-900 text-slate-300 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              3. build-dataset
            </button>
            <button
              onClick={() => handleRunCli('yearly-eval')}
              disabled={isExecutingCli}
              className="px-2.5 py-1 text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 transition-colors cursor-pointer font-bold"
            >
              4. yearly-eval (2020-2026)
            </button>
          </div>
        </div>

        {/* Terminal Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-1 text-slate-400">PowerShell - vtai execution environment</span>
            </div>
            <span>Python 3.12 · XGBoost · DuckDB · Parquet</span>
          </div>

          <div className="min-h-24 whitespace-pre-wrap leading-relaxed">
            {simulatedCliOutput || (
              <span className="text-slate-600">
                # Bấm vào một trong các nút lệnh ở trên (ingest-index, ingest-prices, build-dataset, yearly-eval) để mô phỏng tiến trình thực thi CLI...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Source Tree & Code File Viewer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree Left Navigation */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-mono text-slate-300">vietnam_trading_ai_v01/</span>
            <span className="text-[10px] text-slate-500">{SOURCE_CODE_FILES.length} tệp</span>
          </div>

          <div className="space-y-1">
            {SOURCE_CODE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 uppercase shrink-0">{file.category}</span>
                </button>
              );
            })}
          </div>

          {/* Vnstock Quarantine Notice Note */}
          <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg text-xs space-y-1.5 mt-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>GHI CHÚ VỀ VNSTOCK V4.0.8</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Trang dự án Vnstock hiện hiển thị trạng thái quarantined trên PyPI từ 24/09/2026. Trong code kiến trúc đã tách riêng <code className="text-amber-300 font-mono">VnstockProvider</code> adapter; 
              nếu API bên thứ ba thay đổi, chỉ cần thay đổi adapter này mà không chạm vào features, labels hay walk-forward!
            </p>
          </div>
        </div>

        {/* Code Content Viewer Right Column */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500">Path:</span>
              <span className="text-white font-bold">{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-md transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 max-h-[560px]">
            <pre className="leading-relaxed whitespace-pre">{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
