import React from 'react';
import { RefreshCw, Download, Settings, Database, Sparkles, Layers, Wifi, AlertCircle, Sun, Moon } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENT: Header
 * ============================================================================
 * Thanh điều hướng & tiêu đề chuẩn CTUMP:
 * - Brand: "CTUMP RESEARCH METRICS & AUDIT PORTAL"
 * - Trạng thái nguồn dữ liệu: Đọc trực tiếp 100% từ Google Sheets
 * - Thao tác: "Làm mới (Live Sync)", "Xuất CSV sạch", "Cấu hình Sheets", "Đổi Theme"
 * ============================================================================
 */
export const Header = ({
  activeTab = 'source1',
  onTabChange,
  recordCount = 0,
  lastUpdated = null,
  loading = false,
  error = null,
  theme = 'dark',
  onToggleTheme,
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
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top Row: Brand + Status + Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 p-0.5 bg-white/95 border border-slate-700/40 shadow-md shadow-blue-900/20 overflow-hidden group">
              <img
                src="/logo/logo.png"
                alt="Logo Đại học Y Dược Cần Thơ (CTUMP)"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                  Dashboard Nghiên Cứu Khoa Học CTUMP 1
                </h1>
                {error ? (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    Lỗi kết nối Sheet
                  </span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Google Sheets
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  Đang hiển thị: <strong className="text-white font-bold">{recordCount}</strong> bản ghi từ Sheet
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Cập nhật: {formatTime(lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all disabled:opacity-50 active:scale-95"
              title="Làm mới dữ liệu trực tiếp từ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Đang nạp...' : 'Làm mới (Live Sync)'}</span>
            </button>

            <button
              onClick={onExportCSV}
              disabled={recordCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-40"
              title="Xuất danh sách bài báo sạch ra file CSV chuẩn UTF-8 Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV sạch</span>
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm text-xs font-semibold cursor-pointer"
                title="Dán link Google Sheet mới"
              >
                <Settings className="w-4 h-4" />
                <span>Đổi link Sheet</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm text-xs font-semibold cursor-pointer hover:border-slate-500"
                title={theme === 'dark' ? 'Chuyển sang giao diện Sáng (White Theme)' : 'Chuyển sang giao diện Tối (Black Theme)'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Giao diện Sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="hidden sm:inline">Giao diện Tối</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Tab Switcher */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onTabChange('source1')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'source1'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Nguồn 1: Bài báo Ngoài Trường (HĐGS)</span>
          </button>

          <button
            onClick={() => onTabChange('source2')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'source2'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nguồn 2: Danh mục NCKH Mở rộng & Quốc tế (Scopus/ISI)</span>
          </button>

          <button
            onClick={() => onTabChange('combined')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === 'combined'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tổng hợp 2 Nguồn</span>
          </button>
        </div>
      </div>
    </header>
  );
};
