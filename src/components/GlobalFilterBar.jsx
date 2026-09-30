import React, { useMemo } from 'react';


export const GlobalFilterBar = ({
  filters,
  onFilterChange,
  availableYears = [],
  availableScores = [],
  availableJournals = [],
  isSource2 = false,
  isCombined = false,
}) => {
  const handleChange = (field, value) => {
    onFilterChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white border-y border-slate-200 py-3 px-4 mb-6 sticky top-[76px] z-30 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Lọc nhanh (Icon Filter) */}
        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
          <span>Bộ Lọc:</span>
        </div>

        {/* Thanh Tìm kiếm */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm theo tên bài báo, tác giả, tạp chí..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="block w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 transition-colors"
          />
        </div>

        {/* Lọc theo Nguồn (chỉ hiện khi xem cả 2 nguồn) */}
        {isCombined && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              Nguồn:
            </label>
            <select
              value={filters.sourceType || 'all'}
              onChange={(e) => handleChange('sourceType', e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả Nguồn</option>
              <option value="source1">Trong nước (HĐGS)</option>
              <option value="source2">Quốc tế (Scopus/ISI)</option>
            </select>
          </div>
        )}

        {/* Lọc Năm */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            Năm XB:
          </label>
          <input
            type="number"
            placeholder="Nhập năm..."
            value={filters.year === 'all' ? '' : filters.year}
            onChange={(e) => handleChange('year', e.target.value || 'all')}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[100px]"
            min="1900"
            max="2100"
          />
        </div>

        {/* Lọc Tạp chí */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            Tạp chí ({availableJournals.length}):
          </label>
          <select
            value={filters.journal}
            onChange={(e) => handleChange('journal', e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 max-w-[150px] truncate"
          >
            <option value="all">Tất cả Tạp chí</option>
            {availableJournals.map((j) => (
              <option key={j} value={j}>{j.length > 30 ? `${j.substring(0, 30)}...` : j}</option>
            ))}
          </select>
        </div>

        {/* Lọc Điểm (Source 1) hoặc Hạng Q (Source 2) */}
        {!isSource2 ? (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              Điểm:
            </label>
            <select
              value={filters.score}
              onChange={(e) => handleChange('score', e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Mọi mốc điểm</option>
              {availableScores.map((s) => (
                <option key={s} value={s}>{s} điểm</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              Hạng:
            </label>
            <select
              value={filters.qRank}
              onChange={(e) => handleChange('qRank', e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Mọi phân hạng</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
              <option value="Khác">Khác / Chưa rõ</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
