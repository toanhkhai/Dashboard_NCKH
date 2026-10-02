import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Header = ({
  activeTab = 'source1',
  onTabChange,
  recordCount = 0,
  source1Count = 0,
  source2Count = 0,
  lastUpdated = null,
  loading = false,
  error = null,
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
            <div className="w-12 h-12 flex items-center justify-center shrink-0 p-0.5 bg-white overflow-hidden">
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

        </div>

      </div>
    </header>
  );
};
