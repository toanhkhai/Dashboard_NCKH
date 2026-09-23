import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENT: GlobalFilterBar
 * ============================================================================
 * Bộ lọc toàn cục đa tiêu chí:
 * - Tìm kiếm tức thời: Lọc theo Tên bài báo, Tác giả liên hệ, Tên tạp chí
 * - Dropdown Năm xuất bản
 * - Dropdown Điểm HĐGS (1.0, 0.75, 0.5, 0.25)
 * - Dropdown Phân hạng Q (Q1, Q2, Q3, Q4)
 * - Dropdown Tạp chí
 * - Nút Đặt lại bộ lọc
 * ============================================================================
 */
export const GlobalFilterBar = ({
  filters,
  onFilterChange,
  availableYears = [],
  availableScores = [],
  availableJournals = [],
  isSource2 = false,
}) => {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleYearChange = (e) => {
    onFilterChange({ ...filters, year: e.target.value });
  };

  const handleScoreChange = (e) => {
    onFilterChange({ ...filters, score: e.target.value });
  };

  const handleJournalChange = (e) => {
    onFilterChange({ ...filters, journal: e.target.value });
  };

  const handleQRankChange = (e) => {
    onFilterChange({ ...filters, qRank: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      year: 'all',
      score: 'all',
      journal: 'all',
      qRank: 'all',
    });
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.year !== 'all' ||
    filters.score !== 'all' ||
    filters.journal !== 'all' ||
    filters.qRank !== 'all';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 shadow-md backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Instant Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tức thời theo tên bài báo, tác giả liên hệ, tạp chí..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2 bg-slate-950/90 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded"
              title="Xóa từ khóa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid / Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-2.5">
          {/* Dropdown Năm */}
          <div className="min-w-[120px]">
            <select
              value={filters.year}
              onChange={handleYearChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">Năm: Tất cả</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Điểm HĐGS */}
          <div className="min-w-[130px]">
            <select
              value={filters.score}
              onChange={handleScoreChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">Điểm: Tất cả</option>
              <option value="1">1.0 điểm</option>
              <option value="0.75">0.75 điểm</option>
              <option value="0.5">0.5 điểm</option>
              <option value="0.25">0.25 điểm</option>
              {availableScores
                .filter((s) => !['1', '0.75', '0.5', '0.25'].includes(s))
                .map((sc) => (
                  <option key={sc} value={sc}>
                    {sc} điểm
                  </option>
                ))}
            </select>
          </div>

          {/* Dropdown Phân hạng Q (nếu ở Nguồn 2 hoặc Tổng hợp) */}
          {isSource2 && (
            <div className="min-w-[110px]">
              <select
                value={filters.qRank}
                onChange={handleQRankChange}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">Hạng: Tất cả</option>
                <option value="Q1">Hạng Q1</option>
                <option value="Q2">Hạng Q2</option>
                <option value="Q3">Hạng Q3</option>
                <option value="Q4">Hạng Q4</option>
              </select>
            </div>
          )}

          {/* Dropdown Tạp chí */}
          <div className="min-w-[160px] col-span-2 sm:col-span-1">
            <select
              value={filters.journal}
              onChange={handleJournalChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 truncate"
            >
              <option value="all">Tạp chí: Tất cả</option>
              {availableJournals.slice(0, 20).map((j) => (
                <option key={j} value={j} title={j}>
                  {j.length > 25 ? `${j.slice(0, 25)}...` : j}
                </option>
              ))}
            </select>
          </div>

          {/* Nút Reset */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
              title="Đặt lại toàn bộ tiêu chí lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
