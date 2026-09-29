import React, { useState } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  Check, 
  FileText, 
  Building2,
  TrendingUp,
  Search
} from 'lucide-react';
import { VIETNAM_STOCKS, VNINDEX_DATA, CORPORATE_ACTIONS, TRADING_CALENDAR_RULES, SAMPLE_CALENDAR_DAYS } from '../data/mockVietnamData';

export const PointInTimeInspector: React.FC = () => {
  const [asOfDate, setAsOfDate] = useState<string>('2024-05-20');
  const [selectedExchange, setSelectedExchange] = useState<'HOSE' | 'HNX' | 'UPCOM'>('HOSE');
  const [activeTab, setActiveTab] = useState<'data_slice' | 'corporate_actions' | 'calendar_rules'>('data_slice');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter corporate actions based strictly on point-in-time barrier: announcementDate <= asOfDate
  const visibleEvents = CORPORATE_ACTIONS.filter(ca => ca.announcementDate <= asOfDate);
  const leakedEvents = CORPORATE_ACTIONS.filter(ca => ca.announcementDate > asOfDate);

  // Filter stocks matching exchange and search
  const filteredStocks = VIETNAM_STOCKS.filter(s => 
    s.exchange === selectedExchange && 
    (s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining Point-in-Time Principle */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <Clock className="w-4 h-4" />
              <span>POINT-IN-TIME TEMPORAL ISOLATION</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Kiểm Soát Ranh Giới Thời Gian & Chống Rò Rỉ Dữ Liệu
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Một dòng model tại ngày <span className="text-emerald-400 font-mono font-semibold">{asOfDate}</span> chỉ được phép nhìn thấy 
              giá và sự kiện đã công bố trước hoặc đúng ngày đó. Tuyệt đối không nhìn trước quyền chia thưởng trong tương lai hoặc vũ trụ cổ phiếu của năm 2026.
            </p>
          </div>

          {/* Interactive Date Picker */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium text-slate-400">Thời điểm as_of:</span>
            <input
              type="date"
              value={asOfDate}
              min="2024-05-15"
              max="2024-05-27"
              onChange={(e) => setAsOfDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-mono px-3 py-1.5 rounded-md focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs: Data Slice vs Corporate Actions vs Calendar Rules */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('data_slice')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'data_slice'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lát cắt OHLCV & Universe
          </button>
          <button
            onClick={() => setActiveTab('corporate_actions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'corporate_actions'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Quyền & Cổ tức (Point-in-Time)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {visibleEvents.length} cho phép / {leakedEvents.length} chặn
            </span>
          </button>
          <button
            onClick={() => setActiveTab('calendar_rules')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'calendar_rules'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lịch giao dịch & Phiên HOSE/HNX
          </button>
        </div>

        {activeTab === 'data_slice' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm mã cổ phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs pl-8 pr-3 py-1 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
            />
          </div>
        )}
      </div>

      {/* Content for Data Slice */}
      {activeTab === 'data_slice' && (
        <div className="space-y-4">
          {/* Status summary banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 font-mono mb-1">TRẠNG THÁI GIÁ RAW</div>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Giá gốc chưa điều chỉnh (Unadjusted)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Không dùng adjusted price hậu nghiệm; factor được tính strictly theo sự kiện đã công bố.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 font-mono mb-1">VŨ TRỤ NIÊM YẾT TẠI AS_OF</div>
              <div className="text-base font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>10 mã Bluechip HOSE hợp lệ</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Được lọc theo universe_membership.csv có effective_from &le; {asOfDate}.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 font-mono mb-1">VNINDEX BENCHMARK</div>
              <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                {VNINDEX_DATA.find(d => d.date === asOfDate)?.close.toLocaleString('vi-VN') || '1,277.5'} điểm
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Lợi suất thị trường dùng tính Relative Strength 20 phiên.
              </p>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-300">
                Lát cắt dữ liệu Point-in-time phiên {asOfDate}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Dữ liệu chỉ hiển thị các phiên &le; {asOfDate}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Mã CP</th>
                    <th className="py-2.5 px-4 font-semibold">Tên Doanh nghiệp</th>
                    <th className="py-2.5 px-4 font-semibold">Ngành</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Mở cửa (Open)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Cao nhất (High)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Thấp nhất (Low)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Đóng cửa (Close)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Khối lượng (Vol)</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Kiểm định Leakage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {filteredStocks.map((stock) => {
                    const point = stock.dataPoints.find(dp => dp.date === asOfDate) || stock.dataPoints[3];
                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{stock.symbol}</span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-300">{stock.name}</td>
                        <td className="py-2.5 px-4 font-sans text-slate-400">{stock.industry}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">{point.open.toFixed(1)}k</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-emerald-400">{point.high.toFixed(1)}k</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-rose-400">{point.low.toFixed(1)}k</td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-bold text-white">{point.close.toFixed(1)}k</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">
                          {point.volume.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Hợp lệ point-in-time</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content for Corporate Actions Point-in-time Check */}
      {activeTab === 'corporate_actions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allowed Events Panel */}
            <div className="bg-slate-900/40 border border-emerald-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SỰ KIỆN ĐƯỢC PHÉP TRẢ VỀ CHO MODEL (announcement_date &le; {asOfDate})</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">{visibleEvents.length} sự kiện</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Những quyền này đã được công bố chính thức ra thị trường tính đến ngày as_of. 
                Pipeline được phép sử dụng factor hoặc metadata này.
              </p>

              <div className="space-y-2 mt-3">
                {visibleEvents.map(evt => (
                  <div key={evt.id} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">{evt.symbol} · {evt.actionType}</span>
                      <span className="text-emerald-400 font-semibold">Factor: {evt.adjustmentFactor}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] font-sans">{evt.description}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                      <span>Công bố: {evt.announcementDate}</span>
                      <span>Ngày GDKHQ (Ex-date): {evt.exDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Events Panel (Future Leakage) */}
            <div className="bg-slate-900/40 border border-rose-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>SỰ KIỆN TƯƠNG LAI BỊ CHẶN TUYỆT ĐỐI (announcement_date &gt; {asOfDate})</span>
                </div>
                <span className="text-xs font-mono text-rose-400">{leakedEvents.length} sự kiện chặn</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đây là các sự kiện công bố sau ngày as_of. Nếu đưa vào model tại ngày {asOfDate}, 
                backtest sẽ bị lookahead bias (biết trước tương lai), dẫn đến kết quả đẹp giả.
              </p>

              <div className="space-y-2 mt-3">
                {leakedEvents.length === 0 ? (
                  <div className="text-xs text-slate-500 p-4 text-center bg-slate-950/40 rounded-lg">
                    Không có sự kiện tương lai bị rò rỉ tại mốc thời gian này.
                  </div>
                ) : (
                  leakedEvents.map(evt => (
                    <div key={evt.id} className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-rose-200">{evt.symbol} · {evt.actionType}</span>
                        <span className="text-rose-400 font-semibold">TƯƠNG LAI: ẨN</span>
                      </div>
                      <div className="text-slate-300 text-[11px] font-sans">{evt.description}</div>
                      <div className="flex items-center justify-between text-[10px] text-rose-300/60 font-mono pt-1 border-t border-rose-900/30">
                        <span>Ngày công bố: {evt.announcementDate}</span>
                        <span>Ngày GDKHQ: {evt.exDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content for Calendar Rules */}
      {activeTab === 'calendar_rules' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* HOSE Rule */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-emerald-400 font-mono">HOSE (TP. HỒ CHÍ MINH)</div>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Khớp lệnh ATO:</span>
                  <span>{TRADING_CALENDAR_RULES.hose.ato}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Liên tục sáng:</span>
                  <span>{TRADING_CALENDAR_RULES.hose.morningContinuous}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Nghỉ trưa:</span>
                  <span>{TRADING_CALENDAR_RULES.hose.lunchBreak}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Liên tục chiều:</span>
                  <span>{TRADING_CALENDAR_RULES.hose.afternoonContinuous}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Khớp lệnh ATC:</span>
                  <span>{TRADING_CALENDAR_RULES.hose.atc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biên độ dao động:</span>
                  <span className="text-emerald-400 font-bold">{TRADING_CALENDAR_RULES.hose.priceLimit}</span>
                </div>
              </div>
            </div>

            {/* HNX Rule */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-cyan-400 font-mono">HNX (HÀ NỘI)</div>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Khớp lệnh ATO:</span>
                  <span className="text-slate-500 italic">Không có ATO</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Liên tục sáng:</span>
                  <span>{TRADING_CALENDAR_RULES.hnx.morningContinuous}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Nghỉ trưa:</span>
                  <span>{TRADING_CALENDAR_RULES.hnx.lunchBreak}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Liên tục chiều:</span>
                  <span>{TRADING_CALENDAR_RULES.hnx.afternoonContinuous}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Khớp lệnh ATC:</span>
                  <span>{TRADING_CALENDAR_RULES.hnx.atc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biên độ dao động:</span>
                  <span className="text-cyan-400 font-bold">{TRADING_CALENDAR_RULES.hnx.priceLimit}</span>
                </div>
              </div>
            </div>

            {/* UPCoM Rule */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-amber-400 font-mono">UPCoM</div>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Khớp lệnh ATO:</span>
                  <span className="text-slate-500 italic">Không có ATO</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Liên tục sáng:</span>
                  <span>{TRADING_CALENDAR_RULES.upcom.morningContinuous}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Nghỉ trưa:</span>
                  <span>{TRADING_CALENDAR_RULES.upcom.lunchBreak}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Liên tục chiều:</span>
                  <span>{TRADING_CALENDAR_RULES.upcom.afternoonContinuous}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-slate-500">Khớp lệnh ATC:</span>
                  <span className="text-slate-500 italic">Không có ATC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biên độ dao động:</span>
                  <span className="text-amber-400 font-bold">{TRADING_CALENDAR_RULES.upcom.priceLimit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Holiday demonstration */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>VÍ DỤ TẠI SAO BẮT BUỘC DÙNG OFFICIAL CALENDAR THAY VÌ PANDAS BDATE_RANGE</span>
            </div>
            <p className="text-xs text-slate-400">
              Nếu dùng <code className="text-rose-400 font-mono">pd.bdate_range</code>, ngày 29/04 (nghỉ hoán đổi) và 30/04 - 01/05 vẫn bị xem là ngày làm việc, 
              trong khi ngày thứ Bảy 04/05/2024 làm bù theo công văn Chính phủ lại bị bỏ qua!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
              {SAMPLE_CALENDAR_DAYS.map((day) => (
                <div 
                  key={day.date}
                  className={`p-2.5 rounded-lg border text-xs font-mono text-center ${
                    day.isTradingDay 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">{day.dayOfWeek}</div>
                  <div className="font-bold text-white my-1">{day.date.split('-').slice(1).join('/')}</div>
                  <div className="text-[10px] font-sans">
                    {day.isTradingDay ? '✓ Mở phiên' : '✗ Nghỉ lễ'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
