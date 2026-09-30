import React from 'react';
import { RefreshCw, Download, Settings, Database, Sparkles, Layers, Wifi, AlertCircle } from 'lucide-react';

export const Header = ({
  activeTab = 'source1',
  onTabChange,
  recordCount = 0,
  source1Count = 0,
  source2Count = 0,
  lastUpdated = null,
  loading = false,
  error = null,
  onRefresh,
  onExportCSV,
  onOpenSettings,
}) => {
  const formatTime = (d) => {
    if (!d) return 'Chưa có';
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top Row: Brand + Status + Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 flex items-center justify-center shrink-0 p-0.5 bg-white border border-slate-200 overflow-hidden">
              <img
                src="/logo/logo.png"
                alt="Logo CTUMP"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight uppercase">
                  Dashboard Nghiên Cứu Khoa Học - Trường Đại Học Y Dược Cần Thơ
                </h1>
                {error && (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 bg-red-100 text-red-600 border border-red-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Lỗi kết nối Sheet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              title="Làm mới dữ liệu trực tiếp từ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Đang nạp...' : 'Làm mới (Live Sync)'}</span>
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors text-xs font-semibold cursor-pointer"
                title="Dán link Google Sheet mới"
              >
                <Settings className="w-4 h-4" />
                <span>Đổi link Sheet</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
